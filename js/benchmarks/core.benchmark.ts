import * as esc from '../../js/packages/core/index'
import { model } from '../demos/graph/index'
import { checkPerformance } from './utils/index'
import { nTimes } from './global';

export const instantiate = async () => {
    return checkPerformance(async (i) => {
        const component = esc.create(model)
        await component.__resolved
    }, nTimes)
}


export const listen = async () => {
    const component = esc.create(model)
    return checkPerformance(async () => {
        component.nodeA.jump();
    }, nTimes)
}
