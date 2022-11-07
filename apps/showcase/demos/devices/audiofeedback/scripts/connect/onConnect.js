import { visualizeDirectory } from "../../../utils/BFS_CSV.js"

function onConnect(result){

    let cap;
    let csvmenu;

    const parentNode = this.__element.parentNode ?? document.body

    // TODO: Ensure that subprocesses come out
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
    disc.innerHTML = `Disconnect`;
    disc.onclick = () => {
        result.disconnect();
        disc.remove();
        if (cap) cap.remove();
    }

    if (parentNode) parentNode.appendChild(disc);
}

export default onConnect