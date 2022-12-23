import plugins from "./plugins"

const p3Copy = Object.assign({}, plugins.default.plugin3)
p3Copy.tag = `${p3Copy.tag}_1`
export const node3 = p3Copy

const p2Copy = Object.assign({}, plugins.default.plugin2)
p2Copy.tag = `${p2Copy.tag}_1`
export const node2 = p2Copy

const p1Copy = Object.assign({}, plugins.default.plugin1)
p1Copy.tag = `${p1Copy.tag}_1`
export const node1 = p1Copy

export const graph = {
   nodes: {
    [node1.tag]: node1,
    [node2.tag]: node2,
    [node3.tag]: node3,
   },
    edges: {
        [node1.tag]: {
            [node2.tag]: {},
            [node3.tag]: {}
        }
    }
}