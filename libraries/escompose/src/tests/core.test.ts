import * as core from '../core/index';

const object = {
  test: 1, 
  active: false,
  testFunction: () => {
      const message = 'Hi!'
      console.log(message)
      return message
  }
}

const o2TestMessage = 'Failed!'

const o2TestFunction = () => {
  console.log(o2TestMessage)
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
  console.log(o3TestMessage)
  return o3TestMessage
}

o3TestFunction.__compose = true

const objectThree = {
  test: 3, 
  active: true, 
  success: true,
  testFunction: o3TestFunction // Function merge
}

// console.log('------------- Trying test function -------------')
// await object.testFunction()


// // Use merge for merging objects
// console.log('------------- Starting failed merge -------------')
// const failedToListenToNewKey = escompose.merge([object, objectTwo], true)
// // object.testFunction = o2TestFunction // Direct replacement
// await object.testFunction()
// console.log('Failed to Listener to New Key', failedToListenToNewKey)

// console.log('------------- Starting successful merge -------------')
// const listenedToNewKey = escompose.merge([objectProxy, objectThree], true)
// // objectProxy.testFunction = o3TestFunction // Direct replacement
// await objectProxy.testFunction()

// console.log('Merged + All Listeners Worked!', listenedToNewKey)

// console.log(objectProxy, object)
// console.log(objectProxy.test, object.test)
// console.log(objectProxy.active, object.active)
// console.log(objectProxy.success, object.success)


// afterAll(() => {
//   clearCityDatabase();
// });


// beforeEach(() => {
//   initializeCityDatabase();
// });

// afterEach(() => {
//   clearCityDatabase();
// });

describe('The core ESCompose helper functions behave appropriately on their own', () => {

  let proxy, changelog: {[x:string]: any} = {};

  beforeAll(() => {
    proxy = core.monitor.set( 'object',  object,  {static: true} ) // Set object reference
    core.monitor.on('object', (path, _, update) => changelog[path] = update) // Track changes in a changelog
  });

  describe('merging into the original object has limited functionality', () => {

    let merged;
    beforeAll(() => {
      merged = core.merge([object, objectTwo], true)
    });

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
      expect(proxy.testFunction).not.toBe(o2TestFunction) 
      expect((res as any).output).toBe(o2TestMessage) // TO FIX: This returns an object...
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

    test('new keys will trigger updates on relevant listeners', () => {
      expect('success' in changelog).toBe(true)
    })

    test('the test function is still replaced by a proxy function', async () => {
      const res = await object.testFunction()
      console.log('Got Res', res)
      expect(proxy.testFunction).not.toBe(o2TestFunction) 
      expect((res as any).output).toBe(o3TestMessage) // TO FIX: This returns an object...
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