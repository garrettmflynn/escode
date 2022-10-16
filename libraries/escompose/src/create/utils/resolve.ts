export const parentNode = (esm, parentNode) => {

    const oncreate = esm.esOnRender

    const elm = esm.esElement;
    parentNode = parentNode || elm.parentNode;
    if(!parentNode) {
        setTimeout(()=>{ //slight delay on appendChild so the graph is up to date after other sync loading calls are finished
            if(typeof parentNode === 'string') parentNode = document.getElementById(parentNode);
            if(parentNode && typeof parentNode === 'object') parentNode.appendChild(elm);
            if(oncreate) {
                const esm = elm.esComponent
                const context = esm.__esProxy ?? esm
                oncreate.call(context, elm);
            }
            if(elm.esComponent.animation || elm.esComponent.animate) elm.esComponent.runAnimation();
            if(elm.esComponent.looper || typeof elm.esComponent.loop === 'number' && elm.esComponent.loop) elm.esComponent.runLoop()
        },0.01); //small timeout makes sure the elements all load before executing component utilities
    }
}