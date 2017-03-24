import jQuery from 'jquery';
import showdown from 'showdown';
import Images from '../Images';

class Projects {
  constructor () {
    const self = this;

    self.entries = {};

    self.markdownLoader = new showdown.Converter();

    let metaMarkdownLoader = require.context('./', true, /\.md$/);
    metaMarkdownLoader.keys().forEach(key => {
      let entry = metaMarkdownLoader(key);
      entry.title = key.match(/\.\/(.*)\.md/)[1].replace(/-/g, ' ');
      entry.load = function () {
        let resolvePromise;
        let responsePromise = new Promise((resolve, reject) => {
          resolvePromise = resolve;
        });
        if (this.readme) {
          // We want to load a README from Github as the page content
          jQuery.ajax({
            url: this.readme,
            type: 'GET',
            dataType: 'text',
            success: response => {
              let content = self.markdownLoader.makeHtml(response);
              resolvePromise(
                `<img class="headerImage" src="${Images[this.icon]}"/>
                 ${content}`);
            },
            error: () => {
              resolvePromise(this.getErrorMessage());
            }
          });
        } else {
          // With no README, this means we just want to use the
          // local markdown file's content
          resolvePromise(`<img class="headerImage" src="${Images[this.icon]}"/>
                          ${this.__content}`);
        }
        return responsePromise;
      };
      entry.getLoadingMessage = function () {
        return `<img class="headerImage" src="${Images[this.icon]}"/>
                <h1>${this.title}</h1>
                <p>Hang on a second... just stealing the page from the
                <a href="${this.repository}">Github README</a>...`;
      };
      entry.getErrorMessage = function () {
        return `<img class="headerImage" src="${Images[this.icon]}"/>
                <h1>${this.title}</h1>
                <p class="disclaimer">Sorry, for some reason I couldn't load the
                project README from the repository; try
                <a href="${this.repository}">viewing it directly</a> on Github
                instead.`;
      };
      entry.hash = self.getHash(entry);
      self.entries[entry.hash] = entry;
    });
  }
  getOrderedEntries () {
    return [
      '#ResonantLab',
      '#hanpuku',
      '#UPDBExplorer',
      '#EFGlite',
      '#SCIxmap',
      '#SCIpingpong',
      '#Calendarcreator',
      '#paperinstruments',
      '#expressionTopology'
    ].map(hash => this.entries[hash]);
  }
  getHash (entry) {
    return '#' + entry.title.replace(/[\s/\.,#:]/g, '');
  }
}
export default Projects;
