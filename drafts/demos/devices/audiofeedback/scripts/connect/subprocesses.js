
function subprocesses() {
    const sps = this.device.sps
    return {
    hr: {
        init: 'createSubprocess',
        initArgs: [
            'heartrate', //preprogrammed algorithm
            {sps}
        ],
        route: 'runSubprocess', //the init function will set the _id as an additional argument for runAlgorithm which selects existing contexts by _id 
        callback: (heartbeat) => {
            console.log('heartrate result', heartbeat); //this algorithm only returns when it detects a beat
        }
    },
    breath: {
        init: 'createSubprocess',
        initArgs: [
            'breath',
            {sps}
        ],
        route: 'runSubprocess',
        callback: (breath) => {
            console.log('breath detect result', breath); //this algorithm only returns when it detects a beat
        }
    },
    csv: {
        route: 'appendCSV',
        otherArgs: [`data/${new Date().toISOString()}_${this.selected}_${this.mode}.csv`], //filename
        stopped: true //we will press a button to stop/start the csv collection conditionally
    }
}
}
export default subprocesses