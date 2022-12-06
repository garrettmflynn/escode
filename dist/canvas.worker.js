(()=>{var mouseEventHandler=makeSendPropertiesHandler(["ctrlKey","metaKey","shiftKey","button","pointerType","clientX","clientY","pageX","pageY"]);var wheelEventHandlerImpl=makeSendPropertiesHandler(["deltaX","deltaY"]);var keydownEventHandler=makeSendPropertiesHandler(["ctrlKey","metaKey","shiftKey","keyCode"]);function wheelEventHandler(event,sendFn){event.preventDefault();wheelEventHandlerImpl(event,sendFn)}function preventDefaultHandler(event){event.preventDefault()}function copyProperties(src,properties,dst){for(const name of properties){dst[name]=src[name]}}function makeSendPropertiesHandler(properties){return function sendProperties(event,sendFn){const data={type:event.type};copyProperties(event,properties,data);sendFn(data)}}function touchEventHandler(event,sendFn){const touches=[];const data={type:event.type,touches};for(let i=0;i<event.touches.length;++i){const touch=event.touches[i];touches.push({pageX:touch.pageX,pageY:touch.pageY})}sendFn(data)}var orbitKeys={"37":true,"38":true,"39":true,"40":true};function filteredKeydownEventHandler(event,sendFn){const{keyCode}=event;if(orbitKeys[keyCode]){event.preventDefault();keydownEventHandler(event,sendFn)}}var eventHandlers={contextmenu:preventDefaultHandler,mousedown:mouseEventHandler,mousemove:mouseEventHandler,mouseup:mouseEventHandler,pointerdown:mouseEventHandler,pointermove:mouseEventHandler,pointerup:mouseEventHandler,touchstart:touchEventHandler,touchmove:touchEventHandler,touchend:touchEventHandler,wheel:wheelEventHandler,keydown:filteredKeydownEventHandler};function initProxyElement(element,worker,id){if(!id)id="proxy"+Math.floor(Math.random()*1e15);const sendEvent=data=>{if(!worker){handleProxyEvent(data,id)}else worker.postMessage({route:"handleProxyEvent",args:[data,id]})};let entries=Object.entries(eventHandlers);for(const[eventName,handler]of entries){element.addEventListener(eventName,function(event){handler(event,sendEvent)})}const sendSize=()=>{const rect=element.getBoundingClientRect();sendEvent({type:"resize",left:rect.left,top:rect.top,width:element.clientWidth,height:element.clientHeight})};sendSize();globalThis.addEventListener("resize",sendSize);return id}var EventDispatcher=class{addEventListener(type,listener){if(this.__listeners===void 0)this.__listeners={};const listeners=this.__listeners;if(listeners[type]===void 0){listeners[type]=[]}if(listeners[type].indexOf(listener)===-1){listeners[type].push(listener)}}hasEventListener(type,listener){if(this.__listeners===void 0)return false;const listeners=this.__listeners;return listeners[type]!==void 0&&listeners[type].indexOf(listener)!==-1}removeEventListener(type,listener){if(this.__listeners===void 0)return;const listeners=this.__listeners;const listenerArray=listeners[type];if(listenerArray!==void 0){const index=listenerArray.indexOf(listener);if(index!==-1){listenerArray.splice(index,1)}}}dispatchEvent(event,target){if(this.__listeners===void 0)return;const listeners=this.__listeners;const listenerArray=listeners[event.type];if(listenerArray!==void 0){if(!target)event.target=this;else event.target=target;const array=listenerArray.slice(0);for(let i=0,l=array.length;i<l;i++){array[i].call(this,event)}event.target=null}}};function noop(){}var ElementProxyReceiver=class extends EventDispatcher{constructor(){super();this.__listeners={};this.style={};this.setPointerCapture=()=>{};this.releasePointerCapture=()=>{};this.getBoundingClientRect=()=>{return{left:this.left,top:this.top,width:this.width,height:this.height,right:this.left+this.width,bottom:this.top+this.height}};this.handleEvent=data=>{if(data.type==="resize"){this.left=data.left;this.top=data.top;this.width=data.width;this.height=data.height;if(typeof this.proxied==="object"){this.proxied.style.width=this.width+"px";this.proxied.style.height=this.height+"px";this.proxied.clientWidth=this.width;this.proxied.clientHeight=this.height}}data.preventDefault=noop;data.stopPropagation=noop;this.dispatchEvent(data,this.proxied)};this.style={}}get clientWidth(){return this.width}get clientHeight(){return this.height}focus(){}};var ProxyManager=class{constructor(){this.targets={};this.makeProxy=(id,addTo=void 0)=>{if(!id)id=`proxyReceiver${Math.floor(Math.random()*1e15)}`;let proxy;if(this.targets[id])proxy=this.targets[id];else{proxy=new ElementProxyReceiver;this.targets[id]=proxy}if(typeof addTo==="object"){addTo.proxy=proxy;proxy.proxied=addTo;if(typeof WorkerGlobalScope!=="undefined")addTo.style=proxy.style;if(proxy.width){addTo.style.width=proxy.width+"px";addTo.clientWidth=proxy.width}if(proxy.height){addTo.style.height=proxy.height+"px";addTo.clientHeight=proxy.height}addTo.setPointerCapture=proxy.setPointerCapture.bind(proxy);addTo.releasePointerCapture=proxy.releasePointerCapture.bind(proxy);addTo.getBoundingClientRect=proxy.getBoundingClientRect.bind(proxy);addTo.addEventListener=proxy.addEventListener.bind(proxy);addTo.removeEventListener=proxy.removeEventListener.bind(proxy);addTo.handleEvent=proxy.handleEvent.bind(proxy);addTo.dispatchEvent=proxy.dispatchEvent.bind(proxy);addTo.focus=proxy.focus.bind(proxy)}};this.getProxy=id=>{return this.targets[id]};this.handleEvent=(data,id)=>{if(!this.targets[id])this.makeProxy(id);if(this.targets[id]){this.targets[id].handleEvent(data);return true}return void 0};if(!globalThis.document)globalThis.document={}}};function makeProxy(id,elm){if(this?.__node?.graph){if(!this.__node.graph.ProxyManager)this.__node.graph.ProxyManager=new ProxyManager;this.__node.graph.ProxyManager.makeProxy(id,elm)}else{if(!globalThis.ProxyManager)globalThis.ProxyManager=new ProxyManager;globalThis.ProxyManager.makeProxy(id,elm)}return id}function handleProxyEvent(data,id){if(this?.__node?.graph){if(!this.__node.graph.ProxyManager)this.__node.graph.ProxyManager=new ProxyManager;if(this.__node.graph.ProxyManager.handleEvent(data,id))return data}else{if(!globalThis.ProxyManager)globalThis.ProxyManager=new ProxyManager;if(globalThis.ProxyManager.handleEvent(data,id))return data}}var proxyElementWorkerRoutes={initProxyElement,makeProxy,handleProxyEvent};function Renderer(options){if(options.worker){let worker=options.worker;let route=options.route;if(worker instanceof Blob||typeof worker==="string"){worker=new Worker(worker)}delete options.worker;delete options.route;return transferCanvas(worker,options,route)}else{initProxyElement(options.canvas,void 0,options._id);return setupCanvas(options)}}function transferCanvas(worker,options,route){if(!options)return void 0;if(!options._id)options._id=`canvas${Math.floor(Math.random()*1e15)}`;let offscreen=options.canvas.transferControlToOffscreen();if(!options.width)options.width=options.canvas.clientWidth;if(!options.height)options.height=options.canvas.clientHeight;let message={route:route?route:"setupCanvas",args:{...options,canvas:offscreen}};if(this?.__node?.graph)this.__node.graph.run("initProxyElement",options.canvas,worker,options._id);else initProxyElement(options.canvas,worker,options._id);if(options.draw){if(typeof options.draw==="function")message.args.draw=options.draw.toString();else message.args.draw=options.draw}if(options.update){if(typeof options.update==="function")message.args.update=options.update.toString();else message.args.update=options.update}if(options.init){if(typeof options.init==="function")message.args.init=options.init.toString();else message.args.init=options.init}if(options.clear){if(typeof options.clear==="function")message.args.clear=options.clear.toString();else message.args.clear=options.clear}let transfer=[offscreen];if(options.transfer){transfer.push(...options.transfer);delete options.transfer}worker.postMessage(message,transfer);const canvascontrols={_id:options._id,width:options.width,height:options.height,worker,draw:props=>{worker.postMessage({route:"drawFrame",args:[props,options._id]})},update:props=>{worker.postMessage({route:"updateCanvas",args:[props,options._id]})},clear:()=>{worker.postMessage({route:"clearCanvas",args:options._id})},init:()=>{worker.postMessage({route:"initCanvas",args:options._id})},stop:()=>{worker.postMessage({route:"stopAnim",args:options._id})},start:()=>{worker.postMessage({route:"startAnim",args:options._id})},set:newDrawProps=>{worker.postMessage({route:"setDraw",args:[newDrawProps,options._id]})},terminate:()=>{worker.terminate()}};return canvascontrols}function setDraw(settings,_id){let canvasopts;if(this?.__node?.graph){if(_id)canvasopts=this.__node.graph.CANVASES?.[settings._id];else if(settings._id)canvasopts=this.__node.graph.CANVASES?.[settings._id];else canvasopts=this.__node.graph.CANVASES?.[Object.keys(this.__node.graph.CANVASES)[0]]}else{if(_id)canvasopts=globalThis.CANVASES?.[settings._id];else if(settings._id)canvasopts=globalThis.CANVASES?.[settings._id];else canvasopts=globalThis.CANVASES?.[Object.keys(globalThis.CANVASES)[0]]}if(canvasopts){if(settings.canvas){canvasopts.canvas=settings.canvas;if(this?.__node?.graph)this.__node.graph.run("makeProxy",canvasopts._id,canvasopts.canvas);else proxyElementWorkerRoutes.makeProxy(canvasopts._id,canvasopts.canvas)}if(typeof settings.context==="string")canvasopts.context=canvasopts.canvas.getContext(settings.context);else if(settings.context)canvasopts.context=settings.context;if(settings.width)canvasopts.canvas.width=settings.width;if(settings.height)canvasopts.canvas.height=settings.height;if(typeof settings.draw==="string")settings.draw=parseFunctionFromText(settings.draw);if(typeof settings.draw==="function"){canvasopts.draw=settings.draw}if(typeof settings.update==="string")settings.update=parseFunctionFromText(settings.update);if(typeof settings.update==="function"){canvasopts.update=settings.update}if(typeof settings.init==="string")settings.init=parseFunctionFromText(settings.init);if(typeof settings.init==="function"){canvasopts.init=settings.init}if(typeof settings.clear==="string")settings.clear=parseFunctionFromText(settings.clear);if(typeof settings.clear==="function"){canvasopts.clear=settings.clear}return settings._id}return void 0}function setupCanvas(options){if(this?.__node?.graph){if(!this.__node.graph.CANVASES)this.__node.graph.CANVASES={}}else if(!globalThis.CANVASES)globalThis.CANVASES={};let canvasOptions=options;options._id?canvasOptions._id=options._id:canvasOptions._id=`canvas${Math.floor(Math.random()*1e15)}`;typeof options.context==="string"?canvasOptions.context=options.canvas.getContext(options.context):canvasOptions.context=options.context;"animating"in options?canvasOptions.animating=options.animating:canvasOptions.animating=true;if(this?.__node?.graph?.CANVASES[canvasOptions._id]){this.__node.graph.run("setDraw",canvasOptions)}else if(globalThis.CANVASES?.[canvasOptions._id]){setDraw(canvasOptions)}else{if(this?.__node?.graph)canvasOptions.graph=this.__node.graph;if(this?.__node?.graph)this.__node.graph.CANVASES[canvasOptions._id]=canvasOptions;else globalThis.CANVASES[canvasOptions._id]=canvasOptions;if(this?.__node?.graph)this.__node.graph.run("makeProxy",canvasOptions._id,canvasOptions.canvas);else proxyElementWorkerRoutes.makeProxy(canvasOptions._id,canvasOptions.canvas);if(options.width)canvasOptions.canvas.width=options.width;if(options.height)canvasOptions.canvas.height=options.height;if(typeof canvasOptions.draw==="string"){canvasOptions.draw=parseFunctionFromText(canvasOptions.draw)}else if(typeof canvasOptions.draw==="function"){canvasOptions.draw=canvasOptions.draw}if(typeof canvasOptions.update==="string"){canvasOptions.update=parseFunctionFromText(canvasOptions.update)}else if(typeof canvasOptions.update==="function"){canvasOptions.update=canvasOptions.update}if(typeof canvasOptions.init==="string"){canvasOptions.init=parseFunctionFromText(canvasOptions.init)}else if(typeof canvasOptions.init==="function"){canvasOptions.init=canvasOptions.init}if(typeof canvasOptions.clear==="string"){canvasOptions.clear=parseFunctionFromText(canvasOptions.clear)}else if(typeof canvasOptions.clear==="function"){canvasOptions.clear=canvasOptions.clear}if(typeof canvasOptions.init==="function")canvasOptions.init(canvasOptions,canvasOptions.canvas,canvasOptions.context);canvasOptions.stop=()=>{stopAnim(canvasOptions._id)};canvasOptions.start=draw=>{startAnim(canvasOptions._id,draw)};canvasOptions.set=settings=>{setDraw(settings,canvasOptions._id)};if(typeof canvasOptions.draw==="function"&&canvasOptions.animating){let draw=(s,canvas,context)=>{if(s.animating){s.draw(s,canvas,context);requestAnimationFrame(()=>{draw(s,canvas,context)})}};draw(canvasOptions,canvasOptions.canvas,canvasOptions.context)}}if(typeof WorkerGlobalScope!=="undefined"&&self instanceof WorkerGlobalScope)return canvasOptions._id;else{const canvascontrols={_id:options._id,width:options.width,height:options.height,draw:props=>{drawFrame(props,options._id)},update:props=>{updateCanvas(props,options._id)},clear:()=>{clearCanvas(options._id)},init:()=>{initCanvas(options._id)},stop:()=>{stopAnim(options._id)},start:()=>{startAnim(options._id)},set:newDrawProps=>{setDraw(newDrawProps,options._id)},terminate:()=>{stopAnim(options._id)}};return canvascontrols}}function drawFrame(props,_id){let canvasopts;if(this?.__node?.graph){if(!_id)canvasopts=this.__node.graph.CANVASES?.[Object.keys(this.__node.graph.CANVASES)[0]];else canvasopts=this.__node.graph.CANVASES?.[_id]}else{if(!_id)canvasopts=globalThis.CANVASES?.[Object.keys(globalThis.CANVASES)[0]];else canvasopts=globalThis.CANVASES?.[_id]}if(canvasopts){if(props)Object.assign(canvasopts,props);if(canvasopts.draw){canvasopts.draw(canvasopts,canvasopts.canvas,canvasopts.context);return _id}}return void 0}function clearCanvas(_id){let canvasopts;if(this?.__node?.graph){if(!_id)canvasopts=this.__node.graph.CANVASES?.[Object.keys(this.__node.graph.CANVASES)[0]];else canvasopts=this.__node.graph.CANVASES?.[_id]}else{if(!_id)canvasopts=globalThis.CANVASES?.[Object.keys(globalThis.CANVASES)[0]];else canvasopts=globalThis.CANVASES?.[_id]}if(canvasopts?.clear){canvasopts.clear(canvasopts,canvasopts.canvas,canvasopts.context);return _id}return void 0}function initCanvas(_id){let canvasopts;if(this?.__node?.graph){if(!_id)canvasopts=this.__node.graph.CANVASES?.[Object.keys(this.__node.graph.CANVASES)[0]];else canvasopts=this.__node.graph.CANVASES?.[_id]}else{if(!_id)canvasopts=globalThis.CANVASES?.[Object.keys(globalThis.CANVASES)[0]];else canvasopts=globalThis.CANVASES?.[_id]}if(canvasopts?.init){canvasopts.init(canvasopts,canvasopts.canvas,canvasopts.context);return _id}return void 0}function updateCanvas(input,_id){let canvasopts;if(this?.__node?.graph){if(!_id)canvasopts=this.__node.graph.CANVASES?.[Object.keys(this.__node.graph.CANVASES)[0]];else canvasopts=this.__node.graph.CANVASES?.[_id]}else{if(!_id)canvasopts=globalThis.CANVASES?.[Object.keys(globalThis.CANVASES)[0]];else canvasopts=globalThis.CANVASES?.[_id]}if(canvasopts?.update){canvasopts.update(canvasopts,canvasopts.canvas,canvasopts.context,input);return _id}return void 0}function setProps(props,_id){let canvasopts;if(this?.__node?.graph){if(!_id)canvasopts=this.__node.graph.CANVASES?.[Object.keys(this.__node.graph.CANVASES)[0]];else canvasopts=this.__node.graph.CANVASES?.[_id]}else{if(!_id)canvasopts=globalThis.CANVASES?.[Object.keys(globalThis.CANVASES)[0]];else canvasopts=globalThis.CANVASES?.[_id]}if(canvasopts){Object.assign(canvasopts,props);if(props.width)canvasopts.canvas.width=props.width;if(props.height)canvasopts.canvas.height=props.height;return _id}return void 0}function startAnim(_id,draw){let canvasopts;if(this?.__node?.graph){if(!_id)canvasopts=this.__node.graph.CANVASES?.[Object.keys(this.__node.graph.CANVASES)[0]];else canvasopts=this.__node.graph.CANVASES?.[_id]}else{if(!_id)canvasopts=globalThis.CANVASES?.[Object.keys(globalThis.CANVASES)[0]];else canvasopts=globalThis.CANVASES?.[_id]}canvasopts.animating=true;if(canvasopts&&draw){if(typeof draw==="string")draw=parseFunctionFromText(draw);if(typeof draw==="function"){canvasopts.draw=draw}return _id}if(typeof canvasopts?.draw==="function"){let draw2=(s,canvas,context)=>{if(s.animating){s.draw(s,canvas,context);requestAnimationFrame(()=>{draw2(s,canvas,context)})}};if(typeof canvasopts.clear==="function")canvasopts.clear(canvasopts,canvasopts.canvas,canvasopts.context);if(typeof canvasopts.init==="function")canvasopts.init(canvasopts,canvasopts.canvas,canvasopts.context);draw2(canvasopts,canvasopts.canvas,canvasopts.context);return _id}return void 0}function stopAnim(_id){let canvasopts;if(this?.__node?.graph){if(!_id)canvasopts=this.__node.graph.CANVASES?.[Object.keys(this.__node.graph.CANVASES)[0]];else canvasopts=this.__node.graph.CANVASES?.[_id]}else{if(!_id)canvasopts=globalThis.CANVASES?.[Object.keys(globalThis.CANVASES)[0]];else canvasopts=globalThis.CANVASES?.[_id]}if(canvasopts){canvasopts.animating=false;if(typeof canvasopts.clear==="function")canvasopts.clear(canvasopts,canvasopts.canvas,canvasopts.context);return _id}return void 0}var workerCanvasRoutes={...proxyElementWorkerRoutes,Renderer,transferCanvas,setupCanvas,setDraw,drawFrame,clearCanvas,initCanvas,updateCanvas,setProps,startAnim,stopAnim};function parseFunctionFromText(method=""){let getFunctionBody=methodString=>{return methodString.replace(/^\W*(function[^{]+\{([\s\S]*)\}|[^=]+=>[^{]*\{([\s\S]*)\}|[^=]+=>(.+))/i,"$2$3$4")};let getFunctionHead=methodString=>{let startindex=methodString.indexOf("=>")+1;if(startindex<=0){startindex=methodString.indexOf("){")}if(startindex<=0){startindex=methodString.indexOf(") {")}return methodString.slice(0,methodString.indexOf("{",startindex)+1)};let newFuncHead=getFunctionHead(method);let newFuncBody=getFunctionBody(method);let newFunc;if(newFuncHead.includes("function")){let varName=newFuncHead.split("(")[1].split(")")[0];newFunc=new Function(varName,newFuncBody)}else{if(newFuncHead.substring(0,6)===newFuncBody.substring(0,6)){let varName=newFuncHead.split("(")[1].split(")")[0];newFunc=new Function(varName,newFuncBody.substring(newFuncBody.indexOf("{")+1,newFuncBody.length-1))}else{try{newFunc=(0,eval)(newFuncHead+newFuncBody+"}")}catch{}}}return newFunc}var b=class{constructor(e,t,s,h){this.r=e,this.g=t,this.b=s,this.a=h}};var x=class{constructor(){this.scaleX=1,this.scaleY=1,this.offsetX=0,this.offsetY=0,this.loop=false,this._vbuffer=0,this._coord=0,this.visible=true,this.intensity=1,this.xy=new Float32Array([]),this.numPoints=0,this.color=new b(0,0,0,1),this.webglNumPoints=0}};var v=class extends x{constructor(e,t){super(),this.currentIndex=0,this.webglNumPoints=t,this.numPoints=t,this.color=e,this.xy=new Float32Array(2*this.webglNumPoints)}setX(e,t){this.xy[e*2]=t}setY(e,t){this.xy[e*2+1]=t}getX(e){return this.xy[e*2]}getY(e){return this.xy[e*2+1]}lineSpaceX(e,t){for(let s=0;s<this.numPoints;s++)this.setX(s,e+t*s)}arrangeX(){this.lineSpaceX(-1,2/this.numPoints)}constY(e){for(let t=0;t<this.numPoints;t++)this.setY(t,e)}shiftAdd(e){let t=e.length;for(let s=0;s<this.numPoints-t;s++)this.setY(s,this.getY(s+t));for(let s=0;s<t;s++)this.setY(s+this.numPoints-t,e[s])}addArrayY(e){if(this.currentIndex+e.length<=this.numPoints)for(let t=0;t<e.length;t++)this.setY(this.currentIndex,e[t]),this.currentIndex++}replaceArrayY(e){if(e.length==this.numPoints)for(let t=0;t<this.numPoints;t++)this.setY(t,e[t])}};var Y=(c,e,t)=>{let s={x:0,y:0};return s.x=c.x+e.x*t,s.y=c.y+e.y*t,s};var _=c=>P(-c.y,c.x);var w=(c,e)=>{let t=T(c,e);return t=M(t),t};var S=(c,e)=>{let t={x:0,y:0};return t.x=c.x+e.x,t.y=c.y+e.y,t};var R=(c,e)=>c.x*e.x+c.y*e.y;var M=c=>{let e={x:0,y:0},t=c.x*c.x+c.y*c.y;return t>0&&(t=1/Math.sqrt(t),e.x=c.x*t,e.y=c.y*t),e};var P=(c,e)=>{let t={x:0,y:0};return t.x=c,t.y=e,t};var T=(c,e)=>{let t={x:0,y:0};return t.x=c.x-e.x,t.y=c.y-e.y,t};var C=c=>{let e,t={x:0,y:0},s={x:0,y:0},h=[],r=(n,l)=>{h.push({vec2:n,miterLength:l})},a=n=>({x:c[n*2],y:c[n*2+1]});t=w(a(1),a(0)),e=_(t),r(e,1);let o=c.length/2;for(let n=1;n<o-1;n++){let l=a(n-1),i=a(n),f=a(n+1);t=w(i,l),e=_(t),s=w(f,i);let u=F(t,s),g=N(t,u,1);r(u,g)}return t=w(a(o-1),a(o-2)),e=_(t),r(e,1),h};var F=(c,e)=>{let t=S(c,e);return t=M(t),P(-t.y,t.x)};var N=(c,e,t)=>{let s=P(-c.y,c.x);return t/R(e,s)};var d=class extends x{constructor(e,t,s){super(),this.currentIndex=0,this._thicknessRequested=0,this._actualThickness=0,this.webglNumPoints=t*2,this.numPoints=t,this.color=e,this._thicknessRequested=s,this._linePoints=new Float32Array(t*2),this.xy=new Float32Array(2*this.webglNumPoints)}convertToTriPoints(){let e=this._actualThickness/2,t=C(this._linePoints);for(let s=0;s<this.numPoints;s++){let h=this._linePoints[2*s],r=this._linePoints[2*s+1],a={x:h,y:r},o=Y(a,t[s].vec2,t[s].miterLength*e),n=Y(a,t[s].vec2,-t[s].miterLength*e);this.xy[s*4]=o.x,this.xy[s*4+1]=o.y,this.xy[s*4+2]=n.x,this.xy[s*4+3]=n.y}}setX(e,t){this._linePoints[e*2]=t}setY(e,t){this._linePoints[e*2+1]=t}lineSpaceX(e,t){for(let s=0;s<this.numPoints;s++)this.setX(s,e+t*s)}setThickness(e){this._thicknessRequested=e}getThickness(){return this._thicknessRequested}setActualThickness(e){this._actualThickness=e}};var A=class{constructor(e,t){this.debug=false,this.addLine=this.addDataLine,t==null?this.webgl=e.getContext("webgl",{antialias:true,transparent:false}):(this.webgl=e.getContext("webgl",{antialias:t.antialias,transparent:t.transparent,desynchronized:t.deSync,powerPerformance:t.powerPerformance,preserveDrawing:t.preserveDrawing}),this.debug=t.debug==null?false:t.debug),this.log("canvas type is: "+e.constructor.name),this.log(`[webgl-plot]:width=${e.width}, height=${e.height}`),this._linesData=[],this._linesAux=[],this._thickLines=[],this._surfaces=[],this.gScaleX=1,this.gScaleY=1,this.gXYratio=1,this.gOffsetX=0,this.gOffsetY=0,this.gLog10X=false,this.gLog10Y=false,this.webgl.clear(this.webgl.COLOR_BUFFER_BIT),this.webgl.viewport(0,0,e.width,e.height),this._progLine=this.webgl.createProgram(),this.initThinLineProgram(),this.webgl.enable(this.webgl.BLEND),this.webgl.blendFunc(this.webgl.SRC_ALPHA,this.webgl.ONE_MINUS_SRC_ALPHA)}get linesData(){return this._linesData}get linesAux(){return this._linesAux}get thickLines(){return this._thickLines}get surfaces(){return this._surfaces}_drawLines(e){let t=this.webgl;e.forEach(s=>{if(s.visible){t.useProgram(this._progLine);let h=t.getUniformLocation(this._progLine,"uscale");t.uniformMatrix2fv(h,false,new Float32Array([s.scaleX*this.gScaleX*(this.gLog10X?1/Math.log(10):1),0,0,s.scaleY*this.gScaleY*this.gXYratio*(this.gLog10Y?1/Math.log(10):1)]));let r=t.getUniformLocation(this._progLine,"uoffset");t.uniform2fv(r,new Float32Array([s.offsetX+this.gOffsetX,s.offsetY+this.gOffsetY]));let a=t.getUniformLocation(this._progLine,"is_log");t.uniform2iv(a,new Int32Array([this.gLog10X?1:0,this.gLog10Y?1:0]));let o=t.getUniformLocation(this._progLine,"uColor");t.uniform4fv(o,[s.color.r,s.color.g,s.color.b,s.color.a]),t.bufferData(t.ARRAY_BUFFER,s.xy,t.STREAM_DRAW),t.drawArrays(s.loop?t.LINE_LOOP:t.LINE_STRIP,0,s.webglNumPoints)}})}_drawSurfaces(e){let t=this.webgl;e.forEach(s=>{if(s.visible){t.useProgram(this._progLine);let h=t.getUniformLocation(this._progLine,"uscale");t.uniformMatrix2fv(h,false,new Float32Array([s.scaleX*this.gScaleX*(this.gLog10X?1/Math.log(10):1),0,0,s.scaleY*this.gScaleY*this.gXYratio*(this.gLog10Y?1/Math.log(10):1)]));let r=t.getUniformLocation(this._progLine,"uoffset");t.uniform2fv(r,new Float32Array([s.offsetX+this.gOffsetX,s.offsetY+this.gOffsetY]));let a=t.getUniformLocation(this._progLine,"is_log");t.uniform2iv(a,new Int32Array([this.gLog10X?1:0,this.gLog10Y?1:0]));let o=t.getUniformLocation(this._progLine,"uColor");t.uniform4fv(o,[s.color.r,s.color.g,s.color.b,s.color.a]),t.bufferData(t.ARRAY_BUFFER,s.xy,t.STREAM_DRAW),t.drawArrays(t.TRIANGLE_STRIP,0,s.webglNumPoints)}})}_drawTriangles(e){let t=this.webgl;t.bufferData(t.ARRAY_BUFFER,e.xy,t.STREAM_DRAW),t.useProgram(this._progLine);let s=t.getUniformLocation(this._progLine,"uscale");t.uniformMatrix2fv(s,false,new Float32Array([e.scaleX*this.gScaleX*(this.gLog10X?1/Math.log(10):1),0,0,e.scaleY*this.gScaleY*this.gXYratio*(this.gLog10Y?1/Math.log(10):1)]));let h=t.getUniformLocation(this._progLine,"uoffset");t.uniform2fv(h,new Float32Array([e.offsetX+this.gOffsetX,e.offsetY+this.gOffsetY]));let r=t.getUniformLocation(this._progLine,"is_log");t.uniform2iv(r,new Int32Array([0,0]));let a=t.getUniformLocation(this._progLine,"uColor");t.uniform4fv(a,[e.color.r,e.color.g,e.color.b,e.color.a]),t.drawArrays(t.TRIANGLE_STRIP,0,e.xy.length/2)}_drawThickLines(){this._thickLines.forEach(e=>{if(e.visible){let t=Math.min(this.gScaleX,this.gScaleY);e.setActualThickness(e.getThickness()/t),e.convertToTriPoints(),this._drawTriangles(e)}})}update(){this.clear(),this.draw()}draw(){this._drawLines(this.linesData),this._drawLines(this.linesAux),this._drawThickLines(),this._drawSurfaces(this.surfaces)}clear(){this.webgl.clear(this.webgl.COLOR_BUFFER_BIT)}_addLine(e){e._vbuffer=this.webgl.createBuffer(),this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER,e._vbuffer),this.webgl.bufferData(this.webgl.ARRAY_BUFFER,e.xy,this.webgl.STREAM_DRAW),e._coord=this.webgl.getAttribLocation(this._progLine,"coordinates"),this.webgl.vertexAttribPointer(e._coord,2,this.webgl.FLOAT,false,0,0),this.webgl.enableVertexAttribArray(e._coord)}addDataLine(e){this._addLine(e),this.linesData.push(e)}addAuxLine(e){this._addLine(e),this.linesAux.push(e)}addThickLine(e){this._addLine(e),this._thickLines.push(e)}addSurface(e){this._addLine(e),this.surfaces.push(e)}initThinLineProgram(){let e=`
      attribute vec2 coordinates;
      uniform mat2 uscale;
      uniform vec2 uoffset;
      uniform ivec2 is_log;

      void main(void) {
         float x = (is_log[0]==1) ? log(coordinates.x) : coordinates.x;
         float y = (is_log[1]==1) ? log(coordinates.y) : coordinates.y;
         vec2 line = vec2(x, y);
         gl_Position = vec4(uscale*line + uoffset, 0.0, 1.0);
      }`,t=this.webgl.createShader(this.webgl.VERTEX_SHADER);this.webgl.shaderSource(t,e),this.webgl.compileShader(t);let s=`
         precision mediump float;
         uniform highp vec4 uColor;
         void main(void) {
            gl_FragColor =  uColor;
         }`,h=this.webgl.createShader(this.webgl.FRAGMENT_SHADER);this.webgl.shaderSource(h,s),this.webgl.compileShader(h),this._progLine=this.webgl.createProgram(),this.webgl.attachShader(this._progLine,t),this.webgl.attachShader(this._progLine,h),this.webgl.linkProgram(this._progLine)}popDataLine(){this.linesData.pop()}removeAllLines(){this._linesData=[],this._linesAux=[],this._thickLines=[],this._surfaces=[]}removeDataLines(){this._linesData=[]}removeAuxLines(){this._linesAux=[]}viewport(e,t,s,h){this.webgl.viewport(e,t,s,h)}log(e){this.debug&&console.log("[webgl-plot]:"+e)}};var y=class{constructor(){this.plots={}}initPlot(e,t){if(t||(t=new A(e.canvas,e.webglOptions)),!e._id)e._id=`plot${Math.floor(Math.random()*1e15)}`;else if(this.plots[e._id]){let l=this.plots[e._id].initial;if(e.lines){for(let i in e.lines)if(l.lines[i]&&Array.isArray(e.lines[i])){let f=e.lines[i];e.lines[i]=l.lines[i]}}e=Object.assign(l,e)}e.overlay&&(typeof e.overlay!="object"&&(e.overlay=document.createElement("canvas"),e.overlay.style.position="absolute",e.overlay.width=e.canvas.width,e.overlay.height=e.canvas.height,e.canvas.appendChild(e.overlay)),e.overlayCtx||(e.overlayCtx=e.overlay.getContext("2d"))),e.width&&(e.canvas.width=e.width,e.canvas.style&&(e.canvas.style.width=e.width+"px"),typeof e.overlay=="object"&&(e.overlay.width=e.width,e.overlay.style&&(e.overlay.style.width=e.width+"px"))),e.height&&(e.canvas.height=e.height,e.canvas.style&&(e.canvas.style.height=e.height+"px"),typeof e.overlay=="object"&&(e.overlay.height=e.height,e.overlay.style&&(e.overlay.style.height=e.height+"px"))),e.lines?.timestamp&&delete e.lines.timestamp;let s={};for(let l in e.lines)s[l]=Object.assign({},s[l]),"viewing"in e.lines[l]||(e.lines[l].viewing=true),s[l].viewing=e.lines[l].viewing,s[l].sps=e.lines[l].sps,s[l].nSec=e.lines[l].nSec,s[l].nPoints=e.lines[l].nPoints,s[l].ymin=e.lines[l].ymin,s[l].ymax=e.lines[l].ymax,s[l].units=e.lines[l].units;let h={plot:t,settings:e,initial:Object.assign(Object.assign({},e),{lines:s}),anim:()=>{t.update()}};this.plots[e._id]=h;let r=0,a=0;Object.keys(e.lines).forEach(l=>{e.lines[l]?.viewing!==false&&a++}),e.nLines=a;let o,n;typeof e.overlay=="object"&&(o=e.overlay,n=e.overlayCtx,n.clearRect(0,0,e.overlay.width,e.overlay.height),n.font=e.overlayFont?e.overlayFont:"1em Courier",n.fillStyle=e.overlayColor?e.overlayColor:"white");for(let l in e.lines){let i=e.lines[l];if(Array.isArray(i)&&(i={values:i},e.lines[l]=i),"viewing"in i||(i.viewing=true),i.color)Array.isArray(i.color)&&(i.color=new b(...i.color));else{let m=y.HSLToRGB(360*(r/a)%360,100,50,1);h.initial.lines[l].color=[...m,1],i.color=new b(...m,1)}let f;if(i.nSec&&i.sps?f=Math.ceil(i.nSec*i.sps):i.nPoints?f=i.nPoints:i.points?f=i.points:e.linePoints?f=e.linePoints:i.values?f=i.values.length:f=1e3,i.points=f,e.lines[l].viewing===false)continue;if((i.width||e.lineWidth)&&i.width!==0){let m=e.lineWidth;m||(m=i.width),i.width?i.line=new d(i.color,f,i.width):e.lineWidth&&(i.line=new d(i.color,f,e.lineWidth)),i.line.lineSpaceX(-1,2/i.line.numPoints)}else i.line=new v(i.color,f),i.line.arrangeX();i.values?.length===i.points?i.values.length!==f&&(i.interpolate?i.values.length>f?i.values=y.downsample(i.values,f):i.values.length<f&&(i.values=y.upsample(i.values,f)):i.values.length>i.points?i.values=i.values.slice(i.values.length-i.points):i.values=[...new Array(i.points-i.values.length).fill(0),...i.values]):Array.isArray(i.values)?i.values=[...new Array(f-i.values.length).fill(0),...i.values]:i.values=new Array(i.points).fill(0);let u=i.ymin,g=i.ymax;if(u===g?(g=i.values.length<=1e5?Math.max(...i.values):1,u=i.values.length<=1e5?Math.min(...i.values):0):isNaN(g)&&(g=i.values.length<=1e5?Math.max(...i.values):1),isNaN(u)&&(u=i.values.length<=1e5?Math.min(...i.values):0),u>g){let m=u;g=u,u=m}let p=Math.abs(u);if(i.absmax=p>g?p:g,"autoscale"in i||(i.autoscale=true),i.position||(i.position=e.nLines-r-1),i.autoscale?i.autoscale===2?("clamp"in i||(i.clamp=true),i.scaled=y.autoscale(i.values,i.position,a,i.centerZero,u,g,i.clamp)):(i.scaled=i.values,i.line.scaleY=y.getYScalar(i.values,a,i.centerZero,u,g),i.line.offsetY=y.getYOffset(i.position,a,u,i.line.scaleY)):i.scaled=i.values,i.scaled.forEach((m,L)=>i.line.setY(L,m)),i.line instanceof d?t.addThickLine(i.line):i.line instanceof v&&t.addDataLine(i.line),"xAxis"in i||(i.xAxis=true),i.xAxis){i.xColor?Array.isArray(i.xColor)&&(i.xColor=new b(...i.xColor)):i.xColor=new b(1,1,1,.3);let m=new v(i.xColor,2),L=i.autoscale?(r+1)*2/a-1-1/a:0;m.constY(L),m.arrangeX(),m.xy[2]=1,i.x=m,t.addAuxLine(m)}if(a>1&&i.autoscale&&r!==a-1){e.dividerColor?Array.isArray(e.dividerColor)&&(e.dividerColor=new b(...e.dividerColor)):e.dividerColor=new b(1,1,1,1);let m=new v(e.dividerColor,2);m.constY(i.autoscale?(r+1)*2/a-1:1),m.arrangeX(),m.xy[2]=1,i.divider=m,t.addAuxLine(m)}if(typeof e.overlay=="object"&&(i.useOverlay||!("useOverlay"in i))){let m=e.nLines-i.position-1;n.fillText(l,20,o.height*(m+.2)/e.nLines),n.fillText(`${Math.floor(g)===g?g:g?.toFixed(5)} ${i.units?i.units:""}`,o.width-100,o.height*(m+.2)/e.nLines),n.fillText(`${Math.floor(u)===u?u:u?.toFixed(5)} ${i.units?i.units:""}`,o.width-100,o.height*(m+.9)/e.nLines)}r++}return requestAnimationFrame(h.anim),this.plots[e._id]}deinitPlot(e){return typeof e=="string"&&(e=this.plots[e]),e.plot.clear(),e.plot.removeAllLines(),true}reinitPlot(e,t){if(typeof e=="string"){let s=e;e=this.plots[e],t._id||(t._id=s)}if(!!e.plot)return e.plot.clear(),e.plot.removeAllLines(),e.settings.overlayCtx&&e.settings.overlayCtx.clearRect(0,0,e.settings.overlay?.width,e.settings.overlay?.height),this.initPlot(t,e.plot)}getChartSettings(e,t){let s=this.plots[e];if(s){let h=Object.assign({},s.initial);for(let r in s.initial.lines)typeof s.initial.lines[r]?.ymax!="number"&&(h.lines[r].ymax=s.settings.lines[r]?.ymax),typeof s.initial.lines[r]?.ymin!="number"&&(h.lines[r].ymin=s.settings.lines[r]?.ymin),t&&(h.lines[r].values=s.settings.lines[r].values);return delete h.canvas,delete h.overlay,delete h.overlayCtx,h}}update(e,t,s=true){if(typeof e=="string"&&(e=this.plots[e]),!e)return false;if(t){let h=false,r,a;typeof e.settings.overlay=="object"&&(r=e.settings.overlay,a=e.settings.overlayCtx,a.font=e.settings.overlayFont?e.settings.overlayFont:"1em Courier",a.fillStyle=e.settings.overlayColor?e.settings.overlayColor:"white");for(let o in t)if(e.settings.lines[o]&&e.settings.lines[o].line){if(e.settings.lines[o]?.viewing===false)continue;let n=e.settings.lines[o];if(Array.isArray(t[o])&&n.values.length<1e5?t[o].length===n.values.length?n.values=t[o]:y.circularBuffer(n.values,t[o]):typeof t[o]=="number"?(n.values.push(t[o]),n.values.shift()):t[o]?.values&&(t[o].values.length===n.values.length?n.values=t[o].values:y.circularBuffer(n.values,t[o].values)),n.values){n.values.length!==n.points&&(n.interpolate?n.values.length>n.points?n.values=y.downsample(n.values,n.points):n.scaled.length<n.points&&(n.values=y.upsample(n.values,n.points)):n.values.length>n.points?n.values.splice(0,n.values.length-n.points):n.values=new Array(n.points).fill(0).splice(n.points-n.values.length,0,n.values));let l=n.ymin,i=n.ymax;if(l===i?(i=n.values.length<=1e5?Math.max(...n.values):1,l=n.values.length<=1e5?Math.min(...n.values):0):isNaN(i)&&(i=n.values.length<=1e5?Math.max(...n.values):1),isNaN(l)&&(l=n.values.length<=1e5?Math.min(...n.values):0),l>i){let u=l;i=l,l=u}let f=Math.abs(l);if(n.absmax=f>i?f:i,n.autoscale?n.autoscale===2?n.scaled=y.autoscale(n.values,n.position,e.settings.nLines,n.centerZero,l,i,n.clamp):(n.scaled=n.values,n.line.scaleY=y.getYScalar(n.values,e.settings.nLines,n.centerZero,l,i),n.line.offsetY=y.getYOffset(n.position,e.settings.nLines,l,n.line.scaleY)):n.scaled=n.values,n.scaled.forEach((u,g)=>{!n.autoscale&&n.absmax>1?n.line.setY(g,u/n.absmax):n.line.setY(g,u)}),typeof e.settings.overlay=="object"&&(n.useOverlay||!("useOverlay"in n))){let u=e.settings.nLines-n.position-1;a.clearRect(0,r.height*u/e.settings.nLines,r.width,r.height/e.settings.nLines),a.fillText(o,20,r.height*(u+.2)/e.settings.nLines),a.fillText(`${Math.floor(i)===i?i:i?.toFixed(5)} ${n.units?n.units:""}`,r.width-100,r.height*(u+.2)/e.settings.nLines),a.fillText(`${Math.floor(l)===l?l:l?.toFixed(5)} ${n.units?n.units:""}`,r.width-100,r.height*(u+.9)/e.settings.nLines)}}}else e.settings.generateNewLines&&!o.includes("timestamp")&&(Array.isArray(t[o])&&(t[o]={values:t[o]}),!t[o].nSec&&!t[o].nPoints&&!e.settings.linePoints&&(t[o].nPoints=1e3),h=true);if(h)return e.settings.cleanGeneration||Object.keys(e.initial.lines).forEach(o=>{t[o]?t[o]=Object.assign(e.initial.lines[o],t[o]):t[o]=e.initial.lines[o]}),this.reinitPlot(e,{_id:e.settings._id,lines:t}),true}return s&&requestAnimationFrame(e.anim),true}updateLine(e,t,s,h,r,a,o){return e.numPoints!==t.length&&(s?e.numPoints>t.length?t=y.downsample(t,e.numPoints):e.numPoints<t.length&&(t=y.upsample(t,e.numPoints)):t.length>e.numPoints?t=t.slice(t.length-e.numPoints):t=[...new Array(t.length).fill(0),...t]),h&&(t=y.autoscale(t,r,a,o)),t.forEach((n,l)=>e.setY(l,n)),true}static autoscale(e,t=0,s=1,h=false,r,a,o){if(e?.length===0)return e;let n=typeof a=="number"?a:e.length<=1e5?Math.max(...e):1,l=typeof r=="number"?r:e.length<=1e5?Math.min(...e):0,i=1/s,f=1;if(h){let u=Math.max(Math.abs(l),Math.abs(n));return u!==0&&(f=i/u),e.map(g=>(o&&(g<l&&(g=l),g>n&&(g=n)),g*f+(i*(t+1)*2-1-i)))}else return n===l?n!==0?f=i/n:l!==0&&(f=i/Math.abs(l)):f=i/(n-l),e.map(u=>(o&&(u<l&&(u=l),u>n&&(u=n)),2*((u-l)*f-1/(2*s))+(i*(t+1)*2-1-i)))}static getYScalar(e,t=1,s=false,h,r){if(e?.length===0)return e;let a=typeof r=="number"?r:e.length<=1e5?Math.max(...e):1,o=typeof h=="number"?h:e.length<=1e5?Math.min(...e):0,n=1/t,l=1;if(s){let i=Math.max(Math.abs(o),Math.abs(a));return i!==0&&(l=n/i),2*l}else return a===o?a!==0?l=n/a:o!==0&&(l=n/Math.abs(o)):l=n/(a-o),2*l}static getYOffset(e=0,t=1,s=0,h=1){let r=1/t,a=r*(e+1)*2-1-r;return s>0&&(a-=s*h+1/t),a}static absmax(e){return Math.max(Math.abs(Math.min(...e)),Math.max(...e))}static downsample(e,t,s=1){if(e.length>t){let h=new Array(t),r=e.length/t,a=e.length-1,o=0,n=0;for(let l=r;l<e.length;l+=r){let i=Math.round(l);i>a&&(i=a);for(let f=o;f<i;f++)h[n]+=e[f];h[n]/=(i-o)*s,n++,o=i}return h}else return e}static upsample(e,t,s=1){var h=function(u,g,p){return(u+(g-u)*p)*s},r=new Array(t),a=(e.length-1)/(t-1);r[0]=e[0];for(var o=1;o<t-1;o++){var n=o*a,l=Math.floor(n),i=Math.ceil(n),f=n-l;r[o]=h(e[l],e[i],f)}return r[t-1]=e[e.length-1],r}static interpolate(e,t,s=1){return e.length>t?y.downsample(e,t,s):e.length<t?y.upsample(e,t,s):e}static HSLToRGB(e,t,s,h=255){t/=100,s/=100;let r=(1-Math.abs(2*s-1))*t,a=r*(1-Math.abs(e/60%2-1)),o=s-r/2,n=0,l=0,i=0;return 0<=e&&e<60?(n=r,l=a,i=0):60<=e&&e<120?(n=a,l=r,i=0):120<=e&&e<180?(n=0,l=r,i=a):180<=e&&e<240?(n=0,l=a,i=r):240<=e&&e<300?(n=a,l=0,i=r):300<=e&&e<360&&(n=r,l=0,i=a),n=(n+o)*h,l=(l+o)*h,i=(i+o)*h,[n,l,i]}static circularBuffer(e,t){if(t.length<e.length){let s=e.slice(t.length),h=e.length;e.splice(0,h,...s,...t)}else if(t.length>e.length){let s=e.length;e.splice(0,s,t.slice(s-t.length))}else e.splice(0,e.length,...t);return e}static formatDataForCharts(e,t){if(Array.isArray(e)){if(Array.isArray(e[0])){let s={};if(e.forEach((h,r)=>{s[r]=h}),e=s,isNaN(e[0][0]))return}else if(t){if(e={[t]:e},isNaN(e[t][0]))return}else if(e={0:e},isNaN(e[0][0]))return}else if(typeof e=="object"){for(let s in e)if(typeof e[s]=="number"?e[s]=[e[s]]:e[s]?.values&&typeof e[s].values=="number"&&(e[s].values=[e[s].values]),isNaN(e[s][0]))return}else if(typeof e=="string"){let s;if(e.includes(`\r
`)){let h=e.split(`\r
`);e={},h.forEach((r,a)=>{r.includes("	")?s=r.split("	"):r.includes(",")?s=r.split(","):r.includes("|")&&(s=r.split("|")),s&&s.forEach((o,n)=>{if(o.includes(":")){let[l,i]=o.split(":"),f=parseFloat(i);isNaN(f)||(e[l]=[f])}else{let l=parseFloat(o);isNaN(l)||(e[n]=[l])}})})}else e.includes("	")?s=e.split("	"):e.includes(",")?s=e.split(","):e.includes("|")&&(s=e.split("|"));e={},s&&s.forEach((h,r)=>{if(h.includes(":")){let[a,o]=h.split(":"),n=parseFloat(o);isNaN(n)||(e[a]=[n])}else{let a=parseFloat(h);isNaN(a)||(e[r]=[a])}})}else typeof e=="number"&&(t?e={[t]:[e]}:e={0:[e]});return e}static padTime(e,t,s,h){let r=(e[0]-t)/s/h;return[...new Array(h-e.length).map((o,n)=>t+r*(n+1)),...e]}static interpolateForTime(e,t,s){return y.interpolate(e,Math.ceil(s*t))}};globalThis.plotter=new y;var routes={...workerCanvasRoutes};self.onmessage=ev=>{if(ev.data.route){if(Array.isArray(ev.data.args)){routes[ev.data.route](...ev.data.args)}else routes[ev.data.route](ev.data.args)}};var canvas_worker_default=self;})();
