import * as d3 from '../lib/d3.min.js';
import View from '../View';
import staticMenuItems from './staticMenuItems.json';
import template from './template.svg';
import './style.scss';

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

    this.navigationDepth = [];
  }
  render () {
    super.render();
    let svg = this.d3el.select('svg');
    console.log(svg);
    svg.attrs({
      width: 512,
      height: 512
    });

    // Update the history
    this.historyItem.graph = window.router.historyGraph();

    console.log(this.menuItems);
    // TODO: use contactInfo, window.blog.entries, maybe window.router.historyGraph()
  }
}
export default Menu;
