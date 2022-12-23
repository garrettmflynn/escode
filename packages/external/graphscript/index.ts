//graphnodes but we are going to define graph nodes as scopes and graphs as instances of scopes, 
// then the execution behaviors will be made plugins to recognize settings on the objects optionally. This is more generic

import { isNativeClass } from "../../../src/utils";
import { EventHandler } from "./services/EventHandler";

export const state = new EventHandler();


function applyLoader (node: GraphNode, parent, graph=this, tree= graph.__node.tree, properties, tag=node.__node.tag, loader) {

    const args = [ node,parent,graph,tree,properties, tag ]

    if(typeof loader === 'object') { 
        if(loader.init) loader(...args);
        if(loader.connected) node.__addOnconnected(loader.connect); 
        if(loader.disconnected) node.__addOndisconnected(loader.disconnect); 
    } else if (typeof loader === 'function') loader(...args); //run any passes on the nodes to set things up further

}
function applyLoaders (node: GraphNode, parent, graph=this, tree= graph.__node.tree, properties, tag=node.__node.tag, loaders=this.__node.loaders) {
    for(const l in loaders) applyLoader(node,parent,graph,tree,properties,tag,loaders[l])
}


export type GraphNodeProperties = {
    __props?:Function|GraphNodeProperties, //a class constructor function (calls 'new x()') or an object we want to proxy all of the methods on this node. E.g. an html element gains 'this' access through operators and listeners on this node.
    __operator?:((...args:any[])=>any)|string, //The 'main' function of the graph node, children will call this function if triggered by a parent. Functions passed as graphnodeproperties become the operator which can set state.
    __children?:{[key:string]:GraphNodeProperties}, //child nodes belonging to this node, e.g. for propagating results
    __listeners?:{[key:string]:true|string|((result)=>void)|{__callback:string|((result)=>void)|true,subInput?:boolean,[key:string]:any}}|{[key:string]:((result)=>void)|true|string}, //subscribe by tag to nodes or their specific properties and method outputs
    __onconnected?:((node)=>void|((node)=>void)[]), //what happens once the node is created?
    __ondisconnected?:((node)=>void|((node)=>void)[]), //what happens when the node is deleted?
    __node?:{ //node specific properties, can contain a lot more things
        tag?:string,
        state?:EventHandler, //by default has a global shared state
        inputState?:boolean //we can track inputs on a node, subscribe to state with 'input' on the end of the tag or 'tag.prop' 
        [key:string]:any
    },
    [key:string]:any
}


export type Loader = (
    node:GraphNode,
    parent:Graph|GraphNode,
    graph:Graph,
    tree:any,
    properties:GraphNodeProperties,
    key:string
)=>void;

export type GraphOptions = {
    tree?:{[key:string]:any},
    loaders?:{
        [key:string]:Loader|{
            init?:Loader, 
            connected?:(node)=>void, 
            disconnected?:(node)=>void}
        },
    state?:EventHandler,
    mapGraphs?:false, //if adding a Graph as a node, do we want to map all the graph's nodes with the parent graph tag denoting it (for uniqueness)?
    [key:string]:any
}

//this is a scope
export class GraphNode {

    // Confirm that the object should be recognized as graph script
    __isGraphScript = true;

    __node:{
        [key:string]:any
    } = { //GraphNode-specific properties 
        tag:`node${Math.floor(Math.random()*1000000000000000)}`,
        unique:`${Math.random()}`,
        state,
        // operator: undefined as any,
        // graph: undefined as any,
        // children: undefined as any,
        // localState: undefined as any,
        // oncreate:undefined as any, //function or array of functions
        // ondelete:undefined as any, //function or array of functions
        // listeners:undefined as any, //e.g. { 'nodeA.x':(newX)=>{console.log('nodeA.x changed:',x)}  }
        // source:undefined as any// source graph if a graph is passed as properties
    }

    __children?;
    __operator?;
    __listeners?;
    __props?;

    [key:string]:any
    
