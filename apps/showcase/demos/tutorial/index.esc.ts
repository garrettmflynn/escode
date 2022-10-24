import * as demo1 from './components/demo1'
import * as demo2 from './components/demo2'
import * as demo3 from './components/demo3'
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

demo1.esAttributes.style = demoEl.style

demo2.esAttributes.style = demoEl.style
demo2.esDOM.game.esAttributes = {
    style: {
        height: '400px',
    }
}

demo3.esAttributes.style = demoEl.style

export const esDOM = {
    log,
    h1: {
        esElement: 'h1',
        esAttributes: {
            innerHTML: "How Does Signal Processing Work?"
        }
    },
    firstsection: {
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
                            innerHTML:  "Signals are information being carried in a medium like electricity or light that we can use to understand or communicate with each other."
                        }
                    },
                    demo1,
                }
            },


            block2: {
                esDOM: {
                    p2: {
                        esElement: 'p',
                        esAttributes: {
                            innerHTML:   "However, signals usually have to compete with nonsensical noise due to imperfect device measurements and environmental interference."
                        }
                    },
                    demo2,
                }
            },


            block3: {
                esDOM: {
                    p3: {
                        esElement: 'p',
                        esAttributes: {
                            innerHTML:   "This makes it hard to use these signals to do things like control a game!"
                        }
                    },
                    demo3
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
                    }
                }
            }
        }
    }
}



// const set = new Set()
export const esListeners = {
    'firstsection.block3.demo3.plotter': {
        'firstsection.block2.demo2.datastreams': {
            esFormat: ([data, timestamps, contentHint]) => {
                return [{[contentHint]: data}]
            }
        }
    }
}