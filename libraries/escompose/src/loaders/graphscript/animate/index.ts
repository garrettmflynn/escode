import { specialKeys } from "../../../../../esc/standards";
import { GraphNode } from "../../../../../external/graphscript";

const animations = {}
const animateKey = specialKeys.animate // Reference the standard definition

/**
 * 
 * Specify a timer loop, will stop when node is popped or nodeA.__node.isLooping is set false
 * nodeA.__node.loop = 100 will loop the operator every 100 milliseconds
 * 
 * Or 
 * nodeA.__node.delay will delay the operator by specified millisecond number and resolve the result as a promise
 * nodeA.__node.frame will use requestAnimationFrame to call the function and resolve the result as a promise
 * 
 * Use in combination with:
 * nodeA.__node.repeat will repeat the operator the specified number of times
 * nodeA.__node.recursive will do the same as repeat but will pass in the previous operator call's results 
 * 
 * 
 */
 export const loop = ( node: GraphNode )=>{

    if(node.__operator && !node.__node.looperSet) {
        node.__node.looperSet = true;
        if(typeof node.__node.delay === 'number') {
            let fn = node.__operator;
            node.__setOperator((...args:any[]) => {
                return new Promise((res,rej) => {
                    setTimeout(async ()=>{
                        res(await fn(...args));},node.__node.delay);
                });
            });
        } else if (node.__node.frame === true) {
            let fn = node.__operator;
            node.__setOperator((...args:any[]) => {
                return new Promise((res,rej) => {
                    requestAnimationFrame(async ()=>{res(await fn(...args));});
                });
            });
        }

        if(typeof node.__node.repeat === 'number' || typeof node.__node.recursive === 'number') {
            let fn = node.__operator;
            node.__setOperator(async (...args:any[]) => {
                let i = node.__node.repeat ? node.__node.repeat : node.__node.recursive; 
                let result;
                let repeater = async (tick,...inp:any[]) => {
                    while(tick > 0) {
                        if(node.__node.delay || node.__node.frame) {
                            fn(...inp).then(async (res) => {
                                if(node.__node.recursive) { 
                                    await repeater(tick,res);
                                }
                                else await repeater(tick,...inp);
                            })
                            break;
                        }
                        else result = await fn(...args);
                        tick--;
                    }
                }
                await repeater(i,...args);
                return result;
            });
        } 
               
        if(node.__node.loop && typeof node.__node.loop === 'number') {
            
            let fn = node.__operator;
            node.__setOperator((...args) => {
                if(!('looping' in node.__node)) node.__node.looping = true;
                if(node.__node.looping) {
                    fn(...args);
                    setTimeout(()=>{node.__operator(...args)},node.__node.loop);
                }
            });
            if(node.__node.looping) node.__operator();
            
            let ondelete = (node) => {
                if(node.__node.looping) node.__node.looping = false;
            }

            node.__addOndisconnected(ondelete);
        }
    }

}

/** Animations
 * 
 * nodeA.__node.animate = true;
 * then __operator becomes a requestAnimationFrame function
 * start with a call the __operator or by setting node.__node.animating = true;
 * 
 * or node.__animation = (...args) => {}
 * 
 */
export const originalAnimate =  ( node:GraphNode ) => {
    if(node.__node.animate === true || node.__animation) {
            let fn = node.__operator;

            node.__setOperator((...args) => {
                if(!('animating' in node.__node)) node.__node.animating = true;
                if(node.__node.animating) {
                    if(typeof node.__animation === 'function') node.__animation(...args);
                    else fn(...args);
                    requestAnimationFrame(()=>{node.__operator(...args);});
                }
            });
            if(node.__node.animating || ((!('animating' in node.__node) || node.__node.animating) && node.__animation)) 
                setTimeout(()=>{requestAnimationFrame(node.__operator)},10);
        

        let ondelete = (node) => {
            if(node.__node.animating) node.__node.animating = false;
        }

        node.__addOndisconnected(ondelete);
    }
}



// This is a basic animation function that allows users to specify (1) the number of animations per second (e.g. 60), or (2) other values to use the global requestAnimationFrame loop (e.g. true, 'global')
export default function animate( node ) {

    // Use original animate function specified by Josh
    originalAnimate(node)
    loop(node)

    // Declare new managed animation function
    if (node[animateKey]) {
        let original = node[animateKey]

        const id = Math.random()
        const interval = (typeof original === 'number') ? original : 'global'

        if (!animations[interval]) {
        
            const info = animations[interval] = {objects: {[id]: node}} as any

            const objects = info.objects
            const runFuncs = () => {
                for (let key in objects) objects[key].default()
            }

            // Global Animation Frames
            if (interval === 'global') {
                const start = () => {
                    runFuncs()
                    info.id = window.requestAnimationFrame(start)
                }

                start()

                animations[interval].stop = () => {
                    window.cancelAnimationFrame(info.id)
                    info.cancel = true
                }
            }
            // Set Interval
            else {
                runFuncs() // run initially
                info.id = setInterval(() => runFuncs(), 1000/interval)
                animations[interval].stop = () => clearInterval(info.id)
            } 
        } 
        
        // Add to Objects
        else {
            node.default() // run initially
            animations[interval].objects[id] = node
        }


        node[animateKey] = {
            id,
            original,
            stop: () => {
                delete animations[interval].objects[id]
                this[animateKey] = original // Replace with original function
                if (Object.keys(animations[interval].objects).length === 0) {
                    animations[interval].stop()
                    delete animations[interval]
                }
            }
        }
    }
}