    //pass GraphNodeProperties, functions, or tags of other nodes
    constructor(properties:any, parent?:{[key:string]:any}, graph?:Graph) {

        let orig = properties;
        if(typeof properties === 'function') {
            if(isNativeClass(properties)) { //works on custom classes
                console.log(properties);
                properties = new properties(); //this is a class that returns a node definition
            } else properties = {
                __operator:properties,
                __node:{
                    forward:true, //propagate operator results to children
                    tag:properties.name
                }
            };
        } else if (typeof properties === 'string') {
            if(graph?.get(properties)) {
                properties = graph.get(properties);
            }
        }
        if(!properties.__node.initial) properties.__node.initial = orig; //original object or function

        if(typeof properties === 'object') {
            if(properties.__props) { //e.g. some generic javascript object or class constructor that we want to proxy. Functions passed here are treated as constructors. E.g. pass an HTML canvas element for the node then set this.width on the node to set the canvas width  
                if (typeof properties.__props === 'function') properties.__props = new properties.__props();
                if (typeof properties.__props === 'object') {
                    this.__proxyObject(properties.__props);
                }
            }

            if (typeof properties.__node === 'string') {
                //copy
                if(graph?.get(properties.__node.tag)) {
                    properties = graph.get(properties.__node.tag);
                } else properties.__node = {}
            } else if(!properties.__node) properties.__node = {};

            if(graph) {
                properties.__node.graph = graph;
            }

            if(properties.__operator) {
                if (typeof properties.__operator === 'string') {
                    if(graph) {
                        let n = graph.get(properties.__operator);
                        if(n) properties.__operator = n.__operator;
                        if(!properties.__node.tag && (properties.__operator as Function).name) 
                            properties.__node.tag = (properties.__operator as Function).name;
                    }
                }
                if(typeof properties.__operator === 'function') 
                    properties.__operator = this.__setOperator(properties.__operator);
                
            }

            if(!properties.__node.tag) {
                if(properties.__operator?.name)
                    properties.__node.tag = properties.__operator.name;
                else 
                    properties.__node.tag = `node${Math.floor(Math.random()*1000000000000000)}`;
            }

            //nested graphs or 2nd level+ nodes get their parents as a tag
            if(!properties.__parent && parent) properties.__parent = parent;
            if(parent?.__node && (!(parent instanceof Graph || properties instanceof Graph))) 
                properties.__node.tag = parent.__node.tag + '.' + properties.__node.tag; //load parents first
            
            if(parent instanceof Graph && properties instanceof Graph) {

                if(properties.__node.loaders) Object.assign(parent.__node.loaders ? parent.__node.loaders : {}, properties.__node.loaders); //let the parent graph adopt the child graph's loaders

                if(parent.__node.mapGraphs) {
                    //do we still want to register the child graph's nodes on the parent graph with unique tags for navigation? Need to add cleanup in this case
                    properties.__node.nodes.forEach((n) => {parent.set(properties.__node.tag+'.'+n.__node.tag,n)});

                    let ondelete = () => { properties.__node.nodes.forEach((n) => {parent.__node.nodes.delete(properties.__node.tag+'.'+n.__node.tag)}); }
                    this.__addOndisconnected(ondelete);

                }
            }

            properties.__node = Object.assign(this.__node,properties.__node);
            
            let keys = Object.getOwnPropertyNames(properties);
            for(const key of keys) { this[key] = properties[key]; }


            // Apply loaders before checking for properties
            applyLoaders.call(graph, this, parent, graph, graph?.__node?.tree, properties) // what was stated for objects
            
            // Check for default function
            // TODO: Make sure this only applies when subscribed to something...
            if (typeof this.default === 'function' && !this.__operator) { //make it so the node is subscribable
                let fn = this.default.bind(this);
                this.default = (...args) => {
                    if(this.__node.inputState) this.__node.state.setValue(this.__node.unique+'input',args);
                    let result = fn(...args);
                    if(typeof result?.then === 'function') {
                        result.then((res)=>{ if(res !== undefined) this.__node.state.setValue( this.__node.unique,res ) }).catch(console.error);
                    } else if(result !== undefined) this.__node.state.setValue(this.__node.unique,result);
                    return result;
                } 

                properties.default = this.default;
            }
            
            if(properties instanceof Graph) this.__node.source = properties; //keep tabs on source graphs passed to make nodes

            
        }
    }

