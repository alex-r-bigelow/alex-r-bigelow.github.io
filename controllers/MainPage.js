/* globals d3 */
import Controller from './Controller.js';
import Menu from '../views/Menu/Menu.js';
import Feed from '../views/Feed/Feed.js';

class MainPage extends Controller {
  constructor () {
    super();
    this.menu = new Menu(d3.select('.Menu'));
    this.feed = new Feed(d3.select('.Feed'));
  }
  renderAllViews () {
    super.renderAllViews();
    this.menu.render();
    this.feed.render();
  }
}

window.controller = new MainPage();
