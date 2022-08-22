export default class ESComponent {

    stateless = true // Determine whether the component is stateless or stateful
    
    constructor(module){
       this.init(module)
    }

    init = (module) => {
        this.module = (typeof module === 'string') ? await import(module) : module
        const isValid = this.validate(module)
        if (isValid) {
            console.log('Is a valid ES Component')
        }

    }

    validate = (module) => {
        const errors = []

        // Check if the component has a default export
        if (!('default' in module)) errors.push({message: 'default export is missing'})
        
        // Check if the component is stateless
        if (Object.keys(module).length != 1) {
            this.stateless = false
        }


        // Determine validity of the component
        const valid = errors.length === 0
        return valid
    }
}