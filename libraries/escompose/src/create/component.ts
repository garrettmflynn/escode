import createComponent from '../index'
import { resolve } from '../utils'

// Allow Specifying a Customized Element using Autonomous Element format
const registry = {}
const ogCreateElement = document.createElement
document.createElement = function (name, options) {
    const info = registry[name]
    const created = (info && !info.autonomous) ? ogCreateElement.call(this, info.tag, {is: name}) : ogCreateElement.call(this, name, options)
    return created
}

const tagToClassMap = {
    li: 'LI'
}

const isAutonomous = false


export const define = (config, esm) => {

    // Split the Instances
    esm = Object.assign({}, esm)

    // Register the Component
    if (!registry[config.name]) {


        // Derive the Base Class Name
        const clsName = (isAutonomous) ? '' : (tagToClassMap[config.extends] ?? config.extends[0].toUpperCase() + config.extends.slice(1))
        
        const BaseClass = (new Function(`

        class ESComponentBase extends HTML${clsName}Element { 
            #properties;
            constructor(properties={}){
                super()
               this.#properties = properties
            }
        }
        return ESComponentBase;

        `))() as CustomElementConstructor;
        
        // Create a New Class Per Definition
        class ESComponent extends BaseClass {
            __component;

            constructor(properties){
                super(properties)
                resolve(createComponent(esm), res => {
                    res.__element = this
                    this.__component = res
                })
            }

            connectedCallback() {
                console.log('Custom element added to page.');
                this.__component.____connected(); // Notify that the Component is connected
            }

            disconnectedCallback() {
                console.log('Custom element removed from page.');
            }
              
            adoptedCallback() {
            console.log('Custom element moved to new page.');
            }

            attributeChangedCallback(name, oldValue, newValue) {
                console.log('Custom element attributes changed.', name, oldValue, newValue);
            }
        }

        registry[config.name] = {
            class: ESComponent,
            autonomous: isAutonomous,
            tag: config.extends
        }
        
        const cls = registry[config.name].class
        // Define the Element
        if (isAutonomous) customElements.define(config.name, cls);
        else customElements.define(config.name, cls, {extends: config.extends});

    } else {
        console.log('Already created component...')
    }

    // // Create the Element
    // if (isAutonomous) return document.createElement(config.name);
    // else return document.createElement(config.extends, {is: config.name});
}
