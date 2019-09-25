/* globals d3 */
import Controller from './Controller.js';
import Menu from '../views/Menu/Menu.js';
import CvView from '../views/CvView/CvView.js';

class CvController extends Controller {
  constructor () {
    super();
    this.menu = new Menu(d3.select('.Menu'));
    this.views.push(this.menu);
    this.views.push(new CvView(d3.select('.CV')));
    this.finishConstruction();
  }
  async finishConstruction () {
    await super.finishConstruction();
    // Inject a print button into the menu
    this.menu.addButton('Print', 'images/print.svg', () => {
      window.print();
    });
  }
}

window.controller = new CvController();
