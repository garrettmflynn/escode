import * as core from '../packages/core/index';

// import * as graph from '../demos/graph/index'
// import { OperationsManager } from '../demos/utils';

describe(`Standard ES Component objects are created`, () => {
  test('empty configuration object will return empty component', () => {
    const component = core.create({});
    expect(component).toStrictEqual({});
  })

  
})