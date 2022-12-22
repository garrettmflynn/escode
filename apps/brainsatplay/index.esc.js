import * as statement from './components/statement.esc.js'
import * as feature from './components/feature.esc.js'
import * as twitch from './components/twitch.esc.js'



const borderStyle = {
    borderBottom: '2px solid white',
    paddingBottom: '0.5rem',
    paddingRight: '1rem'
}

const list = {
    list: [],
    __element: 'ul',
    __onconnected: function () {
        this.__element.innerHTML = ''
        this.list.forEach(link => {
            const li = document.createElement('li')
            const a = document.createElement('a')
            a.innerText = link.label
            li.appendChild(a)
            this.__element.appendChild(li)

            if (link.oncreate) link.oncreate(li)

            if (link.onclick) a.onclick = link.onclick
            else a.href = link.href

        })
    },
}

const links = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '#about' },
    { label: 'Work', href: '#work' },
    { label: 'Ethos', href: '#ethos' },
    { label: 'Twitch', href: '#twitch' },

]

export const nav = {
    __element: 'nav',
    __attributes: {
        style: {
            position: 'fixed',
            top: '0px',
            right: '0px',
            paddingRight: '2rem',
        }
    },
    list: {
        list: links,
        __compose: list,
        __attributes: {
            style: {
                textTransform: 'uppercase',
            }
        },
    }

}

