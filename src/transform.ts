import { Graph } from "./graphscript/Graph";

export default (tag, node) => {

    const args = node.arguments as Map<string, any>

    // Create Instance Argument Tree
    const instanceTree = {};
    Array.from(args.entries()).forEach(([arg], i) => {
      instanceTree[arg] = {
        tag: arg,
        operator: function (input) {
          const o = args.get(arg)
          o.state = input
          if (i === 0) return node.operator(); // run the operator but pass to these connections
          return input;
        }
      };
    });

    const originalOperator = node.operator
    // Create Proper Global Operator for the Instance
    node.operator = function (...argsArr){

      let updatedArgs: any[] = [];
      let i = 0;
      args.forEach((o, k) => {
        const argO = args.get(k)
        const currentArg = argO.spread ? argsArr.slice(i) : argsArr[i];
        let update = currentArg !== void 0 ? currentArg : o.state;
        argO.state = update
        if (!argO.spread)  update = [update];
        updatedArgs.push(...update);
        i++;
      });


        return originalOperator.call(this ?? node, ...updatedArgs) // bound to GraphNode later
    }

    return new Graph(instanceTree, tag, node)
  }