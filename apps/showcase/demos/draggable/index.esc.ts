import * as draggable from '../../../../components/ui/behaviors/draggable.js'
export const __attributes = {
    style: {
        margin: '25px'
    }
}

export const __children = {

    draggable: {
        __element: 'h1',
        __attributes: {
            innerText: 'Drag Me'
        },
        __compose: draggable
    }, 
}