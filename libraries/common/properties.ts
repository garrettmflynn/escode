
// ------------ Get All Property Names ------------

const objectPrototypeKeys = Object.getOwnPropertyNames(Object.prototype)

export function all( obj: any ) {
    var props: string[] = [];
    if (obj) {
        do {

            const isRawObject = obj.constructor?.name === 'Object'
            Object.getOwnPropertyNames( obj ).forEach(function ( prop ) {
                if (isRawObject && objectPrototypeKeys.includes(prop)) return; // Skip Object.prototype
                if ( props.indexOf( prop ) === -1 ) props.push( prop )
            });
        } while ( obj = Object.getPrototypeOf( obj ));
    }

    return props;
}
