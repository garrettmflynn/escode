import * as basicDemo from '../basic/index.esc'
import * as todoDemo from '../todo/index.esc'
import * as animationsDemo from '../animations/index.esc'
import * as phaserDemo from '../phaser/index.esc'
import * as multiplayerPhaserDemo from '../phaser/versions/multiplayer/index.esc'
import * as speakPhaserDemo from '../phaser/versions/speak/index.esc'

import * as devicePhaserDemo from '../phaser/versions/devices/index.esc'
import * as signalDemo from '../signal/index.esc'
import * as noisySignalDemo from '../signal/versions/noisy/index.esc'
import * as filteredSignalDemo from '../signal/versions/filtered/index.esc'

import * as audiofeedbackDemo from '../devices/audiofeedback/index.esc'

export const __attributes = {
    style: {
        padding: '50px'
    }
}

const demoEl = {
    style: {
        // padding: '25px',
        // paddingTop: "8px",
        // border: '1px solid black',
        // borderRadius: '10px',
        position: 'relative',
    }
}


const tryFromText = true

const demos = {
    basic: {
        src: tryFromText ? '../basic/index.esc' : undefined,
        ref: basicDemo
    },
    todo: {
        src: tryFromText ? '../todo/index.esc' : undefined,
        ref: todoDemo
    },
    animations: {
        src: tryFromText ? '../animations/index.esc' : undefined,
        ref: animationsDemo
    },
    phaser: {
        src: tryFromText ? '../phaser/index.esc' : undefined,
        ref: phaserDemo
    },
    multiplayerPhaser: {
        src: tryFromText ? '../phaser/versions/multiplayer/index.esc' : undefined,
        ref: multiplayerPhaserDemo
    },
    speakPhaser: {
        src: tryFromText ? '../phaser/versions/speak/index.esc' : undefined,
        ref: speakPhaserDemo
    },

    signal: {
        src: tryFromText ? '../signal/index.esc' : undefined,
        ref: signalDemo
    },
    noisySignal: {
        src: tryFromText ? '../signal/versions/noisy/index.esc' : undefined,
        ref: noisySignalDemo
    },

    filteredSignal: {
        src: tryFromText ? '../signal/versions/filtered/index.esc' : undefined,
        ref: filteredSignalDemo
    },

    devicePhaser: {
        src: tryFromText ? '../phaser/versions/devices/index.esc' : undefined,
        ref: devicePhaserDemo
    },

    audiofeedback: {
        src: tryFromText ? '../devices/audiofeedback/index.esc' : undefined,
        ref: audiofeedbackDemo
    },
    
}

const demoInfo = {} as any

const maxHeight = '300px'

// const __editor = undefined 

const __editor = {
    style: {
        height: maxHeight,
        border: '2px solid'
    }
}


for (let key in demos) {

    // Copy the editor properties
    const thisEditor = Object.assign({}, __editor)
    thisEditor.style = Object.assign({}, thisEditor.style)

    demoInfo[key] = {
        __compose: demos[key],
        __attributes: {
            style: Object.assign({}, demoEl.style)
        },
        __editor: thisEditor
    }

    if (key === 'basic') {
        demoInfo[key].__editor.style[`--${'visualscript'}-primary-color`] = 'darkblue'
        demoInfo[key].__editor.style[`--${'visualscript'}-primary-font-color`] = 'white'

    }

    // if (key.includes('phaser')) demoInfo[key].__attributes.style.height = maxHeight
}

