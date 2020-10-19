import Controller from '../Controller/Controller.js';
import BlogView from '../../views/BlogView/BlogView.js';

class BlogController extends Controller {
  constructor (options) {
    super(options);

    this.collapseMenu = true;
  }

  async setup () {
    this.blogView = new BlogView({
      d3el: this.d3el.select('.BlogView')
    });

    await super.setup(...arguments);

    this.views.push(this.blogView);
  }
}

export default BlogController;
