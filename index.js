var blogLoader = require.context('./blog', true, /\.md$/);

let blogEntries = [];
blogLoader.keys().forEach(function (key) {
  let pieces = key.match(/\.\/(\d+-\d+-\d+)-(.*)\.md/);
  console.log(pieces);
  blogEntries.push({
    path: pieces[0],
    date: new Date(pieces[1]),
    title: pieces[2].replace(/-/g, ' ')
  });
});
console.log(JSON.stringify(blogEntries, null, 2));

console.log(blogLoader(blogEntries[0].path).__content);
