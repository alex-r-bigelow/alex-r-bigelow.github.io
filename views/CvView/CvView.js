/* globals uki, d3 */

class CvView extends uki.View {
  constructor(options = {}) {
    options.resources = options.resources || [];
    options.resources.push(
      ...[
        { type: 'json', url: '/views/CvView/data.json', name: 'data' },
        { type: 'less', url: '/views/CvView/style.less' }
      ]
    );
    super(options);

    window.addEventListener('beforeprint', async () => {
      // Programmatically add contact info to a printed version of the CV...
      // really lame version of obfuscation, but this should stop *most* evil
      // spammers
      this.d3el
        .select('.contactInfo')
        .append('p')
        .html(
          '<small>An interactive version of this CV is available at:</small><br/><a href="https://alex-r-bigelow.github.io">https://alex-r-bigelow.github.io</a><br/>alex.r.b' +
            'igelow@gm' +
            'ail.com<br/>+1 (8' +
            '01) 30' +
            '0-85' +
            '25'
        );
      // Switch lenghty paper section to a shorter one for printing
      this.d3el.select('[data-type="papers"] h5').text('Papers');
    });
    window.addEventListener('afterprint', () => {
      this.d3el.select('.contactInfo').html('');
      // Switch lenghty paper section to a shorter one for printing
      this.d3el
        .select('[data-type="papers"] h5')
        .text('Refereed Conference and Journal Papers');
    });
    this.hashLookup = {};
    window.addEventListener('hashchange', () => {
      this.openHashedModal();
    });

    window.enableFullPrint = () => {
      window.fullPrintEnabled = true;
      d3.selectAll('.showInFullPrint').classed('hideInPrint', false);
      d3.selectAll('.hideInFullPrint').classed('showInPrint', false);
      d3.selectAll('.extraMarginAboveInFullPrint').classed(
        'extraMarginAbove',
        true
      );
      this.render();
    };
  }

  get data() {
    return this.getNamedResource('data');
  }

  async setup() {
    await super.setup(...arguments);

    console.log(
      'Easter egg! Type enableFullPrint() if you want to print a multi-page version of this'
    );
  }

  async draw() {
    await super.draw(...arguments);

    for (const pubChunk of this.d3el.selectAll('.pubchunk').nodes()) {
      const pubType = pubChunk.dataset.type;
      const pubData = this.data.publications[pubType] || {};
      for (const [key, pub] of Object.entries(pubData)) {
        pub.hash = key;
        this.hashLookup['#' + key] = pub;
      }
      this.drawPublications(d3.select(pubChunk), pubData);
    }
    for (const exp of Object.values(this.data.experience)) {
      exp.hash = exp.name;
      this.hashLookup['#' + exp.name] = exp;
    }
    this.drawExperience(
      this.d3el.select('.experience'),
      this.data.experience,
      false
    );
    this.drawExperience(
      this.d3el.select('.service'),
      this.data.experience,
      true
    );
    this.openHashedModal();
  }

  drawPublications(container, pubData) {
    const pubList = Object.values(pubData).sort((a, b) => {
      return b['citation.bib'].contents.year - a['citation.bib'].contents.year;
    });
    if (pubList.length === 0) {
      container.style('display', 'none');
      return;
    }
    let pubs = container.selectAll('.entry').data(pubList);
    pubs.exit().remove();
    const pubsEnter = pubs.enter().append('div').classed('entry', true);
    pubs = pubs.merge(pubsEnter);

    pubs.classed(
      'hideInPrint showInFullPrint',
      (d) => d['meta.json']?.contents?.hideInPrint
    );

    pubsEnter
      .append('h6')
      .classed('title', true)
      .attr('id', (d) => d.hash)
      .text((d) => d['citation.bib'].contents.title);

    pubsEnter
      .append('h6')
      .classed('date', true)
      .text((d) => d['citation.bib'].contents.year);

    pubs.on('click', (event, d) => {
      const hash = '#' + d.hash;
      if (window.location.hash === hash) {
        this.showModal(d);
      } else {
        window.location.hash = '#' + d.hash;
        // automatically calls this.showModal(d)
      }
    });

    pubsEnter.append('ul').classed('meta', true);

    let meta = pubs
      .select('.meta')
      .selectAll('li')
      .data((d) => this.getPubMetaFields(d));
    const metaEnter = meta
      .enter()
      .append('li')
      .attr('class', (d) => d.fieldname);
    meta = meta.merge(metaEnter).text((d) => d.fieldvalue);
  }

  getPubMetaFields(pub) {
    return [
      ['award'],
      ['booktitle', 'journal', 'howpublished'],
      ['joinedAuthorList']
    ]
      .map((fieldnames) => {
        for (const fieldname of fieldnames) {
          const bib = pub['citation.bib'].contents;
          const metadata = bib[fieldname]
            ? bib
            : pub['meta.json']?.contents || {};
          let fieldvalue = metadata[fieldname];
          if (fieldvalue) {
            // Add / change extra info for some fields:
            if (fieldname === 'journal' && bib.volume && bib.pages) {
              fieldvalue += ` ${bib.volume}:${bib.pages}`;
            }
            if (fieldname === 'booktitle' && bib.pages) {
              fieldvalue += ` pp. ${bib.pages}`;
            }
            if (
              !window.fullPrintEnabled &&
              fieldname === 'joinedAuthorList' &&
              metadata.authorList?.length > 6 &&
              metadata.shortAuthorList
            ) {
              fieldvalue = metadata.shortAuthorList;
            }
            return { fieldname, fieldvalue };
          }
        }
        return null;
      })
      .filter((d) => d !== null);
  }

