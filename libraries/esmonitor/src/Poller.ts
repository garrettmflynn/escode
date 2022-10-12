import * as utils from './utils'
import { ListenerInfo, PollingOptions } from './types'

const defaultSamplingRate = 60

export default class Poller {

    #pollingId?: number;
    #sps: number;

    listeners: {[x:symbol]: ListenerInfo} = {}

    get sps(){
        return this.#sps
    }

    set sps(sps: number) {
        this.#sps = sps

        const listeners = this.listeners
        const nListeners = Object.keys(listeners).length
        if (nListeners){
            this.stop()
            this.start()
        }
    }

    constructor(
        listeners?: Poller['listeners'],
        sps?: Poller['sps']
    ) {
        if (listeners) this.listeners = listeners // Initialize listeners externally
        if (sps) this.sps = sps // Set sampling rate externally
    }

    setOptions = (opts: PollingOptions = {}) => {
        for (let key in opts) this[key] = opts[key] // Merge polling option
    }


    // Basic Object Manipulation
    add = (info: ListenerInfo) => {
        const sub = info.sub
        this.listeners[sub] = info
        this.start() // Start polling if not already started
    }
    get = (sub: ListenerInfo['sub']) => this.listeners[sub]
    remove = (sub: ListenerInfo['sub']) => {
        delete this.listeners[sub]
        if (!Object.keys(this.listeners).length) this.stop() // Stop polling if no listeners
    }

    // Poll Listeners
    poll = (listeners) => {
        utils.iterateSymbols(listeners, (sym, value) => {
            let { path, callback, current, history } = value
            if (!utils.isSame(current, history)){
                callback(path.output, current)
                if (typeof current === 'object') {
                    if (Array.isArray(current)) history = [...current]
                    else history = {...current}
                } else listeners[sym].history = current
            }
        })
    }

    // Start Polling
    start = (listeners = this.listeners) => {
        if (!this.sps) this.sps = defaultSamplingRate // Set default sampling rate
        else if (!this.#pollingId) {
            this.#pollingId = setInterval(() => this.poll(listeners), 1000/this.sps)
        }
    }

    // Stop Polling
    stop = () => {
        if (this.#pollingId) clearInterval(this.#pollingId)
    }
}
