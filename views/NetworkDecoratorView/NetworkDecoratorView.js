/* globals uki, d3 */

const NODE_RADIUS = 5;
const CENTER_RADIUS = 150;
const MIRROR_RADIUS = 25;

function wallBounce () {
  let nodes = [];
  let bounds = { left: 0, top: 0, right: 100, bottom: 100 };

  function force (alpha) {
    for (const node of nodes) {
      if (node.x < bounds.left + MIRROR_RADIUS) {
        node.vx = Math.abs(node.vx);
      } else if (node.x > bounds.right - MIRROR_RADIUS) {
        node.vx = -Math.abs(node.vx);
      }
      if (node.y < bounds.top + MIRROR_RADIUS) {
        node.vy = Math.abs(node.vy);
      } else if (node.y > bounds.bottom - MIRROR_RADIUS) {
        node.vy = -Math.abs(node.vy);
      }
    }
  }

  force.initialize = newNodes => {
    nodes = newNodes;
  };

  force.bounds = newBounds => {
    bounds = newBounds;
  };

  return force;
}

class NetworkDecoratorView extends uki.View {
  constructor (options = {}) {
    options.resources = options.resources || [];
    options.resources.push(...[
      { type: 'text', url: '/views/NetworkDecoratorView/template.html', name: 'template' },
      { type: 'json', url: '/views/NetworkDecoratorView/data.json', name: 'data' },
      { type: 'less', url: '/views/NetworkDecoratorView/style.less' }
    ]);
    super(options);

    this.corner = options.corner || { x: 0, y: 0 };
    this.selectedName = null;
  }

  async setup () {
    await super.setup(...arguments);

    this.d3el.html(this.getNamedResource('template'))
      .classed('NetworkDecoratorView', true);

    this.d3el.select('svg')
      .attr('width', 0)
      .attr('height', 0);

    const bounds = this.getBounds();
    const x0 = this.corner.x === 0 ? CENTER_RADIUS : bounds.width - CENTER_RADIUS;
    const y0 = this.corner.y === 0 ? CENTER_RADIUS : bounds.height - CENTER_RADIUS;
    const jitterRadius = 50;

    this.cleanGraph = this.getNamedResource('data');
    this.dirtyGraph = {
      nodes: this.cleanGraph.nodes.map(d => Object.assign({
        x: x0 + Math.random() * jitterRadius - jitterRadius,
        y: y0 + Math.random() * jitterRadius - jitterRadius
      }, d)),
      links: this.cleanGraph.links.map(d => Object.assign({}, d))
    };

    this.simulation = d3.forceSimulation([])
      .force('link', d3.forceLink([]).id(d => d.name).strength(0.1))
      .force('charge', d3.forceManyBody())
      .force('x', d3.forceX().strength(0.05))
      .force('y', d3.forceY().strength(0.05))
      .force('collide', d3.forceCollide(NODE_RADIUS))
      .force('wallBounce', wallBounce());

    d3.select(window).on('resize.NetworkDecoratorView', () => {
      this.simulation.alphaTarget(0.3).restart();
      this.render();
    });
  }

  async draw () {
    await super.setup(...arguments);

    const svg = this.d3el.select('svg')
      .attr('width', 0)
      .attr('height', 0);

    const bounds = this.getBounds();

    svg
      .attr('width', bounds.width)
      .attr('height', bounds.height);

    this.simulation.nodes(this.dirtyGraph.nodes);
    this.simulation.force('link')
      .links(this.dirtyGraph.links);
    this.simulation.force('x')
      .x(this.corner.x === 0 ? CENTER_RADIUS : bounds.width - CENTER_RADIUS);
    this.simulation.force('y')
      .y(this.corner.y === 0 ? CENTER_RADIUS : bounds.height - CENTER_RADIUS);
    this.simulation.force('wallBounce')
      .bounds(bounds);

    let links = svg.select('.links')
      .selectAll('.link').data(this.dirtyGraph.links, d => d.source + '_' + d.target);
    links.exit().remove();
    const linksEnter = links.enter().append('path')
      .classed('link', true);
    links = links.merge(linksEnter);

    let nodes = svg.select('.nodes')
      .selectAll('.node').data(this.dirtyGraph.nodes, d => d.name);
    nodes.exit().remove();
    const nodesEnter = nodes.enter().append('g')
      .classed('node', true);
    nodes = nodes.merge(nodesEnter);

    nodesEnter.append('circle')
      .attr('r', NODE_RADIUS);
    nodesEnter.append('text');
    nodes.select('text')
      .text(d => d.name);

    nodes.classed('selected', d => this.selectedName === d.name)
      .on('click', (event, d) => {
        if (!this.selectedName) {
          this.selectedName = d.name;
        } else if (this.selectedName === d.name) {
          this.selectedName = null;
        } else {
          this.cleanGraph.links.push({
            source: this.selectedName,
            target: d.name
          });
          this.dirtyGraph.links = this.cleanGraph.links.map(d => Object.assign({}, d));
          this.selectedName = null;
          this.simulation.alphaTarget(0.3).restart();
        }
        this.render();
      });

    this.simulation.on('tick', () => {
      links.attr('d', d => {
        return `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`;
      });

      nodes.attr('transform', d => `translate(${d.x},${d.y})`);
    });
  }
}

export default NetworkDecoratorView;
