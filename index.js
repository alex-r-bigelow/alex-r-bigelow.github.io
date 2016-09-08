import * as d3 from './lib/d3.min.js';
import jQuery from 'jquery';

import './.htaccess';

import './style.scss';
import createImageRecoloringFilters from './lib/createImageRecoloringFilters';

import Router from './Router';
import Blog from './Blog';
import LandingPage from './LandingPage';
import Menu from './Menu';

// For debugging, expose d3 and jQuery on the console
window.d3 = d3;
window.jQuery = jQuery;

// First deal with some page-wide styling stuff
createImageRecoloringFilters();
window.emSize = parseFloat(jQuery('body').css('font-size'));

// Create the router, a lookup table for view types, and
// a place to store instantiated views
window.router = new Router();
window.viewTypes = {
  '#': LandingPage
};
window.views = {};

// Create a blog object that figures out what posts we have
window.blog = new Blog();

// Create the menu
window.menu = new Menu();

// Create a page-wide render function
window.render = (targetHash) => {
  window.menu.render();
  // If specified, switch views
  if (targetHash) {
    Object.keys(window.views).forEach(hash => {
      if (hash !== targetHash) {
        window.views[hash].$el.hide();
      }
    });
    window.views[targetHash].$el.show();
    window.views[targetHash].render();
  }
};
// Listen for resized windows
jQuery(window).on('resize', () => {
  window.render();
});

// Move to the view that the user specified in the URL
window.router.navigate(window.router.getHash());
