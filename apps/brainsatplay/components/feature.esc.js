export function __onconnected () {
    const properties = ['number', 'title', 'description']
    properties.forEach(property => {
        if (this[property] !== undefined) this.__children.container.__children[property].__element.innerText = this[property]
    })

    if (this.projects !== undefined) {
        this.projects.forEach(project => {
            const li = document.createElement('li')
            const a = document.createElement('a')
            if (project.active === false) {
                li.style.opacity = '0.5'
                li.style.pointerEvents = 'none'
                li.style.userSelect = 'none'
            } else {
                if (project.oncreate) project.oncreate(li)

                if (project.onclick)  a.onclick = project.onclick
                else if (project.href) a.href = project.href
            }

            li.appendChild(a)
            a.innerText = project.name


            this.__children.container.__children.projects.__element.appendChild(li)
        })
    }

}

export const __attributes = {
    style: {
        padding: '1rem',
    }
}

export const __children = {
    container: {
        __children: {
            number: {
                __element: 'p',
                __attributes: {
                    innerText: '',
                    style: {
                        fontSize: '0.9rem',
                        paddingBottom: '0.5rem',
                        margin: '0px'
                    }
                }
            },
            title: {
                __element: 'h3',
                __attributes: {
                    innerText: 'Feature'
                }
            },
            description: {
                __element: 'p',
                __attributes: {
                    innerText: 'This is a feature that is featured.'
                }
            },
            projects: {
                __element: 'ul',
                __children: { }
            }
        }
    }
}