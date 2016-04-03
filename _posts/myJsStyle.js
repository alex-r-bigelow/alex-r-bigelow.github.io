/*globals d3, console*/
// This line keeps JSHint/JSLint happy about libraries
// that I've loaded in the page or globals in other files.
// I use this similar to import statements in other languages


// This is how I expose stuff globally if/when I need to do it on purpose
// (this chunk is almost like a C header file)
var SomeClass;


// I protect the namespace with this kind of wrapper (I don't usually
// bother with this in small projects):
(function() {
    // A (globally visible) class definition
    SomeClass = function (data, lookup) {
        // I've developed a habit of always starting functions
        // with these two statements:
        "use strict";
        var self = this;
        
        // "use strict"; helps me avoid various errors that browsers would
        // normally fail silently on. If you're using JSLint (stricter
        // than JSHint), it requires using strict mode
        
        // var self = this; helps me avoid complications
        // especially when working with d3 (see an example in draw())
        
        
        self.data = data;
        self.lookup = lookup;
    };
    
    // This is usually how I prefer to assign member functions
    // to classes:
    SomeClass.prototype.logStuff = function () {
        "use strict";
        var self = this;
        
        console.log(this.data, this.lookup);
    };
    
    
    
    // A (locally visible) class definition
    function SomeChildClass () {
        "use strict";
        var self = this;
        
        // Apparently this is an old-school way of calling super;
        // there are probably newer, better ways, but this is what I'm used to
        
        SomeClass.call(self, ['foo', 'bar'], {'foo' : 10, 'bar' : 20});
    }
    // This is how I set up inheritance:
    SomeChildClass.prototype = Object.create(SomeClass);
    SomeChildClass.prototype.constructor = SomeChildClass;
    
    SomeChildClass.prototype.draw = function () {
        "use strict";
        var self = this;
        
        var bars = d3.select('svg').selectAll('rect').data(self.data);
        bars.enter.append('rect');
        bars.attr('height', function (d) {
            // Here's an example of why I always start
            // class member functions with defining a "self"
            // variable. In this scope, "this" refers to
            // the DOM element instead of the SomeClass
            // instance; without the "self" variable,
            // there would be no way to access class
            // variables
            return self.lookup[d];
        });
    };
})();