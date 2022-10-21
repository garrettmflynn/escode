import * as demo1 from './components/demo1'
import * as demo2 from './components/demo2'
import * as demo3 from './components/demo3'
import * as log from '../../../../components/basic/log.js'

export const esElement = {
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

demo1.esElement.style = demoEl.style

demo2.esElement.style = demoEl.style
demo2.esComponents.game.esElement = {
    style: {
        height: '400px',
    }
}

demo3.esElement.style = demoEl.style

export const esComponents = {
    log,
    h1: {
        esElement: {
            element: 'h1',
            attributes: {
                innerHTML: "How Does Signal Processing Work?"
            }
        }
    },
    firstsection: {
        esComponents: {
            h2: {
                esElement: {
                    element: 'h2',
                    attributes: {
                        innerHTML: "What are Signals?"
                    }
                }
            },

            block1: {
                esComponents: {
                    p1: {
                        esElement: {
                            element: 'p',
                            attributes: {
                                innerHTML: "Signals are information being carried in a medium like electricity or light that we can use to understand or communicate with each other."
                            }
                        }
                    },
                    demo1,
                }
            },


            block2: {
                esComponents: {
                    p2: {
                        esElement: {
                            element: 'p',
                            attributes: {
                                innerHTML: "However, signals usually have to compete with nonsensical noise due to imperfect device measurements and environmental interference."
                            }
                        }
                    },
                    demo2,
                }
            },


            block3: {
                esComponents: {
                    p3: {
                        esElement: {
                            element: 'p',
                            attributes: {
                                innerHTML: "This makes it hard to use these signals to do things like control a game!"
                            }
                        }
                    },
                    demo3
                }
            },


            block4: {
                esComponents: {
                    p4: {
                        esElement: {
                            element: 'p',
                            attributes: {
                                innerHTML: "We can filter some noise, but sometimes there are multiple sources of noise, in this case we still see signals from our power outlet, which oscillates as a 60Hz alternating current that isn't completely converted to DC current."
                            }
                        }
                    },
                    demo4: {
                        esElement: demoEl
                    },
                }
            },


            block5: {
                esComponents: {
                    p5: {
                        esElement: {
                            element: 'p',
                            attributes: {
                                innerHTML: "To solve this we can apply multiple filters to block different ranges or specific frequencies. "
                            }
                        }
                    },
                    demo5: {
                        esElement: demoEl
                    },
                }
            },


            block6: {
                esComponents: {
                    p6: {
                        esElement: {
                            element: 'p',
                            attributes: {
                                innerHTML: "With just a low pass and notch filter, we can now control the game with our eyes! Try it!"
                            }
                        }
                    },
                    demo6: {
                        esElement: demoEl
                    }
                }
            }
        }
    }
}

export const esListeners = {
    'firstsection.block2.demo2.datastreams': {
        // 'firstsection.block3.demo3.plotter': true,
        log: true
    },
}