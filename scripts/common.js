/* globals d3 */
import drawMenu from './menu.js';

function getPages (rawPages) {
  window.pages = {};
  window.pageHierarchy = {
    root: [],
    project: [],
    blog: []
  };
  for (const page of rawPages) {
    page.location = new URL(page.url);
    const type = /\/(blog)\/|\/(project)s\//.exec(page.location.pathname);
    page.type = type === null ? 'root' : type[1] || type[2];
    if (page.type === 'root') {
      switch (page.location.pathname) {
        case '/':
          page.title = 'My tale';
          break;
        case '/cv.html':
          page.title = 'My CV';
          break;
        default:
          page.title = '404';
      }
    } else if (page.type === 'project' || page.type === 'blog') {
      const subdir = page.type === 'project' ? 'projects' : 'blog';
      page.dir = new RegExp(`${subdir}/(.*)/[^/]*$`).exec(page.location.pathname)[1];
      page.title = page.dir.replace('_', ' ');
      (async () => {
        try {
          const metadata = await d3.json(`${subdir}/${page.dir}/page_meta.json`);
          Object.assign(page, metadata);
        } catch (err) {
          if (page.type === 'project') {
            console.warn(`${page.title} project is missing page_meta.json`);
          }
        }
      })();
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
