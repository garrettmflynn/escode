import * as todoDemo from '../todo/index.esc'

export const esElement = {
    element: 'div',
    style: {
        padding: '50px'
    }
}

const demoEl = {
    element: 'div',
    style: {
        padding: '25px',
        paddingTop: "8px",
        border: '1px solid black',
        borderRadius: '10px'
    }
}  

const todoComponent = Object.assign({}, todoDemo) as any
todoComponent.esElement = demoEl


export const esComponents = {
    h1: {
        esElement: {
            element: 'h1',
            attributes: {
                innerHTML: "How Does Signal Processing Work?"
            }
        }
    },
    firstsection: {
        esElement: 'div',
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
                esElement: 'div',
                esComponents: {
                    p1: {
                        esElement: {
                            element: 'p',
                            attributes: {
                                innerHTML: "Signals are information being carried in a medium like electricity or light that we can use to understand or communicate with each other."
                            }
                        }
                    },
                    demo1: todoComponent,
                }
            },


            block2: {
                esElement: 'div',
                esComponents: {
                    p2: {
                        esElement: {
                            element: 'p',
                            attributes: {
                                innerHTML: "However, signals usually have to compete with nonsensical noise due to imperfect device measurements and environmental interference."
                            }
                        }
                    },
                    demo2: {
                        esElement: demoEl
                    },
                }
            },


            block3: {
                esElement: 'div',
                esComponents: {
                    p3: {
                        esElement: {
                            element: 'p',
                            attributes: {
                                innerHTML: "This makes it hard to use these signals to do things like control a game!"
                            }
                        }
                    },
                    demo3: {
                        esElement: demoEl
                    },
                }
            },


            block4: {
                esElement: 'div',
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
                esElement: 'div',
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
                esElement: 'div',
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

}