    //subscribe an output or input with an arbitrary callback
    __subscribe = (callback:string|GraphNode|((res)=>void), key?:string, subInput?:boolean, bound?:string, target?:string) => {


        const subscribeToGraphMethod = (callback) => {
            let fn = this.__node.graph.get(callback);
            if(!fn && callback.includes('.')) {
                const substring = callback.substring(0,callback.lastIndexOf('.'))
                let n = this.__node.graph.get(substring)
                let key = callback.substring(callback.lastIndexOf('.')+1);

                const f = n[key].default ?? n[key];
                if(n && typeof f === 'function') return n
            }
        }
        
        const subscribeHelper = (k, setTarget = (callback, target?) => callback, triggerCallback=callback) => {
            

            let sub = this.__node.state.subscribeTrigger(k, triggerCallback);

            // Add details to trigger
            let trigger = this.__node.state.getTrigger(k,sub);
            trigger.source = this.__node.tag;
            if(key) trigger.key = key;
            trigger.target = setTarget(callback) // Non-string value

            if(bound) trigger.bound = bound;

            return sub
        }

        const subscribeToGraphNode = (k, callback) => subscribeHelper(k, 
            (callback, target) => target ? target : (callback as GraphNode).__node.tag,
            (state:any)=>{ if((callback as any).__operator) (callback as any).__operator(state); }
        )

        if(key) {
           // console.log(key,this.__node.tag, 'callback:', callback);
            if(!this.__node.localState) {
                this.__addLocalState(this);
            }
             
            if(typeof callback === 'string') {
                if(typeof this[callback] === 'function') callback = this[callback];
                // else if(this.__node.graph) callback = subscribeToGraphMethod(callback)
            }

            let sub;
            
            let k = subInput ? this.__node.unique+'.'+key+'input' : this.__node.unique+'.'+key;

            
            const typeOf = typeof callback
            if (typeOf === 'string') {
                const graph = subscribeToGraphMethod(callback)
                if (graph) {
                    let newK = subInput ? graph.__node.unique+'.'+key+'input' : graph.__node.unique+'.'+key;

                    // TODO: Make sure this is recognized when changes occur...
                    // Need to implement a way to subscribe to arbitrary object properties
                    sub = subscribeHelper(newK, 
                        (callback) => callback,
                        (state:any)=>{ 
                            console.log('triggered', state)
                        }
                    )
                }
                else console.error('String callback not found', callback)
            }
            else if(typeOf === 'function') sub = subscribeHelper(k)
            else if((callback as GraphNode)?.__node) sub = subscribeToGraphNode(k, callback)

            return sub;
        }
        else {

            // Get node based on the graph
            if(typeof callback === 'string') {
                if(this.__node.graph) callback = this.__node.graph.get(callback);
                else callback = this.__node.graph.nodes.get(callback);
            }

            let sub;
            let k = subInput ? this.__node.unique+'input' : this.__node.unique;
            if(typeof callback === 'function') sub = subscribeHelper(k)
            else if((callback as GraphNode)?.__node) sub = subscribeToGraphNode(k, callback)

            return sub;
        }
    }
    
    //unsub the callback
    __unsubscribe = (sub?:number, key?:string, subInput?:boolean) => {

        if(key) {
            return this.__node.state.unsubscribeTrigger(subInput ? this.__node.unique+'.'+key+'input' : this.__node.unique+'.'+key, sub);
        }
        else return this.__node.state.unsubscribeTrigger(subInput ? this.__node.unique+'input' : this.__node.unique, sub);
        
    }

    __setOperator = (fn:(...args:any[])=>any) => {
        fn = fn.bind(this);
        this.__operator = (...args) => {
            if(this.__node.inputState) this.__node.state.setValue(this.__node.unique+'input',args);
            let result = fn(...args);
            if(this.__node.state.triggers[this.__node.unique]) { //don't set state (i.e. copy the result) if no subscriptions
                if(typeof result?.then === 'function') {
                    result.then((res)=>{ if(res !== undefined) this.__node.state.setValue( this.__node.unique,res ) }).catch(console.error);
                } else if(result !== undefined) this.__node.state.setValue(this.__node.unique,result);
            }
            return result;
        } 

        if(!this.__subscribedToParent) {
            if(this.__parent instanceof GraphNode && this.__parent.__operator) {
                let sub = this.__parent.__subscribe(this);
                let ondelete = () => { this.__parent?.__unsubscribe(sub); delete this.__subscribedToParent;}
                this.__addOndisconnected(ondelete);
                this.__subscribedToParent = true;
            }
        }

        return this.__operator;
    }

