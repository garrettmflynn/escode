import * as keys from './keys'
import { getOS } from './os'

type StatusType = 'connecting' | 'connected' | 'disconnecting' | 'disconnected'
  
export class Client {

    status: StatusType = 'disconnected'
    ws: WebSocket
    os: string
    validMessages: string[]
    #queue: {command: string, payload: any}[] = []
    #toResolve: {[key: string]: {
        resolve: (value: any) => void
        reject: (reason: any) => void
    }} = {}

    host: string
    port: number | string

    // WebSocket events
    #onmessage: WebSocket['onmessage']
    get onmessage() { return this.#onmessage }
    set onmessage(f: WebSocket['onmessage']) {  this.#onmessage = f }

    #onopen: WebSocket['onopen']
    get onopen() { return this.#onopen }
    set onopen(f: WebSocket['onopen']) {  this.#onopen = f }

    #onclose: WebSocket['onclose']
    get onclose() { return this.#onclose }
    set onclose(f: WebSocket['onclose']) { this.#onclose = f }

    constructor(host: string = 'localhost', port: number = 8765) {
        this.host = host
        this.port = port
    }

    connect = (host = this.host, port = this.port) => {
        if (this.status === 'disconnected') {
            this.host = host
            this.port = port

            const usUrl = `ws://${host}:${port}`
            console.warn(`Trying to connect to ${usUrl}`)
            const ws = new WebSocket(usUrl);
            this.status = 'connecting'

            ws.onmessage = (ev) => {
                const { id, payload, error } = JSON.parse(ev.data)

                const toResolve = this.#toResolve[id]
                if (toResolve) {
                    if (error) toResolve.reject(error)
                    else toResolve.resolve(payload)
                    delete this.#toResolve[id]
                }

                if (this.onmessage) this.onmessage.call(this.ws, ev)
            }
            
            ws.addEventListener('open', async (ev) => { 
                this.ws = ws
                console.warn(`Connected to ${usUrl}`)
                this.status = 'connected'
                this.#queue.forEach(o => this.send(o.command, o.payload))
                this.#queue = []

                const nodePlatform = await this.send('platform')
                const os = this.os = getOS(nodePlatform)
                const otherOSs = Object.entries(keys.supported).filter(([key, value]) => key !== os && value).map(([key]) => key)
                this.validMessages = keys.supported[os] ? [...keys.allKeys, ...(keys.only[os] ?? [])].filter(key => !keys.exclude[os]?.includes(key) && !otherOSs.find(os => keys.only[os]?.includes(key))) : []


                if (this.onopen) this.onopen.call(this.ws, ev)
            })

            ws.addEventListener('close', (ev) => {
                console.warn(`Disconnected from ${usUrl}`)
                this.status = 'disconnected'
                if (this.onclose) this.onclose.call(this.ws, ev)
            })

            // Close the connection if it takes too long to connect
            setTimeout(() => {
                if (this.status === 'connecting') ws.close()
            }, 2000)
        }
    }

    disconnect = () => {
        if (this.status === 'connected') {
            this.status = 'disconnecting'
            this.ws.close()
        }
    }

    send = (command, payload?) => {
        if (this.status === 'connected') {

            // Key Preprocessing
            if (command === 'key') {
                if (!this.validMessages.includes(payload)) {

                    // Basic key transformations
                    if (payload === ' ') payload = 'space'
                    if (payload === 'Enter') payload = 'enter'
                    if (payload === 'ArrowUp') payload = 'up'
                    if (payload === 'ArrowDown') payload = 'down'
                    if (payload === 'ArrowLeft') payload = 'left'
                    if (payload === 'ArrowRight') payload = 'right'

                    if (!this.validMessages.includes(payload)) {
                        console.warn(`${payload} is not a valid key for ${this.os}`)
                        return
                    }
                }
            }

            const id = Math.random().toString(36).substr(2, 9)
            const message = { command, id }
            if (payload) message['payload'] = payload

            this.ws.send(JSON.stringify(message))
            return new Promise((resolve, reject) => this.#toResolve[id] = {resolve, reject})
        } 
        
        else if (this.status === 'connecting') this.#queue.push({ command, payload })
    }
}