export const content = {

    hero: {
        __element: 'section',
        container: {
            title: {
                __element: 'h1',
                __attributes: {
                    innerText: 'Brains@Play'
                },
            },
            subtitle: {
                __element: 'h2',
                __attributes: {
                    innerText: 'The Universal Web Development Cooperative'
                }
            },
            description: {
                __element: 'p',
                __attributes: {
                    innerText: 'We empower everyone to build better apps—together.'
                }
            }
        }
    },
    about: {
        __element: 'section',
        __attributes: {
            style: {
                background: 'darkslategray'
            }
        },
        container: {
            title: {
                text: {
                    __element: 'h2',
                    __attributes: {
                        innerText: 'About Us'
                    }
                },
                support: {
                    __element: 'a',
                    __attributes: {
                        href: "https://opencollective.com/brainsatplay",
                        target: "_blank",
                    },
                    image: {
                        __element: 'img',
                        __attributes: {
                            height: 40,
                            src: "https://opencollective.com/brainsatplay/contribute/button@2x.png?color=white"
                        }
                    }
                },
                __attributes: {
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        ...borderStyle
                    }
                }
            },
            description: {
                __element: 'p',
                __attributes: {
                    innerHTML: "Brains@Play is currently led by two developers—<a href='https://github.com/garrettmflynn' target='_blank'>Garrett Flynn</a> and <a href='https://github.com/garrettmflynn' target='_blank'>Joshua Brewster</a>—working to build a better Web with free software."
                }
            },
            statements: {
                __attributes: {
                    style: {
                        display: 'flex',
                        flexWrap: 'wrap'
                    }
                },
                mission: {
                    header: 'Mission',
                    text: 'Make code universally <a>shareable</a>, <a>modifiable</a>, and <a>usable</a>.',
                    __compose: statement,
                    __attributes: {
                        style: {
                            flexBasis: '50%',
                            padding: '15px'
                        }
                    },
                },

                vision: {
                    header: 'Vision',
                    text: 'Engulf the Web in public experiments of communal organization and citizen science, engineering, and art.',
                    __compose: statement,
                    __attributes: {
                        style: {
                            flexBasis: '50%',
                            padding: '15px'
                        }
                    },
                }
            },
        }
    },
    ethos: {
        __element: 'section',
        container: {
            title: {
                __element: 'h2',
                __attributes: {
                    innerText: 'Our Ethos',
                    style: {
                        ...borderStyle
                    }
                }
            },
            featureone: {
                number: '1',
                title: 'Recompose the Web',
                description: 'We are consuming the infrastructure of the Web.',
                projects: [
                    {
                        name: 'ES Components (ESC)',
                        link: 'https://github.com/brainsatplay/escomponent',
                        version: '0.1.7',
                        description: 'A specification for composable JavaScript objects with concurrent message-passing.',
                    },
                    {
                        name: 'ESCode',
                        link: 'https://github.com/brainsatplay/escode',
                        version: '0.1.7',
                        description: 'A framework for using ES Components using graphscript.',
                    },
                    {
                        name: 'Web Source Accessibility Guidelines (WSAG)',
                        active: false,
                        version: '0.0.0',
                        description: 'Identify best practices to allow anyone to use, modify, and share Web Components.',
                    },
                ],
                __compose: feature
            },
            featuretwo: {
                number: '2',
                title: 'Make Software Yours',
                description: 'Bring yourself to every page.',
                projects: [
                    {
                        name: 'Browser Extension',
                        link: 'https://github.com/brainsatplay/brainsatplay-extension',
                        version: '0.0.0',
                        oncreate: (element) => {

                            const extensionScriptId = 'brainsatplay-injection-proxy'

                            const openOptions = (id) => {
                                window.postMessage({
                                    source: id,
                                    command: 'openOptions' // direct shortcut command
                                })
                            }

                            const checkExtension = () => {
                                let hasExtension = false;

                                element.onclick = () => {
                                    const extensionURL = "https://github.com/brainsatplay/brainsatplay-extension"
                                    window.open(extensionURL, '_blank');
                                }

                                // Check if extension is installed
                                const el = document.getElementById(extensionScriptId);
                                if (el) {
                                    const version = el.getAttribute('data-version')
                                    if (version) {
                                        const id = el.getAttribute('data-id')
                                        // if (version >= requiredVersion) {
                                        hasExtension = true;
                                        element.onclick = () => openOptions(id)
                                        // }
                                    }
                                }

                                return hasExtension
                            }

                            window.onload = function () {
                                const res = checkExtension()
                                if (!res) setTimeout(checkExtension, 100)
                            }
                        },
                        description: 'Apply components across web pages.',
                    },
                    {
                        name: 'Desktop App',
                        link: 'https://github.com/brainsatplay/brainsatplay-electron',
                        version: '0.0.0',
                        onclick: () => {
                            customProtocolCheck(
                                "brainsatplay://",
                                () => {
                                    window.open("https://github.com/brainsatplay/brainsatplay-desktop", "_blank");
                                    console.log("Custom protocol not found.");
                                },
                                () => {
                                    console.log("Custom protocol found and opened the file successfully.");
                                },
                                // 5000
                            )
                        },
                        description: 'Create composable cross-platform web systems.',
                    }
                ],
                __compose: feature
            },
            featurethree: {
                number: '3',
                title: 'Free Public Experimentation',
                description: 'We are supporting new scientific and human-computer interaction (HCI) advances that drive experimentation on the Web and translate quickly across sites.',
                projects: [
                    {
                        name: 'WebNWB',
                        link: 'https://github.com/brainsatplay/webnwb',
                        description: 'Enable citizen neuroscience.',
                        version: '0.0.12',
                    },
                    {
                        name: 'MyAlyce',
                        link: 'https://myalyce.com',
                        description: 'Enable citizen neuroscience.',
                        version: '0.0.0',
                    }
                ],
                __compose: feature
            },
        },

        twitch,
    },
}

export const footer = {
    __element: 'footer',
    __attributes: {
        style: {
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'black',
            color: 'white',
            padding: '25px 50px'
        }
    },
        title: {
                // logo: {
                //     __element: 'img',
                //     __attributes: {
                //         src: 'https://brainsatplay.com/assets/images/logo.png',
                //     }
                // },
                text: {
                    __element: 'span',
                    __attributes: {
                        innerText: '© Brains@Play 2022'
                    }
                }
        },
        links: {
            __compose: list,
            list: [
                ...links
            ]
        },
        social: {
            __element: 'ul',
            email: {
                __element: 'li',
                link: {
                    __element: 'a',
                    __attributes: {
                        href: 'mailto:contact@brainsatplay.com',
                        innerText: 'contact@brainsatplay.com'
                    }
                },
            },
            newsletter: {
                __element: 'li',
                link: {
                    __element: 'a',
                    __attributes: {
                        href: 'https://brainsatplay.substack.com',
                        innerText: 'Sign up for our newsletter',
                        style: {
                            fontSize: '0.8rem'
                        }
                    }
                }
        }
    }
}