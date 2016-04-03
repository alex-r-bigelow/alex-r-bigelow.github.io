---
layout: post
title:  "Traced Headers"
date:   2016-1-2 15:00:00
categories: web design
---
In case you're curious about how I'm doing the header tracing animation at the top of the page, it's pretty basic—I use [opentype.js](https://nodebox.github.io/opentype.js/) to get the SVG path string, slice the string up into chunks, and animate putting it back together.

If you're wanting to copy this effect, there's probably a lot of room for artistic adjustment. I only bother splitting by the string by `'C'` commands—I'm guessing opentype.js always uses cubic-interpolated splines in their SVG conversion, but I've really only experimented with Sorts Mill Goudy. You could split differently, and, of course, stitch the string together differently for different effects.

There are a few odd things to note with this approach—I had a little trouble getting the SVG and HTML versions of the text to line up perfectly (I originally tried overlaying an SVG outline on top of the HTML text). I'm guessing it has something to do with `text-rendering`, or maybe there are subtle differences between the [fontsquirrel](http://www.fontsquirrel.com/fonts/Sorts-Mill-Goudy) OTF files and the [Google Font](https://www.google.com/fonts#QuickUsePlace:quickUse) versions.

As I'm adding an SVG element to the document anyway, I instead decided to replace all the `<h1>` elements with two SVG path elements. This also has the nice effect that I can prepend the SVG to the page so I don't have to worry about whether the SVG element will overlap interaction targets, etc.

It takes a second for the browser to load the font file; when the user initially loads the page, they'll see the original text briefly flash before the animation starts. To avoid this, I have a `visibility:hidden` setting for `h1` in my site's CSS.

Anyway, here's the code I came up with:

{% highlight javascript %}{% raw %}

function sketchHeaders() {
    var headers = d3.selectAll('h1');
    var fill = headers.style('color');
    var temp;
    
    opentype.load('/fonts/Sorts-Mill-Goudy/GoudyStM-Italic.otf', function (err, font) {
        if (!err) {
            headers.each(function(d, i) {
                d3.select(this).style('display','inline-block');
                
                // The SVG element should be as wide as the text,
                // and as tall as a single line of text
                var bounds = this.getBoundingClientRect(),
                    lineHeight = parseInt(d3.select(this).style('line-height'));
                
                // In the event that the header text has wrapped
                // (should only happen on very small screens),
                // let's demote the header to H2, and don't
                // bother with animating
                if (bounds.height > lineHeight) {
                    temp = document.createElement('h2');
                    temp.textContent = this.textContent;
                    this.parentNode.replaceChild(temp, this);
                    return;
                }
                
                // replace the text with an SVG element
                // (with the same width/height)
                var newNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                this.parentNode.insertBefore(newNode, this);
                var svg = d3.select(newNode)
                    // these values are hand-tuned to keep text flow
                    // consistent as if the h1 elements were still there;
                    // I'm still not sure how to figure this out automatically
                    .style({
                        'padding-top' : 2,
                        'margin-bottom' : -11
                    })
                    .attr({
                        width: bounds.width,
                        height: bounds.height,
                        class: 'sketchedHeader'
                    });
                
                d3.select(this).style('display', 'none');
                
                // Use opentype to get the SVG path string
                var pathString = font.getPath(this.textContent, 0, 78, 96).toPathData();
                
                // Start with a transparent fill and an empty path
                var inside = svg.append('path')
                    .attr('d', pathString)
                    .attr('fill', fill)
                    .attr('opacity', 0.0);
                var outline = svg.append('path')
                    .attr('d', "")
                    .attr('stroke', 'black')
                    .attr('fill', 'none');
                
                // Split up the path into cubic sections;
                // each will get added one at a time
                pathString = pathString.split('C');
                
                // I do the animation old-school - while I could
                // use d3's transitions, in this scenario, the
                // setTimeout() approach seemed cleaner
                function drawOutline(index) {
                    if (index >= pathString.length) {
                        inside.attr('opacity', 1.0);
                        return;
                    }
                    
                    outline.attr('d', pathString.slice(0, index).join('C'));
                    inside.attr('opacity', index/pathString.length);
                    
                    window.setTimeout(function() {
                        drawOutline(index + 1);
                    }, 10);
                }
                drawOutline(0);
            });
        }
    });
}

{% endraw %}{% endhighlight %}