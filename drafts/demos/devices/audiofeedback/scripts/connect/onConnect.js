import { visualizeDirectory } from "../../../../../utils/BFS_CSV.js";

function onConnect(result){
    console.log('session', result, this);
    let cap;
    let csvmenu;

    let target = this
    do {
        target = target?.parent?.node
    } while (target.parent && !target.esElement)

    const parentNode = target?.esElement ?? document.body
    if (typeof result.subprocesses === 'object') {
        if (result.subprocesses.csv) {

            csvmenu = document.getElementById('csvmenu');

            cap = document.createElement('button');
            cap.innerHTML = `Record ${this.selected} (${this.mode})`;
            cap.onclick = () => {
                (result.subprocesses.csv).setArgs([`data/${new Date().toISOString()}_${this.selected}_${this.mode}.csv`]);
                (result.subprocesses.csv).start();
                cap.innerHTML = `Stop recording ${this.selected} (${this.mode})`;
                cap.onclick = () => {
                    (result.subprocesses.csv).stop();
                    visualizeDirectory('data', csvmenu);
                    cap.innerHTML = `Record ${this.selected} (${this.mode})`;
                }
            }

            if (parentNode) parentNode.appendChild(cap);
        }
    }

    result.options.ondisconnect = () => { visualizeDirectory('data', csvmenu); }

    //console.log(result);
    let disc = document.createElement('button');
    disc.innerHTML = `Disconnect ${this.selected} (${this.mode})`;
    disc.onclick = () => {
        result.disconnect();
        disc.remove();
        if (cap) cap.remove();
    }

    if (parentNode) parentNode.appendChild(disc);
}

export default onConnect