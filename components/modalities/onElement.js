
const types = {
    interactive: ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'FORM', 'A']
}

export function stop(){
    this.observer.disconnect(); // stop observing
}

const onElement = (el, validTags, callback) => {
    if (!validTags) callback(el)
    else if (validTags.includes(el.tagName)) callback(el)
}

export function start(config) {

    if (config.stylesheet) {
        let styles = config.stylesheet
        if (typeof config.stylesheet === 'string') {
            let stylesheet = document.createElement('style');
            stylesheet.innerHTML = styles
            styles = stylesheet
        }

        if (!styles.parentNode) document.head.appendChild(styles);
    }

    // Select the node that will be observed for mutations
    const targetNode = config.target ?? document.body;

    const elTags = types[config.type] ?? ['*']

    // Get All Initial Children
    elTags.forEach(tag => { 
        var all = targetNode.getElementsByTagName(tag);
        for (var i=0, max=all.length; i < max; i++) onElement(all[i], undefined, config.callback)
    })

    // Options for the observer (which mutations to observe)
    const observerConfig = { 
        childList: true, 
        subtree: true 
    };

    // Callback function to execute when mutations are observed
    const callback = (mutationList, observer) => {
        for (const mutation of mutationList) {
            if (mutation.type === 'childList') mutation.addedNodes.forEach(el => onElement(el, elTags, config.callback))
        }
    };

    // Create an observer instance linked to the callback function
    this.observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    this.observer.observe(targetNode, observerConfig);
}