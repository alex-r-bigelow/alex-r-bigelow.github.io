/* globals d3 */
function drawLinks (container, urls) {
  let links = container.selectAll('a').data(urls, d => d.key);
  links.exit().remove();
  const linksEnter = links.enter().append('a');
  links = links.merge(linksEnter);

  links.attr('src', d => d);

  return { links, linksEnter };
}

function drawMenu () {
  if (window.suppressMenu) {
    return;
  }
  let menu = d3.select('#menu');
  if (menu.size() === 0) {
    menu = d3.select('body').append('header').attr('id', 'menu');
    menu.append('img')
      .classed('hamburger', true)
      .on('click', () => {
        menu.classed('expanded', !menu.classed('expaneded'));
      });
    menu.append('nav').classed('root', true);
    menu.append('h1').text('Projects');
    menu.append('nav').classed('projects', true);
  }

  drawLinks(menu.select('.root'), window.pageHierarchy.root)
    .links.text(d => window.pages[d].title);
  drawLinks(menu.select('.projects'), window.pageHierarchy.project)
    .links.text(d => window.pages[d].title);
}

export default drawMenu;
