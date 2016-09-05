import * as d3 from 'd3';
import View from '../View';
import contactInfo from './contactInfo.json';
import template from './template.html';

class Menu extends View {
  constructor () {
    super(template, d3.select('nav').node());
  }
  render () {
    super.render();
     // let svg = this.d3el.select('svg');

    console.log(contactInfo, window.blog.entries, window.router.historyGraph());
    // TODO: use contactInfo, window.blog.entries, maybe window.router.historyGraph()
  }
}
export default Menu;
