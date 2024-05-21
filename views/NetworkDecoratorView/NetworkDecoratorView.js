/* globals uki, d3 */
import MenuView from '../../views/MenuView/MenuView.js';

const NODE_RADIUS = 10;
const GRAVITY_MULTIPLIER = 0.15;
const MAX_GRAVITY_ALPHA = 0.0005;
const LINK_STRENGTH = 0.05;
const BOUNCE_STRENGTH = 2;
const JITTER_RADIUS = 150;
const CHARGE_STRENGTH = -250;

function getRandomPosition(center) {
  return {
    x: center.x + Math.random() * JITTER_RADIUS - JITTER_RADIUS / 2,
    y: center.y + Math.random() * JITTER_RADIUS - JITTER_RADIUS / 2
  };
}

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

const simulateMouse = (event) => {
  const touch = event.originalEvent?.touches[0] || event.changedTouches?.[0];
  return {
    x: touch.pageX,
    y: touch.pageY,
    preventDefault: event.preventDefault
  };
};

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
    this.renamedNode = null;
    this.draggedNode = null;
    this.dragOffset = null;

    this.toolbar = null;
    this.renderedLinks = [];
  }

  get toolbarMenuSpecs() {
    const specs = [
      {
        label: 'Download',
        img: '/img/download.svg',
        onclick: () => {
          const hiddenLink = document.createElement('a');
          hiddenLink.setAttribute(
            'href',
            'data:application/json;charset=utf-8,' +
              encodeURIComponent(JSON.stringify(this.cleanGraph))
          );
          hiddenLink.setAttribute('download', 'graph.json');
          hiddenLink.style.display = 'none';
          document.body.appendChild(hiddenLink);
          hiddenLink.click();
          document.body.removeChild(hiddenLink);
        }
      },
      {
        label: 'Tips',
        img: '/img/help.svg',
        onclick: () => {
          uki.ui.alert(`\
<p>
  To edit links, first select a node:
</p>
<ul>
  <li>Shift-click another node to add a link</li>
  <li>Ctrl-click another node to remove a link</li>
</ul>
<p>
  Apologies for the simplistic UX in this toy demo; if this were a real app,
  I wouldn't make you rely on keyboard hacks like this.
</p>`);
        }
      }
    ];
    if (this.selectedName) {
      specs.unshift({
        label: 'Rename Node',
        img: '/img/pencil.svg',
        onclick: async () => {
          const name = await uki.ui.prompt('Node name', this.selectedName, {
            validate: (newName) =>
              !this.cleanGraph.nodes.find(
                ({ name }) => name !== this.selectedName && name === newName
              )
          });
          const index = this.cleanGraph.nodes.findIndex(
            ({ name }) => name === this.selectedName
          );
          if (index === -1) {
            uki.ui.alert(
              "Error... er, uhm, I mean... Easter Egg discovered! Please email me to let me know that you found the secret, ... feature ... in which you can't rename a thing that I lost track of!"
            );
          } else {
            this.renamedNode = [this.selectedName, name];
            this.cleanGraph.links.forEach((link) => {
              if (link.source === this.selectedName) {
                link.source = name;
              }
              if (link.target === this.selectedName) {
                link.target = name;
              }
            });
            this.cleanGraph.nodes[index].name = name;
            this.selectedName = name;
            this.render();
          }
        }
      });
      specs.unshift({
        label: 'Delete Node',
        img: '/img/delete.svg',
        onclick: () => {
          const index = this.cleanGraph.nodes.findIndex(
            ({ name }) => name === this.selectedName
          );
          if (index === -1) {
            uki.ui.alert(
              "Error... er, uhm, I mean... Easter Egg discovered! Please email me to let me know that you found the secret, ... feature ... in which you can't delete a thing that I lost track of!"
            );
          } else {
            this.cleanGraph.nodes.splice(index, 1);
            this.cleanGraph.links = this.cleanGraph.links.filter(
              (link) =>
                link.source !== this.selectedName &&
                link.target !== this.selectedName
            );
            this.selectedName = null;
            this.render();
          }
        }
      });
    } else {
      specs.unshift({
        label: 'Add Node',
        img: '/img/addNode.svg',
        onclick: async () => {
          const name = await uki.ui.prompt('Node name', 'New Node', {
            validate: (newName) =>
              !this.cleanGraph.nodes.find(({ name }) => name === newName)
          });
          this.cleanGraph.nodes.push({ name });
          this.render();
        }
      });
    }
    return specs;
  }

  async setup() {
    await super.setup(...arguments);

    this.d3el
      .html(this.getNamedResource('template'))
      .classed('NetworkDecoratorView', true);

    this.d3el.select('svg').attr('width', 0).attr('height', 0);

    const bounds = this.getBounds();

    this.toolbar = new MenuView({
      d3el: this.d3el.select('.toolbar'),
      overrideSpecs: [],
      collapsedLogo: '/img/wrench.svg',
      drawCollapsed: bounds.width < 620
    });

    this.cleanGraph = this.getNamedResource('data');

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
    const center = getCenter(bounds);

    svg.attr('width', bounds.width).attr('height', bounds.height);

    const tempAlpha = this.simulation.alpha();
    this.simulation.alpha(0);

    // d3 pollutes the data that you give to forceSimulation, and expects its
    // objects to be fairly consistent, or we'll get weird interaction bugs.
    // Always update its existing nodes / links with new data, but don't let
    // manipulate our cleanGraph directly:
    const dirtyNodesByName = Object.fromEntries(
      (this.simulation.nodes() || []).map((node) => {
        if (node.name === this.renamedNode?.[0]) {
          // Ugly hack: renaming a node makes it lose its position information,
          // in part because d3 uses the anti-pattern mentioned above. This
          // repairs BOTH nodes and links in the event of a rename
          node.name = this.renamedNode[1];
          this.renamedNode = null;
        }
        return [node.name, node];
      })
    );
    const dirtyLinksByKey = Object.fromEntries(
      (this.simulation.force('link').links() || []).map((link) => {
        return [`${link.source.name}_${link.target.name}`, link];
      })
    );
    const dirtyGraph = {
      nodes: this.cleanGraph.nodes.map((d) =>
        Object.assign(dirtyNodesByName[d.name] || getRandomPosition(center), d)
      ),
      links: this.cleanGraph.links.map((d) =>
        Object.assign(dirtyLinksByKey[`${d.source}_${d.target}`] || {}, d)
      )
    };

    this.simulation.nodes(dirtyGraph.nodes);
    this.simulation.force('link').links(dirtyGraph.links);
    this.simulation.force('centerAndBounds').bounds(bounds);

    this.renderedLinks = svg
      .select('.links')
      .selectAll('.link')
      .data(
        dirtyGraph.links,
        (d) => (d.source.name || d.source) + '_' + (d.target.name || d.target)
      );
    this.renderedLinks.exit().remove();
    const linksEnter = this.renderedLinks
      .enter()
      .append('path')
      .classed('link', true);
    this.renderedLinks = this.renderedLinks.merge(linksEnter);

    let nodes = svg
      .select('.nodes')
      .selectAll('.node')
      .data(dirtyGraph.nodes, (d) => d.name);
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
      })
      .on('touchstart', (event, d) => {
        this.mouseDown(d, bounds, simulateMouse(event));
        event.preventDefault();
      });
    svg
      .on('mousemove', (event) => {
        this.mouseMove(bounds, event);
      })
      .on('touchmove', (event) => {
        this.mouseMove(bounds, simulateMouse(event));
        event.preventDefault();
      })
      .on('mouseup', (event) => {
        this.mouseUp(event);
      })
      .on('touchend', (event) => {
        this.mouseUp(simulateMouse(event));
        event.preventDefault();
      });

    this.simulation.on('tick', () => {
      this.renderedLinks.attr('d', (d) => {
        return `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`;
      });

      nodes.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });
    this.simulation.alpha(tempAlpha);
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
    if (!createdOrRemovedLink) {
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
    event.preventDefault();
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
