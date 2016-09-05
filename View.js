import jQuery from 'jquery';
import * as d3 from 'd3';

class View {
  constructor (template = '', element = null) {
    if (element === null) {
      this.d3el = d3.select('#content').append('article');
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
      this.$el.html(this.template);
      this.firstRender = false;
    }
  }
}
export default View;
