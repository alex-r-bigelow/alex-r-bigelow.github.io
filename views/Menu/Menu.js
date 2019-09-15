import { View } from '../../node_modules/uki/dist/uki.esm.js';

class Menu extends View {
  constructor (d3el) {
    super(d3el, [
      { type: 'less', url: 'views/Menu/style.less' },
      { type: 'text', url: 'views/Menu/template.html' }
    ]);
  }
  setup () {
    this.d3el.html(this.resources[1]);
  }
}

export default Menu;
