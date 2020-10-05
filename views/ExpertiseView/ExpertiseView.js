/* globals uki, d3 */

class ExpertiseView extends uki.View {
  constructor (options = {}) {
    options.resources = options.resources || [];
    options.resources.push(...[
      { type: 'text', url: 'views/ExpertiseView/template.html', name: 'template' },
      { type: 'json', url: `views/ExpertiseView/${options.dataset}`, name: 'data' },
      { type: 'less', url: 'views/ExpertiseView/style.less' }
    ]);
    super(options);
  }

  async setup () {
    await super.setup(...arguments);

    this.d3el.html(this.getNamedResource('template'));

    this.starDescriptions = {};
    for (const element of this.d3el.selectAll('[data-description]').nodes()) {
      this.starDescriptions[element.dataset.description] = element.innerHTML;
    }
  }

  async draw () {
    await super.draw(...arguments);

    const legendStars = this.d3el.selectAll('[data-stars]');
    this.drawStars(legendStars);

    let entries = this.d3el.select('.entryList')
      .selectAll('.entry').data(this.getNamedResource('data'));
    entries.exit().remove();
    const entriesEnter = entries.enter().append('div')
      .classed('entry', true);
    entries = entries.merge(entriesEnter);

    entriesEnter.append('h5');
    entries.select('h5').text(d => d.title);

    entriesEnter.append('div').classed('stars', true);
    const stars = entriesEnter.select('.stars');
    this.drawStars(stars);
    const self = this;
    stars.on('mouseenter', function (event, d) {
      uki.ui.showTooltip({
        target: d3.select(this),
        showEvent: event,
        hideAfterMs: 10000,
        content: `
        <div style="max-width:20em">
          ${self.starDescriptions[d.stars]}
        </div>`
      });
    });

    entriesEnter.append('p');
    entries.select('p')
      .style('display', d => d.description ? null : 'none')
      .text(d => d.description);
  }

  drawStars (selection) {
    let stars = selection.selectAll('.star')
      .data(function (d) {
        const stars = d === undefined ? parseInt(this.dataset.stars) : d.stars;
        return [1, 2, 3, 4, 5, 6].map(thisStar => {
          return { thisStar, stars };
        });
      }, d => d.thisStar);
    stars.exit().remove();
    const starsEnter = stars.enter().append('span')
      .classed('star', true);
    stars = stars.merge(starsEnter);

    stars.html(d => {
      return d.thisStar === 6
        ? (d.stars >= 6 ? '&#10026' : '')
        : d.stars >= d.thisStar ? '&#9733' : '&#9734';
    });
  }
}

export default ExpertiseView;
