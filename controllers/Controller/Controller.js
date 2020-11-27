/* globals d3, uki, galite */

import MenuView from '../../views/MenuView/MenuView.js';

class Controller extends uki.ui.InformativeView {
  constructor (options = {}) {
    options.d3el = d3.select('body');

    super(options);

    this.views = [];

    window.addEventListener('resize', () => { this.render(); });

    if (window.galite && window.location.hostname !== 'localhost') {
      galite('create', 'UA-44570094-2', 'auto');
      galite('send', 'pageview');
      window.addEventListener('unload', () => {
        galite('send', 'timing', 'JS Dependencies', 'unload');
      });
    }
  }

  async setup () {
    await super.setup(...arguments);

    this.menuView = new MenuView({
      d3el: this.d3el.append('nav'),
      drawCollapsed: this.collapseMenu === undefined ? window.outerWidth < 1536 : this.collapseMenu,
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
