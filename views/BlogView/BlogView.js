/* globals uki */

class BlogView extends uki.View {
  constructor (options = {}) {
    options.resources = options.resources || [];
    options.resources.push(...[
      { type: 'json', url: 'views/BlogView/data.json', name: 'data' }
    ]);
    super(options);
  }
}
export default BlogView;
