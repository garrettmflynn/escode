    import { Howl, Howler } from 'howler';

    export const instance = null
    export const fftSize = 2048
    export const audioState = {
        playing: undefined,
        analyser: undefined,
        audioFFTBuffer: undefined, //default fft size
    }

    export function stop() {
        this.instance.stop()
        this.instance = undefined;
    }

    export function getState() {
        return this.audioState
    }

    export function start(value) {
        this.instance = this.audioState.playing = new Howl({
            src: value,
            loop:true,
            autoplay:true,
            volume:0.5,
            onend:()=>{},
            onplay:()=>{},
            onload:()=>{
                this.audioState.analyser = Howler.ctx.createAnalyser();
                Howler.masterGain.connect(this.audioState.analyser);
                this.audioState.analyser.connect(Howler.ctx.destination);
                this.audioState.audioFFTBuffer = new Uint8Array(this.fftSize)
                this.default(true, {_internal: true})
            }
        });
    }

    export default function(value, o) {
        if (o?._internal) return  this.audioState
        if(this.instance) this.stop()
        else this.start(value)
    }