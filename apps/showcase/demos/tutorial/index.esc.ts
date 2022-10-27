import * as basicDemo from '../basic/index.esc'
import * as todoDemo from '../todo/index.esc'
import * as animationsDemo from '../animations/index.esc'
import * as phaserDemo from '../phaser/index.esc'
import * as multiplayerPhaserDemo from '../phaser/versions/multiplayer/index.esc'
import * as devicePhaserDemo from '../phaser/versions/devices/index.esc'
import * as signalDemo from '../signal/index.esc'

import * as log from '../../../../components/basic/log.js'

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
    basic: basicDemo,
    todo: todoDemo,
    animations: animationsDemo,
    phaser: phaserDemo,
    multiplayerPhaser: multiplayerPhaserDemo,

    signal: signalDemo,
    devicePhaser: devicePhaserDemo,
}

const demoInfo = {} as any

const maxHeight = '300px'

for (let key in demos) {
    demoInfo[key] = {
        esCompose: demos[key],
        esAttributes: {
            style: Object.assign({}, demoEl.style)
        },
        esCode: {
            style: {
                height: maxHeight,
                border: '2px solid'
            }
        }
    }

    // if (key.includes('phaser')) demoInfo[key].esAttributes.style.height = maxHeight
}

export const esDOM = {
    log,
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
                            innerHTML: "It can be used to make simple animations."
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
                    // demo5: demoInfo.multiplayerPhaser,
                }
            },


            block6: {
                esDOM: {
                    p6: {
                        esElement: 'p',
                        esAttributes: {
                            innerHTML: "And adding another control method—such as physiological data—is as simple as adding a control source (e.g. a blink detector using electroencephalography, or EEG, data) and a listener that handles the control source's output!"
                        }
                    },
                    // demo6: demoInfo.devicePhaser,
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
                        // demo2: demoInfo.signal,
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
                        // demo3: demoInfo.signal,
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
                        demo4: {
                            esElement: demoEl
                        },
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
                        demo5: {
                            esElement: demoEl
                        },
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
                        demo6: {
                            esElement: demoEl
                        },
                    }
                }
            }
    }
}



// // const set = new Set()
// export const esListeners = {
//     'firstsection.block3.demo3.plotter': {
//         'firstsection.block2.demo2.datastreams': {
//             esFormat: ([data, timestamps, contentHint]) => {
//                 return [{ [contentHint]: data }]
//             }
//         }
//     }
// }