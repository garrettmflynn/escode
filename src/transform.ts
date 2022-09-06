import { Graph } from "./graphscript/Graph";

export default (tag, node) => {

    const args = node.arguments as Map<string, any>

    let graph;

    // Create Instance Argument Tree
    Array.from(args.keys()).forEach((arg, i) => node[`${arg}`] = args.get(arg).state) // transfer argument states

    const originalOperator = node.operator
    if (typeof originalOperator === 'function'){

      // Create Proper Global Operator for the Instance
      node.operator = function (...argsArr){

        let updatedArgs: any[] = [];
        let i = 0;
        args.forEach((o, k) => {
          const argO = args.get(k)
          const proxy = `${k}`
          const currentArg = argO.spread ? argsArr.slice(i) : argsArr[i];
          const target = graph.node ?? graph
          let update = currentArg !== void 0 ? currentArg : target[proxy];
          target[proxy] = update // updating state on graph
          if (!argO.spread)  update = [update];
          updatedArgs.push(...update);
          i++;
        });


          return originalOperator.call(this ?? node, ...updatedArgs) // bound to GraphNode later
      }
    } else {
      console.error('Operator is not a function for', node.tag, node, originalOperator)
      node.operator = (...args) => args
    }

    graph = new Graph({}, tag, node) // no internal nodes
    return graph
  }