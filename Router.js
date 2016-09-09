import View from './View';
import View404 from './View404';

class Router {
  constructor () {
    this.nodeLookup = {};
    this.nodes = [];
    this.nodeHistory = [];
    window.onhashchange = event => {
      this.navigate(this.getHash(event.newURL));
    };
  }
  getHash (url = window.location.href) {
    let hash = url.match(/#.*$/);
    if (hash === null || hash.length === 0) {
      hash = '#';
    } else {
      hash = hash[0];
    }
    return hash;
  }
  navigate (newHash) {
    if (!(newHash in window.views)) {
      if (newHash in window.blog.entries) {
        window.views[newHash] = new View(window.blog.entries[newHash].load());
      } else if (newHash in window.viewTypes) {
        window.views[newHash] = new window.viewTypes[newHash]();
      } else {
        if (!(window.view404)) {
          window.view404 = new View404();
        }
        window.views[newHash] = window.view404;
      }

      this.nodeLookup[newHash] = this.nodes.length;
      this.nodes.push(newHash);
    }
    this.nodeHistory.push(newHash);
    window.render(newHash);
  }
  historyGraph () {
    let graph = {
      nodes: this.nodes,
      edges: []
    };
    let previousHash;
    this.nodeHistory.forEach(hash => {
      if (previousHash) {
        graph.edges.push({
          source: this.nodeLookup[previousHash],
          target: this.nodeLookup[hash]
        });
      }
      previousHash = hash;
    });
    return graph;
  }
}

export default Router;
