/* globals uki */
class MenuView extends uki.View {
  constructor (options = {}) {
    options.resources = options.resources || [];
    options.resources.push(...[
      { type: 'less', url: 'views/MenuView/style.less' },
      { type: 'json', url: 'views/MenuView/default.json', name: 'defaultMenu' }
    ]);
    super(options);

    this._drawCollapsed = options.drawCollapsed || false;
    this._extraSpecs = options.extraSpecs || [];
  }

  get drawCollapsed () {
    return this._drawCollapsed;
  }

  set drawCollapsed (value) {
    this._drawCollapsed = value;
    this.render();
  }

  get extraSpecs () {
    return this._extraSpecs;
  }

  set extraSpecs (value) {
    this._extraSpecs = value;
    this.render();
  }

  async setup () {
    await super.setup(...arguments);

    this.d3el.classed('MenuView', true);
  }

  async draw () {
    await super.draw(...arguments);

    let menuItems = this.d3el.selectAll('.menuItem')
      .data(this.computeMenuSpec());
    menuItems.exit().remove();
    const menuItemsEnter = menuItems.enter().append('div')
      .classed('menuItem', true);
    menuItems = menuItems.merge(menuItemsEnter);

    uki.ui.ButtonView.initForD3Selection(menuItemsEnter);
    uki.ui.ButtonView.iterD3Selection(menuItems, (buttonView, spec) => {
      Object.assign(buttonView, spec);
      buttonView.d3el.classed('subMenu', !!spec.subEntries);
      buttonView.d3el.on('mouseenter.MenuView', () => {
        if (spec.subEntries) {
          uki.ui.showContextMenu({
            menuEntries: spec.subEntries,
            target: buttonView.d3el
          });
        }
      });
    });
  }

  computeMenuSpec () {
    function pageToSpec (page) {
      const spec = {
        label: page.title,
        img: page.icon,
        // primary: window.location.pathname === page.url,
        primary: page.url === '/funding.html',
        onclick: () => {
          window.location = page.url;
        }
      };
      if (page.subMenu) {
        spec.subEntries = page.subMenu.map(pageToSpec);
      }
      return spec;
    }

    const specs = this.getNamedResource('defaultMenu')
      .map(pageToSpec)
      .concat(this.extraSpecs);
    if (this.drawCollapsed) {
      return [{
        img: 'img/hamburger.svg',
        onclick: function () {
          uki.ui.showContextMenu({
            menuEntries: specs,
            target: this.d3el,
            anchor: { x: -1, y: 0 }
          });
        }
      }];
    } else {
      return specs;
    }
  }
}

export default MenuView;
