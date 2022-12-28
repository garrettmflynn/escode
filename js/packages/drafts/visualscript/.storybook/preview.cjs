const withBackground = (Story, context) => {
  const doc = document.documentElement
  const body = document.body
  const root = body.querySelector('#root')
  doc.style.height = body.style.height = root.style.height = '100%';
  doc.style.width = body.style.width = root.style.height = '100%';
  return new Story(context)
};

const decorators = [withBackground];


module.exports = {
  decorators,
parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  }
}
