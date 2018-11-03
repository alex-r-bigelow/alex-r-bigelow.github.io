/* globals d3 */
import drawMenu from './menu.js';

function deriveSitemap (sitemap) {
  window.pages = {};
  window.pageHierarchy = {
    root: [],
    projects: [],
    blog: []
  };
  for (const url of sitemap.querySelectorAll('url')) {
    const base = {
      loc: url.querySelector('loc').textContent,
      lastmod: new Date(url.querySelector('lastmod').textContent)
    };
    const type = /\/(blog)\/|\/(project)s\//.exec(base.loc);
    base.type = type === null ? 'root' : type[1] || type[2];
    base.url = /https:\/\/alex-r-bigelow\.github\.io\/?(.*)/.exec(base.loc)[1];
    if (base.type === 'root') {
      switch (base.url) {
        case '':
          base.title = 'My tale';
          break;
        case 'cv.html':
          base.title = 'My CV';
          break;
        default:
          base.title = '404';
      }
    } else if (base.type === 'project' || base.type === 'blog') {
      base.title = base.url.split('.').slice(0, -1).join('.');
    }
    window.pages[base.url] = base;
    window.pageHierarchy[base.type].push(base.url);
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
  deriveSitemap(await d3.xml('sitemap.xml'));
  drawMenu();
};
