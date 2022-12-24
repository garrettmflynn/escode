import { specialKeys } from "../../../spec/properties"
import create from "../../index"

export type RuleElements = boolean | string | HTMLElement | NodeList | (() => HTMLElement[]) | HTMLElement[]

export class Rule {

    component = {}

    appliedTo: Set<HTMLElement> = new Set()

    // By default, apply to every ES Component already in the DOM
    elements: RuleElements = `[${specialKeys.attribute}]`

    constructor (component: any = {}, elements?: RuleElements) {
        if (component) this.component = component
        if (elements) this.elements = (elements === true) ? `[${specialKeys.component}]` : elements

        // Apply rule to all elements provided
        if (this.elements) this.apply(this.elements)
    }

    apply = (elements: RuleElements = this.elements) => {

        let arrayOfElements = [] as Node[]

        if (typeof elements === 'string') arrayOfElements = Array.from(document.body.querySelectorAll(this.elements))
        else if (typeof elements === 'function') arrayOfElements = this.elements()
        else if (elements instanceof HTMLElement) arrayOfElements = [elements]
        else if (elements instanceof NodeList) arrayOfElements = Array.from(elements)

        create(arrayOfElements, this.component)
        arrayOfElements.forEach(el => this.appliedTo.add(el))
    }


    remove = () => {
        console.error('Cannot remove a Rule yet...')
    }
}