    __addLocalState(props?:{[key:string]:any}) {
        if(!props) return;
        if(!this.__node.localState) {
            this.__node.localState = {};
        }
        let localState = this.__node.localState;
        for (let k in props) {
            if(this.__props && this.__props[k]) continue; //already given a local state, continue
            if(typeof props[k] === 'function') {
                if(!k.startsWith('_')) {
                    let fn = props[k].bind(this) as Function;
                    props[k] = (...args) => { //all functions get state functionality when called, incl resolving async results for you
                        if(this.__node.inputState) this.__node.state.setValue(this.__node.unique+'.'+k+'input',args);
                        let result = fn(...args);
                        if(typeof result?.then === 'function') {
                            if(this.__node.state.triggers[this.__node.unique+'.'+k]) result.then((res)=>{ this.__node.state.setValue( this.__node.unique+'.'+k, res ) }).catch(console.error);
                        } else if(this.__node.state.triggers[this.__node.unique+'.'+k]) this.__node.state.setValue(this.__node.unique+'.'+k,result);
                        return result;
                    }
                    this[k] = props[k]; 
                }
            } else {
                localState[k] = props[k];
                //console.log(k, localState[k]);

                let definition = {
                    get: () => {
                        return localState[k];
                    },
                    set: (v) => {
                        localState[k] = v;
                        if(this.__node.state.triggers[this.__node.unique+'.'+k]) this.__node.state.setValue(this.__node.unique+'.'+k,v); //this will update localState and trigger local key subscriptions
                    },
                    enumerable: true,
                    configurable: true
                } as any;

                try {
                    Object.defineProperty(this, k, definition);
                } catch(e) { console.warn(`Cannot set local state for ${k} on ${this.__node.tag}`) }
                
                if(typeof this.__node.initial === 'object') {
                    let dec = Object.getOwnPropertyDescriptor(this.__node.initial,k);
                    if(dec === undefined || dec?.configurable) {
                        Object.defineProperty(this.__node.initial, k, definition);
                    }
                }
            }
        }
    }

    //we can proxy an original object and function outputs on the node
    __proxyObject = (obj) => {
        
        let allProps = getAllProperties(obj);

        for(const k of allProps) {
            if(typeof this[k] === 'undefined') {
                if(typeof obj[k] === 'function') {
                    this[k] = (...args) => { //all functions get state functionality when called, incl resolving async results for you
                        if(this.__node.inputState) this.__node.state.setValue(this.__node.unique+'.'+k+'input',args);
                        let result = obj[k](...args);
                        if(this.__node.state.triggers[this.__node.unique+'.'+k]) {
                            if(typeof result?.then === 'function') {
                                result.then((res)=>{ this.__node.state.setValue( this.__node.unique+'.'+k, res ) }).catch(console.error);
                            } else this.__node.state.setValue(this.__node.unique+'.'+k,result);
                        }
                        return result;
                    }
                } else {

                    let definition = {
                        get:()=>{return obj[k]},
                        set:(value) => { 
                            obj[k] = value;
                            if(this.__node.state.triggers[this.__node.unique+'.'+k]) this.__node.state.setValue(this.__node.unique+'.'+k,value);
                        },
                        enumerable: true,
                        configurable: true
                    }

                    Object.defineProperty(this, k, definition);
                }
            }  
        }
    }
    
    __addOnconnected(callback:(node)=>void) {
        if(Array.isArray(this.__ondisconnected)) { this.__onconnected.push(callback); }
        else if (typeof this.__onconnected === 'function') { this.__onconnected = [callback,this.__onconnected] }
        else this.__onconnected = callback;
    }

    __addOndisconnected(callback:(node)=>void) {
        if(Array.isArray(this.__ondisconnected)) { this.__ondisconnected.push(callback); }
        else if (typeof this.__ondisconnected === 'function') { this.__ondisconnected = [callback,this.__ondisconnected] }
        else this.__ondisconnected = callback;
    }

    __callConnected(node=this) {
        if(typeof this.__onconnected === 'function') { this.__onconnected(this); }
        else if (Array.isArray(this.__onconnected)) { this.__onconnected.forEach((o:Function) => { o(this); }) }
    }

    __callDisconnected(node=this) {
        if(typeof this.__ondisconnected === 'function') this.__ondisconnected(this);
        else if (Array.isArray(this.__ondisconnected)) { this.__ondisconnected.forEach((o:Function) => {o(this)}); }
    }

}

export class Graph {

    [key:string]:any;

    __node:{
        tag:string,
        state:EventHandler,
        nodes:Map<string,GraphNode|any>,
        ref?: GraphNode
        [key:string]:any
    } = {
        tag:`graph${Math.floor(Math.random()*1000000000000000)}`,
        nodes:new Map(),
        state,
        // addState:true //apply the addLocalState on node init 
        // mapGraphs:false //if adding a Graph as a node, do we want to map all the graph's nodes with the parent graph tag denoting it (for uniqueness)?
        // tree:undefined as any,
        // loaders:undefined as any,
    }



    constructor(
        options?:GraphOptions
    ) {
        this.init(options);
    }

