import { setFromPath } from "../libraries/common/pathHelpers"

export const main = document.getElementById('app')
const stateTable = document.getElementById('states')
let containers = {}
const add = (arr) => arr.reduce((a, b) => a + b, 0)
const average = (arr) => add(arr) / arr.length


export const update = async (path, info, update, toUpdate: any[] = []) => {

    // ------------------ Set Manually in Inspected State ------------------
    toUpdate.forEach(state => setFromPath(path, update, state, { create: true }))

    // ------------------ Show States on UI ------------------
    if (stateTable){

        const split = path.split('.')
        const last = split.pop()
        const obj = split.join('.')

        let container = containers[obj]
        if (!container) {
            container = containers[obj] = {
                states: {
                    averages: {},
                    elements: {},
                    output: {}
                },
                headers: {
                    name: document.createElement('th')
                }
            }
            
            container.header = document.createElement('tr')
            container.header.classList.add('header-row')
            container.headers.name.innerText = obj
            container.header.appendChild(container.headers.name)
            stateTable.appendChild(container.header)
        }

        let state = container.states[last]
        if(!state) {

            let header = container.headers.state
            if (!header) {
                const header = document.createElement('th')
                header.innerText = 'state'
                container.header.appendChild(header)
                container.headers.state = header
            }

            state = container.states[last] = {
                info: {
                    averages: {},
                    columns: {},
                    output: {}
                },
            }

            state.header = document.createElement('th')
            state.header.innerText = last
            state.div = document.createElement('tr')
            state.value = document.createElement('td')
            state.averages = {}

            state.div.appendChild(state.header)
            state.div.appendChild(state.value)
            stateTable.appendChild(state.div)
        }

        // container.table.insertAdjacentElement('afterbegin', state.div)
        // stateTable.insertAdjacentElement('afterbegin', container.div)

        state.value.innerHTML = JSON.stringify(update)


        const infoCopy = {...info}
        delete infoCopy.function
        delete infoCopy.arguments
        delete infoCopy.info

        for (let key in infoCopy) {
            const val = infoCopy[key]
            if (!state.info.averages[key]) state.info.averages[key] = []

            let output = val
            if (typeof val === 'number') {
                const aveArr = state.info.averages[key]
                aveArr.push(val)
                output = `${average(aveArr).toFixed(3)}ms`
            } 

            if (output === undefined) output = 'No Data'


            let header = container.headers[key]
            if (!header) {
                const header = document.createElement('th')
                header.innerText = key
                container.header.appendChild(header)
                container.headers[key] = header
            }


            let col = state.info.columns[key]
            if (!col) {
                col = state.info.columns[key] = document.createElement('td')
                state.div.appendChild(col)
            }

            col.innerText = output

            state.info.output[key] = output
        }


        // Shift Buffers
        for (let key in state.averages){
            if (state.averages[key].length > 100) state.averages[key].shift()
        }
    }
}