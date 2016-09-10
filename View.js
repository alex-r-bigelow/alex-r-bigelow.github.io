import jQuery from 'jquery';
import * as d3 from './lib/d3.min.js';

class View {
  constructor (template = '', element = null, containerClass = null) {
    if (element === null) {
      this.d3el = d3.select('#content').append('article')
        .attr('class', containerClass);
      this.element = this.d3el.node();
    } else {
      this.element = element;
      this.d3el = d3.select(this.element);
    }
    this.$el = jQuery(this.element);
    this.template = template;
    this.firstRender = true;
  }
  render () {
    if (this.firstRender) {
      this.d3el.html(this.template);
      this.firstRender = false;
    }
  }
  updateContent (content) {
    this.firstRender = true;
    this.template = content;
    this.render();
  }
}
export default View;
