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
          let content = '<h1>' + this.title + '</h1>';
          content += '<h2>' + this.date.toLocaleDateString() + '</h2>';
          content += self.markdownLoader(this.path).__content;
          return content;
        }
      };
      entry.hash = self.getHash(entry);
      self.entries[entry.hash] = entry;
    });
  }
  getOrderedEntries () {
    let result = Object.keys(this.entries).map(hash => this.entries[hash]);
    result.sort((a, b) => b.date - a.date);
    return result;
  }
  getHash (entry) {
    return '#' + entry.title.replace(/[\s/\.,#:]/g, '');
  }
}
export default Blog;
