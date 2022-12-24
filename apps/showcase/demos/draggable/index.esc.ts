import * as draggableComponent from '../../../../js/components/ui/behaviors/draggable.js'
export const __attributes = {
    style: {
        margin: '25px'
    }
}

export const draggable = {
    __element: 'h1',
    __attributes: {
        innerText: 'Drag Me'
    },
    __compose: draggableComponent
}