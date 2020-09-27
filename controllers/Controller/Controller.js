/* globals d3, uki */

import MenuView from '../../views/MenuView/MenuView.js';

class Controller extends uki.ui.InformativeView {
  constructor (options = {}) {
    options.d3el = d3.select('body');

    super(options);

    window.onresize = () => { this.render(); };
  }

  async setup () {
    await super.setup(...arguments);

    this.menuView = new MenuView({
      d3el: this.d3el.append('nav'),
      drawCollapsed: this.collapseMenu === undefined ? true : this.collapseMenu,
      extraSpecs: this.extraMenuSpecs || []
    });
  }
}

export default Controller;
