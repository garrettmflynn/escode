var WebpackDevServer = require("webpack-dev-server"),
    webpack = require("webpack"),
    config = require("../webpack.config"),
    env = require("./env"),
    path = require("path");

delete config.chromeExtensionBoilerplate;

var compiler = webpack(config);

var server =
  new WebpackDevServer(compiler, {
    hot: false,
    contentBase: path.join(__dirname, "../build"),
    sockPort: env.PORT,
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    disableHostCheck: true
  });

server.listen(env.PORT);
