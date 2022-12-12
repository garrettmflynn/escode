export const __element = 'button'

export const __attributes = {
    onclick: () => {
        console.log('Current')
    }
}

export const __children = {
    header: {
        __element: 'b',
        __attributes: {
            innerText: 'Workspace Result: '
        }
    },
    span: {
        __element: 'span',
    }
}