    init = (options?:GraphOptions) => {
        if(options) {
            recursivelyAssign(this.__node, options); //assign loaders etc
            if(options.tree) this.setTree(options.tree);
        }
    }

    setTree = (tree:{[key:string]:any}) => {

        // ---------------- Recognize node trees ----------------
        const hasGraphscriptProperties = Object.keys(tree).find(str => {
            const slice = str.slice(0,2)
            return (slice === '__' && str !== '__node')
        })

        if (hasGraphscriptProperties) tree.__node = {} // Set tree as a node (not all nodes are registered in the graph...)

        // ---------------- Preprocess tree ----------------
        this.__node.tree = Object.assign(this.__node.tree ? this.__node.tree : {}, tree);

        let cpy = Object.assign({}, tree);
        if(cpy.__node) delete cpy.__node; //we can specify __node behaviors on the tree too to specify listeners

        // Activate the tree by creating active nodes
        let listeners = this.recursiveSet(cpy,this,undefined,tree);


        // ---------------- Turn the tree into a node (if specified) ----------------
        if(tree.__node) {

            // Assign random tag to tree (if one is missing)
            if(!tree.__node.tag) tree.__node.tag = this.__node.tag //getRandomTag('tree')
            
            // Create graph node if tag isn't already present in the graph
            if (!this.get(tree.__node.tag)) {
                const node = this.__node.ref = new GraphNode(tree,this,this); //blank node essentially for creating listeners

                // Activate all children
                const children = node.__children
                if (children) listeners = this.recursiveSet(Object.assign({}, children), this, undefined, children)

                if(node.__listeners) listeners[node.__node.tag] = node.__listeners;
            }
        } 
        
        // // Just provide listeners for the tree | NOW COVERED BY SETTING THE ACTIVE TREE AS THE FIRST NODE
        // else if (tree.__listeners) this.setListeners(tree.__listeners)

        // ---------------- Setup event listeners ----------------
        this.setListeners(listeners);

        return cpy; //should be the node tree

    }

    setLoaders = (loaders:{[key:string]:(node:GraphNode,parent:Graph|GraphNode,graph:Graph,tree:any,props:any,key:string)=>void}, replace?:boolean) => {
        if(replace)  this.__node.loaders = loaders;
        else Object.assign(this.__node.loaders,loaders);

        return this.__node.loaders;
    }

    add = (properties:any, parent?:GraphNode|string) => {

        let listeners = {}; //collect listener props declared
        if(typeof parent === 'string') parent = this.get(parent);

        let instanced;
        if(typeof properties === 'function') {
            if(isNativeClass(properties)) { //works on custom classes
                if(properties.prototype instanceof GraphNode) { properties = properties.prototype.constructor(properties,parent,this); instanced = true; } //reinstantiate a new node with the old node's props
                else properties = new properties(); //this is a class that returns a node definition 
            } else properties = { __operator:properties };
        }
        else if (typeof properties === 'string') properties = this.__node.tree[properties];
        
        if(!instanced) {
            properties = Object.assign({},properties); //make sure we don't mutate the original object   
        }
        if(!properties.__node) properties.__node = {};
        properties.__node.initial = properties; 

        if(typeof properties === 'object' && (!properties?.__node?.tag || !this.get(properties.__node.tag))) {
            let node;
            if(instanced) node = properties;
            else node = new GraphNode(properties, parent as GraphNode, this);
            this.set(node.__node.tag,node);
            this.__node.tree[node.__node.tag] = properties; //reference the original props by tag in the tree for children
            //console.log('old:',properties.__node,'new:',node.__node);
            
            if(node.__listeners) {
                listeners[node.__node.tag] = node.__listeners;
            }
    
            if(node.__children) {
                node.__children = Object.assign({},node.__children);
                this.recursiveSet(node.__children, node, listeners,node.__children);
            }
    
            //now setup event listeners
            this.setListeners(listeners);
    
            node.__callConnected();

            return node;

        }

        return;
    }

