import * as core from '../../packages/core/index'
import { model } from './index'
import { checkPerformance } from '../../packages/common/benchmark'


const nTimes = 1000

const checkInstantiationTime = async () => {
    return checkPerformance(async (i) => {
        const component = core.create(model)
        await component.__resolved
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