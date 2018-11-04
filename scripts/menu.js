/* globals d3 */
function drawLinks (container, paths) {
  let links = container.selectAll('a').data(paths, d => d);
  links.exit().remove();
  const linksEnter = links.enter().append('a');
  links = links.merge(linksEnter);

  links.attr('href', d => window.pages.details[d].url)
    .attr('target', d => window.pages.details[d].isExternal ? '_blank' : null);

  linksEnter.append('img');
  links.select('img')
    .style('display', d => window.pages.details[d].icon ? null : 'none')
    .attr('src', d => window.pages.details[d].icon);

  linksEnter.append('h4');
  links.select('h4').text(d => window.pages.details[d].title);

  return { links, linksEnter };
}

function drawMenu () {
  if (window.suppressMenu) {
    return;
  }
  let menu = d3.select('#menu');
  if (menu.size() === 0) {
    menu = d3.select('body').append('div')
      .attr('id', 'menu')
      .classed('collapsed', true);
    menu.append('div')
      .classed('hamburger', true)
      .on('click', () => {
        menu.classed('collapsed', !menu.classed('collapsed'));
      });
    menu.append('nav').classed('root', true);
    menu.append('h4').text('Major Projects').classed('projectLabel', true);
    menu.append('nav').classed('projects', true);
  }

  drawLinks(menu.select('.root'), window.pages.hierarchy.root
    .filter(d => d !== '/404.html'));
  drawLinks(menu.select('.projects'), window.pages.hierarchy.project);
}

export default drawMenu;
