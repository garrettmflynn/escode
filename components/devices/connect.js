import * as deviceDecoder from 'device-decoder' 
export const mode = 'BLE'
export const selected = 'hegduino'

// Responses
export const decoder = deviceDecoder
export const ondecoded = undefined
export const subprocesses = {}
export const routes = {}
export const onconnect = () => {}
export const device = null
export const info = null
export const thirdPartyDecoder = null
export const workerUrl = null //gsworker

// States
export const transferred = {
    main: false,
    canvas: false
}

export default async function (selected, o) {

            if (o?._internal) return selected // pass new data to children

            this.selected = selected

            const devices = this.thirdPartyDecoder?.Devices ?? this.decoder.Devices

            this.device = devices[this.mode][this.selected]

            if (!this.device) {
                console.warn('Device not found...', this.mode, this.selected)
                return;
            }

            if (this.info) {
                this.info.disconnect()
                this.info = null
            }

            const subprocesses = (typeof this.subprocesses === 'function') ? this.subprocesses.call(this) : this.subprocesses
            const routes = (typeof this.routes === 'function') ? this.routes.call(this) : this.routes

            let info = this.decoder.initDevice(
                this.mode,
                this.selected,
                {
                    devices,
                    routes,
                    subprocesses,
                    workerUrl: this.workerUrl,
                    ondecoded: (...args) => {
                        if (this.ondecoded) this.ondecoded(...args)
                        this.run(args, {_internal: true})
                    },
                }
            );
    
            if (info && typeof this.onconnect === 'function') {
                this.info = await info
                this.onconnect.call(this, this.info)
                return this.info
            }
}
