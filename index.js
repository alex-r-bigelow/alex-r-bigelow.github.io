import './.htaccess';

import Router from './Router';
import Blog from './Blog';
import LandingPage from './LandingPage';
import Menu from './Menu';

// For debugging, expose d3 and jQuery on the console
import * as d3 from './lib/d3.min.js';
import jQuery from 'jquery';
window.d3 = d3;
window.jQuery = jQuery;

window.router = new Router();
window.views = {};
window.viewTypes = {
  '#': LandingPage
};
window.blog = new Blog();
window.menu = new Menu();
window.render = (targetHash) => {
  window.menu.render();
  Object.keys(window.views).forEach(hash => {
    if (hash !== targetHash) {
      window.views[hash].$el.hide();
    }
  });
  window.views[targetHash].$el.show();
  window.views[targetHash].render();
};
window.router.navigate(window.router.getHash());
