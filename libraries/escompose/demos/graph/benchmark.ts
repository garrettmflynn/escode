import * as core from '../../src/core/index'
import { model } from 'escompose/demos/graph/index'
import { checkPerformance } from '../../../common/benchmark'


const nTimes = 1000

const checkInstantiationTime = async () => {
    return checkPerformance(async (i) => {
        const component = core.create(model)
        await component.__resolved
        const res = component.nodeA.jump();
        // console.log('Jumped!', res)
    }, nTimes).then(averageTime => {
        console.log(`Time to Construct Graphs:`, averageTime)
    }).then(() => {
    
    })
}


const checkListenerTime = async () => {
    const component = core.create(model)
    return checkPerformance(async () => {
        component.nodeA.jump();
    }, nTimes).then(averageTime => {
        console.log(`Time to Jump:`, averageTime)
    })
}


// Run Benchmarks
checkInstantiationTime()
.then(checkListenerTime)