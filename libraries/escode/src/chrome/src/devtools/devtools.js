let states = {
  document: null,
  table: null
}; 


// ------------------------------------------------------------------
// ----------------------- UI Management Code -----------------------
// ------------------------------------------------------------------

let sections = {}
let headers = []

const add = (arr) => arr.reduce((a, b) => a + b, 0)
const average = (arr) => add(arr) / arr.length

const update = async (path, info, update) => {

    states.error.style.display = 'none'

    // ------------------ Show States on UI ------------------
    if (states.table){

        const split = path.split('.')
        const last = split.pop()
        const obj = split.join('.')

        let section = sections[obj]
        if (!section) {
            section = sections[obj] = {
                states: {
                    averages: {},
                    elements: {},
                    output: {}
                },
                columns: {
                    name: document.createElement('th')
                }
            }
            
            section.header = document.createElement('tr')
            section.header.classList.add('header-row')
            section.columns.name.innerText = obj
            section.header.appendChild(section.columns.name)
            states.table.appendChild(section.header)
        }

        let state = section.states[last]
        if(!state) {

            let header = section.columns.state
            if (!header) {
                const header = document.createElement('th')
                header.innerText = 'state'
                section.header.appendChild(header)
                section.columns.state = header
            }

            state = section.states[last] = {
                info: {
                    averages: {},
                    columns: {},
                    output: {}
                },
            }

            state.header = document.createElement('th')
            state.header.innerText = path
            state.div = document.createElement('tr')
            state.value = document.createElement('td')
            state.averages = {}

            state.div.appendChild(state.header)
            state.div.appendChild(state.value)
        }

        section.header.insertAdjacentElement('afterend', state.div)

        if (typeof update === 'object') state.value.innerHTML = 'Object' //JSON.stringify(update)
        else state.value.innerHTML = JSON.stringify(update)

        const infoCopy = {...info}

        for (let key in infoCopy) {
          if (!headers.includes(key)) headers.push(key)
        }

        headers.forEach(key => {

            const val = infoCopy[key]
            if (!state.info.averages[key]) state.info.averages[key] = []

            let output = val
            if (typeof val === 'number') {
                const aveArr = state.info.averages[key]
                aveArr.push(val)
                output = `${average(aveArr).toFixed(3)}ms`
            } 


            let header = section.columns[key]

            // Add New Headers to Each Column
            if (!header) {
                for (let name in sections) {
                  const section = sections[name]
                  if (!section.columns[key]){
                    const header = document.createElement('th')
                    header.innerText = key
                    section.header.appendChild(header)
                    section.columns[key] = header
                  }
                }
            }


            let col = state.info.columns[key]
            if (!col) {
                col = state.info.columns[key] = document.createElement('td')
                state.div.appendChild(col)
            }

            col.innerText = output

            state.info.output[key] = output
        })


        // Shift Buffers
        for (let key in state.averages){
            if (state.averages[key].length > 100) state.averages[key].shift()
        }
    }
}

// ------------------------------------------------------------------
// ------------------------- Event Listeners ------------------------
// ------------------------------------------------------------------

const onShow = (panelWindow) => {

  const panel = chrome.runtime.connect({ name: "devtools-page" });


    // ------------------ On First Show ------------------
  if (!states.document) {

      // ------------------ Track the Document ------------------
    states.document = panelWindow.document
    states.error = states.document.getElementById('error')
    states.table = states.document.getElementById('states')
    var a = chrome.runtime.getURL("devtools/style.css");
    const link = states.document.createElement('link')
    link.rel = 'stylesheet'
    link.type = 'text/css'
    link.href = a
    states.document.head.appendChild(link)
    states.document.body.insertAdjacentElement('beforeend', states.table);

    panel.postMessage({ tabId: chrome.devtools.inspectedWindow.tabId, script: "devtools/background.js" }); // Only once...
  }


    // ----------- Connect to Background Page -----------
    panel.onMessage.addListener(function (message) {

        // Set States
        if (message.states) {
          for (let path in message.states) {
            const state = message.states[path]
            update(path, state.value, state.output)
          }
        }

        // Set Single State
        else if (message.state) update(message.state.path, message.state.info, message.state.update)
        else if (message.clear) {
          states.error.style.display = ''
          states.table.innerHTML = ''
          sections = {}
        } else if (message.name === 'echo') {
          panel.postMessage({ 
            ...message,
            tabId: chrome.devtools.inspectedWindow.tabId, 
            name: 'echo'
          });
        } else  {
          console.log('Unhandled Message', message)
        }
    });


    // ----------- Initialize in Background Registry -----------
    panel.postMessage({
      name: 'init',
      tabId: chrome.devtools.inspectedWindow.tabId
    });
}

const onHide = () => console.log('Closed!')



// ------------------------------------------------------------------
// ------------------------- Creation Event -------------------------
// ------------------------------------------------------------------

chrome.devtools.panels.create('ESCode', null, 'devtools/panels/panel.html', (panel) => {
  panel.onShown.addListener(onShow);
  panel.onHidden.addListener(onHide);
});