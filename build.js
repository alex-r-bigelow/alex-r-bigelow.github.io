#!/usr/bin/env node
// Update sitemap.xml and pages.json with the latest modification dates
const fs = require('fs');
const shell = require('shelljs');
shell.config.silent = true;

const pages = {
  details: {},
  hierarchy: {
    root: ['/index.html', '/cv.html', '/blog.html', '/contact.html', '/404.html'],
    project: [],
    blog: []
  }
};
const data = {};
const icons = {};
const ICON_FORMATS = ['png', 'svg'];

const BASE_URL = 'https://alex-r-bigelow.github.io';

// Make sure any new files will show up in the git ls-files command,
// but wait to actually stage those files:
shell.exec('git add --intent-to-add -A');

const fileList = shell.exec('git ls-files').stdout.trim().split('\n');
for (const filename of fileList) {
  if (shell.test('-e', filename)) {
    const location = new URL(BASE_URL + '/' + filename);
    let includePage = false;
    let details = {
      url: location.pathname
    };

    // Root file?
    if (pages.hierarchy.root.indexOf(location.pathname) !== -1) {
      includePage = true;
      details.type = 'root';
      details.dirname = '';
      details.path = location.pathname;
      switch (location.pathname) {
        case '/index.html':
          details.title = 'About Me';
          break;
        case '/cv.html':
          details.title = 'CV';
          break;
        case '/blog.html':
          details.title = 'Blog';
          break;
        case '/contact.html':
          details.title = 'Contact Me';
          break;
        default:
          details.title = '404';
      }
    }

    // Main project or blog file?
    let project = /projects\/(.*)\/([^/]*)\.([^/.]*)$/.exec(location.pathname);
    let blog = /blog\/(.*)\/([^/])*\.([^/.]*)$/.exec(location.pathname);

    if (project || blog) {
      // Project metadata
      if (project) {
        details.dirname = project[1];
        details.path = `/projects/${details.dirname}`;
        details.featureOrder = -1;
        details.type = 'project';
        if (project[3] === 'html') {
          includePage = true;
        } else if (project[2] === 'redirect' && project[3] === 'url') {
          includePage = true;
          details.isExternal = true;
          details.url = shell.cat(filename).trim();
          // TODO idea: get lastmod for external files based on curl --head url | grep Last-Modified
        } else if (project[2] === 'icon' && ICON_FORMATS.indexOf(project[3]) !== -1) {
          icons[details.path] = `${details.path}/${project[2]}.${project[3]}`;
        }
      }

      // Blog metadata
      if (blog) {
        details.dirname = blog[1];
        details.path = `/blog/${details.dirname}`;
        details.type = 'blog';
        if (blog[3] === 'html') {
          includePage = true;
        } else if (blog[2] === 'icon' && ICON_FORMATS.indexOf(blog[3])) {
          icons[details.path] = `${details.path}/${blog[2]}.${blog[3]}`;
        }
      }
    }

    if (includePage) {
      // Allow for custom / overriding metadata
      const metapath = `${__dirname}${details.path}/meta.json`;
      if (shell.test('-e', metapath)) {
        Object.assign(details, require(metapath));
      }

      // Default metadata for all pages
      if (!details.title) {
        details.title = details.dirname.replace(/_/g, ' ');
      }
      if (!details.lastmod) {
        details.lastmod = shell.exec(`git log -1 --date=format:%Y-%m-%d --format="%ad" -- ${filename}`).stdout.trim() ||
          shell.exec(`date +%Y-%m-%d -r ${filename}`).stdout.trim();
      }

      // Add the page
      if (details.type !== 'root') {
        pages.hierarchy[details.type].push(details.path);
      }
      pages.details[details.path] = details;
    }

    // Generic data files
    let dataDir = /data\/(.*)\/([^/]*)\.([^/.]*)$/.exec(location.pathname);
    if (dataDir) {
      details.path = dataDir[1].split('/');
      details.name = dataDir[2];
      details.extension = dataDir[3];
      details.filename = `${details.name}.${details.extension}`;
      details.lastmod = shell.exec(`git log -1 --date=format:%Y-%m-%d --format="%ad" -- ${filename}`).stdout.trim() ||
        shell.exec(`date +%Y-%m-%d -r ${filename}`).stdout.trim();
      const pathCopy = Array.from(details.path);
      let parent = data;
      while (pathCopy.length > 0) {
        const chunk = pathCopy.shift();
        parent[chunk] = parent[chunk] || {};
        parent = parent[chunk];
      }
      parent[details.filename] = details;
    }
  }
}

// Attach any icons that we found that weren't otherwise specified
for (const [pagePath, icon] of Object.entries(icons)) {
  if (!pages.details[pagePath].icon) {
    pages.details[pagePath].icon = icon;
  }
}

pages.hierarchy.blog.sort((a, b) => {
  return pages.details[a].lastmod - pages.details[b].lastmod;
});
pages.hierarchy.project.sort((a, b) => {
  return pages.details[a].featureOrder - pages.details[b].featureOrder;
});

// Dump pages.json
fs.writeFileSync('pages.json', JSON.stringify(pages, null, 2));

// Dump data.json
fs.writeFileSync('data.json', JSON.stringify(data, null, 2));

// Dump non-external pages to sitemap.xml
let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
for (const details of Object.values(pages.details)) {
  if (!details.isExternal) {
    sitemap += `\
  <url>
  <lastmod>${details.lastmod}</lastmod>
  <loc>${BASE_URL}${details.url}</loc>
  </url>
`;
  }
}
fs.writeFileSync('sitemap.xml', sitemap + '</urlset>');

shell.echo('Updated and staged pages.json, data.json, and sitemap.xml');