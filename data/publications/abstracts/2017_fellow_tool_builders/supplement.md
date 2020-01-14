This file summarizes the raw observations, open codes, and resulting themes.

# Collaborators

| ID     | Role                | Gender | Research Area             |
|--------|---------------------|--------|---------------------------|
| **I1** | Mid Grad Student    | F      | Biomedical Computation    |
| **I2** | Mid Grad Student    | F      | Biomedical Computation    |
| **I3** | Staff Developer     | F      | Scientific Computing      |
| **I4** | Research Faculty    | M      | Information Visualization |
| **I5** | Senior Grad Student | M      | Biomedical Computation    |
| **I6** | Senior Grad Student | M      | Biomedical Computation    |
| **I7** | Senior Grad Student | M      | Biomedical Computation    |
| **I8** | New Grad Student    | F      | Scientific Visualization  |

# Raw observations
The very raw data used for this poster takes the form of git commit messages, git histories, emails, Slack conversations, and group meeting notes.
Rather than include all of that data directly (that would include identifying information, etc), extracts of the raw events surrounding the development of each system are summarized below.

## Open House Map Extracts
- **M1**: We used text CSV files on GitHub to hold all the information about what groups would be where, and, later, what individual posters or presentations would be in what area. These csv files had to be refactored a number of times
- **M2**: Though the student committee worked hard for weeks to get details, I ended up having to come in at night to collect poster location information myself, once the posters were finally set up. **I3**'s assigned area was particularly problematic, because the location was changed last-minute
- **M3**: Using an Illustrator SVG map made annotating (e.g. adding restrooms to the map) / changing area shapes easy; most changes in the git history were changes to the spaceAssignments.csv file
- **M4**: **I4** provided useful feedback about the width of the selection bars above each poster name (they were initially squares and hard to click directly, even though the whole text block was technically clickable), but also provided (too much?) feedback about things like typography
- **M5**: An institution-wide meeting (mostly about making sure people created / printed their posters on time) quickly devolved into a debate about the interface... particularly with respect to the map orientation (should North be up? But people exit the elevator, and initially encounter the interactive interface facing South...). However, an important development in this meeting occurred when the task abstraction of the interface changed---some participants indicated that they knew specific visitors that would want to be able to locate individual posters.
- **M6**: Public display on a touch table likely contributed to high engagement - my personal demo was on an equally-sized monitor immediately off the elevator, but most visitors would walk right past me to the touch display in the room behind me (of course, I didn't actively try to stop people to see my demo, and it makes sense that people would want to first orient themselves in a new environment)

## Ping Pong Tournament Extracts
- **P1**: Instead of CSV files on GitHub, we used Google forms / sheets as a pseudo-database for the ping pong tournament. We still used GitHub for hosting the site, but this meant that committee members could check / edit the spreadsheets easily
- **P2**: Setting up a debug / simulation mode was helpful during the live ping pong deployment - **I6** in particular responded quickly to requests to beta test changes to the site before they went live. Because of the google spreadsheets setup, it was easy to see and debug what tests he used to try (and, in some cases, succeed) to trigger bugs.
- **P3**: **I5**, **I6**, and **I7** had very specific ideas of how the pool play / bracket should work. As such, I planned (and succeeded) to outsource the seeding of the bracket to them via a Google spreadsheet
- **P4**: Shortly after the first debugging deployment, **I8** designed and printed promotional posters using the background image... but chose a very different font style and color scheme. Rather than reprint the posters, we felt it best to refactor the interactive system.
- **P5**: This interface required typing in information---initially, we planned to deploy the interface on a touch table, as we had with the open house map. The touch table has a built-in keyboard that can be swiped in from the side---but we needed to add an icon to the interface to make this clear. However, due to a more important project needing the touch table, we had to instead deploy the interface on a monitor by the elevator (actually the same monitor where I gave my demo in the open house), with a keyboard and mouse attached
- **P6**: We initially anticipated more participants---because the limited number that actually signed up was much lower (the vis deadline was partly to blame---we later heard that many more would have signed up, but they were too busy with submissions), we decided to include everyone in the bracket. This necessitated a last-minute rewrite of the code to include BYE / PASS nodes for the highest-seeded players
- **P7**: It proved difficult to get people to actually play their games, particularly when the scheduled players didn't know each other well. Eventually, we had to add forfeits to the pool play phase (again, necessitating a last-minute redesign of the system). This happened again in the bracket---some students began leaving for the summer. Luckily, the few that had left were able to nominate the player they had most recently defeated to play for them, and the change was a simple adjustment to the spreadsheets (more drastic rewrites of the system were not necessary)
- **P8**: Our initial plan was for all participants to pick a charity to represent (**I1** provided a CSV list of 503(c)(3) charities), and non-players could still participate by "betting" on players. However, this garnered little attention / participation. Toward the beginning of the bracket phase, **I6** suggested that we implement a March Madness-style approach, where people could submit their own brackets, and award a secondary prize to the charity picked by the most accurate bracket. Unfortunately, this was too difficult to implement in the short amount of time left in the tournament.
- **P9**: Having the public display also appeared to result in high engagement, though not as much as I observed with the touch table. Passers-by seemed to be hesitant to use the keyboard / mouse... this may have had something to do with the permanent nature of the display (attached to the wall) - normally, the monitor showed a looping video of demonstrations, that people would not normally interfere with.
- **P10**: Some passers-by reported confusion about the triangular edges, particularly in the node-link diagram (are triangles arrowheads pointing to the winner, or does the larger side indicate the winner)?
- **P11**: Though most people that interacted with the interface were very technically savvy, the pool play adjacency matrices proved confusing to some people (not all, however... some people even commented on how intuitive they were). In their design, **I3** provided very useful feedback---initially, I displayed an arrow for an already-played game, pointing to the winner. However, **I3** made it clear that this was confusing; instead, redundantly displaying the name of the winner in the cell made more sense.
- **P12**: **I6** contributed a very minor code fix

# Open Codes

- **O1**: Last-minute system adjustments were common (**M2**, **P4**, **P5**, **P6**, **P7**, **P8**)
- **O2**: Clever engineering tricks made most last-minute adjustments easier to handle (**M3**, **P1**, **P2**, **P7**)
- **O3**: Actual code contributions from collaborators were rare (**P12**)
- **O4**: Spreadsheets encouraged more collaborator help (**M1**, **P1**)
- **O5**: Overall, mixed results getting data from collaborators (**M2**, **P2**, **P3**, **P8**)
- **O6**: Confusion about triangular edges (**P10**)
- **O7**: Confusion / intuition about rotated adjacency matrices (**P11**)
- **O8**: Collaborators' feedback (mostly) insightful (**M4**, **M5**, **P2**, **P11**)
- **O9**: Touch table more engaging than monitor + keyboard / mouse (**M6**, **P9**)

# Themes

## Collaborator Participation
- **A1**: Collaborator technical involvement in the project varied; personality seemed to dictate whether and how much people contributed, rather than interest in the overall project or interest in the technical aspects (**O3**, **O4**, **O5**). Technical involvement did *not* seem to have any relationship with relevant technical skills (**O3**; **I6** is not a web developer).
- **A2**: Collaborators most readily participated when the tools were familiar; google sheets (even with strict rules about structure) were the most freely adjusted. Github CSV files came in second, beta testing the interface itself came in third, and the interface code was barely touched (**O3**, **O4**, **O5**).

## Collaborator Feedback
- **A3**: Most feedback was helpful; compared to non-developer users in typical design studies, people seemed more willing to provide critique (**O8**). The kinds of critique that collaborators suggested tended to be more bounded by their technical knowledge of what is easily changed, and what is difficult to implement (**01**, **02**, **08**)
- **A4**: Some feedback was too specific or failed to capture the scope of the project; dealing with this gracefully is tricky. However, it was a pitfall to automatically assume that all feedback was too specific (**O8**)

## Implications for Visualization Techniques and Deployment
- **A5**: Adjacency matrices were confusing to a subset of a *technical* audience (**O7**)! Artifact of rotated design?
- **A6**: Triangles as arrows are ambiguous (**O6**)
- **A7**: Touch table more engaging than fixed monitor (**O9**)

# Key Takeaways

- Just because a collaborator has the technical ability and the time to contribute, that doesn't mean that they will (**A1**, **A2**)
- The opposite is also true: just because a collaborator doesn't appear to have the technical ability or the time to contribute, that doesn't mean that they won't (**A1**, **A2**)
- Concern about working with fellow tool builders is warranted, but they should not necessarily be avoided---their expertise can be an incredible asset (**A3**, **A4**)
- Some minor details of node-link diagrams and adjacency matrices can have a profound effect on the ability of users to make sense of what is represented (**A5**, **A6**)---where these are employed, a legend is probably necessary
- Touch table vs traditional display: the former seems to naturally produce more engagement / willingness to mess with the system (**A7**)
