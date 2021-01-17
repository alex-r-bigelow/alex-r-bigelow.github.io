#!/usr/bin/env node
// Update sitemap.xml with the latest modification dates, and build data files
// that summarize / contain CV info and blog posts
const fs = require('fs');
const shell = require('shelljs');
const bibtexParse = require('bibtex-parse-js');
const grayMatter = require('gray-matter');
const showdown = require('showdown');
const showdownConverter = new showdown.Converter();
const menu = require('./views/MenuView/default.json');
shell.config.silent = true;

const pages = {
  details: {},
  hierarchy: {
    root: [
      '/index.html',
      '/funding.html',
      '/projects.html',
      '/cv.html',
      '/blog.html',
      '/404.html'
    ],
    blog: [],
    drafts: []
  }
};
const cvData = {};
const externalBlogPreviews = {};
const PRELOAD_FORMATS = ['json', 'url', 'txt', 'bib', 'md'];
const PARSERS = {
  json: text => JSON.parse(text),
  bib: text => {
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

    // Fake 'howpublished' field for theses and patents
    if (raw.entryType === 'phdthesis') {
      result.howpublished = result.school + ' PhD Dissertation';
    } else if (raw.entryType === 'mastersthesis') {
      result.howpublished = result.school + ' Thesis';
    } else if (raw.entryType === 'patent') {
      result.howpublished = result.number;
    }
    return result;
  },
  md: text => {
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
    const details = {
      url: location.pathname
    };

    // Root file?
    if (pages.hierarchy.root.indexOf(location.pathname) !== -1) {
      includePage = true;
      details.type = 'root';
      details.dirname = '';
      details.path = location.pathname;
      details.title = menu.find(d => d.url === location.pathName)?.title;
    }

    // Blog or draft file?
    const blog = /blog\/(.*)\/([^/]*)\.([^/.]*)$/.exec(location.pathname);
    const drafts = /drafts\/(.*)\/([^/]*)\.([^/.]*)$/.exec(location.pathname);
    const blogOrDraft = blog || drafts;
    if (blogOrDraft) {
      details.dirname = blogOrDraft[1];
      details.type = blog ? 'blog' : 'drafts';
      details.path = `/${details.type}/${details.dirname}`;

      if (blogOrDraft[2] === 'index' || blogOrDraft[2] === 'preview') {
        // Check if this is an auto-generated HTML file that we should skip
        const mdFile = `${details.type}/${blogOrDraft[1]}/${blogOrDraft[2]}.md`;
        const mdFileExists = shell.test('-e', mdFile);
        if (blogOrDraft[3] === 'html' && mdFileExists) {
          console.log(`... skipping auto-generated ${filename} ...`);
          continue;
        }

        // Parse the post / preview contents
        let contents = shell.exec(`cat ${filename}`).stdout;
        let saveHTML = false;
        let wrapHTML = false;
        if (blogOrDraft[3] === 'md') {
          // Convert to HTML
          contents = PARSERS.md(contents).content;
          if (blogOrDraft[2] === 'index') {
            // Always wrap markdown posts in our generic blog HTML wrapper, and
            // override the url to point to the generated file
            saveHTML = true;
            wrapHTML = true;
            details.url = `/${details.type}/${blogOrDraft[1]}/${blogOrDraft[2]}.html`;
          }
        }
        // Store the contents and what to do with them
        if (blogOrDraft[2] === 'index') {
          details.index = contents;
          details.saveIndexHTML = saveHTML;
          details.wrapIndexHTML = wrapHTML;
          // Include the main post page
          includePage = true;
        } else {
          // We may not have seen the main post yet, so add it later
          externalBlogPreviews[details.path] = contents;
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
        // Default title is the directory name, replacing underscores with spaces
        details.title = details.dirname.replace(/_/g, ' ');
      }
      if (!details.lastmod) {
        // Check when the file was last changed
        details.lastmod = shell.exec(`git log -1 --date=format:%Y-%m-%d --format="%ad" -- ${filename}`).stdout.trim() ||
          shell.exec(`date +%Y-%m-%d -r ${filename}`).stdout.trim();
      }

      // Add the page
      if (details.type !== 'root') {
        pages.hierarchy[details.type].push(details.path);
      }
      pages.details[details.path] = details;
    }

    // CV data?
    const dataDir = /cv\/(.*)\/([^/]*)\.([^/.]*)$/.exec(location.pathname);
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
      let parent = cvData;
      while (pathCopy.length > 0) {
        const chunk = pathCopy.shift();
        parent[chunk] = parent[chunk] || {};
        parent = parent[chunk];
      }
      parent[details.filename] = details;
    }
  }
}

// Post-processing for blog stuff
pages.hierarchy.blog.sort((a, b) => {
  return new Date(pages.details[b].lastmod) - new Date(pages.details[a].lastmod);
});
const blogHTMLWrapper = shell.exec('cat blogHTMLWrapper.html').stdout;
function finalizeBlog (blogPath) {
  // Get the details associated with the path
  const details = pages.details[blogPath];
  // Patch on an external preview if it exists
  if (externalBlogPreviews[details.path]) {
    details.preview = externalBlogPreviews[details.path];
  }
  // While we're here, create / overwrite any converted HTML files
  if (details.index) {
    if (details.saveIndexHTML) {
      let contents = details.index;
      if (details.wrapIndexHTML) {
        contents = eval('`' + blogHTMLWrapper + '`'); // eslint-disable-line no-eval
      }
      fs.writeFileSync(`${details.type}/${details.dirname}/index.html`, contents);
      if (details.type === 'blog') {
        shell.exec(`git add blog/${details.dirname}/index.html`);
      }
      console.log(`Generated ${details.type}/${details.dirname}/index.html`);
    }
    // Don't store blog contents in BlogView/data.json
    delete details.index;
  }
  // If this is only a draft, delete all its details now that we've finished the
  // dry run, so that its info doesn't end up in any of our metadata
  if (details.type === 'drafts') {
    delete pages.details[blogPath];
  }
  return details;
}
const blogData = pages.hierarchy.blog.map(finalizeBlog);
// Dry run for drafts (generate HTML files, but don't include drafts' metadata anywhere)
pages.hierarchy.drafts.map(finalizeBlog);

// Dump BlogView/data.json
fs.writeFileSync('views/BlogView/data.json', JSON.stringify(blogData, null, 2));
shell.exec('git add views/BlogView/data.json');
console.log('Updated views/CvView/data.json');

// Dump CvView/data.json
fs.writeFileSync('views/CvView/data.json', JSON.stringify(cvData, null, 2));
shell.exec('git add views/CvView/data.json');
console.log('Updated views/CvView/data.json');

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
shell.exec('git add sitemap.xml');
console.log('Updated sitemap.xml');
