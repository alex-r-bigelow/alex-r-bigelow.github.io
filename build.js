#!/usr/bin/env node
// Update sitemap.xml and pages.json with the latest modification dates
const fs = require('fs');
const shell = require('shelljs');
const bibtexParse = require('bibtex-parse-js');
const grayMatter = require('gray-matter');
const showdown = require('showdown');
const showdownConverter = new showdown.Converter();
shell.config.silent = true;

const pages = {
  details: {},
  hierarchy: {
    root: ['/index.html', '/cv.html', '/blog.html', '/404.html'],
    project: [],
    blog: []
  }
};
const data = {};
const icons = {};
const ICON_FORMATS = ['png', 'svg'];
const PRELOAD_FORMATS = ['json', 'url', 'txt', 'bib', 'md'];
const PARSERS = {
  'json': text => JSON.parse(text),
  'bib': text => {
    // For our purposes, .bib files should only have one entry
    const raw = bibtexParse.toJSON(text)[0];
    const result = raw.entryTags;

    // We want a prettier author list than the nasty format BibTeX uses:
    result.authorList = result.author.split(/\s+and\s+/).map(author => {
      author = author.split(/[\s,]+/);
      return author.slice(1).join(' ') + ' ' + author[0];
    });
    if (result.authorList.length > 2) {
      result.joinedAuthorList = result.authorList.slice(0, -1).join(', ') +
        ', and ' + result.authorList[result.authorList.length - 1];
    } else {
      result.joinedAuthorList = result.authorList.join(' and ');
    }

    // Fake 'howpublished' field for theses
    if (raw.entryType === 'phdthesis') {
      result.howpublished = result.school + ' PhD Dissertation';
    } else if (raw.entryType === 'mastersthesis') {
      result.howpublished = result.school + ' Thesis';
    }
    return result;
  },
  'md': text => {
    const result = grayMatter(text);
    result.content = showdownConverter.makeHtml(result.content);
    return result;
  }
};

const BASE_URL = 'https://alex-r-bigelow.github.io';

// Make sure any new files will show up in the git ls-files command,
// but wait to actually stage those files:
shell.exec('git add --intent-to-add -A');

const fileList = shell.exec('git ls-files').stdout.trim().split('\n');
for (const filename of fileList) {
  if (shell.test('-e', filename)) {
    const location = new URL(BASE_URL + '/' + filename);
    console.log(`Bundling ${filename}`);
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
        default:
          details.title = '404';
      }
    }

    // Blog file?
    let blog = /blog\/(.*)\/([^/])*\.([^/.]*)$/.exec(location.pathname);
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
      if (PRELOAD_FORMATS.indexOf(details.extension) !== -1) {
        details.contents = shell.exec(`cat ${filename}`).stdout;
        if (PARSERS[details.extension]) {
          details.contents = PARSERS[details.extension](details.contents);
        }
      }
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
