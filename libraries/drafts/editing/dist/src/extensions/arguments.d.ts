declare const ArgumentGraphExtension: {
    type: string;
    condition: (treeEntry: any) => boolean;
    transform: (treeEntry: any, app: any) => any;
};
export default ArgumentGraphExtension;
