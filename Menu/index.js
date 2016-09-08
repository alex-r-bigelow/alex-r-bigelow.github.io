import * as d3 from '../lib/d3.min.js';
import svgTextWrap from '../lib/svgTextWrap.js';
import View from '../View';
import staticMenuItems from './staticMenuItems.json';
import template from './template.svg';
import './style.scss';

import Projects from '../images/menu/Projects.svg';
import Blog from '../images/menu/Blog.svg';
import History from '../images/menu/History.svg';
import Profile from '../images/menu/Profile.svg';

let ICONS = {
  Profile,
  Projects,
  Blog,
  History
};

let ANIMATION_SPEED = 300;

class Menu extends View {
  constructor () {
    super(template, d3.select('nav').node());
    this.menuItems = staticMenuItems;
    this.menuItems.push({
      title: 'Blog',
      children: window.blog.getOrderedEntries()
    });
    this.historyItem = {
      title: 'History'
    };
    this.menuItems.push(this.historyItem);

    this.openMenu = null;
    this.mousedMenu = null;
  }
  attachBubbleListeners (selection) {
    selection.on('mouseover', function (d) {
      // this refers to the DOM element
      console.log(d);
    });
  }
  drawPill (width, height) {
    // Draw a pill shape, with the right arc center at 0, 0
    let r = height / 2;
    let l = Math.max(0, width - (2 * r));
    // Top right
    let path = 'M0,' + (-r);
    // Arc right
    path += 'A' + r + ',' + r + ',0,0,1,0,' + r;
    // Line bottom
    path += 'L' + (-l) + ',' + r;
    // Arc left
    path += 'A' + r + ',' + r + ',0,0,1,' + (-l) + ',' + (-r);
    // Line top
    path += 'Z';
    return path;
  }
  drawHamburger (iconSize, pillRadius) {
    let hamburger = this.d3el.select('#Hamburger')
      .attr('transform', 'translate(' + (-pillRadius) + ',' + pillRadius + ')');
    hamburger.select('path')
      .attr('d', this.drawPill(2 * pillRadius, 2 * pillRadius));
    hamburger.select('image')
      .attrs({
        // 'xlink:href': '../images/menu/Hamburger.svg',
        x: -iconSize / 2,
        y: -iconSize / 2,
        width: iconSize,
        height: iconSize
      });
    hamburger.on('click', () => {
      if (this.openMenu === null) {
        this.openMenu = 'Hamburger';
      } else {
        this.openMenu = null;
      }
      this.render();
    });
    return {
      width: 2 * pillRadius,
      height: 2 * pillRadius
    };
  }
  drawTopLevel (iconSize, pillRadius, bubblePadding, availableWidth) {
    let menuItems = this.menuItems;
    let topLevel = this.d3el.select('#TopLevel');

    let bounds = {
      width: 0,
      height: 0
    };

    if (this.openMenu === null) {
      // hide / remove the top level
      menuItems = [];
      if (topLevel.size() > 0) {
        console.log(topLevel.attr('transform'));
        topLevel.transition()
          .duration(ANIMATION_SPEED)
          .attr('transform', 'translate(' +
            (-pillRadius) + ',' + pillRadius + ')')
          .transition()
          .remove();
      }
    } else {
      bounds.width = bubblePadding + pillRadius;
      bounds.height = menuItems.length * bubblePadding + pillRadius;
      if (topLevel.size() === 0) {
        topLevel = this.d3el.select('svg').insert('g', ':first-child')
          .attrs({
            id: 'TopLevel',
            transform: 'translate(' +
              (-pillRadius) + ',' + pillRadius + ')'
          });
      }
      console.log(topLevel.attr('transform'));
      topLevel.transition()
        .duration(ANIMATION_SPEED)
        .attr('transform', 'translate(' +
          (-bubblePadding) + ',0)');
    }

    let pills = topLevel.selectAll('g.toplevel')
      .data(menuItems, d => d.title);

    // Start new pills off at 0, 0 with a small bubble
    // and move them into place with a standard-size bubble
    let smallPillPath = this.drawPill(pillRadius / 2, pillRadius / 2);
    let standardPillPath = this.drawPill(2 * pillRadius, 2 * pillRadius);
    let growPills = d3.transition()
      .duration(ANIMATION_SPEED);
    let pillsEnter = pills.enter().append('g')
      .attr('class', d => 'toplevel bubble ' + d.title.toLowerCase())
      .attr('transform', 'translate(0, 0)');
    pillsEnter.transition(growPills)
      .attr('transform', (d, i) => 'translate(0,' +
        ((i + 1) * bubblePadding) + ')');
    pillsEnter.append('path')
      .attr('d', smallPillPath)
      .transition(growPills)
      .attr('d', standardPillPath);
    pillsEnter.append('text')
      .text(d => d.title);
    pillsEnter.append('image')
      .attr('xlink:href', d => ICONS[d.title]);

    // Shrink and move old pills back to 0, 0
    let pillsExit = pills.exit();
    pillsExit.transition(growPills)
      .attr('transform', 'translate(0, 0)')
      .select('path')
        .transition(growPills)
        .attr('d', smallPillPath);

    pills = pillsEnter.merge(pills);

    // Handle the icons
    pills.select('image')
      .attrs({
        x: -iconSize / 2,
        y: -iconSize / 2,
        width: iconSize,
        height: iconSize
      });

    // Handle the text labels (and get their width)
    let self = this;
    let longestText = 0;
    pills.select('text')
      .each(function (d) {
        // this refers to the DOM element
        this.textContent = d.title;
        let d3el = d3.select(this);
        if (d.title !== self.openMenu && d.title !== self.mousedMenu) {
          // The menu isn't open or hovered, so hide the text
          d3el.style('display', 'none');
          d.textLength = 0;
        } else {
          // The menu item is either open or hovered, so show the text
          d3el.style('display', null);
          let availableTextWidth = availableWidth - 2 * pillRadius;
          let lineLengths = svgTextWrap(this, availableTextWidth);
          // For convenience / easy access, store the text block
          // size in the data item itself
          d.textLength = Math.max(...lineLengths);
        }
        longestText = Math.max(longestText, d.textLength);
      });

    bounds.width += longestText;
    return bounds;
  }
  render () {
    super.render();

    let iconSize = 2 * window.emSize;
    let pillRadius = 2 * window.emSize;
    let bubblePadding = 4 * window.emSize;

    // Update the history
    this.historyItem.graph = window.router.historyGraph();

    // Should we show the overlay?
    if (this.openMenu === null) {
      d3.select('#overlay')
        .transition()
        .duration(ANIMATION_SPEED)
        .style('opacity', 0)
        .transition()
        .style('display', 'none');
    } else {
      d3.select('#overlay')
        .on('click', () => {
          this.openMenu = null;
          this.render();
        }).style('display', null)
        .transition()
        .duration(ANIMATION_SPEED)
        .style('opacity', 1);
    }

    // Okay, update the Hamburger bubble
    let bounds = this.drawHamburger(iconSize, pillRadius);

    // Draw the top menu items
    let topBounds = this.drawTopLevel(
      iconSize, pillRadius, bubblePadding,
      window.innerWidth - bounds.width + bubblePadding);
    bounds.width = Math.max(topBounds.width, bounds.width);
    bounds.height = Math.max(topBounds.height, bounds.height);

    // Draw the second level menu items

    // Adjust the SVG element to the appropriate width / height
    // with 0,0 in the top-right corner... but if we're shrinking
    // it, we want to wait until any animations finish first
    let svg = this.d3el.select('svg');
    let delay = 0;
    if ((svg.attr('width') || 0) > bounds.width ||
        (svg.attr('height') || 0) > bounds.height) {
      delay = ANIMATION_SPEED;
    }
    this.d3el.select('svg')
      .transition()
      .delay(delay)
      .attrs(bounds)
      .attr('viewBox', -bounds.width + ' 0 ' + bounds.width + ' ' + bounds.height);

    console.log(this.menuItems);
    // TODO: use contactInfo, window.blog.entries, maybe window.router.historyGraph()
  }
}
export default Menu;
