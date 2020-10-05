/* globals d3, uki */

import MenuView from '../../views/MenuView/MenuView.js';

class Controller extends uki.ui.InformativeView {
  constructor (options = {}) {
    options.d3el = d3.select('body');

    super(options);

    this.views = [];

    window.onresize = () => { this.render(); };
  }

  async setup () {
    await super.setup(...arguments);

    this.menuView = new MenuView({
      d3el: this.d3el.append('nav'),
      drawCollapsed: this.collapseMenu === undefined ? true : this.collapseMenu,
      extraSpecs: this.extraMenuSpecs || []
    });
    this.views.push(this.menuView);
  }

  async draw () {
    await super.draw(...arguments);

    for (const view of this.views) {
      view.render();
    }
  }
}

export default Controller;
