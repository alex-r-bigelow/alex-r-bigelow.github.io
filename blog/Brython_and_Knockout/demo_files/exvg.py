class Point:
    def __init__(self):
        self.x = ko.observable(100)
        self.y = ko.observable(50)
        
        # This is a little funky:
        self.mouseDown = lambda data, event : self._mouseDown(event)
        
    def _mouseDown(self, event):
        # I want to drag relative to the parent SVG element
        containerRect = event.target.parent.getBoundingClientRect()
        startX = containerRect.left
        startY = containerRect.top
        
        def mouseMove(event):
            self.x(event.clientX-startX)
            self.y(event.clientY-startY)
        
        def mouseUp(event):
            # In theory I should unbind the specific function, but brython
            # chokes when I try to unbind mouseUp from mouseup
            doc.unbind('mouseup')
            doc.unbind('mousemove')
        
        # I override other events until we're done dragging
        event.preventDefault()
        doc.bind('mousemove',mouseMove)
        doc.bind('mouseup',mouseUp)

ko.applyBindings(Point())