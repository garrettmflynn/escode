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

export const esAttributes = {
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

const demos = {
    basic: {
        esURI: '../basic/index.esc',
        esReference: basicDemo
    },
    todo: {
        esURI: '../todo/index.esc',
        esReference: todoDemo
    },
    animations: {
        esURI: '../animations/index.esc',
        esReference: animationsDemo
    },
    phaser: {
        esURI: '../phaser/index.esc',
        esReference: phaserDemo
    },
    multiplayerPhaser: {
        esURI: '../phaser/versions/multiplayer/index.esc',
        esReference: multiplayerPhaserDemo
    },
    speakPhaser: {
        esURI: '../phaser/versions/speak/index.esc',
        esReference: speakPhaserDemo
    },

    signal: {
        esURI: '../signal/index.esc',
        esReference: signalDemo
    },
    noisySignal: {
        esURI: '../signal/versions/noisy/index.esc',
        esReference: noisySignalDemo
    },

    filteredSignal: {
        esURI: '../signal/versions/filtered/index.esc',
        esReference: filteredSignalDemo
    },

    devicePhaser: {
        esURI: '../phaser/versions/devices/index.esc',
        esReference: devicePhaserDemo
    },

    audiofeedback: {
        esURI: '../devices/audiofeedback/index.esc',
        esReference: audiofeedbackDemo
    },
    
}

const demoInfo = {} as any

const maxHeight = '300px'

// const esCode = undefined 

const esCode = {
    style: {
        height: maxHeight,
        border: '2px solid'
    }
}

for (let key in demos) {
    demoInfo[key] = {
        esCompose: demos[key],
        esAttributes: {
            style: Object.assign({}, demoEl.style)
        },
        esCode
    }

    // if (key.includes('phaser')) demoInfo[key].esAttributes.style.height = maxHeight
}

export const esDOM = {

    h1: {
        esElement: 'h1',
        esAttributes: {
            innerHTML: "Welcome to the Brains@Play Framework"
        }
    },
    firstsection: {
        esDOM: {
            h2: {
                esElement: 'h2',
                esAttributes: {
                    innerHTML: "Getting Started"
                }
            },

            block1: {
                esDOM: {
                    p1: {
                        esElement: 'p',
                        esAttributes: {
                            innerHTML: "Brains@Play is a rapid application development framework."
                        }
                    },
                    demo1: demoInfo.basic,
                }
            },


            block2: {
                esDOM: {
                    p2: {
                        esElement: 'p',
                        esAttributes: {
                            innerHTML: "It can be used to make simple animations: "
                        },
                        esDOM: {
                            readout: {
                                esElement: 'span',
                            },
                        }
                    },
                    demo2: demoInfo.animations,
                }
            },


            block3: {
                esDOM: {
                    p3: {
                        esElement: 'p',
                        esAttributes: {
                            innerHTML: "Or control the information flow of more complicated applications."
                        }
                    },
                    demo3: demoInfo.todo,
                }
            },


            block4: {
                esDOM: {
                    p4: {
                        esElement: 'p',
                        esAttributes: {
                            innerHTML: "You can even use it to create games!"
                        }
                    },
                    demo4: demoInfo.phaser,
                }
            },


            block5: {
                esDOM: {
                    p5: {
                        esElement: 'p',
                        esAttributes: {
                            innerHTML: "Adding another player is as simple as adding another Player component to the Game component."
                        }
                    },
                    demo5: demoInfo.multiplayerPhaser,
                }
            },


            block6: {
                esDOM: {
                    p6: {
                        esElement: 'p',
                        esAttributes: {
                            innerHTML: "And adding another control method—such as voice control—is as simple as adding a control source (e.g. the native Speech Recognition API) and a listener that handles the control source's output!"
                        }
                    },
                    demo6: demoInfo.speakPhaser,
                }
            }
        }
        },
        secondsection: {
            esDOM: {
                h2: {
                    esElement: 'h2',
                    esAttributes: {
                        innerHTML: "What are Signals?"
                    }
                },

                block1: {
                    esDOM: {
                        p1: {
                            esElement: 'p',
                            esAttributes: {
                                innerHTML: "Signals are information being carried in a medium like electricity or light that we can use to understand or communicate with each other."
                            }
                        },
                        demo1: demoInfo.signal,
                    }
                },


                block2: {
                    esDOM: {
                        p2: {
                            esElement: 'p',
                            esAttributes: {
                                innerHTML: "However, signals usually have to compete with nonsensical noise due to imperfect device measurements and environmental interference."
                            }
                        },
                        demo2: demoInfo.noisySignal,
                    }
                },


                block3: {
                    esDOM: {
                        p3: {
                            esElement: 'p',
                            esAttributes: {
                                innerHTML: "This makes it hard to use these signals to do things like control a game!"
                            }
                        },
                        demo3: demoInfo.devicePhaser,
                    }
                },


                block4: {
                    esDOM: {
                        p4: {
                            esElement: 'p',
                            esAttributes: {
                                innerHTML: "We can filter some noise, but sometimes there are multiple sources of noise, in this case we still see signals from our power outlet, which oscillates as a 60Hz alternating current that isn't completely converted to DC current."
                            }
                        },
                        demo4: demoInfo.noisySignal,
                    }
                },


                block5: {
                    esDOM: {
                        p5: {
                            esElement: 'p',
                            esAttributes: {
                                innerHTML: "To solve this we can apply multiple filters to block different ranges or specific frequencies. "
                            }
                        },
                        demo5: demoInfo.filteredSignal,
                    }
                },


                block6: {
                    esDOM: {
                        p6: {
                            esElement: 'p',
                            esAttributes: {
                                innerHTML: "With just a low pass and notch filter, we can now control the game with our eyes! Try it!"
                            }
                        },
                        demo6: demoInfo.devicePhaser,
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
// Wire together all the data demos
const n = 6
for (let i = 1; i < n + 1; i++) {
    const list = {}
    for (let j = 1; j < n + 1; j++) {
        if (i !== j) {
            list[`secondsection.block${j}.demo${j}.devices.connect`] = true
        }
    }

    if (!phaser.includes(i)) listeners[`secondsection.block${i}.demo${i}.devices.ondata`] = list
}

// Mirror the data above
phaser.forEach(i => {
    listeners[`secondsection.block${i}.demo${i}.devices.ondata`] = {
        [`secondsection.block${i-1}.demo${i-1}.devices.ondata`]: true
    }
})

// // const set = new Set()
export const esListeners = listeners