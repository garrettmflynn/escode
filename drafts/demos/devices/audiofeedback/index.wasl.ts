//@ts-nocheck
//resources
// import { DOMService, SubprocessWorkerInfo } from 'graphscript'//'../../index'////'../../index';
import { DOMService, SubprocessWorkerInfo } from '../../../index'//'../../index'////'../../index';

// plugins
import * as plugins from '../../../plugins/index.js'
const soundDropdown =plugins.wasl.instance(plugins.output.sound.dropdown, { 
    soundFilePaths = [
        {
            "label": "Kalimba",
            "src": "../assets/kalimba.wav"
        },
        {
            "label": "Phonk",
            "src": "../assets/phonk.wav"
        },
        {
            "label": "Synth Flute",
            "src": "../assets/synthflute.wav"
        }
    ]
})

//types
import { ElementProps, ElementInfo } from 'graphscript/services/dom/types/element';
//import { ComponentProps } from 'graphscript/services/dom/types/component';

//start of your web page
const webappHtml = {
    'app':{
        tagName:'div',
        children:{
            'devices':{
                tagName:'div',
                children:{
                    'devicediv':{
                        tagName:'div',
                        children:{
                            'connectheader': plugins.connect.header as ElementProps,
                            'connectmode': plugins.connect.mode as ElementProps,
                            'selectUSB': plugins.select.usb as ElementProps,
                            'selectBLE': plugins.select.ble as ElementProps,
                            'connectDevice': plugins.connect.device as ElementProps
                        }
                    }
                }
            },
            'output':{
                tagName:'div',
                children:{
                    'playsounds':{
                        tagName:'div',
                        children:{
                            'soundheader': output.sound.header as ElementProps,
                            'soundDropdown': soundDropdown as ElementProps,
                            'play': plugins.output.sound.play as ElementProps,
                            'stop': plugins.output.sound.stop as ElementProps
                        }
                    } as ElementProps,
                    'stats': plugins.output.stats.start as ElementProps,
                    'resetstats': plugins.output.stats.reset as ElementProps,
                    'waveform': plugins.output.waveform as ElementProps,
                    'csvmenu': plugins.output.csv.menu as ElementProps,
                }
            } as ElementProps
        }
    } as ElementProps
}


const webapp = new DOMService({
    routes:webappHtml
});