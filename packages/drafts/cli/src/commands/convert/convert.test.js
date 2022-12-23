import { fromText } from './index.js'

test('parse an empty JSON file to get an empty HTML file', () => {
  expect(fromText(`{}`, 'json', 'html')).toBe(``);
});