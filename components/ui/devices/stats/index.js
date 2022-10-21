
    export const latest = null

    export const animation = function(){
        const thisLatest = this.latest ?? {}
        if((!this.esElement.innerHTML || thisLatest.currentTimestamp !== thisLatest.lastTimestamp)){
            const timestamp = (thisLatest.currentTimestamp) ? new Date(thisLatest.currentTimestamp).toISOString() : 0

            // Calculate RMSE Stats
            const rmsetemplate =  ``
            let rmskeys = Object.keys(thisLatest.latestRMS ?? {}); //1 second RMS average used as predicted value for getting the error
            if(rmskeys.length > 0) { 
                rmsetemplate = ``;
                rmskeys.forEach((key) => {
                    if(thisLatest.latestRaw[key] && key !== 'timestamp') {
                        if(Array.isArray(thisLatest.latestRaw[key])) rmsetemplate += `<div>${key}: ${thisLatest.sampleError[key][thisLatest.sampleError[key].length - 1]}</div>`;
                        else rmsetemplate += `<div>${key}: ${thisLatest.sampleError[key]}</div>`;
                    }
                });
                // if(recording) {
                //     info.routes.csv2.worker.post('appendCSV',thisLatest.sampleError)
                // }
            }

            this.esElement.innerHTML = `
            STATS:
            <tr> <th>Timestamp: </th><td>${timestamp}</td> </tr>
            <tr> <th>Current: </th><td>${thisLatest.current?.toFixed(2) ?? 0}</td> </tr>
            <tr> <th>Baseline: </th><td>${thisLatest.baseline?.toFixed(2) ?? 0}</td> </tr>
            ${thisLatest.shortChange ? `<tr> <th>Fast Change: </th><td>${thisLatest.baseline ? (100*thisLatest.shortChange/thisLatest.baseline)?.toFixed(2) : 0}%</td> </tr>` : ''}
            ${thisLatest.longChange ? `<tr> <th>Slow Change: </th><td>${thisLatest.baseline ? (100*thisLatest.longChange/thisLatest.baseline)?.toFixed(2): 0}%</td> </tr>` : ''}
            ${rmsetemplate ? `<tr> <th>RMSE: </th><td>${rmsetemplate}</td></tr>` : ''}
            `
        }
    }

    export default function(stats){
        this.latest = stats  // merge
    }