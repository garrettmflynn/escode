import ListClassComponent from "./List.esc"

class List extends ListClassComponent {

    itemType = 'es-removable-list-item'
    __element = 'ul'
    __childposition = 0

    constructor() {
        super()
    }
}


export default List