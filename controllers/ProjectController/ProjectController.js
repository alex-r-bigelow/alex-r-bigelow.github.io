/* globals d3 */
import Controller from '../Controller/Controller.js';
import ProjectFeed from '../../views/ProjectFeed/ProjectFeed.js';

class ProjectController extends Controller {
  async setup () {
    this.cvView = new ProjectFeed({
      d3el: d3.select('body').select('.Feed')
    });

    await super.setup(...arguments);
  }
}

export default ProjectController;
