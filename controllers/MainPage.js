/* globals d3 */
import Controller from './Controller.js';
import Menu from '../views/Menu/Menu.js';
import Feed from '../views/Feed/Feed.js';

class MainPage extends Controller {
  constructor () {
    super();
    this.views.push(new Menu(d3.select('.Menu')));
    this.views.push(new Feed(d3.select('.Feed')));
    super.finishConstruction();
  }
}

window.controller = new MainPage();
