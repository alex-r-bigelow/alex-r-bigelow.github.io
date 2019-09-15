/* globals d3, less */
import { Model } from '../node_modules/uki/dist/uki.esm.js';
import Tooltip from '../views/Tooltip/Tooltip.js';

import recolorImageFilter from '../utils/recolorImageFilter.js';

class Controller extends Model {
  constructor () {
    super([
      { type: 'json', url: 'pages.json' }
    ]);
    this.tooltip = new Tooltip();

    window.onresize = () => { this.renderAllViews(); };

    (async () => {
      // Wait for LESS to finish loading before applying our SVG
      // filter hack
      await less.pageLoadFinished;
      recolorImageFilter();
    })();
  }
  renderAllViews () {
    this.tooltip.render();
  }
}

export default Controller;
