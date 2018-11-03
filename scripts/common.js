/* globals d3 */
import drawMenu from './menu.js';

const ICON_FORMATS = ['svg', 'png'];

function getPages (rawPages) {
  window.pages = {};
  window.pageHierarchy = {
    root: [],
    projects: [],
    blog: []
  };
  for (const page of rawPages) {
    const type = /\/(blog)\/|\/(project)s\//.exec(page.loc);
    page.type = type === null ? 'root' : type[1] || type[2];
    page.localUrl = /https:\/\/alex-r-bigelow\.github\.io\/?(.*)/.exec(page.url)[1];
    if (page.type === 'root') {
      switch (page.localUrl) {
        case '':
          page.title = 'My tale';
          break;
        case 'cv.html':
          page.title = 'My CV';
          break;
        default:
          page.title = '404';
      }
    } else if (page.type === 'project' || page.type === 'blog') {
      if (page.localUrl) {
        page.title = page.localUrl.split('.').slice(0, -1).join('.');
        (async () => {
          for (const format of ICON_FORMATS) {
            try {
              const icon = `${page.localUrl}/icon.${format}`;
              await window.fetch(icon, { method: 'HEAD' });
              page.icon = icon;
            } catch (err) {
              // ignore failures to get icons
            }
          }
        })();
      } else {
        page.title = page.loc.split('/').slice(-1)[0].split('.').slice(0, -1).join('.');
      }
    }
    window.pages[page.url] = page;
    window.pageHierarchy[page.type].push(page.url);
  }
  for (const pageList of Object.values(window.pageHierarchy)) {
    pageList.sort((a, b) => {
      return a.lastmod - b.lastmod;
    });
  }
  window.currentPage = window.pages[window.location.hash.slice(1)] ||
    window.pages['404.html'];
}

window.onload = async () => {
  getPages(await d3.json('pages.json'));
  drawMenu();
};
