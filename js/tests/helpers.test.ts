import { isProxy } from '../js/esmonitor/src/globals';
import * as core from '../js/core/index';

import * as objects from '../demos/objects/index'
import { OperationsManager } from '../demos/utils';


describe('The core ESCode helper functions behave appropriately on their own', () => {

  const isStatic = false
  const manager = new OperationsManager(objects)
  let proxy, returnedProxy, state;

  beforeAll(() => {
    const info = manager.start(isStatic)
    proxy = info.proxy
    state = info.state
    returnedProxy = !!globalThis.Proxy && !!proxy[isProxy]
  });


  describe('merging into the original object has limited functionality', () => {


    let merged
    const shouldBeProxy = !isStatic && !!globalThis.Proxy

    beforeAll(() => merged = manager.next());

    test('a proxy object has been successfuly created when available', () => {
      expect(shouldBeProxy).toBe(!!proxy[isProxy])
    })


    test('values for existing keys are updated properly', () => {
      expect(proxy.test).toBe(objects.two.test)
      expect(state.test).toBe(objects.two.test)

      expect(proxy.active).toBe(objects.two.active)
      expect(state.active).toBe(objects.two.active)
    })

    test('values for new keys remain the same', () => {
      expect(proxy.success).toBe(false)
    })

    test('new keys do not trigger updates on relevant listeners', () => {
      expect('success' in state).toBe(false)
    })

    test('the test function is now replaced by a proxy function', async () => {
      const res = await objects.one.testFunction()
      
      if (returnedProxy) expect(proxy.testFunction.__esInspectable.target).toBe(objects.functions.two) 
      else expect(proxy.testFunction).not.toBe(objects.functions.two) 

      expect(res).toBe(objects.messages.two)
      expect(state.testFunction).toBe(objects.messages.two)
    })

  })

  describe('merging into the returned proxy has full functionality', () => {

    let merged;
    beforeAll(() => merged = manager.next());

    test('values for existing keys are still updated properly', () => {
      expect(proxy.test).toBe(objects.three.test)
      expect(state.test).toBe(objects.three.test)

      expect(proxy.active).toBe(objects.three.active)
      expect(state.active).toBe(objects.three.active)
    })

    test('values for new keys are now updated', () => {
      expect(proxy.success).toBe(objects.three.success)
    })

    test('new keys will trigger updates on relevant listeners if Proxies are used', () => {
      expect('success' in state).toBe(!!proxy[isProxy])
    })

    test('the test function is still replaced by a proxy function', async () => {
      const res = await objects.one.testFunction()

      if (returnedProxy) expect(proxy.testFunction.__esInspectable.target).not.toBe(objects.functions.three) // Not the same since this uses function composition
      else expect(proxy.testFunction).not.toBe(objects.functions.three)

      expect(res).toBe(objects.messages.three)
      expect(state.testFunction).toBe(objects.messages.three)
    })

    test('the original object has been updated to match the proxy', async () => {
      expect(objects.one.testFunction).toBe(proxy.testFunction) 
      expect(objects.one.test).toBe(proxy.test) 
      expect(objects.one.active).toBe(proxy.active) 
      expect((objects.one as any).success).toBe(proxy.success) 
    })

  })

})

describe(`Standard ES Component objects are created`, () => {
  test('empty configuration object will return empty component', () => {
    const component = core.create({});
    expect(component).toStrictEqual({});
  })

  
})