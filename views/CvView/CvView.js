/* globals uki, d3 */

class CvView extends uki.View {
  constructor (options = {}) {
    options.resources = options.resources || [];
    options.resources.push(...[
      { type: 'json', url: 'views/CvView/data.json', name: 'data' },
      { type: 'less', url: 'views/CvView/style.less' }
    ]);
    super(options);

    window.addEventListener('beforeprint', () => {
      // Programmatically add contact info to a printed version of the CV...
      // really lame version of obfuscation, but should stop *most* evil
      // spammers
      this.d3el.select('.contactInfo')
        .append('p').html('alex.r.bigelow@gmail.com<br/>+1 (801) 300-8525');
    });
    window.addEventListener('afterprint', () => {
      this.d3el.select('.contactInfo').html('');
    });
  }

  get data () {
    return this.getNamedResource('data');
  }

  async setup () {
    await super.setup(...arguments);

    for (const pubChunk of this.d3el.selectAll('.pubchunk').nodes()) {
      const pubType = pubChunk.dataset.type;
      const pubData = this.data.publications[pubType] || {};
      this.drawPublications(d3.select(pubChunk), pubData);
    }
    for (const [pubType, pubs] of Object.entries(this.data.publications)) {
      this.drawPublications(this.d3el.select(`.${pubType}`), pubs);
    }
    this.drawExperience(this.d3el.select('.experience'), this.data.experience, false);
    this.drawExperience(this.d3el.select('.service'), this.data.experience, true);
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

    pubs.classed('hideInPrint', d => d['meta.json']?.contents?.hideInPrint);

    pubsEnter.append('h6')
      .classed('title', true)
      .text(d => d['citation.bib'].contents.title);

    pubsEnter.append('h6')
      .classed('date', true)
      .text(d => d['citation.bib'].contents.year);

    pubs.on('click', (event, d) => {
      uki.ui.showModal({
        content: modalEl => this.createPubModalContent(d, modalEl),
        buttonSpecs: ['defaultOK']
      });
    });

    pubsEnter.append('ul').classed('meta', true)
      .selectAll('li')
      .data(d => this.getMetaFields(d)).enter().append('li')
      .attr('class', d => d.fieldname)
      .text(d => d.fieldvalue);
  }

  getMetaFields (pub) {
    return [
      ['award'],
      ['booktitle', 'journal', 'howpublished'],
      ['joinedAuthorList']
    ].map(fieldnames => {
      for (const fieldname of fieldnames) {
        const bib = pub['citation.bib'].contents;
        let fieldvalue = bib[fieldname] ||
          (pub['meta.json'] && pub['meta.json'].contents[fieldname]);
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
    }).filter(d => d !== null);
  }

  createPubModalContent (pub, modalEl) {
    modalEl.html('').classed('CV', true);

    modalEl.append('h5').text(pub['citation.bib'].contents.title);
    modalEl.append('ul').classed('meta', true)
      .selectAll('li')
      .data(this.getMetaFields(pub)).enter().append('li')
      .attr('class', d => d.fieldname)
      .text(d => d.fieldvalue);

    // Add buttons for linked files
    const buttonContainer = modalEl.append('div').classed('buttonContainer', true);
    const generateLinkedFileSpec = (key, label) => {
      return {
        key,
        spec: {
          label,
          onclick: () => {
            window.location = pub[key].url;
          }
        }
      };
    };
    const buttonSpecs = [
      generateLinkedFileSpec('publication.pdf', 'Publication PDF'),
      generateLinkedFileSpec('poster.pdf', 'Poster'),
      generateLinkedFileSpec('citation.bib', 'BibTeX Citation')
    ];
    for (const { key, spec } of buttonSpecs) {
      if (pub[key]) {
        spec.d3el = buttonContainer.append('div');
        new uki.ui.ButtonView(spec); // eslint-disable-line no-new
      }
    }

    if (pub['abstract.txt']) {
      modalEl.append('p').html(pub['abstract.txt'].contents);
    }
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
    const entriesEnter = container.selectAll('.entry')
      .data(entriesList).enter().append('div').classed('entry', true)
      .classed('hideInPrint', d => d['meta.json']?.contents?.hideInPrint);
    entriesEnter.append('h6')
      .classed('title', true)
      .text(d => d.contents.data.title);
    entriesEnter.append('h6')
      .classed('date', true)
      .html(d => {
        if (d.contents.data.season) {
          return d.contents.data.season + ' ' + d.contents.data.year;
        } else if (d.contents.data.years) {
          return d.contents.data.years.join(', ');
        } else if (d.contents.data.start === d.contents.data.stop) {
          return d.contents.data.start;
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
          const fieldvalue = d.contents.data[fieldname];
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
