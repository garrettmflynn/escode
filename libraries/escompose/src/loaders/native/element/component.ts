import { deep } from '../../../../../common/clone'
import { specialKeys } from '../../../../../esc/standards'
import createComponent from '../../../index'

// Allow Specifying a Customized Element using Autonomous Element format
const registry = {}
const ogCreateElement = document.createElement
document.createElement = function (name, options) {
    const info = registry[name]
    const created = (info && !info.autonomous) ? ogCreateElement.call(this, info.tag, {is: name}) : ogCreateElement.call(this, name, options)
    return created
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


export const define = (config, esm) => {

    // Register the Component
    if (!registry[config.name]) {

        // Split the Instances
        esm = deep(esm)


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
                esm[specialKeys.element] = this
                createComponent(esm)
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
