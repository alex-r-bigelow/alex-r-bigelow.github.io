/*globals console, d3, jQuery, opentype*/
// jshint browser: true

var spacingUnit = 30;

function getScrollbarWidth() {
    var outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.width = "100px";
    outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

    document.body.appendChild(outer);
    
    var widthNoScroll = outer.offsetWidth;
    // force scrollbars
    outer.style.overflow = "scroll";

    // add innerdiv
    var inner = document.createElement("div");
    inner.style.width = "100%";
    outer.appendChild(inner);        

    var widthWithScroll = inner.offsetWidth;

    // remove divs
    outer.parentNode.removeChild(outer);

    return widthNoScroll - widthWithScroll;
}

var temp;
function distributeAcrossColumns(selection) {
    temp = selection;
    
    var maxWidth = 0,
        maxHeight = 0,
        availableWidth;
    
    // Figure out how big each element is (remove inline styling first)
    selection.attr('style',null).each(function (d, i) {
        var bounds = this.getBoundingClientRect();
        if (i === 0) {
            availableWidth = this.parentNode.getBoundingClientRect().width;
        }
        maxWidth = Math.max(maxWidth, bounds.width);
        maxHeight = Math.max(maxHeight, bounds.height);
    });
    
    // We want stuff to align to the grid, so round sizes
    // up to the neares cell boundary
    maxWidth = Math.ceil(maxWidth/spacingUnit)*spacingUnit;
    maxHeight = Math.ceil(maxHeight/spacingUnit)*spacingUnit;
    
    // How many columns can we fit?
    var numColumns = Math.floor(availableWidth / maxWidth);
    
    // If everything can fit on a row, we want to spread
    // things out as much as we can
    numColumns = Math.min(numColumns, selection.size());
    
    // Okay, how much spacing is there between columns?
    var spacing = 0;
    if (numColumns > 1) {
        spacing = (availableWidth - (numColumns * maxWidth)) / (numColumns - 1);
        // Also want to round the spacing down, so things
        // stay aligned to the grid
        spacing = Math.floor(spacing/spacingUnit)*spacingUnit;
    } else {
        numColumns = 1;
    }
        
    selection.style('position', 'absolute')
        .style('left', function (d, i) {
            return (Math.floor(i % numColumns) * (maxWidth + spacing)) + 'px';
        })
        .style('top', function (d, i) {
            return (Math.floor(i / numColumns) * maxHeight) + 'px';
        });
}

function setupMenu() {
    showMenus();
    
    var rightGridAlign = (jQuery('body')[0].clientWidth % spacingUnit) - 1 + spacingUnit,
        downloadOffset = 6,
        topGridAlign = 20,   // the background is offset slightly
        menuBounds,
        submenuOffset,
        temp;
    
    // Align the menus to the grid
    temp = d3.selectAll('.menu')
        .style('top', topGridAlign + 'px')
        .style('right', function (d, i) {
            if (this.getAttribute('id') === 'menu') {
                return rightGridAlign + 'px';
            } else {
                return (downloadOffset * spacingUnit + rightGridAlign) + 'px';
            }
        });
    
    // Round up each menu's interior size based on the grid
    d3.selectAll('.menuItems')
        .style('width', function () {
            menuBounds = this.getBoundingClientRect();
            var temp = menuBounds.width;
            temp = spacingUnit * Math.ceil(temp / spacingUnit);
            temp = temp - 1;  // -1 for the border
            return temp + 'px';
        });
    
    // Get the new main menu bounding box
    d3.select('#menu').each(function() {
        menuBounds = this.getBoundingClientRect();
    });
    
    // Okay, now all the submenus need to be aligned to the
    // left border of the menu
    submenuOffset = rightGridAlign + menuBounds.width - 1;
    // -1 for the border
    
    d3.selectAll('.subMenu')
    // Round up the submenus' sizes to align to the grid
        .style('width', function() {
            var temp = this.getBoundingClientRect().width;
            temp = spacingUnit * Math.ceil(temp / spacingUnit) - 1;
            return temp + 'px';
        })
    // Align to the menu border
        .style('right', submenuOffset + 'px')
    // Now align the submenus to their respective vertical
    // position
        .style('top', function(d, i) {
            // Need to find where the menu item is...
            // We do some metadata-embedded-in-id voodoo
            // to do the lookup:
            var itemTitle = this.getAttribute('id');
            itemTitle = itemTitle.substring(0, itemTitle.length - 7);
            
            var menuItemBounds = document.getElementById(itemTitle + 'menuItem').getBoundingClientRect();
            return (menuItemBounds.top - spacingUnit/2) + 'px';
        });
    
    closeMenus();
}

