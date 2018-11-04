/* globals d3 */

function renderPublications (pubType) {
  let pubs = this.d3el.select('#' + pubType)
    .selectAll('.publication').data(this.publications
      .filter(d => d.type === pubType));
  let pubsEnter = pubs.enter().append('details')
    .attr('class', 'publication');
  let summaryEnter = pubsEnter.append('summary');
  summaryEnter.append('h4');
  summaryEnter.append('span')
    .attr('class', 'dates');
  summaryEnter.append('p')
    .attr('class', 'people');
  summaryEnter.append('p')
    .attr('class', 'award');
  let metaLinesEnter = pubsEnter.append('ul')
    .attr('class', 'meta');
  metaLinesEnter.append('li').attr('class', 'journal');
  metaLinesEnter.append('li').attr('class', 'note');
  pubsEnter.append('div')
    .attr('class', 'downloads');
  pubsEnter.append('div')
    .attr('class', 'abstract');

  pubs = pubsEnter.merge(pubs);
  pubs.select('summary').select('h4')
    .text(d => d.title);
  pubs.select('summary').select('.dates')
    .text(d => d.year);
  pubs.select('summary').select('.people').text(d => d.authors.join(', '));
  pubs.select('summary').select('.award')
    .text(d => {
      if (d.award) {
        return d.award;
      } else if (d.note && d.note.search(/selected/i) !== -1) {
        return d.note;
      } else {
        return '';
      }
    }).attr('class', d => {
      if (d.award || (d.note && d.note.search(/selected/i) !== -1)) {
        return 'visible award';
      } else {
        return 'award';
      }
    });
  pubs.select('.meta').select('.journal').text(d => d.journal);
  pubs.select('.meta').select('.note').text(d => d.note);
  let downloads = pubs.select('.downloads').selectAll('.download')
    .data(d => {
      let result = {};
      if (d.pdf) {
        result.Paper = { link: d.pdf };
      }
      if (d.bibtex) {
        result['BibTeX Citation'] = { link: d.bibtex };
      }
      if (d.supplement) {
        result['Supplemental Material'] = { link: d.supplement };
      }
      if (d.supplements) {
        d.supplements.forEach(s => {
          result[s.name] = { link: s.link || s.abslink };
          if (s.linksym) {
            result[s.name].linksym = true;
          }
        });
      }
      Object.keys(result).forEach(k => {
        let v = result[k];
        if (!(v.link.startsWith('http'))) {
          // Because I steal my publication markdown files directly
          // from my group's web page, relative links actually refer
          // to that domain...
          result[k].link = 'http://sci.utah.edu/~vdl/papers/' + v.link;
        }
      });
      return d3.entries(result);
    });
  downloads.exit().remove();
  let downloadsEnter = downloads.enter().append('div')
    .attr('class', 'download');
  downloadsEnter.append('img');
  downloadsEnter.append('span');
  downloads = downloadsEnter.merge(downloads);
  downloads.on('click', d => {
    window.open(d.value.link, '_blank');
  });
  downloads.select('img')
    .attr('src', d => {
      if (d.value.linksym) {
        return Images.link;
      } else {
        let extension = d.value.link.match(/\.([^\.]*)$/)[1];
        return Images[extension] || Images.link;
      }
    });
  downloads.select('span')
    .text(d => d.key);
  pubs.select('.abstract').html(d => d.abstract || d.__content);
}

function renderExperience () {
  let exps = this.d3el.select('#experience')
    .selectAll('.experience').data(this.experience);
  let expsEnter = exps.enter().append('details')
    .attr('class', 'experience');
  let summaryEnter = expsEnter.append('summary');
  summaryEnter.append('h4');
  summaryEnter.append('span')
    .attr('class', 'dates');
  expsEnter.append('p')
    .attr('class', 'people');
  expsEnter.append('ul')
    .attr('class', 'meta');
  expsEnter.append('div')
    .attr('class', 'abstract');

  exps = expsEnter.merge(exps);
  exps.select('summary').select('h4')
    .text(d => d.title);
  exps.select('summary').select('.dates')
    .text(d => d.year ? d.season + ' ' + d.year : `${d.start} - ${d.stop}`);
  exps.select('.people').text(d => d.reference);
  let metaLines = exps.select('.meta').selectAll('li').data(d => d.meta);
  metaLines.enter().append('li')
    .merge(metaLines)
    .text(d => d);
  exps.select('.abstract').html(d => d.__content);
}

window.addEventListener('load', () => {
  // I steal my publication data from my research group's page; it has an
  // extra level of abstraction with regard to people that we need to flatten
  // here
  let peopleLookup = {
    'bigelow': 'Alex Bigelow',
    'meyer': 'Miriah Meyer',
    'mckenna': 'Sean McKenna',
    'quinan': 'Sam Quinan'
  };
  let pubTypeOrder = ['paper', 'thesis', 'poster'];

  publications = [];
  let loader = require.context('./Publications/', true, /\.md$/);
  loader.keys().forEach(key => {
    let pub = loader(key);
    if (!pub.authors) {
      pub.authors = [pub.author];
    }
    pub.authors.forEach((d, i) => {
      if (d in peopleLookup) {
        pub.authors[i] = peopleLookup[d];
      }
    });
    this.publications.push(pub);
  });
  this.publications.sort((a, b) => {
    if (a.type !== b.type) {
      return pubTypeOrder.indexOf(a.type) - pubTypeOrder.indexOf(b.type);
    } else {
      return b.year - a.year;
    }
  });

  this.experience = [];
  loader = require.context('./Experience/', true, /\.md$/);
  loader.keys().forEach(key => {
    this.experience.push(loader(key));
  });
  this.experience.sort((a, b) => {
    a = a.year ? a.year : a.stop;
    a = a === 'Present' ? Infinity : a;
    b = b.year ? b.year : b.stop;
    b = b === 'Present' ? Infinity : b;
    return b - a;
  });

  renderPublications('paper');
  renderPublications('poster');
  renderPublications('thesis');
  renderExperience();
});
