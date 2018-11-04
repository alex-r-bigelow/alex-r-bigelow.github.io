/* globals d3 */
import drawMenu from './menu.js';

window.pagesPromise = new Promise((resolve, reject) => {
  window.addEventListener('load', async () => {
    window.pages = await d3.json('/pages.json');
    resolve(window.pages);
    drawMenu();
  });
});
