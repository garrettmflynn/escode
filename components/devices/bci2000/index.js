import * as bci2k from "./bci2k/index.esm.js";
const sleep = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

// Startup Script
export let script = ``;
script += `Startup System localhost; `;
script += `Add State StimulusCode 4 0; `;
script += `Add State BrainClick 1 0; `;
script += `Add State Baseline 1 0; `;
script += `Add State TrialStart 1 0; `;
script += `Start executable SignalGenerator; `;
script += `Start executable DummyApplication; `;
script += `Start executable DummySignalProcessing; `;
script += `Set Parameter WSSourceServer *:20100; `;
script += `Wait for connected; `
script += `Set Config; `
script += `Start; `

export const operator = null
export const device = null

export const status = null
export const ip = 'localhost'
export const ports  = {
    operator: '80',
    device: '20100'
}

export function esConnected () {
    this.operator = new bci2k.BCI2K_OperatorConnection();
    this.device = new bci2k.BCI2K_DataConnection();
}

export const signal = []
export const states = {}
export const raw = false
export const updatedStates = false

export const _states = {} // A cache for states from BCI2000
export const signalProperties = null
export const systemState = null


export async function connect () {

    try {
    const baseURI = `ws://${this.ip}`
    const gotOperator = await this.operator.connect(`${baseURI}:${this.ports.operator}`).then(() => true)
    let response = await this.operator.execute("GET SYSTEM STATE")
    this.systemState = response
    this.operator.resetSystem();

    if(!gotOperator) return;

    this.status = 'connected'

    this.operator.execute(this.script);
    await sleep(4000); //Replace with a check to see if BCI2000 is running

    
    const gotDevice = await this.device.connect(`${baseURI}:${this.ports.device}`).then(() => true)
    if(!gotDevice) return;


    this.status = 'ready'

            // Establish general update cycle
            this.device.onGenericSignal = (raw) => {

                // Update Monitored States
                let monitoredStates = Object.keys(this._states)
                let changed = false
                monitoredStates.forEach(k => {
                    if(this.device.states[k] != null) {
                        let value = this.device.states[k][0] // Exclusive (only first index)
                        if (this.states[k] !== value) {
                            this.states[k] = value
                            changed = true
                        }
                    }
                })
               
                // Raw Data
                raw.forEach((arr,i) => {
                    const key = this.signalProperties?.channels?.[i] ?? i
                    this.signal[key] = arr
                })

                if (changed) this.updatedStates = {...this.states} // Trigger update for all states
                this.raw = {...this.signal} // Trigger setter for whole signal
                
            };

            // Initialize Possible Device States
            this.device.onStateFormat = (data) => {
                // let defaults = ['Recording', 'Running', 'SourceTime', 'StimulusTime','__pad0', 'TrialStart', 'Baseline']
                let keys = Object.keys(data)

                // keys = keys.filter(k => !defaults.includes(k))

                keys.forEach(stateId => {

                    // Determine Possible Keys
                    let possibilities = Math.pow(data[stateId].bitWidth,2)

                    // Split ID to Derive Additional Specifiers
                    // Create States Based on Possibilities
                    let id = ''
                    this._states[stateId] = Array.from({length: possibilities}, (e,i) => {
                        if (possibilities > 1) id = `${stateId}_${i}` // Create unique ID
                        else id = stateId
                        return {data: false, meta: {id}} // Set with expected (boolean) value
                    })
                })
            }

            this.device.onSignalProperties = (data) => this.signalProperties = data // Catch signal properties as a global variable
        } catch (e) {
            console.error(e)
            this.status = 'failed'
        }
}


export default () => {
    
}