function adjustSketchedHeaders() {
    // In the event that the header text overlaps one
    // (or both) menus, insert some whitespace to push
    // the whole document down
    var menuLeft = Infinity;
    d3.selectAll('.menu').each(function (d, i) {
        menuLeft = Math.min(menuLeft, this.getBoundingClientRect().left);
    });
    
    var firstHeader = d3.select('.sketchedHeader');
    var bounds;
    if (firstHeader.size() === 0) {
        firstHeader = d3.select('h2');
    }
    firstHeader.each(function () {
        bounds = this.getBoundingClientRect();
    });
    
    var svgHeaders = d3.selectAll('.sketchedHeader');
    if (bounds.left + bounds.width >= menuLeft) {
        d3.selectAll('#pageContent')
            .style('padding-top', (4 * spacingUnit) + 'px');
    } else {
        d3.selectAll('#pageContent')
            .style('padding-top', null);
    }
}

function updateWindow() {
    // Lay out the username bits in columns
    distributeAcrossColumns(d3.selectAll('span.username'));
    
    setupMenu();
    
    adjustSketchedHeaders();
}

function closeMenus() {
    d3.selectAll('.menuItems').style('display', 'none');
    d3.selectAll('.subMenu').style('display', 'none');
}
function showMenus() {
    d3.selectAll('.menuItems').style('display', null);
    d3.selectAll('.subMenu').style('display', null);
}

function bindMenuEvents() {
    d3.select('body')
        .on('click', closeMenus);
    
    function showMainMenu() {
        d3.select('#menuItems').style('display', null);
        d3.selectAll('#downloadMenuItems').style('display', 'none');
        d3.event.stopPropagation();
    }
    d3.select('#menu')
        .on('click', showMainMenu)
        .on('mouseover', showMainMenu);
    
    function showDownloadMenu() {
        d3.select('#menuItems').style('display', 'none');
        d3.selectAll('.subMenu').style('display', 'none');
        d3.selectAll('#downloadMenuItems').style('display', null);
        d3.event.stopPropagation();
    }
    d3.select('#downloadMenu')
        .on('click', showDownloadMenu)
        .on('mouseover', showDownloadMenu);
    
    function showSubMenu() {
        var subMenuTitle = this.getAttribute('id');
        if (subMenuTitle === null) {
            return;
        }
        subMenuTitle = subMenuTitle.substring(0, subMenuTitle.length - 8);
        d3.selectAll('.subMenu')
            .style('display', function () {
                if (this.getAttribute('id') === subMenuTitle + 'SubMenu') {
                    return null;
                } else {
                    return 'none';
                }
            });
        d3.event.stopPropagation();
    }
    d3.selectAll('.menuItem')
        .on('click', showSubMenu)
        .on('mouseover', showSubMenu);
}

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
            
            adjustSketchedHeaders();
        }
    });
}

function performFixes() {
    sketchHeaders();
    
    // Any code blocks will have scroll bars on the bottom;
    // we don't want this to mess up our vertical rhythm
    var scrollSize = getScrollbarWidth() + 28;
    d3.selectAll('pre').style('margin-bottom', scrollSize + 'px');
    
    bindMenuEvents();
    
    distributeAcrossColumns(d3.selectAll('span.username'));
    
    setupMenu();
}

window.onload = performFixes;
window.onresize = updateWindow;