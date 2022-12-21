import { isProxy } from '../../../esmonitor/src/globals';
import * as core from '../core/index';

const message = 'Hi'
const object = {
  test: 1, 
  active: false,
  testFunction: () => {
    return message
  }
}

const o2TestMessage = 'Failed!'

const o2TestFunction = () => {
  return o2TestMessage
}

const objectTwo = {
  test: 2, 
  active: true, 
  success: false,
  testFunction: o2TestFunction // Function merge
}


const o3TestMessage = 'Succeeded!'

const o3TestFunction = () => {
  return o3TestMessage
}

o3TestFunction.__compose = true

const objectThree = {
  test: 3, 
  active: true, 
  success: true,
  testFunction: o3TestFunction // Function merge
}

describe('The core ESCompose helper functions behave appropriately on their own', () => {

  const isStatic = false
  let proxy, changelog: {[x:string]: any} = {};

  beforeAll(() => {
    proxy = core.monitor.set( 'object',  object,  { static: isStatic } ) // Set object reference
    core.monitor.on('object', (path, _, update) => {
      changelog[path] = update
    }) // Track changes in a changelog
  });

  describe('merging into the original object has limited functionality', () => {


    let merged, returnedProxy
    const shouldBeProxy = !isStatic && !!globalThis.Proxy

    beforeAll(() => {
      returnedProxy = !!globalThis.Proxy && !!proxy[isProxy]
      merged = core.merge([object, objectTwo], true)
    });

    test('a proxy object has been successfuly created when available', () => {
      expect(shouldBeProxy).toBe(!!proxy[isProxy])
    })


    test('values for existing keys are updated properly', () => {
      expect(proxy.test).toBe(objectTwo.test)
      expect(changelog.test).toBe(objectTwo.test)

      expect(proxy.active).toBe(objectTwo.active)
      expect(changelog.active).toBe(objectTwo.active)
    })

    test('values for new keys remain the same', () => {
      expect(proxy.success).toBe(false)
    })

    test('new keys do not trigger updates on relevant listeners', () => {
      expect('success' in changelog).toBe(false)
    })

    test('the test function is now replaced by a proxy function', async () => {
      const res = await object.testFunction()
      if (returnedProxy) expect(proxy.testFunction.__esInspectable.target).toBe(o2TestFunction) 
      else expect(proxy.testFunction).not.toBe(o2TestFunction) 

      expect(res).toBe(o2TestMessage)
      expect(changelog.testFunction).toBe(o2TestMessage)
    })

  })

  describe('merging into the returned proxy has full functionality', () => {

    let merged;
    beforeAll(() => {
      merged = core.merge([proxy, objectThree], true)
    });

    test('values for existing keys are still updated properly', () => {
      expect(proxy.test).toBe(objectThree.test)
      expect(changelog.test).toBe(objectThree.test)

      expect(proxy.active).toBe(objectThree.active)
      expect(changelog.active).toBe(objectThree.active)
    })

    test('values for new keys are now updated', () => {
      expect(proxy.success).toBe(objectThree.success)
    })

    test('new keys will trigger updates on relevant listeners if Proxies are used', () => {
      expect('success' in changelog).toBe(!!proxy[isProxy])
    })

    test('the test function is still replaced by a proxy function', async () => {
      const res = await object.testFunction()
      expect(proxy.testFunction).not.toBe(o2TestFunction) 
      expect(res).toBe(o3TestMessage)
      expect(changelog.testFunction).toBe(o3TestMessage)
    })

    test('the original object has been updated to match the proxy', async () => {
      expect(object.testFunction).toBe(proxy.testFunction) 
      expect(object.test).toBe(proxy.test) 
      expect(object.active).toBe(proxy.active) 
      expect((object as any).success).toBe(proxy.success) 
    })

  })

})

describe(`Standard ES Component objects are created`, () => {
  test('empty configuration object will return empty component', () => {
    const component = core.create({});
    expect(component).toStrictEqual({});
  })
})