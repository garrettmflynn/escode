import { Story, Meta } from '@storybook/web-components';
import { Tab } from '../../src/components/dashboard/tabs/Tab';
import { Panel, PanelProps } from '../../src/components/dashboard/tabs/Panel';

const tabs = Array.from({length: 10}, (e, i) => new Tab({
  name: `Tab ${i}`
}))
const one = tabs.slice(0,1)
const two = tabs.slice(0,2)

const tabOptions = {
  one, two, many: tabs
}


export default {
  title: 'Dashboard/Panel',
  argTypes: {
    tabs: {
      options: Object.keys(tabOptions),
      mapping: tabOptions,
      control: {
        type: 'select', 
        labels: {
          one: 'One Tab',
          two: 'Two Tabs',
          many: 'Many Tabs',
        },
      },
    }
  }
} as Meta;

const Template: Story<Partial<PanelProps>> = (args:any) => new Panel(args);

export const OneTab = Template.bind({});
OneTab.args = {
  tabs: one,
};

export const TwoTabs = Template.bind({});
TwoTabs.args = {
  tabs: two,
};

export const ManyTabs = Template.bind({});
ManyTabs.args = {
  tabs
}
