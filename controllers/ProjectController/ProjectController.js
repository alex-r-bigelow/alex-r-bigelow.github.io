import Controller from '../Controller/Controller.js';
import ProjectFeed from '../../views/ProjectFeed/ProjectFeed.js';

class ProjectController extends Controller {
  constructor (options) {
    super(options);

    this.collapseMenu = true;
  }

  async setup () {
    this.projectFeed = new ProjectFeed({
      d3el: this.d3el.select('.Feed')
    });

    await super.setup(...arguments);

    this.views.push(this.projectFeed);
  }
}

export default ProjectController;
