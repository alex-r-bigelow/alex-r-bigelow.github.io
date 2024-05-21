/* globals uki */
class MenuView extends uki.View {
  constructor(options = {}) {
    options.resources = options.resources || [];
    options.resources.push(
      ...[
        { type: 'less', url: '/views/MenuView/style.less' },
        {
          type: 'json',
          url: '/views/MenuView/default.json',
          name: 'defaultMenu'
        }
      ]
    );
    super(options);

    this._drawCollapsed = options.drawCollapsed || false;
    this._collapsedLogo = options.collapsedLogo || '/img/hamburger.svg';
    this._overrideSpecs = options.overrideSpecs || null;
    this._extraSpecs = options.extraSpecs || [];
  }

  get drawCollapsed() {
    return this._drawCollapsed;
  }

  set drawCollapsed(value) {
    this._drawCollapsed = value;
    this.render();
  }

  get extraSpecs() {
    return this._extraSpecs;
  }

  set extraSpecs(value) {
    this._extraSpecs = value;
    this.render();
  }

  async setup() {
    await super.setup(...arguments);

    this.d3el.classed('MenuView', true);
  }

  async draw() {
    await super.draw(...arguments);

    let menuItems = this.d3el
      .selectAll('.menuItem')
      .data(this.computeMenuSpec(), (spec) => spec.label);
    menuItems.exit().remove();
    const menuItemsEnter = menuItems
      .enter()
      .append('div')
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

  computeMenuSpec() {
    function pageToSpec(page) {
      let onclick =
        page.onclick ||
        (() => {
          window.location = page.url;
        });
      if (page.mail) {
        onclick = () => {
          // email obfuscation to cut down on spam...
          const temp =
            'mai' + 'lto:' + 'ale' + 'x' + '.' + 'r.big' + 'elow' + '@';
          window.location = temp + 'gm' + 'ail.c' + 'om';
        };
      }
      const primary = page.forcePrimary;

      /*
      Uncomment to go back to primary being the current page
      window.location.pathname === page.url ||
        window.location.pathname + '.html' === page.url ||
        (window.location.pathname === '/' && page.url === '/index.html');
      */

      const spec = {
        label: page.title,
        img: page.icon,
        primary,
        onclick
      };
      if (page.subMenu) {
        spec.subEntries = page.subMenu.map(pageToSpec);
      }
      return spec;
    }

    const specs = (this._overrideSpecs || this.getNamedResource('defaultMenu'))
      .map(pageToSpec)
      .concat(this.extraSpecs);
    if (this.drawCollapsed) {
      return [
        {
          img: this._collapsedLogo,
          onclick: function () {
            uki.ui.showContextMenu({
              menuEntries: specs,
              target: this.d3el,
              anchor: { x: -1, y: 0 }
            });
          }
        }
      ];
    } else {
      return specs;
    }
  }
}

export default MenuView;
