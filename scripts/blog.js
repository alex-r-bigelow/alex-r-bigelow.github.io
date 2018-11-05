/* globals d3 */
window.addEventListener('load', async () => {
  await window.pagesPromise;
  let articles = d3.select('#entries').selectAll('a')
    .data(window.pages.hierarchy.blog);
  articles.exit().remove();
  const articlesEnter = articles.enter().append('a');
  articles = articles.merge(articlesEnter);

  articles.attr('href', d => window.pages.details[d].url);

  articlesEnter.append('h2');
  articles.select('h2').text(d => window.pages.details[d].title);
  articlesEnter.append('div').classed('date', true);
  articles.select('.date').text(d => window.pages.details[d].lastmod);
});
