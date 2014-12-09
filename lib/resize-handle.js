//Create a handle that resizes a given element on drag.
export function createResizeHandle(element) {
  var handle = document.createElement('div');
  var isDragging = { x: 0 };

  handle.className = 'es-resize-handle';
  handle.onmousedown = (event) => {
    isDragging.x = event.x;

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  element.appendChild(handle);

  function handleMouseUp(event) {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }

  function handleMouseMove(event) {
    let width =Number((element.style.width || "200px").slice(0, -2));
    width += isDragging.x - event.x;
    element.style.width = `${width}px`;
    
    isDragging.x = event.x;
  }
}