export const __children = {

    h1: {
        __element: 'h1',
        __attributes: {
            innerHTML: "Welcome to ESCode"
        }
    },

    firstsection: {
        __children: {
            h2: {
                __element: 'h2',
                __attributes: {
                    innerHTML: "Getting Started"
                }
            },

            block1: {
                __children: {
                    p1: {
                        __element: 'p',
                        __attributes: {
                            innerHTML: "ESCode is a rapid application development framework."
                        }
                    },
                    demo1: demoInfo.basic,
                }
            },


            block2: {
                __children: {
                    p2: {
                        __element: 'p',
                        __attributes: {
                            innerHTML: "It can be used to make simple animations: "
                        },
                        __children: {
                            readout: {
                                __element: 'span',
                            },
                        }
                    },
                    demo2: demoInfo.animations,
                }
            },


            block3: {
                __children: {
                    p3: {
                        __element: 'p',
                        __attributes: {
                            innerHTML: "Or control the information flow of more complicated applications."
                        }
                    },
                    demo3: demoInfo.todo,
                }
            },


            block4: {
                __children: {
                    p4: {
                        __element: 'p',
                        __attributes: {
                            innerHTML: "You can even use it to create games!"
                        }
                    },
                    demo4: demoInfo.phaser,
                }
            },


            block5: {
                __children: {
                    p5: {
                        __element: 'p',
                        __attributes: {
                            innerHTML: "Adding another player is as simple as adding another Player component to the Game component."
                        }
                    },
                    demo5: demoInfo.multiplayerPhaser,
                }
            },


            block6: {
                __children: {
                    p6: {
                        __element: 'p',
                        __attributes: {
                            innerHTML: "And adding another control method—such as voice control—is as simple as adding a control source (e.g. the native Speech Recognition API) and a listener that handles the control source's output!"
                        }
                    },
                    demo6: demoInfo.speakPhaser,
                }
            },

            block7: {
                __children: {
                    p6: {
                        __element: 'p',
                        __attributes: {
                            innerHTML: "You can even use an embedded editor to edit the entire application!"
                        }
                    },
                    demo7: {
                        __editor: {...__editor, bind: '../../..'}
                    }
                }
            }
        }
        },
        secondsection: {
            __children: {
                h2: {
                    __element: 'h2',
                    __attributes: {
                        innerHTML: "What are Signals?"
                    }
                },

                block1: {
                    __children: {
                        p1: {
                            __element: 'p',
                            __attributes: {
                                innerHTML: "Signals are information being carried in a medium like electricity or light that we can use to understand or communicate with each other."
                            }
                        },
                        demo1: demoInfo.signal,
                    }
                },


                block2: {
                    __children: {
                        p2: {
                            __element: 'p',
                            __attributes: {
                                innerHTML: "However, signals usually have to compete with nonsensical noise due to imperfect device measurements and environmental interference."
                            }
                        },
                        demo2: demoInfo.noisySignal,
                    }
                },


                block3: {
                    __children: {
                        p3: {
                            __element: 'p',
                            __attributes: {
                                innerHTML: "This makes it hard to use these signals to do things like control a game!"
                            }
                        },
                        demo3: {
                            __compose: demoInfo.devicePhaser,
                            __children: {
                                devices: {
                                    __attributes: {
                                        style: {
                                            display:'none'
                                        }
                                    }
                                }
                            }
                        },
                    }
                },


                block4: {
                    __children: {
                        p4: {
                            __element: 'p',
                            __attributes: {
                                innerHTML: "We can filter some noise, but sometimes there are multiple sources of noise, in this case we still see signals from our power outlet, which oscillates as a 60Hz alternating current that isn't completely converted to DC current."
                            }
                        },
                        demo4: {
                            __compose: demoInfo.filteredSignal,

                            // Apply Demo-Specific Filter Bank
                            __children: {
                                devices: {
                                    __children: {
                                        filter: {
                                            settings: {
                                                useNotch50: false,
                                                useNotch60: false,
                                            },
                                        }
                                    }
                                },
                            }
                        }
                    }
                },


                block5: {
                    __children: {
                        p5: {
                            __element: 'p',
                            __attributes: {
                                innerHTML: "To solve this we can apply multiple filters to block different ranges or specific frequencies. "
                            }
                        },
                        demo5: {
                            __compose: demoInfo.filteredSignal,
                        }
                    }
                },


                block6: {
                    __children: {
                        p6: {
                            __element: 'p',
                            __attributes: {
                                innerHTML: "With just a low pass and notch filter, we can now control the game with our eyes! Try it!"
                            }
                        },
                        demo6: {
                            __compose: demoInfo.devicePhaser,
                            __children: {
                                devices: {
                                    __attributes: {
                                        style: {
                                            display:'none'
                                        }
                                    }
                                }
                            }
                        },
                    }
                }
            }
    }
}


const listeners = {
    'firstsection.block2.p2.readout': {
        'firstsection.block2.demo2.counter': true
    },
}

const phaser = [3,6]
const filtered = [4,5]

// Wire together all the data demos
const n = 6
for (let i = 1; i < n + 1; i++) {
    const list = {}
    const spsUpdates = {}
    for (let j = 1; j < n + 1; j++) {
        if (i !== j) {
            list[`secondsection.block${j}.demo${j}.devices.connect`] = true
            spsUpdates[`secondsection.block${j}.demo${j}.devices.connect.sps`] = true
        }
    }

    if (filtered.includes(i)) listeners[`secondsection.block${i}.demo${i}.devices.filter.settings.sps`] = spsUpdates
    if (!phaser.includes(i)) listeners[`secondsection.block${i}.demo${i}.devices.ondata`] = list
}

// Mirror the data above
phaser.forEach(i => {
    listeners[`secondsection.block${i}.demo${i}.devices.output`] = {
        [`secondsection.block${i-1}.demo${i-1}.devices.output`]: true
    }
})

export const __listeners = listeners
