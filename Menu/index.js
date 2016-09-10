import * as d3 from '../lib/d3.min.js';
import jQuery from 'jquery';
import svgTextWrap from '../lib/svgTextWrap.js';
import View from '../View';
import staticMenuItems from './staticMenuItems.json';
import Images from '../Images';
import template from './template.svg';
import './style.scss';

let ANIMATION_SPEED = 300;

class Menu extends View {
  constructor () {
    super(template, d3.select('#menu').node());
    this.menuItems = staticMenuItems;
    this.menuItems.push({
      title: 'Projects',
      children: window.projects.getOrderedEntries()
    });
    this.menuItems.push({
      title: 'Blog',
      children: window.blog.getOrderedEntries()
    });
    /*
    this.historyItem = {
      title: 'History'
    };
    this.menuItems.push(this.historyItem);
    */

    this.openMenu = null;
    this.mousedMenu = null;
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
  renderHamburger (iconSize, pillRadius) {
    let hamburger = this.d3el.select('#Hamburger')
      .attr('transform', 'translate(' + (-pillRadius) + ',' + pillRadius + ')')
      .attr('class', this.openMenu === null ? null : 'repress');
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
        this.closeMenu();
      }
      this.render();
    });
    return {
      bounds: {
        width: 2 * pillRadius,
        height: 2 * pillRadius
      },
      finishAnimation: Promise.resolve()
    };
  }
  renderTopLevel (iconSize, pillRadius, bubblePadding) {
    let menuItems = this.menuItems;
    let topLevel = this.d3el.select('#TopLevel');

    let bounds = {
      width: 0,
      height: 0
    };

    let resolveLevelAnimation;
    let levelAnimation = new Promise((resolve, reject) => {
      resolveLevelAnimation = resolve;
    });

    if (this.openMenu === null) {
      // hide / remove the top level
      menuItems = [];
      if (topLevel.size() > 0) {
        topLevel.transition()
          .duration(ANIMATION_SPEED)
          .attr('transform', 'translate(' +
            (-pillRadius) + ',' + pillRadius + ')')
          .transition()
          .on('end', resolveLevelAnimation)
          .remove();
      } else {
        // Nothing to animate...
        resolveLevelAnimation();
      }
    } else {
      bounds.width = bubblePadding + (2 * pillRadius);
      bounds.height = (menuItems.length - 1) * bubblePadding + (2 * pillRadius);
      if (topLevel.size() === 0) {
        topLevel = this.d3el.select('svg').insert('g', ':first-child')
          .attrs({
            id: 'TopLevel',
            transform: 'translate(' +
              (-pillRadius) + ',' + pillRadius + ')'
          });
      }
      topLevel.transition()
        .duration(ANIMATION_SPEED)
        .attr('transform', 'translate(' +
          (-bubblePadding - pillRadius) + ',0)')
        .on('end', resolveLevelAnimation);
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
        (i * bubblePadding + pillRadius) + ')');
    pillsEnter.append('path')
      .attr('d', smallPillPath)
      .transition(growPills)
      .attr('d', standardPillPath);
    pillsEnter.append('text')
      .attrs({
        'opacity': 0,
        'text-anchor': 'end',
        'x': -pillRadius,
        'y': 0.35 * window.emSize
      }).text(d => d.title);
    pillsEnter.append('image')
      .attr('xlink:href', d => Images[d.title]);

    // Get the exit selection
    let pillsExit = pills.exit();

    pills = pillsEnter.merge(pills);

    // Attach / update event listeners
    pills.on('mouseover', d => {
      this.mousedMenu = d.title;
      this.render();
    }).on('mouseout', d => {
      this.mousedMenu = null;
      this.render();
    }).on('click', d => {
      if (this.openMenu === d.title) {
        this.openMenu = 'Hamburger';
      } else {
        this.openMenu = d.title;
      }
      this.render();
    });

    // Handle the icons
    pills.select('image')
      .attrs({
        x: -iconSize / 2,
        y: -iconSize / 2,
        width: iconSize,
        height: iconSize
      });

    // Animate the pill + text rollover effect in separate stages,
    // and resolve a promise when they're both finished
    let resolvePillAnimation;
    let pillAnimation = new Promise((resolve, reject) => {
      resolvePillAnimation = resolve;
    });

    let pillRolloverStage1 = d3.transition()
      .duration(ANIMATION_SPEED / 2);
    let pillRolloverStage2 = pillRolloverStage1
      .transition()
      .duration(ANIMATION_SPEED / 2);

    pillRolloverStage2.on('end', resolvePillAnimation);

    // Wrap the text labels (in case the window was resized
    // and we have less space available), get their width,
    // and then animate the elements appropriately
    let self = this;
    let longestWidth = bounds.width;
    pills.each(function (d) {
      // this refers to the DOM element
      let $el = jQuery(this);
      let d3el = d3.select(this);
      let textEl = d3el.select('text');
      let pathEl = d3el.select('path');

      textEl.text(d.title);

      if (d.title !== self.openMenu && d.title !== self.mousedMenu) {
        // If something is selected, but this isn't it, we want to
        // subdue the appearance a little
        if (self.openMenu !== 'Hamburger') {
          $el.addClass('repress');
        } else {
          $el.removeClass('repress');
        }

        // The menu isn't open or hovered, so hide the text
        // and then the pill
        textEl.transition(pillRolloverStage1)
          .attr('opacity', 0);
        pathEl.transition(pillRolloverStage2)
          .attr('d', standardPillPath);
      } else {
        // This item is now selected, so remove the repress class
        // if it was there
        $el.removeClass('repress');

        // The menu item is either open or hovered, so show the text
        let availableTextWidth = window.innerWidth -
          (bubblePadding + 3 * pillRadius);
        let lineLengths = svgTextWrap(textEl.node(), availableTextWidth);

        // How much space does the text add?
        let pillLength = Math.max(...lineLengths) + 3 * pillRadius;
        longestWidth = Math.max(longestWidth, pillLength + bubblePadding);

        // Show the pill first, and then the text
        pathEl.transition(pillRolloverStage1)
          .attr('d', self.drawPill(pillLength, 2 * pillRadius));
        textEl.transition(pillRolloverStage2)
          .attr('opacity', 1);
      }
    });

    // Shrink and move old pills back to 0, 0
    pillsExit.select('text')
      .transition(pillRolloverStage1)
      .attr('opacity', 0);
    pillsExit.select('image')
      .transition(pillRolloverStage1)
      .attr('opacity', 0);
    pillsExit.transition(pillRolloverStage2)
      .attr('transform', 'translate(0, 0)')
      .select('path')
        .attr('d', smallPillPath);

    bounds.width = longestWidth;
    return {
      bounds,
      finishAnimation: Promise.all([levelAnimation, pillAnimation])
    };
  }
  renderSecondLevel (spaceFromRight, spaceFromTop) {
    // TODO: for now I do a dumb html listing of everything...
    // I should do cooler things in the future

    let secondLevel = this.d3el.select('#SecondLevel');
    if (secondLevel.size() === 0) {
      secondLevel = this.d3el.append('div')
        .attr('id', 'SecondLevel');
    }

    let menuItems;
    if (this.openMenu === null || this.openMenu === 'Hamburger') {
      // hide / remove the second level
      menuItems = [];
    } else {
      secondLevel.attr('class', this.openMenu.toLowerCase());
      menuItems = this.menuItems.find(d => d.title === this.openMenu).children;
    }

    let links = secondLevel.selectAll('.link')
      .data(menuItems, d => d.title);
    let linksExit = links.exit();
    let linksEnter = links.enter().append('div')
      .attr('class', 'link');
    linksEnter.append('div')
      .attr('class', 'caption');
    linksEnter.append('img');
    links = linksEnter.merge(links)
      .on('click', d => {
        if (d.url) {
          if (d.title === 'Email') {
            window.location.href = d.url;
          } else {
            window.open(d.url, '_blank');
          }
        } else if (d.hash) {
          window.location.hash = d.hash;
          this.closeMenu();
        }
      });
    links.select('.caption')
      .html(d => {
        let result = d.title;
        if (d.date) {
          result += '<br/><span class="date">' +
            d.date.toLocaleDateString() + '</span>';
        }
        return result;
      });
    links.select('img')
      .attr('src', d => Images[d.icon] || null)
      .style('display', d => Images[d.icon] ? null : 'none');

    // Animate stuff
    let resolveLinkAnimation;
    let linkAnimation = new Promise((resolve, reject) => {
      resolveLinkAnimation = resolve;
    });
    let t = d3.transition()
      .duration(ANIMATION_SPEED)
      .on('end', resolveLinkAnimation);
    linksEnter
      .style('right', window.innerWidth + 'px')
      .style('top', (d, i) => spaceFromTop + (i * 3) * window.emSize + 'px')
      .style('opacity', 0);
    linksExit.transition(t)
      .style('right', window.innerWidth + 'px')
      .style('opacity', 0)
      .transition()
      .remove();
    links.transition(t)
      .style('right', spaceFromRight + 'px')
      .style('top', (d, i) => spaceFromTop + (i * 3) * window.emSize + 'px')
      .style('opacity', 1);

    return {
      bounds: {
        width: 0,
        height: 0
      },
      finishAnimation: linkAnimation
    };
  }
  closeMenu () {
    this.mousedMenu = null;
    this.openMenu = null;
    this.render();
  }
  render () {
    super.render();

    let iconSize = 2 * window.emSize;
    let pillRadius = 2 * window.emSize;
    let bubblePadding = 4 * window.emSize;

    // Update the history
    // this.historyItem.graph = window.router.historyGraph();

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
          this.closeMenu();
        }).style('display', null)
        .transition()
        .duration(ANIMATION_SPEED)
        .style('opacity', 1);
    }

    // Okay, update the Hamburger bubble
    let hamburgerRender = this.renderHamburger(iconSize, pillRadius);
    let bounds = hamburgerRender.bounds;

    // Draw the top menu items
    let topRender = this.renderTopLevel(iconSize, pillRadius, bubblePadding);
    bounds.width = Math.max(topRender.bounds.width, bounds.width);
    bounds.height = Math.max(topRender.bounds.height, bounds.height);

    // Draw the second level menu items
    let secondLevelRender = this.renderSecondLevel(bounds.width + window.emSize,
      window.scrollY + 3 * window.emSize);

    // Adjust the SVG element to the appropriate width / height
    // with 0,0 in the top-right corner... but if we're shrinking
    // it, we want to wait until any animations finish first
    let svg = this.d3el.select('svg');
    let adjustSvgBounds = () => {
      svg.attrs(bounds)
        .attr('viewBox', -bounds.width + ' 0 ' + bounds.width + ' ' + bounds.height);
    };
    if ((svg.attr('width') || 0) > bounds.width ||
        (svg.attr('height') || 0) > bounds.height) {
      Promise.all([hamburgerRender.finishAnimation,
                   topRender.finishAnimation,
                   secondLevelRender.finishAnimation]).then(adjustSvgBounds);
    } else {
      adjustSvgBounds();
    }
  }
}
export default Menu;
