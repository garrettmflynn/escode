
// import { component } from "../../core/component2";
// import { loaders } from "../../core/loaders";
import tree from './tree'
import * as core from './../../packages/core/index';
import * as animate from './../../packages/escode-animation-loader';

const nodeAInstance = tree.nodeA // Original value for nodeA


export const history: {[x:string]: any} = []
export const state = {}

let component, secondComponent, popped;
const options = {
    loaders: [animate],
    listen: (path, update) => {
        history.push({ path, update })
        state[path] = update
    }
}

export const model = tree

export function start () {
    component = core.create(tree, {}, options)

    this.log.addHeader('Created component')
    console.log('Component:', component);

    // Stop animating after a few seconds
    setTimeout(()=>{ 
        component.nodeE.__parent = null // Remove from parent
        this.log.addCommand('nodeE removed!')
    }, 5500)
}

export const operations = [
    {
        name: 'component.run("nodeD")',
        function: () => {
            component.nodeD(); // Can be listened to—but isn't a 'true' component
        },
    },
    {
        name: 'component.run("nodeG")',
        function: () => {
            component.nodeG.default(); // Has been instantiated because of the static __ property
            component.nodeH.default();
            component.nodeI.default();
            component.nodeG.default(); // Has been instantiated because of the static __ property
        },
    },
    {
        name: 'nodeAInstance.x = 1',
        function: () => {
            nodeAInstance.x = 1; //should not trigger nodeA.x listener on nodeC, since it has been instanced
        },
    },
    {
        name: `component.get('nodeA').x = 2`,
        function: () => {
            component.nodeA.x = 2; //same thing
        },
    },
    {
        name: `component.get('nodeB').x += 1`,
        function: () => {
            component.nodeB.x += 1; //should trigger nodeA listener jump()

        },
    },
    {
        header: `Clear All Listeners`,
        ignore: true,
        function: () => {
            component.__.listeners.clear() // NEW FEATURE: Clear all listeners
        }
    },
    {
        name: `component.run('nodeB.nodeC', 4)`,
        function: () => {
            component.nodeB.nodeC.default(4)
        },
    },
    {
        name: `component.get('nodeB.nodeC').z += 1`,
        function: () => {
            component.nodeB.nodeC.z += 1
        },
    }, 
    {
        name: `component.get('nodeA').jump()`,
        function: () => {
            component.nodeA.jump()  //should trigger nodeC listener
        }, 
    },

    // TODO: Need to reimplement unsubscribe functions
    {
        header: `Unsubscribe nodeB.nodeC from nodeA.jump`,
        ignore: true,
        function: () => {
            // NEW FEATURE: Clearing nodeC listener from nodeA.jump
            component.__.listeners.unsubscribe('nodeB.nodeC', 'nodeA.jump')
            component.__.listeners.clear('nodeA.jump') // Equivalent   
        }
    },

    {
        name: `component.run('nodeA.jump')`,
        ignore: true,
        function: () => {
            component.nodeA.jump(); // should not trigger nodeC listener 
        }
    },

    {
        header: `Resubscribe nodeB.nodeC from nodeA.jump`,
        ignore: true,
        function: () => {
            component.__listeners.subscribe('nodeB.nodeC', 'nodeA.jump')
        }
    },

    {
        name: `component.run('nodeA.jump')`,
        ignore: true,
        function: () => {
            component.nodeA.jump(); //same 
        }
    },


    // BACK TO WORKING STUFF
    {
        header: 'Create Second Component from First',
        function: function () {
            secondComponent = core.create({tree:{ component }}, undefined, options);
            console.log('Got component 2', secondComponent)

        }
    },
    {
        header: 'Remove Node B',
        function: function () {
            popped = component.nodeB
            component.nodeB.__parent = null

            console.log(popped.__.path, 'popped')
        }
    },
    {
        name: `component.get('nodeA').jump()`,
        function: () => {
            component.nodeA.jump(); //should not trigger nodeC listener
        }
    },
    {
        header: 'Reparent Node B to Second Component',
        ignore: false,
        function: () => {
            popped.__parent = secondComponent
            console.log('Has Been Reparented', popped.__.root === secondComponent.__.root)
        }
    },
    {
        name: `popped.x += 1`,
        function: () => {
            popped.x += 1; //should no longer trigger nodeA.x listener on nodeC NOR the nodeB.x listener on nodeA
        }
    },
    {
        name: `popped.__children.nodeC.__operator(1)`,
        function: () => {
            popped.nodeC.default(1);
        }
    },
    {
        name: `component.get('nodeA').jump()`,
        function: () => {
            component.nodeA.jump(); //this should not trigger the nodeA.jump listener on nodeC now
        }
    },
]