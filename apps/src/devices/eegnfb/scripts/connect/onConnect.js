
import { visualizeDirectory } from "../../../../../utils/BFS_CSV.js";
import { setSignalControls } from 'graphscript-services'//'../../extras/webgl-plot/webglplot.routes'

function onConnect(result){
    console.log('session', result);

    if(this.decoder.filterPresets[this.selected]) { //enable filters, which are customizable biquad filters
        result.workers.streamworker.post(
            'setFilters', 
            this.decoder.filterPresets[this.selected]
        );
    }


    let target = this
    do {
        target = target?.parent
    } while (target.parent && !target.element)

    const parentNode = target?.parentNode?.element ?? document.body

    let cap;
    let csvmenu;
    if(typeof result.routes === 'object') {
        if(result.routes.csv) {
            
            csvmenu = document.getElementById('csvmenu');
            
            cap = document.createElement('button');
            cap.innerHTML = `Record ${this.selected} (${this.mode})`;
            let onclick = () => {
                recording = true;
                result.routes.csv.worker.post(
                    'createCSV',
                    [
                        `data/${new Date().toISOString()}_${this.selected}_${this.mode}.csv`,
                        ['timestamp','0','1','2','3','4','5','6','7']
                    ]
                );
                result.routes.csv2.worker.post(
                    'createCSV',
                    [
                        `data/${new Date().toISOString()}_RMS_${this.selected}_${this.mode}.csv`,
                        ['timestamp','0','1','2','3']
                    ]
                );
                result.routes.csv.worker.start();
                cap.innerHTML = `Stop recording ${this.selected} (${this.mode})`;
                cap.onclick = () => {
                    recording = false;
                    result.routes.csv.worker.stop();
                    visualizeDirectory('data', csvmenu);
                    cap.innerHTML = `Record ${this.selected} (${this.mode})`;
                    cap.onclick = onclick;
                }
            }

            cap.onclick = onclick;

            parentNode.appendChild(cap);
            
            document.getElementById('waveformoverlay').onmouseover = async (ev) => {
                await setSignalControls(
                    document.getElementById('waveformcontrols'),
                    'waveform',
                    result.workers.streamworker,
                    result.routes.renderer.worker 
                )
                document.getElementById('waveformcontrols').style.display = '';
            }
        }
    }
    result.options.ondisconnect = () => { visualizeDirectory('data',csvmenu); }

    //console.log(result);
    let disc = document.createElement('button');
    disc.innerHTML = `Disconnect ${this.selected} (${this.mode})`;
    disc.onclick = () => {
        result.disconnect();
        disc.remove();
        if(cap) cap.remove();
    }

    parentNode.appendChild(disc);
}

export default onConnect