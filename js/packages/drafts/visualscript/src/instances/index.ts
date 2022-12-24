// Global Context Menu
import context from './context'

// Create Global Variables
globalThis.visualscriptContextMenu = context

// Append to Document
document.body.appendChild(context)

export {
    context
}
