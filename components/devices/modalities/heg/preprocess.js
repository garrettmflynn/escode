
export const stats = null

export function reset(input) {
    if (input) {
        const stats = {
            baseline:0,
            current:0,
            shortChange:0,
            longChange:0,
            currentTimestamp:Date.now(),
            lastTimestamp:Date.now(),
            inputFrameTime:0,
            raw:undefined,
            buffer:new Array(512).fill(0),
            localMax:0,
        }
        if (this) this.stats = stats
        return stats
    }
}

export default function (input) { //input returned from decoder thread, ready for 

    // TODO: Handle this in the export...
    if (!this.stats) this.stats = reset(true)

    this.stats.raw = input;

    if (input.heg) {
        let heg = Array.isArray(input.heg) ? input.heg[input.heg.length - 1] : input.heg;
        this.stats.current = heg;
        this.stats.lastTimestamp = this.stats.currentTimestamp;

        this.stats.currentTimestamp = Array.isArray(input.timestamp) ? input.timestamp[input.timestamp.length - 1] : input.timestamp;

        this.stats.inputFrameTime = this.stats.currentTimestamp - this.stats.lastTimestamp;

        if (!this.stats.baseline)
            this.stats.baseline = heg; //first HEG sample
        else {
            this.stats.shortChange = (this.stats.baseline * 0.10 + heg * 0.9) - this.stats.baseline;
            this.stats.longChange = (this.stats.baseline * 0.99 + heg * 0.01) - this.stats.baseline;
            this.stats.baseline = this.stats.baseline * 0.9999 + heg * 0.0001; //have the baseline shift slowly (10000 samples)

            let newLocalMax = false;
            if (heg > this.stats.localMax) {
                this.stats.localMax = heg;
                newLocalMax = true;
            }
            let shifted = this.stats.buffer.shift();
            this.stats.buffer.push(heg);
            if (this.stats.localMax === shifted && !newLocalMax) {
                this.stats.localMax = Math.max(...this.stats.heginputBuffer);
            }

            // if (this.stats.playing) {
            //     let newVol = this.stats.playing.volume() + this.stats.longChange / this.stats.baseline;
            //     if (newVol < 0) newVol = 0;
            //     if (newVol > 1) newVol = 1;
            //     this.stats.playing.volume(newVol);
            // }
        }
    }

    return this.stats
}
