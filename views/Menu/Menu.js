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
  addButton (text, icon, action, position = ':first-child') {
    const button = this.d3el.insert('a', position);
    button.append('img').attr('src', icon);
    button.append('h1').classed('label', true).text(text);
    button.on('click', action);
  }
}

export default Menu;
