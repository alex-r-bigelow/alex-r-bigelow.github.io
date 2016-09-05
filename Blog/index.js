class Blog {
  constructor () {
    const self = this;

    self.entries = {};

    self.markdownLoader = require.context('./', true, /\.md$/);
    self.markdownLoader.keys().forEach(key => {
      let pieces = key.match(/\.\/(\d+-\d+-\d+)-(.*)\.md/);
      let entry = {
        path: pieces[0],
        date: new Date(pieces[1]),
        title: pieces[2].replace(/-/g, ' '),
        load: function () {
          return self.markdownLoader(this.path).__content;
        }
      };
      self.entries[self.getHash(entry)] = entry;
    });
  }
  getHash (entry) {
    return entry.title.replace(/[\s/\.,#:]/, '');
  }
}
export default Blog;
