import p5 from 'p5';

// This becomes something that inherits from the p5 object
export const __element = 'div'; // Force to div

function getAllPropertyNames( obj ) {
    var props = [];
    do {

        if (obj.constructor.name === 'Object') props.push(...Object.keys(obj))
        else Object.getOwnPropertyNames( obj ).forEach(function ( prop ) {
            if ( props.indexOf( prop ) === -1 ) props.push( prop )
        });
    } while ( obj = Object.getPrototypeOf( obj ));

    return props;
}


const otherKeys = ['setup', 'draw', 'windowResized']

const ignoredKeys = ['constructor']

export const ____cache = {}

export function __onconnected() {


    const initialValues = []

    let sketch = (instance) => {

        this.instance = instance

        const keys = [...otherKeys, ...getAllPropertyNames(this.instance)]

        // Proxy all properties
        keys.forEach(key => {

            if (ignoredKeys.includes(key)) return;

            const hasInitialValue = key in this
            const initialValue = this[key]

            const isFunc = typeof this.instance[key] === 'function'
            if (isFunc) {
                const ogFunction = this.instance[key]

                // Proxy the internal calls
                this.instance[key] = function(...args) {
                    try {
                        return ogFunction.call(this, ...args)
                    } catch (e) {
                        ogFunction.bind(this)
                        return ogFunction(...args)
                    }
                }

                // Proxy with external calls
                this[key] = (...args) =>  {
                    // this.____cache[key] = args
                    return this.instance[key](...args);
                }

            } else {
                Object.defineProperty(this, key, {
                    get: () => this.instance[key],
                    set: (value) =>  {
                        // this.____cache[key] = value
                        this.instance[key] = value
                    }
                })

            }

            if (hasInitialValue) {
                this.____cache[key] = initialValue
                initialValues.push({key, type: isFunc ? 'function' : 'value'})
            }

        })

        // Basic setup and draw
        this.windowResized = () => {
            this.resizeCanvas(this.__element.offsetWidth, this.__element.offsetHeight);
        }

        this.setup = () => {
            const res = this.createCanvas(this.__element.offsetWidth, this.__element.offsetHeight);
            this.__element.appendChild(res.canvas) // Add the canvas to the element
            res.canvas.setAttribute('data-hidden', false)
            res.canvas.style.visibility = ''
            this.windowResized()
        };
      
        // 
        this.draw = () => {
            
            initialValues.forEach(o => {

                // Activate functions
                const value = this.____cache[o.key]
                if (o.type === 'function') {
                    if (Array.isArray(value)) this[o.key](...value) 
                    else this[o.key](value)
                } 
                
                // Update values
                else this[o.key] = value
            })

            const children = this.__children;
            if (children)
            for (let name in children) {
                try {
                    const object = children[name]
                    object.default(this)
                } catch(e) {
                    console.error(e)
                }
            }
        }

      };
      

      new p5(sketch);
}

export const instance = null;

export default function () {
   
}