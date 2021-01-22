I spent the last few days trying to learn AngularJS, and was resigned to the thought that I was going to have to suck it up and write my current project in straight javascript. I was getting frustrated with all the baggage that comes with AngularJS and its awful documentation (I still don't have a proper understanding of directives!) when I stumbled on KnockoutJS. It focuses on doing one thing very well, and doesn't force a particular flavor of MVC on you. Its documentation is awesome and has an approach to tutorials that, in my humble opinion, are more natural than the ones at Khan Academy.

And there's an interesting pattern in how it wraps observables.

To get around problems with IE, you access and modify KnockoutJS variables via _functions_. This has a handy side effect in that everything it touches is sanitized. In other words, you can have observable brython objects that are modified and returned directly without any javascript baggage! You don't even have to wrap the ko library in a JSObject... just use it directly in your python script. The only thing you have to remember is which objects are observable and which ones aren't - but you'd have to do that in javascript, too.

There is an oddity, however; KnockoutJS doesn't call brython class functions for events properly (of course, it's expecting javascript). You can get around it, though, by wrapping the function with lambda.

Here's an example:

**index.html:**

```html
<!doctype html>  
 <html>  

 <head>  
   <script type="application/javascript" , src="brython.js"></script>  
   <script type="application/javascript", src="knockout-3.0.0.js"></script>  
   <script type="text/python", src="exvg.py"></script>  
 </head>  

 <body onload="brython()">  
   <table>  
     <thead>  
       <tr>  
         <td>x</td>  
         <td>y</td>  
       </tr>  
     </thead>  
     <tbody>  
     <tr>  
       <td><input data-bind="value: x" /></td>  
       <td><input data-bind="value: y" /></td>  
       </tr>  
     </tbody>  
   </table>  
   <svg style="width:500px;height:200px;border:1px solid">  
     <circle r="10" data-bind="attr: {cx: x, cy: y}, event: { mousedown: mouseDown }"/>  
   </svg>  
 </body>  

 </html>  
```


**exvg.py:**

```python
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
```


**The result:**

<iframe height="300px" src="/blog/Brython_and_Knockout/demo.html"></iframe>