  getExpMetaFields(exp) {
    const basic = [
      { fieldname: 'reference', fieldvalue: exp.contents.data.reference },
      { fieldname: 'timestamp', fieldvalue: this.formatExpTimestamp(exp) }
    ];

    return basic.concat(
      exp.contents.data.meta.map((meta) => {
        return { fieldname: 'expDetail', fieldvalue: meta };
      })
    );
  }

  formatExpTimestamp(exp) {
    if (exp.contents.data.season) {
      return exp.contents.data.season + ' ' + exp.contents.data.year;
    } else if (exp.contents.data.years) {
      return exp.contents.data.years.join(', ');
    } else if (exp.contents.data.start === exp.contents.data.stop) {
      return exp.contents.data.start;
    } else {
      return exp.contents.data.start + '&ndash;' + exp.contents.data.stop;
    }
  }

  openHashedModal() {
    const pub = this.hashLookup[window.location.hash];
    if (pub) {
      this.showModal(pub);
    }
  }

  showModal(d) {
    let title, metaFields, buttonSpecs, body;
    if (d['citation.bib']) {
      // Publication
      title = d['citation.bib'].contents.title;
      metaFields = this.getPubMetaFields(d);
      buttonSpecs = this.getPubButtonSpecs(d);
      body = d['abstract.txt']?.contents || '';
    } else {
      // Experience
      title = d.contents.data.title;
      metaFields = this.getExpMetaFields(d);
      buttonSpecs = Object.entries(d.contents.data.links || []).map(
        ([key, value]) => {
          return {
            label: key,
            onclick: () => {
              window.location = value;
            }
          };
        }
      );
      body = d.contents.content;
    }

    uki.ui.showModal({
      content: (modalEl) =>
        this.createModalContent(title, metaFields, buttonSpecs, body, modalEl),
      buttonSpecs: ['defaultOK']
    });
  }

  getPubButtonSpecs(pub) {
    const generateLinkedFileSpec = (key, label, accessor) => {
      return {
        key,
        spec: {
          label,
          onclick: () => {
            window.location = pub[key][accessor];
          }
        }
      };
    };
    return [
      generateLinkedFileSpec('publication.pdf', 'Publication PDF', 'url'),
      generateLinkedFileSpec(
        'publication.url',
        'Link to Publication',
        'contents'
      ),
      generateLinkedFileSpec('demo.url', 'Demo Video', 'contents'),
      generateLinkedFileSpec('results.url', 'Survey Results', 'contents'),
      generateLinkedFileSpec('talk.url', 'Presentation Video', 'contents'),
      generateLinkedFileSpec('slides.url', 'Presentation Slides', 'contents'),
      generateLinkedFileSpec('supplement.pdf', 'Supplemental PDF', 'url'),
      generateLinkedFileSpec('supplement.zip', 'Supplemental Archive', 'url'),
      generateLinkedFileSpec('osf.url', 'Supplemental Data', 'contents'),
      generateLinkedFileSpec('poster.pdf', 'Poster', 'url'),
      generateLinkedFileSpec('citation.bib', 'BibTeX Citation', 'url')
    ]
      .filter(({ key }) => !!pub[key])
      .map(({ spec }) => spec);
  }

  createModalContent(title, metaFields, buttonSpecs, body, modalEl) {
    modalEl.html('').classed('CV', true);

    modalEl.append('h5').text(title);
    modalEl
      .append('ul')
      .classed('meta', true)
      .selectAll('li')
      .data(metaFields)
      .enter()
      .append('li')
      .attr('class', (d) => d.fieldname)
      .html((d) => d.fieldvalue);

    // Add buttons for linked files
    const buttonContainer = modalEl
      .append('div')
      .classed('buttonContainer', true);
    for (const spec of buttonSpecs) {
      spec.d3el = buttonContainer.append('div');
      new uki.ui.ButtonView(spec); // eslint-disable-line no-new
    }

    if (body) {
      modalEl.append('p').html(body);
    }
  }

  drawExperience(container, experience, service) {
    const entriesList = Object.values(experience)
      .filter((d) => (d.contents.data.service ? service : !service))
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
    let entries = container.selectAll('.entry').data(entriesList);
    const entriesEnter = entries
      .enter()
      .append('div')
      .classed('entry', true)
      .classed(
        'hideInPrint showInFullPrint',
        (d) => d?.contents?.data?.hideInPrint
      );
    entriesEnter
      .append('h6')
      .classed('title', true)
      .text((d) => d.contents.data.title);
    entriesEnter
      .append('h6')
      .classed('date', true)
      .html((d) => this.formatExpTimestamp(d));
    entries = entries.merge(entriesEnter);

    const metaFields = [['meta'], ['reference']];
    entriesEnter.append('ul').classed('meta', true);
    let meta = entries
      .select('.meta')
      .selectAll('li')
      .data((d) =>
        metaFields
          .map((fieldnames) => {
            for (const fieldname of fieldnames) {
              const fieldvalue = d.contents.data[fieldname];
              if (fieldvalue) {
                return { fieldname, fieldvalue };
              }
            }
            return null;
          })
          .filter((d) => d !== null)
      );
    const metaEnter = meta.enter().append('li');
    metaEnter.attr('class', (d) => d.fieldname);
    meta = meta.merge(metaEnter).html((d) => {
      if (d.fieldvalue instanceof Array) {
        const breakTag = window.fullPrintEnabled
          ? '<br/>'
          : '<span class="showInPrint">,&ensp;</span><br class="hideInPrint"/>';
        return d.fieldvalue.join(breakTag);
      } else {
        return d.fieldvalue;
      }
    });

    entriesEnter.on('click', (event, d) => {
      const hash = '#' + d.hash;
      if (window.location.hash === hash) {
        this.showModal(d);
      } else {
        window.location.hash = '#' + d.hash;
        // automatically calls this.showModal(d)
      }
    });
  }
}

export default CvView;
