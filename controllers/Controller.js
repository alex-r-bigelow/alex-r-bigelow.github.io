/* globals less */
import { Model } from '../node_modules/uki/dist/uki.esm.js';
import recolorImageFilter from '../utils/recolorImageFilter.js';

class Controller extends Model {
  constructor () {
    super([
      { type: 'json', url: 'data.json' }
    ]);

    this.views = [];

    window.onresize = () => { this.renderAllViews(); };
  }
  async finishConstruction () {
    const allSetupPromises = Promise.all(this.views.map(view => {
      return new Promise((resolve, reject) => {
        view.on('setupFinished', () => {
          resolve();
        });
      });
    }));
    this.renderAllViews();
    await allSetupPromises;
    await less.pageLoadFinished;
    recolorImageFilter();
  }
  renderAllViews () {
    for (const view of this.views) {
      view.render();
    }
  }
}

export default Controller;
