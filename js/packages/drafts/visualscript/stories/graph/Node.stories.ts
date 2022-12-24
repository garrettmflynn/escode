import { Story, Meta } from '@storybook/web-components';
import { GraphNode, GraphNodeProps } from '../../src/components/graph/Node';
import { node1 } from './info';

export default {
  title: 'Graph/Node',
  argTypes: {
  },
} as Meta;

const Template: Story<Partial<GraphNodeProps>> = (args:any) => new GraphNode(args);

export const Default = Template.bind({});

// Default.setInfo(info)
Default.args = {
  info: node1
};

// export const Stacked = Template.bind({});
// Stacked.args = {
//   brand: {content: 'Brains@Play', link: 'https://brainsatplay.com', external: true},
//   primary,
//   secondary
// };