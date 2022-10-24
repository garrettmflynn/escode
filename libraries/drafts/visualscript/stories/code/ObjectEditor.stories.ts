import { Story, Meta } from '@storybook/web-components';
import { CodeEditor, CodeEditorProps } from '../../src/components/code/Editor';
import object from '../object';

export default {
  title: 'Code/Editor',
  argTypes: {
  },
} as Meta;

const Template: Story<Partial<CodeEditorProps>> = (args:any) => new CodeEditor(args);

export const Default = Template.bind({});
Default.args = {
  value: `const hello = () => console.log('hello world')`
};

// export const Stacked = Template.bind({});
// Stacked.args = {
//   brand: {content: 'Brains@Play', link: 'https://brainsatplay.com', external: true},
//   primary,
//   secondary
// };