import Controller from '../Controller/Controller.js';
import ExpertiseView from '../../views/ExpertiseView/ExpertiseView.js';

class ProjectController extends Controller {
  async setup () {
    this.rolesView = new ExpertiseView({
      d3el: this.d3el.select('.RolesView'),
      legendEl: this.d3el.select('.RolesViewLegend'),
      dataset: 'businessRoles.json'
    });
    this.expertiseView = new ExpertiseView({
      d3el: this.d3el.select('.ExpertiseView'),
      legendEl: this.d3el.select('.ExpertiseViewLegend'),
      dataset: 'skills.json'
    });
    this.views.push(...[this.expertiseView, this.rolesView]);

    await super.setup(...arguments);
  }
}

export default ProjectController;
