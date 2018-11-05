/* globals d3 */
import drawMenu from './menu.js';

window.pagesPromise = new Promise((resolve, reject) => {
  window.addEventListener('load', async () => {
    [window.pages, window.data] = await Promise.all([
      d3.json('/pages.json'),
      d3.json('/data.json')
    ]);
    resolve(window.pages);
    drawMenu();
  });
});
