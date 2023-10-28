function routes() {
    return { //top level routes subscribe to device output thread directly (and workers in top level routes will not use main thread)
    renderer: {
        workerUrl: this.workerUrl,
        callback:'updateCanvas', //will pipe data to the canvas animation living alone on this thread
        oncreate:(self) => {

            if (!self.worker) {
                console.error(`self.worker not defined!`)
                return
            }

            //console.log(self,webapp);
            if(this.transferred.main) {
                let newCanvas = document.createElement('canvas');
                newCanvas.id = 'waveform';
                newCanvas.style.width = '100%';
                newCanvas.style.height = '300px';
                newCanvas.style.position = 'absolute';
                newCanvas.style.zIndex = '1';
                let node = document.getElementById('waveform');
                let newOCanvas = document.createElement('canvas');
                newOCanvas.id = 'waveformoverlay';
                newOCanvas.style.width = '100%';
                newOCanvas.style.height = '300px';
                newOCanvas.style.position = 'absolute';
                newOCanvas.style.zIndex = '2';

                let node2 = document.getElementById('waveformoverlay');
                let parentNode;
                if(node) {
                    parentNode = node.parentNode;
                    node.remove();
                    node2?.remove();
                }
                else parentNode = document.getElementById('waveformdiv');
                parentNode.appendChild(newCanvas); //now transferrable again
                parentNode.appendChild(newOCanvas);
            }

            let canvas = document.getElementById('waveform');
            let overlay = document.getElementById('waveformoverlay').transferControlToOffscreen();

    
            if(this.decoder.chartSettings[this.selected]) {
                self.worker.post('setValue',['chartSettings',this.decoder.chartSettings[this.selected]])
            } 

            console.log('WEBAPP', this, this.source)
            this.source.run(
                'worker.transferCanvas', 
                self.worker.worker,
                {
                    canvas,
                    context:undefined,
                    _id:'waveform',
                    overlay,
                    transfer:[overlay],
                    init:(self, canvas, context) => {

                        let settings = {
                            canvas,
                            _id:self._id,
                            overlay:self.overlay,
                            width:canvas.clientWidth,
                            height:canvas.clientHeight,
                            lines:{
                                '0':{nSec:10, sps: 250}, //{nPoints:1000}
                                '1':{nSec:10, sps: 250},
                                '2':{nSec:10, sps: 250},
                                '3':{nSec:10, sps: 250}
                            },
                            useOverlay:true,
                        };

                        if(self.graph.chartSettings) Object.assign(settings,self.graph.chartSettings);

                        let r = self.graph.run('setupChart', settings);
                    },
                    update:(
                        self,
                        canvas,
                        context,
                        data
                    )=>{
                        self.graph.run('updateChartData', 'waveform', data);
                    },
                    //draw:()=>{},
                    clear:(
                        self,
                        canvas,
                        context
                    ) => {
                        self.graph.run('clearChart','waveform');
                    }
            });
            this.transferred.main = true;
        }

        //this.source.run('worker.updateChartData')
    },
    buffering: {
        workerUrl:this.workerUrl,
        init:'createSubprocess',
        initArgs:[
            'circularBuffer2d',
            {
                bufferSize:this.device.sps,
                watch:['0','1','2','3']
            }
        ],
        callback:'runSubprocess',
        children:{
            coherence:{
                workerUrl:this.workerUrl,
                init:'createSubprocess',
                initArgs:[
                    'coherence',
                    {
                        sps:this.device.sps,
                        tags:['0','1','2','3'] //we can name the fft tags coming in from the watched buffer
                    }
                ],
                callback:'runSubprocess',
                blocking:true, //runs async without backing up on bulk dispatches
                children:{
                    coherence_main:{
                        operator:(result)=>{
                            //console.log('coherence result', result); //this algorithm only returns when it detects a beat
                            if(result?.frequencies) 
                                document.getElementById('dftxaxis').innerHTML = `<span>${result.frequencies[0]}</span><span>${result.frequencies[Math.floor(result.frequencies.length*0.5)]}</span><span>${result.frequencies[result.frequencies.length-1]}</span>`;
                        
                            let alphaCoherence = 0;
                            let ct = 0;
                            //our frequency distribution has round numbers so we can do this
                            for(let i = result.frequencies.indexOf(8); i < result.frequencies.indexOf(12); i++) {
                                alphaCoherence += result.coherence['0_1'][i];
                                ct++;
                            }
                            if(ct) alphaCoherence /= ct;
                            if(isNaN(alphaCoherence)) alphaCoherence = 0;

                            console.log('alpha coherence', alphaCoherence);
                            // if(GameState.playing) {
                            //     let newVol = alphaCoherence;
                            //     if(newVol < 0) newVol = 0;
                            //     if(newVol > 1) newVol = 1;
                            //     GameState.playing.volume(newVol);
                            // }
                        
                        }
                    },
                    crenderer: {
                        workerUrl:this.workerUrl,
                        callback:'updateCanvas', //will pipe data to the canvas animation living alone on this thread
                        oncreate:(self) => {
                            //console.log(self,webapp);
                            if(this.transferred.canvas) {
                                let newCanvas = document.createElement('canvas');
                                newCanvas.id = 'dftwaveform';
                                newCanvas.style.width = '100%';
                                newCanvas.style.height = '300px';
                                newCanvas.style.position = 'absolute';
                                newCanvas.style.zIndex = '1';
                                let node = document.getElementById('dftwaveform');
                                let newOCanvas = document.createElement('canvas');
                                newOCanvas.id = 'dftwaveformoverlay';
                                newOCanvas.style.width = '100%';
                                newOCanvas.style.height = '300px';
                                newOCanvas.style.position = 'absolute';
                                newOCanvas.style.zIndex = '2';

                                let node2 = document.getElementById('dftwaveformoverlay');
                                let parentNode;
                                if(node) {
                                    parentNode = node.parentNode;
                                    node.remove();
                                    node2?.remove();
                                }
                                else parentNode = document.getElementById('dftdiv');
                                parentNode.appendChild(newCanvas); //now transferrable again
                                parentNode.appendChild(newOCanvas);
                            }

                            let canvas = document.getElementById('dftwaveform');
                            let overlay = document.getElementById('dftwaveformoverlay').transferControlToOffscreen();

                            // if(this.decoder.chartSettings[this.selected]) {
                            //     console.log(this.decoder.chartSettings[this.selected])
                            //     self.worker.post('setValue',['chartSettings',this.decoder.chartSettings[this.selected]])
                            // } 

                            this.source.run(
                                'worker.transferCanvas', 
                                self.worker.worker,
                                {
                                    canvas,
                                    context:undefined,
                                    _id:'dftwaveform',
                                    overlay,
                                    transfer:[overlay],
                                    init:(self, canvas, context) => {

                                        let settings = {
                                            canvas,
                                            _id:self._id,
                                            overlay:self.overlay,
                                            width:canvas.clientWidth,
                                            height:canvas.clientHeight,
                                            lines:{
                                                '0_1':{nPoints: 125, ymin:0, ymax:1}, //{nPoints:1000}
                                                '0_2':{nPoints: 125, ymin:0, ymax:1},
                                                '0_3':{nPoints: 125, ymin:0, ymax:1},
                                                '1_2':{nPoints: 125, ymin:0, ymax:1},
                                                '1_3':{nPoints: 125, ymin:0, ymax:1},
                                                '2_3':{nPoints: 125, ymin:0, ymax:1}
                                            },
                                            useOverlay:true,
                                        };

                                        //if(self.graph.chartSettings) Object.assign(settings,self.graph.chartSettings);

                                        let r = self.graph.run('setupChart', settings);

                                        canvas.addEventListener('resize',() => {
                                            self.graph.run('u')
                                        });

                                    },
                                    update:(
                                        self,
                                        canvas,
                                        context,
                                        data
                                    )=>{
                                        self.graph.run('updateChartData', 'dftwaveform', data.coherence);
                                    },
                                    //draw:()=>{},
                                    clear:(
                                        self,
                                        canvas,
                                        context
                                    ) => {
                                        self.graph.run('clearChart','dftwaveform');
                                    }
                            });
                            this.transferred.canvas = true;
                        }

                        //webapp.run('worker.updateChartData')
                    },
                }
            },
        }
    },
    vrms:{
        workerUrl:this.workerUrl,
        init:'createSubprocess',
        initArgs:[
            'rms',
            {
                sps:this.device.sps,
                nSec:1,
                watch:['0','1','2','3']
            }
        ],
        callback:'runSubprocess',
        blocking:true, //runs async without backing up on bulk dispatches
        children:{
            vrms_main:{
                operator:(
                    result
                )=>{
                    // GameState.latestRMS = result;
                    console.log('vrms result', result); 
                }
            }
        }
    },
    csv:{
        workerUrl:this.workerUrl,
        // init:'createCSV',
        // initArgs:[`data/${new Date().toISOString()}_${this.selected}_${this.mode}.csv`],
        callback:'appendCSV',
        stopped:true //we will press a button to stop/start the csv collection conditionally
    },
    csv2:{
        workerUrl:this.workerUrl,
        // init:'createCSV',
        // initArgs:[`data/${new Date().toISOString()}_${this.selected}_${this.mode}.csv`],
        callback:'appendCSV',
        stopped:true //we will press a button to stop/start the csv collection conditionally
    }
}
}

export default routes