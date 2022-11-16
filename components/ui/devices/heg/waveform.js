
    export const webaudio = null
    export const data = null
    export const canvas = null
    export const ctx = null

    export const __element = 'canvas'

    export function __onconnected() { 

        if (this.__element instanceof HTMLCanvasElement) this.canvas = this.__element
        else {
            this.canvas = document.createElement('canvas')
            this.__element.appendChild(this.canvas)
        }

        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        let ctx = this.canvas.getContext('2d');
        this.ctx = ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    }


    // Auto-Animate
    export const __animate = true

    export default function(input) {

        // Save Data
        if (input !== undefined) this.data = input

        // Only Redraw on Raw Animation Loop
        else {

            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            let x = 0;
            let sliceWidth = (this.canvas.width * 1.0) / 512;

            if(this.data) {

                this.ctx.lineWidth = 2;
                    
                this.ctx.strokeStyle = 'limegreen'
                this.ctx.beginPath();

                for (let i = 0; i < 512; i++) {
                    let v = 1 - this.data.buffer[i] / this.data.localMax;
                    let y = (v * this.canvas.height + this.canvas.height)*0.5;

                    if (i === 0) {
                        this.ctx.moveTo(x, y)
                    } else {
                        this.ctx.lineTo(x, y)
                    }

                    x += sliceWidth;
                }
            }

            this.ctx.lineTo(this.canvas.width, this.canvas.height )
            this.ctx.stroke()

            if(this.webaudio) {
                this.webaudio.analyser.getByteFrequencyData(this.webaudio.audioFFTBuffer);           
                this.ctx.strokeStyle = 'royalblue'
                this.ctx.beginPath()

                x = 0

                for (let i = 0; i < 512; i++) {
                    let v = this.webaudio.audioFFTBuffer[i] / 255.0
                    let y = (this.canvas.height - v * this.canvas.height) 

                    if (i === 0) {
                        this.ctx.moveTo(x, y)
                    } else {
                        this.ctx.lineTo(x, y)
                    }

                    x += sliceWidth;
                }

                this.ctx.lineTo(this.canvas.width, this.canvas.height )
                this.ctx.stroke();
            }
        }
    }