    recursiveSet = (t,parent,listeners={},origin) =>  {
        let keys = Object.getOwnPropertyNames(origin);
        for(const key of keys) {
            if(key.includes('__')) continue;
            let p = origin[key];
            if(Array.isArray(p)) continue;
            let instanced;
            if(typeof p === 'function') {
                if(isNativeClass(p)) { //works on custom classes
                    p = new p(); //this is a class that returns a node definition
                    if(p instanceof GraphNode) { p = p.prototype.constructor(p,parent,this); instanced = true; } //re-instance a new node
                } else p = { __operator:p };
            } 
            else if (typeof p === 'string') p = this.__node.tree[p];
            else if (typeof p === 'boolean') p = this.__node.tree[key];
            if(typeof p === 'object') {
                
                if(!instanced) {
                    p = Object.assign({},p); //make sure we don't mutate the original object
                }
                if(!p.__node) p.__node = {};
                if(!p.__node.tag) p.__node.tag = key;
                p.__node.initial = t[key];
                if((this.get(p.__node.tag) && !(parent?.__node && this.get(parent.__node.tag + '.' + p.__node.tag))) || (parent?.__node && this.get(parent.__node.tag + '.' + p.__node.tag))) continue; //don't duplicate a node we already have in the graph by tag
                let node;
                if(instanced) node = p;
                else node = new GraphNode(p, parent as GraphNode, this);
                this.set(node.__node.tag,node);
                // for(const l in this.__node.loaders) { this.__node.loaders[l](node,parent,this,t,t[key],key); } //run any passes on the nodes to set things up further
                t[key] = node; //replace child with a graphnode
                this.__node.tree[node.__node.tag] = p; //reference the original props by tag in the tree for children
                if(node.__listeners) {
                    listeners[node.__node.tag] = node.__listeners;
                }
                if(node.__children) {
                    node.__children = Object.assign({},node.__children);
                    this.recursiveSet(node.__children, node, listeners,node.__children);
                }

                node.__callConnected();
            }
        } 
        return listeners;
    }

    remove = (node:GraphNode|string, clearListeners:boolean=true) => {
        this.unsubscribe(node);

        if(typeof node === 'string') node = this.get(node);

        if(node instanceof GraphNode) {
            this.delete(node.__node.tag);
            delete this.__node.tree[node.__node.tag];

            if(clearListeners) {
                this.clearListeners(node);
            }

            node.__callDisconnected();
 
            const recursiveRemove = (t) => {
                for(const key in t) {
                    this.unsubscribe(t[key]);
                    this.delete(t[key].__node.tag);
                    delete this.__node.tree[t[key].__node.tag]
                    this.delete(key);
                    delete this.__node.tree[key]

                    //console.log(key, 'removing child',t[key]);
                    t[key].__node.tag = t[key].__node.tag.substring(t[key].__node.tag.lastIndexOf('.')+1);

                    if(clearListeners) {
                        this.clearListeners(t[key]);
                    }

                    t[key].__callDisconnected();
                   
                    if(t[key].__children) {
                        recursiveRemove(t[key].__children);
                    }

                   // console.log('removed!', t[key])
                } 
            }

            if(node.__children) {
                recursiveRemove(node.__children);
            }
        }

        if((node as any)?.__node.tag && (node as any)?.__parent) {
            delete (node as any)?.__parent;
            (node as any).__node.tag = (node as any).__node.tag.substring((node as any).__node.tag.indexOf('.')+1);
        }

        return node;
    }

    run = (node:string|GraphNode, ...args:any[]) => {
        if(typeof node === 'string') {
            let nd = this.get(node);
            if(!nd && node.includes('.')) {
                nd = this.get(node.substring(0,node.lastIndexOf('.')));
                if(typeof nd?.[node.substring(node.lastIndexOf('.')+1)] === 'function') return nd[node.substring(node.lastIndexOf('.')+1)](...args);
            } else if(nd?.__operator) return nd.__operator(...args);
        }
        if((node as GraphNode)?.__operator) {
            return (node as GraphNode)?.__operator(...args);
        }
    }

