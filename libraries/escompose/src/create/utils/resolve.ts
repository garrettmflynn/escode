export const parentNode = (esm, parentNode) => {

    const oncreate = esm.onrender

    const elm = esm.element;
    parentNode = parentNode || elm.parentNode;
    if(!parentNode) {
        setTimeout(()=>{ //slight delay on appendChild so the graph is up to date after other sync loading calls are finished
            if(typeof parentNode === 'string') parentNode = document.getElementById(parentNode);
            if(parentNode && typeof parentNode === 'object') parentNode.appendChild(elm);
            if(oncreate) oncreate.call(elm.component, elm);
            if(elm.component.animation || elm.component.animate) elm.component.runAnimation();
            if(elm.component.looper || typeof elm.component.loop === 'number' && elm.component.loop) elm.component.runLoop()
        },0.01); //small timeout makes sure the elements all load before executing component utilities
    }
}