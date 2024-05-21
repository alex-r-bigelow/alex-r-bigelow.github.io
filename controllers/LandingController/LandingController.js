import Controller from '../Controller/Controller.js';
import NetworkDecoratorView from '../../views/NetworkDecoratorView/NetworkDecoratorView.js';

class LandingController extends Controller {
  constructor(options = {}) {
    options.resources = options.resources || [];
    options.resources.push({
      type: 'less',
      url: '/controllers/LandingController/style.less'
    });
    super(options);
    this.collapseMenu = window.outerWidth < 620;
  }

  async setup() {
    this.networkDecorator = new NetworkDecoratorView({
      d3el: this.d3el.select('.NetworkDecorator')
    });

    await super.setup(...arguments);

    this.views.push(this.networkDecorator);
  }
}

export default LandingController;
