/* globals d3 */
import { View } from '../../node_modules/uki/dist/uki.esm.js';

class CvView extends View {
  constructor (d3el) {
    super(d3el, [
      { type: 'less', url: 'views/CvView/style.less' }
    ]);
    window.addEventListener('beforeprint', () => {
      // Mechanically add contact info to a printed version of the CV
      this.d3el.select('.contactInfo')
        .append('p').html('alex.r.bigelow@gmail.com<br/>+1 (801) 300-8525');
    });
    window.addEventListener('afterprint', () => {
      this.d3el.select('.contactInfo').html('');
    });
  }
  async setup () {
    await window.controller.ready;
    for (const pubChunk of this.d3el.selectAll('.pubchunk').nodes()) {
      const pubType = pubChunk.dataset.type;
      const pubData = window.controller.resources[0].publications[pubType] || {};
      this.drawPublications(d3.select(pubChunk), pubData);
    }
    for (const [pubType, pubs] of Object.entries(window.controller.resources[0].publications)) {
      this.drawPublications(this.d3el.select(`.${pubType}`), pubs);
    }
    this.drawExperience(this.d3el.select('.experience'), window.controller.resources[0].experience, false);
    this.drawExperience(this.d3el.select('.service'), window.controller.resources[0].experience, true);
  }
  drawPublications (container, pubData) {
    const pubList = Object.values(pubData).sort((a, b) => {
      return b['citation.bib'].contents.year - a['citation.bib'].contents.year;
    });
    if (pubList.length === 0) {
      container.style('display', 'none');
      return;
    }
    let pubs = container.selectAll('.entry').data(pubList);
    pubs.exit().remove();
    const pubsEnter = pubs.enter().append('div')
      .classed('entry', true);
    pubs = pubs.merge(pubsEnter);

    pubsEnter.append('span')
      .classed('title', true)
      .text(d => d['citation.bib'].contents.title);

    pubsEnter.append('span')
      .classed('date', true)
      .text(d => d['citation.bib'].contents.year);

    const metaFields = [
      ['award'],
      ['booktitle', 'journal', 'howpublished'],
      ['joinedAuthorList']
    ];
    pubsEnter.append('ul').classed('meta', true);
    const metaEnter = pubsEnter.select('.meta').selectAll('li')
      .data(d => metaFields.map(fieldnames => {
        for (const fieldname of fieldnames) {
          const bib = d['citation.bib'].contents;
          let fieldvalue = bib[fieldname] ||
            (d['meta.json'] && d['meta.json'].contents[fieldname]);
          if (fieldvalue) {
            // Add extra info for some fields:
            if (fieldname === 'journal' && bib.volume && bib.pages) {
              fieldvalue += ` ${bib.volume}:${bib.pages}`;
            }
            if (fieldname === 'booktitle' && bib.pages) {
              fieldvalue += ` pp. ${bib.pages}`;
            }
            return { fieldname, fieldvalue };
          }
        }
        return null;
      }).filter(d => d !== null)).enter().append('li');
    metaEnter.attr('class', d => d.fieldname)
      .text(d => d.fieldvalue);
  }
  drawExperience (container, experience, service) {
    const entriesList = Object.values(experience)
      .filter(d => d.contents.data.service ? service : !service)
      .sort((a, b) => {
        const aTemp =
          parseInt(a.contents.data.stop) ||
          parseInt(a.contents.data.year) ||
          (a.contents.data.years && Math.max(...a.contents.data.years)) ||
          Infinity;
        const bTemp =
          parseInt(b.contents.data.stop) ||
          parseInt(b.contents.data.year) ||
          (b.contents.data.years && Math.max(...b.contents.data.years)) ||
          Infinity;

        return bTemp - aTemp;
      });
    let entriesEnter = container.selectAll('.entry')
      .data(entriesList).enter().append('div').classed('entry', true);
    entriesEnter.append('span')
      .classed('title', true)
      .text(d => d.contents.data.title);
    entriesEnter.append('span')
      .classed('date', true)
      .html(d => {
        if (d.contents.data.season) {
          return d.contents.data.season + ' ' + d.contents.data.year;
        } else if (d.contents.data.years) {
          return d.contents.data.years.join(', ');
        } else {
          return d.contents.data.start + '&ndash;' + d.contents.data.stop;
        }
      });

    const metaFields = [
      ['meta'],
      ['reference']
    ];
    entriesEnter.append('ul').classed('meta', true);
    const metaEnter = entriesEnter.select('.meta').selectAll('li')
      .data(d => metaFields.map(fieldnames => {
        for (const fieldname of fieldnames) {
          let fieldvalue = d.contents.data[fieldname];
          if (fieldvalue) {
            return { fieldname, fieldvalue };
          }
        }
        return null;
      }).filter(d => d !== null)).enter().append('li');
    metaEnter.attr('class', d => d.fieldname)
      .html(d => {
        if (d.fieldvalue instanceof Array) {
          return d.fieldvalue.join('<br/>');
        } else {
          return d.fieldvalue;
        }
      });
  }
}

export default CvView;
