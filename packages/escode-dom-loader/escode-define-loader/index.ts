import { specialKeys } from "../../../spec/standards"
import { deep } from '../../../packages/common/clone'
import { isNode } from "../../common/globals"

export const name = 'define'

export const properties = {
    dependents: [specialKeys.webcomponents],
    dependencies: [specialKeys.element, specialKeys.component, specialKeys.parent]
}

export default (esc) => {

        // ------------------ Register Components (keyword) ------------------
        let registry = esc[specialKeys.webcomponents] ?? {}
        for (let key in registry) {
            const model = registry[key]
            const config =  model[specialKeys.element]
            if (config.name && config.extends) define(config, esc, model)
        }

        return esc
}

// Allow Specifying a Customized Element using Autonomous Element format
const registry = {}

if (!isNode) {
    const ogCreateElement = document.createElement
    document.createElement = function (name, options) {
        const info = registry[name]
        const created = (info && !info.autonomous) ? ogCreateElement.call(this, info.tag, {is: name}) : ogCreateElement.call(this, name, options)
        return created
    }
}

// TODO: Add support for componentizing SVG elements
const tagToClassMap = {
    li: 'LI',
    ol: 'OL',
    ul: 'UL',
    br: 'BR',
    p: 'Paragraph',
    textarea: 'TextArea',
    a: 'Anchor',
}

const isAutonomous = false


export const define = (config, esc, model = esc) => {

    // Register the Component
    if (!registry[config.name]) {

        // Split the Instances
        const copy = deep(model)

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
                copy[specialKeys.element] = this
                esc[specialKeys.isGraphScript].create(copy)
            }

            connectedCallback() {
                const component = this[specialKeys.component]
                const parent = component[specialKeys.parent]
                component[specialKeys.parent] = parent // Trigger parent setter
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
