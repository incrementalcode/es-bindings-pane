"use strict";
Object.defineProperties(exports, {
  createResizeHandle: {get: function() {
      return createResizeHandle;
    }},
  __esModule: {value: true}
});
function createResizeHandle(element) {
  var handle = document.createElement('div');
  var isDragging = {x: 0};
  handle.className = 'es-resize-handle';
  handle.onmousedown = (function(event) {
    isDragging.x = event.x;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  });
  element.appendChild(handle);
  function handleMouseUp(event) {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }
  function handleMouseMove(event) {
    var width = Number((element.style.width || "200px").slice(0, -2));
    width += isDragging.x - event.x;
    element.style.width = (width + "px");
    isDragging.x = event.x;
  }
}
