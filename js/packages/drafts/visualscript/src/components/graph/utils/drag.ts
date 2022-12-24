import { GraphWorkspace } from '../Workspace';
import { GraphNode } from '../Node';
import { GraphPort } from '../Port';

const dragElement = (workspace:GraphWorkspace, dragItem: GraphNode, onMove, onDown,onUp) => {
    var active = false;
    var currentX;
    var currentY;
    var initialX;
    var initialY;
    var xOffset = 0;
    var yOffset = 0;
    var defaultScale = 1.0

    // container.addEventListener("touchstart", dragStart, false);
    // container.addEventListener("touchend", dragEnd, false);
    // container.addEventListener("touchmove", drag, false);

    dragItem.shadowRoot.addEventListener("mousedown", dragStart, false);
    window.addEventListener("mouseup", dragEnd, false);
    window.addEventListener("mousemove", drag, false);

    // let transform = dragItem.style.cssText.match(/transform: ([^;].+);\s?/) // TODO: Check persistence
    // let transformString: string
    // if (transform) transformString = transform[1]
    
    // if (transformString) {
    //   // let scale = transformString.match(/scale\(([^\)].+)\)\s?/)
    //   // if (scale) scale = scale[1]
    //   // else scale = 1

    //   let translateString = transformString.match(/translate\(([^\)].+)\)\s?/)
    //   if (translateString){
    //     let arr = translateString[1].split(',')
    //     xOffset = parseFloat(arr[0].split('px')[0])
    //     yOffset = parseFloat(arr[1].split('px')[0])
    //   }
    // } else {
    //   dragItem.style.transform = `scale(${defaultScale})`;
    // }

    function dragStart(e) {
      
      if (e.type === "touchstart") {
        initialX = (e.touches[0].clientX - (workspace.context.zoom*defaultScale)*dragItem.x);
        initialY = (e.touches[0].clientY - (workspace.context.zoom*defaultScale)*dragItem.y);
      } else {
        initialX = (e.clientX - (workspace.context.zoom*defaultScale)*dragItem.x);
        initialY = (e.clientY - (workspace.context.zoom*defaultScale)*dragItem.y);
      }

      // Account For Nested Control Objects
      if (dragItem.shadowRoot.contains(e.target)){
        if (!(e.target instanceof GraphPort)) active = true;
        onDown()
      }
    }

    function dragEnd() {
      initialX = currentX;
      initialY = currentY;

      active = false;
      onUp()
    }

    function drag(e) {
      if (active) {
      
        e.preventDefault();
      
        if (e.type === "touchmove") {
          currentX = (e.touches[0].clientX - initialX)/(workspace.context.zoom*defaultScale);
          currentY = (e.touches[0].clientY - initialY)/(workspace.context.zoom*defaultScale);
        } else {
          currentX = (e.clientX - initialX)/(workspace.context.zoom*defaultScale);
          currentY = (e.clientY - initialY)/(workspace.context.zoom*defaultScale);
        }

        dragItem.x = currentX;
        dragItem.y = currentY;

        onMove()
      }
    }
}

export default dragElement