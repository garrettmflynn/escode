export let active = false
export let sampleCt = 1000

export function start(){

    let anim = () => {

        // const arr1 = new Array(this.sampleCt).fill(0).map((v,i)=>{ return Math.sin(2*Math.PI*(5)*(Date.now()/1000+(i/this.sampleCt))); })
        // const arr2 = new Array(this.sampleCt).fill(0).map((v,i)=>{ return 1+Math.sin(2*Math.PI*(15)*(Date.now()/1000+(i/this.sampleCt))); })
        // const arr3 = new Array(this.sampleCt).fill(0).map((v,i)=>{ return 2+0.5*Math.sin(2*Math.PI*(10)*(Date.now()/1000+(i/this.sampleCt))); })
        const arr4 = new Array(this.sampleCt).fill(0).map((v,i)=>{ return 0.5*Math.sin(2*Math.PI*(25)*(Date.now()/1000+(i/this.sampleCt))); })
        const arr5 = new Array(this.sampleCt).fill(0).map((v,i)=>{ return 0.5*Math.sin(2*Math.PI*(1)*(Date.now()/1000+(i/this.sampleCt))); })
        const arr6 = new Array(this.sampleCt).fill(0).map((v,i)=>{ return 0.5*Math.sin(2*Math.PI*(3)*(Date.now()/1000+(i/this.sampleCt))); })
        this.default(
            // arr1, 
            // arr2, 
            // arr3, 
            arr4, 
            arr5, 
            arr6
        )

        requestAnimationFrame(anim);
    }
    
    if (!this.active) anim();
}

export default (...args) => args