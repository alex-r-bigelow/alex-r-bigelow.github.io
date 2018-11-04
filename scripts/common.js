/* globals d3 */
import drawMenu from './menu.js';

window.onload = async () => {
  window.pages = await d3.json('/pages.json');
  drawMenu();
};
