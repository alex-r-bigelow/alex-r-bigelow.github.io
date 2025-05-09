/* globals d3 */
import Controller from '../Controller/Controller.js';
import CvView from '../../views/CvView/CvView.js';

class CvController extends Controller {
  constructor (options = {}) {
    super(options);
    this.collapseMenu = window.outerWidth < 1994;
    this.extraMenuSpecs = [{
      label: 'Print',
      img: '/img/print.svg',
      onclick: () => {
        window.print();
      }
    }];
  }

  async setup () {
    this.cvView = new CvView({
      d3el: d3.select('body').select('.CV')
    });

    await super.setup(...arguments);

    this.views.push(this.cvView);
  }
}

export default CvController;
