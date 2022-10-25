let states = {
  document: null,
  table: null,
  showAll: null,
  focus: null,
  sidebar: null
}; 

// ------------------------------------------------------------------
// ----------------------- UI Management Code -----------------------
// ------------------------------------------------------------------

let sections = {}
let headers = []
let focus = null


const add = (arr) => arr.reduce((a, b) => a + b, 0)
const average = (arr) => add(arr) / arr.length


function filterTable (focus) {

  const notDefined = focus == undefined

  // Must have section to switch focus
  if (notDefined || sections[focus]) {
    states.showAll.style.display = (focus) ? '' : 'none'

    for (let header in sections) {
      const section = sections[header]
      const states = section.states
      for (let name in states) {
        const state = states[name]
        section.header.style.display = state.div.style.display = (notDefined || header === focus) ?  '' : 'none'
      }
    }
  }
}

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
                states: {},
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

        state.value.innerHTML = JSON.stringify(update)

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
    var a = chrome.runtime.getURL("css/devtools.css");
    const link = states.document.createElement('link')
    link.rel = 'stylesheet'
    link.type = 'text/css'
    link.href = a
    states.document.head.appendChild(link)

    // Create Show All Button
    states.showAll = document.createElement('button')
    states.showAll.innerHTML = 'Show all states'
    states.showAll.style.display = 'none'
    states.showAll.style.margin = '10px'

    states.showAll.onclick = () => filterTable(null)
  
    // Add to Document
    states.document.body.insertAdjacentElement('beforeend', states.table);
    states.document.body.insertAdjacentElement('beforeend', states.showAll);

    panel.postMessage({ tabId: chrome.devtools.inspectedWindow.tabId, script: "js/devtools/background.js" }); // Only once...
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
        else if (message.state) {
          // console.log('Raw State', message.state)
          update(message.state.path, message.state.info.value, message.state.update)
        }
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
        } 
        else if (message.focus) states.focus = message.focus
        else if (message.inspect) filterTable(states.focus)
        else {
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

chrome.devtools.panels.create('ESCode', null, 'panels/panel.html', (panel) => {
  panel.onShown.addListener(onShow);
  panel.onHidden.addListener(onHide);
});


const elPanel = chrome.devtools.panels.elements
elPanel.createSidebarPane("ESCode Properties",
  function(sidebar) {
    states.sidebar = states
    elPanel.onSelectionChanged.addListener(() => {
      console.log('Cannot get selected element properties...')
        // const result = chrome.devtools.inspectedWindow.eval("$0.innerText")
        // console.log(result, result?.[0]);
        sidebar.setObject(undefined);
    })

    sidebar.setHeight("8ex");
  }
);