import * as element from './element'
import * as component from "./component";
import * as standards from '../../../esc/standards';
import * as clone from "../../../common/clone.js"
import { Options } from '../../../common/types';
import * as define from './define'
import * as helpers from './helpers/index'
import pathLoader from './helpers/path';
import { resolve } from '../utils';

export default (id, esm, parent?, opts: Partial<Options> = {}) => {
    
        // Save states that are initially applied to the Component
        const states = {
            connected: false,
            initial: {
                start: esm[standards.specialKeys.start],
                stop: esm[standards.specialKeys.stop],
            }
        }

        define.value(standards.specialKeys.states, states, esm)
        define.value(standards.specialKeys.options, opts, esm)

        const copy = clone.deep(esm) // Start with a deep copy. You must edit on the resulting object...

        try {

            const hierarchyKey = standards.specialKeys.hierarchy
            for (let name in esm[hierarchyKey]) {
                const value = esm[hierarchyKey][name]
                const isUndefined = value == undefined
                const type = (isUndefined) ? JSON.stringify(value) : typeof value
                if (type != 'object') {
                    console.error(`Removing ${name} ${hierarchyKey} field that which is not an ES Component object. Got ${isUndefined ? type :`a ${type}`} instead.`)
                    delete esm[hierarchyKey][name]
                }
            }

            // ------------------ Register Components ------------------
            let registry = esm[standards.specialKeys.webcomponents] ?? {}
            for (let key in registry) {
                const esm = registry[key]
                const info = esm[standards.specialKeys.element]
                if (info.name && info.extends) component.define(info, esm)
            }

        
            // ------------------ Produce a Complete ESM Element ------------------

            let el = element.create(id, esm, parent, opts, states);

            const finalStates = states as element.ESComponentStates
            
            esm[standards.specialKeys.element] = el

            // ------------------ Declare Special Functions ------------------

            // Delete Function
            esm[standards.specialKeys.start] = () => helpers.start.call(esm, standards.specialKeys)

            esm[standards.specialKeys.stop] = () => helpers.stop.call(esm, standards.specialKeys)

            // -------- Bind Functions to Node --------
            for (let key in esm) {
                if (standards.isPrivate(key)) continue;
                if (typeof esm[key] === 'function') {
                    const desc = Object.getOwnPropertyDescriptor(esm, key)
                    if (desc && desc.get && !desc.set) esm = Object.assign({}, esm) // Support ESM Modules: Only make a copy if a problem
                    const og = esm[key]
                    esm[key] = (...args) =>  {
                        const context = esm[standards.specialKeys.proxy] ?? esm
                        return og.call(context, ...args)
                    }
                }
            }

            pathLoader(standards.specialKeys, esm, opts, id)
            Object.defineProperty(esm, standards.specialKeys.original, {value: copy, enumerable: false})    
            esm[standards.specialKeys.resize] = finalStates.onresize
            esm[standards.specialKeys.parent] = finalStates.parentNode

            return esm;

        } catch (e){ 
            console.error(`Failed to create an ES Component (${typeof id === 'string' ? id : id.toString()}):`, e)
            return copy
        }
}