    setListeners = (listeners:{[key:string]:{[key:string]:any}}) => {

        // Setup event listeners
        for (const bound in listeners) {
            let node = this.get(bound);


            const listenersBoundTo = listeners[bound]
            // console.log('Listeners bound to', deep(listenersBoundTo))


            // Check if the listener information is a sheet of listeners
            if(typeof listenersBoundTo === 'object') {
                for(const from in listenersBoundTo) {

                    let fromNode = this.get(from, bound);

                    let sub;
                    const listenersToFrom = listenersBoundTo[from]
                    
                    // console.log('Listeners from', deep(listenersToFrom))

                    // Is a string or callback
                    if( typeof listenersToFrom !== 'object' ) listenersBoundTo[from] = { __callback: listenersToFrom };

                    // Is a sheet of listeners (object) specifying multiple input
                    // NOTE: These use to / from syntax
                    else if(!listenersToFrom.__callback) {
                        for(const to in listenersToFrom) {

                            let toNode = this.get(to, bound);

                            // Convert to a listener 
                            if(typeof listenersToFrom[to] !== 'object') listenersToFrom[to] = {__callback: listenersToFrom[to]}

                            let listener = listenersToFrom[to]

                            // TEMPORARY: Remove any configuration options from the listener
                            if (Object.keys(listener).find(str => str !== '__callback')) listener = { __callback: true }


                            if(toNode) {
                                if (listener.__callback === true) listener.__callback = fromNode ?? from; 

                                if(!fromNode) {
                                    let tag = from.substring(0,from.lastIndexOf('.'));
                                    fromNode = this.get(tag, bound);
                                    if(fromNode) {
                                        sub = this.subscribe(toNode,  listener.__callback, from.substring(from.lastIndexOf('.')+1), listener.inputState, bound, from);
                                        if(typeof node.__listeners[from][to] !== 'object') node.__listeners[from][to] = { __callback: listener.__callback, inputState:listener?.inputState };
                                        node.__listeners[from][to].sub = sub;
                                    }
                                } else {
                                    sub = this.subscribe(toNode, listener.__callback, undefined, listener.inputState, bound, from);
                                    if(typeof node.__listeners[from][to] !== 'object') node.__listeners[from][to] = { __callback: listener.__callback, inputState: listener?.inputState };
                                    node.__listeners[from][to].sub = sub;
                                }
                            } 
                            
                            // Target toNode
                            else if (listener.__callback === true) listener.__callback = toNode; 
                        }
                    }

                    // Apply callbacks
                    if(listenersToFrom.__callback) {
                        if(listenersToFrom.__callback === true) listenersToFrom.__callback = node.__operator // Target bound node operator
                        if( typeof listenersToFrom.__callback === 'function') listenersToFrom.__callback = listenersToFrom.__callback.bind(node);
                        if(typeof node.__listeners !== 'object') node.__listeners = {}; //if we want to subscribe a node with listeners that doesn't predeclare them
                        if(!fromNode) {
                            let tag = from.substring(0,from.lastIndexOf('.'));
                            fromNode = this.get(tag);
                            if(fromNode) {
                                sub = this.subscribe(fromNode,  listenersToFrom.__callback, from.substring(from.lastIndexOf('.')+1), listenersToFrom.inputState, bound, from);
                                if(typeof node.__listeners[from] !== 'object') node.__listeners[from] = { __callback: listenersToFrom.__callback, inputState:listenersToFrom?.inputState };
                                node.__listeners[from].sub = sub;
                            }
                        } else {
                            sub = this.subscribe(fromNode, listenersToFrom.__callback, undefined, listenersToFrom.inputState, bound, from);
                            if(typeof node.__listeners[from] !== 'object') node.__listeners[from] = { __callback: listenersToFrom.__callback, inputState: listenersToFrom?.inputState };
                            node.__listeners[from].sub = sub;
                        }
                        //console.log(sub);
                    }
                }
            }
        }
    }

    clearListeners = (node:GraphNode|string,listener?:string) => {
        if(typeof node === 'string') node = this.get(node) as GraphNode;
        if(node?.__listeners) {
            //console.log(node?.__listeners);
            //console.log(node.__listeners);
            for(const key in node.__listeners) {
                if(listener && key !== listener) continue; 
                if(typeof node.__listeners[key].sub !== 'number') continue;
                let n = this.get(key);
                if(!n) {
                    n = this.get(key.substring(0,key.lastIndexOf('.')));
                    //console.log(key.substring(0,key.lastIndexOf('.')),key,n,node.__listeners[key]);
                    if(n) {
                        if(!node.__listeners[key].__callback) {
                            for(const k in node.__listeners[key]) {
                                this.unsubscribe(n,node.__listeners[key][k].sub, key.substring(key.lastIndexOf('.')+1), node.__listeners[key][k].inputState);
                            }
                        } else this.unsubscribe(n,node.__listeners[key].sub, key.substring(key.lastIndexOf('.')+1), node.__listeners[key].inputState);
                    }
                } else {
                    if(!node.__listeners[key].__callback) {
                        for(const k in node.__listeners[key]) {
                            this.unsubscribe(n,node.__listeners[key][k].sub, undefined, node.__listeners[key][k].inputState);
                        }
                    } else this.unsubscribe(n,node.__listeners[key].sub, undefined, node.__listeners[key].inputState);
                }

                //console.log('unsubscribed', key)
                delete node.__listeners[key];
            }
        }
    }

