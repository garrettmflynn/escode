import { Story, Meta } from '@storybook/web-components';
import { GraphEditor, GraphEditorProps } from '../../src/components/graph/Editor';
import { graph } from './info';
import plugins from './plugins';

export default {
  title: 'Graph/Editor',
  argTypes: {
  },
} as Meta;

const Template: Story<Partial<GraphEditorProps>> = (args:any) => new GraphEditor(args);

export const Default = Template.bind({});
Default.args = {
  graph: graph,
  plugins
};

// export const Stacked = Template.bind({});
// Stacked.args = {
//   brand: {content: 'Brains@Play', link: 'https://brainsatplay.com', external: true},
//   primary,
//   secondary
// };