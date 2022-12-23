import { Story, Meta } from '@storybook/web-components';
import { Tree, TreeProps } from '../../src/components/tree/Tree';
import object from '../object';

export default {
  title: 'Tree/Editor',
  argTypes: {
  },
} as Meta;

const Template: Story<Partial<TreeProps>> = (args:any) => new Tree(args);

export const Default = Template.bind({});
Default.args = {
  target: object
}

export const Files = Template.bind({});
Files.args = {
  target: object,
  mode: 'files'
}