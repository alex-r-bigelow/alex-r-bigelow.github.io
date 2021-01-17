/* globals uki */

class BlogView extends uki.View {
  constructor (options = {}) {
    options.resources = options.resources || [];
    options.resources.push(...[
      { type: 'json', url: '/views/BlogView/data.json', name: 'data' },
      { type: 'less', url: '/views/BlogView/style.less' }
    ]);
    super(options);
  }

  async setup () {
    await super.draw(...arguments);

    this.d3el.classed('BlogView', true)
      .classed('flexbox-albatross', true)
      .insert('nav', ':first-child')
      .classed('blogMenu', true)
      .insert('a').attr('href', '/blog')
      .insert('h5').text('Blog home');
  }

  async draw () {
    await super.draw(...arguments);

    const data = this.getNamedResource('data');

    let entries = this.d3el.select('.blogMenu').selectAll('.entry').data(data);
    entries.exit().remove();
    const entriesEnter = entries.enter().append('div')
      .classed('entry', true);
    entries = entries.merge(entriesEnter);

    const summaryEnter = entriesEnter.append('div')
      .classed('summary', true);

    summaryEnter.append('a');
    entries.select('.summary a')
      .attr('href', d => d.url)
      .text(d => d.title);

    summaryEnter.append('span')
      .classed('date', true)
      .text(d => d.lastmod);

    entriesEnter.append('div')
      .classed('preview', true)
      .html(d => d.preview?.content || '');
  }
}
export default BlogView;
