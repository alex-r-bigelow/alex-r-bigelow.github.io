---
layout: publication
# The quotes make the : possible, otherwise you can do it without quotes
title: "Visualizing a Moving Target: A Design Study on Task Parallel Programs in the Presence of Evolving Data and Concerns"
key: 2019_infovis_atria
# paper | preprint | poster
type: paper
redirect_from: /publications/2019_infovis_atria

# The shortname is used for auto-generated titels
shortname: Atria
# add a 2:1 aspect ratio (e.g., width: 400px, height: 200px) to the folder /assets/images/papers/
image: 2019_infovis_atria.png

# Authors in the "database" can be used with just the key (lastname). Others can be written properly.
authors:
  - Katy Williams
  - bigelow
  - Kate Isaacs

journal: IEEE Transactions on Visualization and Computer Graphics (InfoVis ’19)
year: 2019
# Add things like "Best Paper Award at InfoVis 2099, selected out of 4000 submissions"
# award: Best Paper Award

pdf: 2019_infovis_atria.pdf

bibtex: 2019_infovis_atria.bib

abstract: "
<p>Common pitfalls in visualization projects include lack of data availability and the domain users’ needs and focus changing
too rapidly for the design process to complete. While it is often prudent to avoid such projects, we argue it can be beneficial to engage
them in some cases as the visualization process can help refine data collection, solving a “chicken and egg” problem of having the
data and tools to analyze it. We found this to be the case in the domain of task parallel computing where such data and tooling is an
open area of research. Despite these hurdles, we conducted a design study. Through a tightly-coupled iterative design process, we
built Atria, a multi-view execution graph visualization to support performance analysis. Atria simplifies the initial representation of the
execution graph by aggregating nodes as related to their line of code. We deployed Atria on multiple platforms, some requiring design
alteration. We describe how we adapted the design study methodology to the “moving target” of both the data and the domain experts’
concerns and how this movement kept both the visualization and programming project healthy. We reflect on our process and discuss
what factors allow the project to be successful in the presence of changing data and user needs.</p>"
---
