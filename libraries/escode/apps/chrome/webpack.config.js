
const extensions = [
  'popup', 'options', // 'background',  // Original
  'devtools', 'newtab', 'onboarding' // New
]

var webpack = require("webpack"),
    path = require("path"),
    fileSystem = require("fs"),
    env = require("./utils/env"),
    CleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin,
    CopyWebpackPlugin = require("copy-webpack-plugin"),
    HtmlWebpackPlugin = require("html-webpack-plugin"),
    WriteFilePlugin = require("write-file-webpack-plugin");

// load the secrets
var alias = {};

var secretsPath = path.join(__dirname, ("secrets." + env.NODE_ENV + ".js"));

var fileExtensions = ["jpg", "jpeg", "png", "gif", "eot", "otf", "svg", "ttf", "woff", "woff2"];

if (fileSystem.existsSync(secretsPath)) {
  alias["secrets"] = secretsPath;
}

var options = {
  mode: 'production',
  entry: {

    // No HTML Associated
    contentScript: path.join(__dirname, "src", "js", 'contentScript.js'),
    background: path.join(__dirname, "src", "js", 'background.js'),
    injected: path.join(__dirname, "src", "js", 'devtools', 'injected.js')

    // Associated HTML + JS Extensions will be added later 
  },
  output: {
    path: path.join(__dirname, "build"),
    filename: "[name].bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        loader: "style-loader!css-loader",
        exclude: /node_modules/
      },
      {
        test: new RegExp('.(' + fileExtensions.join('|') + ')$'),
        loader: "file-loader?name=[name].[ext]",
        exclude: /node_modules/
      },
      {
        test: /\.html$/,
        loader: "html-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    alias: alias
  },
  plugins: [
    // clean the build folder
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false
    }),
    // expose and write the allowed env vars on the compiled bundle
    new webpack.EnvironmentPlugin(["NODE_ENV"]),
    new CopyWebpackPlugin([{
      from: "src/manifest.json",
      transform: function (content, path) {
        // generates the manifest file using the package.json informations
        return Buffer.from(JSON.stringify({
          description: process.env.npm_package_description,
          version: process.env.npm_package_version,
          ...JSON.parse(content.toString())
        }))
      }
    }]),
    new WriteFilePlugin()
  ]
};

// Generate an entrypoint for each extension
extensions.forEach(name => {
  const filename = `${name}.js`
  options.entry[name] =  path.join(__dirname, "src", "js", filename)
})

// Generate HTML plugin for each extension
const plugins = extensions.map(name => {
  const filename = `${name}.html`
  return new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", filename),
      filename,
      chunks: [name]
  })
})

options.plugins.push(...plugins)

module.exports = options;
