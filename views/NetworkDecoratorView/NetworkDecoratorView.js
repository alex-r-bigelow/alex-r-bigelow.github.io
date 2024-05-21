/* globals uki, d3 */
import MenuView from '../../views/MenuView/MenuView.js';

const NODE_RADIUS = 10;
const GRAVITY_MULTIPLIER = 0.15;
const MAX_GRAVITY_ALPHA = 0.0005;
const LINK_STRENGTH = 0.05;
const BOUNCE_STRENGTH = 2;
const JITTER_RADIUS = 150;
const CHARGE_STRENGTH = -250;

function getCenter(bounds) {
  // Bottom-left... ish
  return {
    x: Math.min((2 * bounds.width) / 5, 500),
    y: Math.max(bounds.height / 2, bounds.height - 200)
  };
}

function centerAndBounds() {
  let nodes = [];
  let bounds = { left: 0, top: 0, right: 100, bottom: 100 };

  function force(alpha) {
    for (const node of nodes) {
      const radius = NODE_RADIUS;
      // Kinda weird, but has a nice effect: apply gravity more strongly
      // (within a limit) at the beginning of a layout / while you're
      // dragging, but taper it off toward the end
      const gravityAlpha = Math.min(
        (alpha * GRAVITY_MULTIPLIER) ** 2,
        MAX_GRAVITY_ALPHA
      );

      const center = getCenter(bounds);

      if (node.x < radius) {
        node.x = radius;
        node.vx += alpha * BOUNCE_STRENGTH * (radius - node.x);
      } else if (node.x > bounds.width - radius) {
        node.x = bounds.width - radius;
        node.vx += -alpha * BOUNCE_STRENGTH * (node.x - bounds.width - radius);
      }
      // Gravity toward left corner
      const dx = center.x - node.x;
      node.vx += Math.sign(dx) * gravityAlpha * dx ** 2;

      if (node.y < radius) {
        node.y = radius;
        node.vy += alpha * BOUNCE_STRENGTH * (radius - node.y);
      } else if (node.y > bounds.height - radius) {
        node.y = bounds.height - radius;
        node.vy += -alpha * BOUNCE_STRENGTH * (node.y - bounds.height - radius);
      }
      // Gravity toward bottom corner
      const dy = center.y - node.y;
      node.vy += Math.sign(dy) * gravityAlpha * dy ** 2;
    }
  }

  force.initialize = (newNodes) => {
    nodes = newNodes;
  };

  force.bounds = (newBounds) => {
    bounds = newBounds;
  };

  return force;
}

class NetworkDecoratorView extends uki.View {
  constructor(options = {}) {
    options.resources = options.resources || [];
    options.resources.push(
      ...[
        {
          type: 'text',
          url: '/views/NetworkDecoratorView/template.html',
          name: 'template'
        },
        {
          type: 'json',
          url: '/views/NetworkDecoratorView/data.json',
          name: 'data'
        },
        { type: 'less', url: '/views/NetworkDecoratorView/style.less' }
      ]
    );
    super(options);

    this.selectedName = null;
    this.draggedNode = null;
    this.dragOffset = null;

    this.toolbar = null;
  }

  get toolbarMenuSpecs() {
    const specs = [
      {
        id: 'download',
        label: 'Download',
        img: '/img/download.svg',
        onclick: () => {
          console.log('todo: download');
        }
      }
    ];
    if (this.selectedName) {
      specs.unshift({
        id: 'deleteNode',
        label: 'Delete Node',
        img: '/img/delete.svg',
        onclick: () => {
          console.log('todo: delete node ');
        }
      });
    } else {
      specs.unshift({
        id: 'addNode',
        label: 'Add Node',
        img: '/img/addNode.svg',
        onclick: () => {
          console.log('todo: add node ');
        }
      });
    }
    // TODO: link menu
    return specs;
  }

  async setup() {
    await super.setup(...arguments);

    this.d3el
      .html(this.getNamedResource('template'))
      .classed('NetworkDecoratorView', true);

    this.d3el.select('svg').attr('width', 0).attr('height', 0);

    const bounds = this.getBounds();
    const center = getCenter(bounds);

    this.toolbar = new MenuView({
      d3el: this.d3el.select('.toolbar'),
      overrideSpecs: [],
      collapsedLogo: '/img/wrench.svg',
      drawCollapsed: bounds.width < 620
    });

    this.cleanGraph = this.getNamedResource('data');
    this.dirtyGraph = {
      nodes: this.cleanGraph.nodes.map((d) =>
        Object.assign(
          {
            x: center.x + Math.random() * JITTER_RADIUS - JITTER_RADIUS / 2,
            y: center.y + Math.random() * JITTER_RADIUS - JITTER_RADIUS / 2
          },
          d
        )
      ),
      links: this.cleanGraph.links.map((d) => Object.assign({}, d))
    };

    this.simulation = d3
      .forceSimulation([])
      .force(
        'link',
        d3
          .forceLink([])
          .id((d) => d.name)
          .strength(LINK_STRENGTH)
      )
      .force('charge', d3.forceManyBody().strength(CHARGE_STRENGTH))
      .force('centerAndBounds', centerAndBounds())
      .force(
        'collide',
        d3.forceCollide(() => NODE_RADIUS)
      );

    d3.select(window).on('resize.NetworkDecoratorView', () => {
      this.simulation.alphaTarget(0.3).restart();
      this.render();
    });
  }

