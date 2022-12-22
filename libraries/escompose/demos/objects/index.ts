import * as core from '../../src/core/index';

export const messages = { 
    one: 'Hi',
    two: 'Failed!',
    three: 'Succeeded!'
}

export const functions = { 
    one: () =>  messages.one,
    two: () => messages.two,
    three: (() => messages.three) as any,
}

functions.three.__compose = true



export const one = {
  test: 1, 
  active: false,
  testFunction: functions.one
}

export const two = {
  test: 2, 
  active: true, 
  success: false,
  testFunction: functions.two // Function merge
}


export const three = {
  test: 3, 
  active: true, 
  success: true,
  testFunction: functions.three // Function merge
}


let proxy
const state: {[x:string]: any} = {};
const history: {path: string, update: any}[] = [];

export const start = (isStatic=true) => {
    proxy = core.monitor.set( 'object',  one,  { static: isStatic } ) // Set object reference
    core.monitor.on('object', (path, _, update) => {
      state[path] = update
      history.push({ path, update })
    }) // Track changes 

    return { proxy, history, state }
}



export const operations = [
    () => core.merge([one, two], true),
    () => core.merge([proxy, three], true)
]
