/* globals d3, jsyaml, showdown */
const mdConverter = new showdown.Converter();
const LINK_ICONS = {
  'bib': 'images/cv/bib.png',
  'png': 'images/cv/img.svg',
  'svg': 'images/cv/img.svg',
  'pdf': 'images/cv/pdf.svg',
  'zip': 'images/cv/zip.png'
};

function parseMd (text) {
  const frontMatterChunks = text.split(/---\n/);
  let result = {};
  if (frontMatterChunks.length >= 2) {
    result = jsyaml.load(frontMatterChunks[1]);
    result.__content = mdConverter.makeHtml(frontMatterChunks[2]);
  } else {
    result.__content = mdConverter.makeHtml(text);
  }
  return result;
}

function renderPublications (pubType, publications) {
  console.log(publications);
  let pubs = d3.select('#' + pubType)
    .selectAll('.publication').data(publications);
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
  pubs.attr('id', pub => pub.name)
    .property('open', pub => window.location.hash === '#' + pub.name);
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
        return 'images/cv/link.svg';
      } else {
        let extension = d.value.link.match(/\.([^.]*)$/)[1];
        return LINK_ICONS[extension] || 'images/cv/link.svg';
      }
    });
  downloads.select('span')
    .text(d => d.key);
  pubs.select('.abstract').html(d => d.abstract || d.__content);
}

function renderExperience (experience) {
  let exps = d3.select('#experience')
    .selectAll('.experience').data(experience);
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

window.addEventListener('load', async () => {
  await window.pagesPromise;

  // I steal my publication data from my research group's page; it has an
  // extra level of abstraction with regard to people that we need to flatten
  // here
  let peopleLookup = {
    'bigelow': 'Alex Bigelow',
    'meyer': 'Miriah Meyer',
    'mckenna': 'Sean McKenna',
    'quinan': 'Sam Quinan',
    'nobre': 'Carolina Nobre',
    'lex': 'Alexander Lex'
  };
  let pubTypeOrder = ['preprint', 'paper', 'thesis', 'poster'];

  let publications = Object.values(window.data.publications);
  const pubFiles = await Promise.all(publications.map(pub => window.fetch(pub.url)));
  for (const [index, pub] of publications.entries()) {
    const text = await pubFiles[index].text();
    if (pub.extension === 'md' || pub.extension === 'yaml') {
      Object.assign(pub, parseMd(text));
      if (!pub.authors) {
        pub.authors = [pub.author];
      }
      pub.authors = pub.authors.map(author => {
        return peopleLookup[author] || author;
      });
    }
  }
  publications.sort((a, b) => {
    if (a.type !== b.type) {
      return pubTypeOrder.indexOf(a.type) - pubTypeOrder.indexOf(b.type);
    } else {
      return a.year - b.year;
    }
  });

  let experience = Object.values(window.data.jobs);
  const expFiles = await Promise.all(experience.map(exp => window.fetch(exp.url)));
  for (const [index, exp] of experience.entries()) {
    const text = await expFiles[index].text();
    if (exp.extension === 'md') {
      Object.assign(exp, parseMd(text));
    }
  }
  experience.sort((a, b) => {
    a = a.year ? a.year : a.stop;
    a = a === 'Present' ? Infinity : a;
    b = b.year ? b.year : b.stop;
    b = b === 'Present' ? Infinity : b;
    return b - a;
  });
  window.temp = publications;

  if (publications.filter(pub => pub.type === 'preprint').length > 0) {
    renderPublications('preprint', publications.filter(pub => pub.type === 'preprint'));
  } else {
    d3.select('#preprints').remove();
  }
  renderPublications('paper', publications.filter(pub => pub.type === 'paper'));
  renderPublications('poster', publications.filter(pub => pub.type === 'poster'));
  renderPublications('thesis', publications.filter(pub => pub.type === 'thesis'));
  renderExperience(experience);
});
