
export const esElement = 'canvas'

const defaultSize = 500

export const width = defaultSize
export const height = defaultSize

export const esAttributes = {
    width: function () { return this.width },
    height: function () { return this.height },
    style: {
        width: function () { return this.width },
        height: function () { return this.height },
    }
}