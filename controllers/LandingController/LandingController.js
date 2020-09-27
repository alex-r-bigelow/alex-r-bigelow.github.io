import Controller from '../Controller/Controller.js';

class LandingController extends Controller {
  constructor (options = {}) {
    options.resources = options.resources || [];
    options.resources.push({ type: 'less', url: 'controllers/LandingController/style.less' });
    super(options);
    this.collapseMenu = false;
  }
}

export default LandingController;
