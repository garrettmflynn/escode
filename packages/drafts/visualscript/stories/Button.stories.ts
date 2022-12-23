import { Story, Meta } from '@storybook/web-components';
import { Button, ButtonProps } from '../src/components/general/Button';

export default {
  title: 'General/Button',
  argTypes: {

  },
} as Meta;

const Template: Story<Partial<ButtonProps>> = (args) => new Button(args);


export const Primary = Template.bind({});
Primary.args = {primary: true};

export const Secondary = Template.bind({});
Secondary.args = {};