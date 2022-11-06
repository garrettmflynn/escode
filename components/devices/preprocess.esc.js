export default (o) => {

    // EEG
    if (o.timestamp) Object.defineProperty(o, 'timestamp', {value: o.timestamp})

    if ('electrode' in o){
        return {
            [o.electrode[0]]: o.samples
        }
    } 
    
    // Synthetic Data
    else if (o.timestamp) return o

}