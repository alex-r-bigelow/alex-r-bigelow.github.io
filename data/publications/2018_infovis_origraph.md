---
layout: publication
title: "Mure.js: Toward Flexible Authoring and Reshaping of Networks"
key: 2018_infovis_origraph
type: poster

shortname: origraph poster
image: 2018_infovis_origraph.png

authors:
- bigelow
- nobre
- lex
- meyer

journal-short: InfoVis Posters
year: 2018

bibentry: inproceedings
bib:
  booktitle: Proceedings of the IEEE Information Visualization Conference - Posters (InfoVis ’18)

pdf: 2018_infovis_origraph.pdf

supplements:
- name: Poster
  link: 2018_infovis_origraph_poster.pdf
- name: Origraph Interface
  abslink: https://origraph.github.io
  linksym: true

code: https://github.com/origraph

abstract: "
<p>When interpreting data as a graph for visualization, an analyst first
assigns semantic meaning to graph concepts. For example, they may
choose to represent actors and movies as nodes, and roles as edges.
Alternatively, they may wish to represent movies as edges, connecting actor nodes when they collaborate. Data abstraction choices such
as these are critical, because different data abstractions can limit—or
inspire—different analysis questions, approaches, perspectives, and
visualizations.</p>
<p>However, current network modeling frameworks, systems, and
databases narrowly define graph abstraction constructs—such as
nodes, edges, node / edge classes, supernodes, hyperedges, etc.—in
terms of how the data is stored in memory or on disk, rather than
semantic, human-driven abstractions. Consequently, the ability of
an analyst to iterate on a data abstraction becomes fundamentally
limited by the implementation details of data wrangling software.</p>
<p>We present work-in-progress toward a broader framework for
modeling network data that is less dependent on its underlying structure and storage. Our goal is to use semantic data abstraction <b>constructs</b> to inform how algorithms wrangle data, instead of allowing
algorithmic concerns to define and constrain the semantics.</p>
<p>We also present <i>mure.js</i>, a software library that represents an
initial implementation of this framework, allowing users to map
semantic graph constructs to arbitrary data structures as metadata,
that can, in turn, be used to select, navigate, and reshape the under-
lying data. Additionally, we discuss an early software prototype of a
visual graph wrangling system based on this library.</p>"
---
