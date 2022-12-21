
// ------------ Get All Property Names ------------

const rawProperties = {}

export function all( obj: any ) {
    var props: string[] = [];
    if (obj) {
        do {

            const name = obj.constructor?.name 
            const isNativeClass = globalThis[name] && typeof globalThis[name] === 'function'
            if (globalThis[name]) {
                if (!rawProperties[name]) rawProperties[name] = [...Object.getOwnPropertyNames(globalThis[name].prototype)]
            }

            Object.getOwnPropertyNames( obj ).forEach(function ( prop ) {
                if (isNativeClass && rawProperties[name].includes(prop)) return; // Skip inbuilt class prototypes
                if ( props.indexOf( prop ) === -1 ) props.push( prop )
            });
        } while ( obj = Object.getPrototypeOf( obj ));
    }

    return props;
}