    get = (tag:string, base?:string) => { 

        if (tag === this.__node.tag) return this.__node.ref

        if (base) {
            const relFrom = [base, tag].join('.') // Assume relative targeting first
            const got = this.get(relFrom)
            if (got) return got
        }

        return this.__node.nodes.get(tag); 
    };

    set = (tag:string,node:GraphNode) => { return this.__node.nodes.set(tag,node); };
    delete = (tag:string) => { return this.__node.nodes.delete(tag); }

    getProps = (node:GraphNode|string, getInitial?:boolean) => {
        if(typeof node === 'string') node = this.get(node);

        if(node instanceof GraphNode) {
            
            let cpy;
            if(getInitial) cpy = Object.assign({}, this.__node.tree[node.__node.tag]);
            else {
                cpy = Object.assign({},node) as any;
                //remove graphnode methods to return the arbitrary props
                delete cpy.__unsubscribe;
                delete cpy.__setOperator;
                delete cpy.__node;
                delete cpy.__subscribeState;
                delete cpy.__subscribe;
            }
        }
    }

    subscribe = (
        node:GraphNode|string, callback:string|GraphNode|((res:any)=>void), key?:string|undefined, subInput?:boolean, target?:string, bound?:string
    ) => {

        let nd = (!(node instanceof GraphNode)) ? this.get(node, bound) : node

        let sub;

        if(typeof callback === 'string') {

            //console.log(node, callback, this.__node.nodes.keys());

            if(target) {
                let method = this.get(target, bound)?.[callback];
                if(typeof method === 'function') callback = method;
            } else callback = this.get(callback, bound)?.__operator;
        } 

        if (!callback) {
            console.error('No callback provided to subscribe to ' + nd.__node.tag);
            return
        }

        if(nd instanceof GraphNode) {
            sub = nd.__subscribe(callback,key,subInput,target,bound);
           
            let ondelete = () => {
                (nd as GraphNode).__unsubscribe(sub,key,subInput);
            }

            nd.__addOndisconnected(ondelete);
        } else if (typeof node === 'string') {
            if(this.get(node, bound)) {
                if(callback instanceof GraphNode && callback.__operator) {
                    sub = (this.get(node, bound) as GraphNode).__subscribe(callback.__operator,key,subInput,target,bound); 
                    let ondelete = () => {
                        this.get(node, bound).__unsubscribe(sub)
                        //console.log('unsubscribed', key)
                    }
        
                    callback.__addOndisconnected(ondelete);
                }
                else if (typeof callback === 'function' || typeof callback === 'string') {
                    sub = (this.get(node, bound) as GraphNode).__subscribe(callback,key,subInput,target,bound); 
                    
                    this.__node.state.getTrigger(this.get(node, bound).__node.unique,sub).source = node;
                }
            } else {
                if(typeof callback === 'string') callback = this.get(callback, bound).__operator; 
                else if(typeof callback === 'function') sub = this.__node.state.subscribeTrigger(node, callback);
            }
        }
        return sub;
    }

    unsubscribe = ( node:GraphNode|string, sub?:number, key?:string, subInput?:boolean) => {
        if(node instanceof GraphNode) {
            return node.__unsubscribe(sub,key,subInput);
        }
        else return this.get(node)?.__unsubscribe(sub,key,subInput); // TODO: Make this work even without the input of "bound"
    }

    setState = (update:{[key:string]:any}) => {
        this.__node.state.setState(update);
    }

}


function recursivelyAssign (target,obj) {
    for(const key in obj) {
        if(obj[key]?.constructor.name === 'Object' && !Array.isArray(obj[key])) {
            if(target[key]?.constructor.name === 'Object' && !Array.isArray(target[key])) 
                recursivelyAssign(target[key], obj[key]);
            else target[key] = recursivelyAssign({},obj[key]); 
        } else {
            target[key] = obj[key];
            //if(typeof target[key] === 'function') target[key] = target[key].bind(this);
        }
    }

    return target;
}


export function getAllProperties(obj){ //https://stackoverflow.com/questions/8024149/is-it-possible-to-get-the-non-enumerable-inherited-property-names-of-an-object
    let allProps = [] as string[], curr = obj
    while(curr = Object.getPrototypeOf(curr)) {
        let props = Object.getOwnPropertyNames(curr)
        props.forEach((prop) => {
            if (allProps.indexOf(prop) === -1) allProps.push(prop)
        })
    }
    return allProps;
}

export function instanceObject(obj) {
    let props = getAllProperties(obj); //e.g. Math
    let instance = {} as any;
    for(const key of props) instance[key] = obj[key];
    return instance; //simply copies methods, nested objects will not be instanced to limit recursion
}