  async draw() {
    await super.setup(...arguments);

    this.toolbar.extraSpecs = this.toolbarMenuSpecs;

    const svg = this.d3el.select('svg').attr('width', 0).attr('height', 0);

    const bounds = this.getBounds();

    svg.attr('width', bounds.width).attr('height', bounds.height);

    this.simulation.nodes(this.dirtyGraph.nodes);
    this.simulation.force('link').links(this.dirtyGraph.links);
    this.simulation.force('centerAndBounds').bounds(bounds);

    let links = svg
      .select('.links')
      .selectAll('.link')
      .data(this.dirtyGraph.links, (d) => d.source + '_' + d.target);
    links.exit().remove();
    const linksEnter = links.enter().append('path').classed('link', true);
    links = links.merge(linksEnter);

    let nodes = svg
      .select('.nodes')
      .selectAll('.node')
      .data(this.dirtyGraph.nodes, (d) => d.name);
    nodes.exit().remove();
    const nodesEnter = nodes.enter().append('g').classed('node', true);
    nodes = nodes.merge(nodesEnter);

    nodesEnter.append('circle').attr('r', NODE_RADIUS);
    nodesEnter
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', -NODE_RADIUS - 20);
    nodes.select('text').text((d) => d.name);

    nodes
      .classed('selected', (d) => this.selectedName === d.name)
      .on('mousedown', (event, d) => {
        this.mouseDown(d, bounds, event);
      });
    svg
      .on('mousemove', (event) => this.mouseMove(bounds, event))
      .on('mouseup', () => this.mouseUp());

    this.simulation.on('tick', () => {
      links.attr('d', (d) => {
        return `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`;
      });

      nodes.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });
  }

  mouseDown(node, bounds, event) {
    let createdOrRemovedLink = false;
    if (this.selectedName && event.shiftKey) {
      // Create a link when shift-clicking and a node is already selected
      this.cleanGraph.links.push({
        source: this.selectedName,
        target: node.name
      });
      createdOrRemovedLink = true;
    } else if (this.selectedName && event.ctrlKey) {
      const existingLinkIndex = this.cleanGraph.links.findIndex(
        ({ source, target }) =>
          (source === this.selectedName && target === node.name) ||
          (source === node.name && target === this.selectedName)
      );
      if (existingLinkIndex !== -1) {
        this.cleanGraph.links.splice(existingLinkIndex, 1);
        createdOrRemovedLink = true;
      }
    }
    if (createdOrRemovedLink) {
      this.dirtyGraph.links = this.cleanGraph.links.map((d) =>
        Object.assign({}, d)
      );
    } else {
      // Only select a different node if we didn't create or delete a link
      this.selectedName = node.name;
    }
    this.draggedNode = node;
    const clickedPoint = {
      x: event.x - bounds.left,
      y: event.y - bounds.y
    };
    this.dragOffset = {
      dx: clickedPoint.x - node.x,
      dy: clickedPoint.y - node.y
    };
    node.fx = node.x;
    node.fy = node.y;
    this.simulation.alphaTarget(0.025).restart();
    this.render();
  }

  mouseMove(bounds, event) {
    if (!this.selectedName || !this.dragOffset || !this.draggedNode) {
      return;
    }
    const clickedPoint = {
      x: event.x - bounds.left,
      y: event.y - bounds.top
    };
    this.draggedNode.fx = clickedPoint.x - this.dragOffset.dx;
    this.draggedNode.fy = clickedPoint.y - this.dragOffset.dy;
    this.render();
  }

  mouseUp() {
    if (!this.selectedName) {
      return;
    }
    if (!this.dragOffset || !this.draggedNode) {
      // We weren't dragging; instead we clicked somewhere else so deselect
      this.selectedName = null;
    } else {
      this.draggedNode.fx = null;
      this.draggedNode.fy = null;
      this.draggedNode = null;
      this.dragOffset = null;
      this.simulation.alphaTarget(0);
    }

    this.render();
  }
}

export default NetworkDecoratorView;
