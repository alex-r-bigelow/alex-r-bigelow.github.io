<span style="color: var(--error-color)">UPDATE: As has happened several times, the <a href="http://tinkerpop.incubator.apache.org/">tinkerpop documentation</a> has completely changed, so the Titan parts of this guide are no longer accurate (not even close). Fortunately, their tutorials are a little more complete this time, so I recommend starting there if you want to use Titan. I'll write a new post soon if I get a chance...</span><br />
<h3>
Audience</h3>
This post is intended for people who know what a graph is, but are completely new to graph databases. If, like me, you've tried to understand all the jargon surrounding them, or actually tried to get started using one, you have probably gotten very frustrated. It helps to realize that this space is still very bleeding-edge, as in:<br />
<br />
<div style="text-align: center;">
<i>"On the cutting edge, you cut. On the bleeding edge, you bleed."</i></div>
<br />
These are my notes that I've collected over the last few weeks – they're just my impressions from the documentation that I've encountered. If you feel that I've misrepresented your favorite tool / framework / whatever, please correct me, or, better yet, fix your tools / documentation so that people don't come off with these impressions.<br />
<br />
Disclaimer: if you're on Windows, commands may be a bit different.<br />
<br />
<h3>
Getting started quickly</h3>
Neo4j and Titan are probably your best options when it comes to easy installation. They are database systems (like Postgres or mongodb), except they are dedicated to graphs (Titan is technically more of a layer on top of HBase, Cassandra, or BerkleyDB, but for getting started you might as well think of it as its own thing).<br />
<br />
Both have a package that you can just download, decompress, run a script in the bin/ directory, and you'll technically be in business.<br />
<br />
<h3>
Neo4j</h3>
Neo4j is the easiest:<br />
<br />
Download the community edition <a href="http://neo4j.com/download/">here</a>, and decompress it anywhere you like (you'll be running the server from the folder, in case that helps your decision). Then on the command line, type:<br />
<br />
<code>./neo4j-community-2.2.3/bin/neo4j start</code><br />
<br />
If you get warnings / errors about your JVM (e.g. you're using OS X), you'll want to install Java 7 (I don't think 8 is supported yet), and add this to ~/.bash_profile:<br />
<br />
<code>export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk1.7.0_79.jdk/Contents/Home</code><br />
<br />
Next, open <a href="http://localhost:8080/">http://localhost:8080</a> in your browser.<br />
<br />
At this point you probably don't need this guide (you probably don't need it to begin with), but if you're like me, you want at least a rough idea of whether learning to use Neo4j is worth your time. Here are my impressions:<br />
<br />
Cypher (neo4j's special query language) is really easy to learn and use, but it's not quite as powerful as Gremlin (more on that later)... so if you start building a tool that uses Cypher, you'll be locked in with Neo4j. This is a problem, because the community (free) edition of Neo4j doesn't scale beyond one machine. On the flip side, if your project uses Gremlin, it should work with a variety of database backends, including (allegedly) Neo4j. As of this writing, it doesn't actually work (something to do with Gremlin not working with Neo4j version 2...) but it should eventually.<br />
<br />
That said, learning Cypher was worth it, even though it's not going to end up as part of the tool I'm developing. Normally, I hate it when people say things like this (I've got a deadline, man! I don't have time for this!), but I think in this case, just getting a feel for graph databases in a non-threatening environment really may save you time in the long run. Every other graph database environment that I've encountered has been pretty threatening – outside of Neo4j, documentation is usually very poor, and installations and configurations are very elaborate.<br />
<br />
<h3>
Titan</h3>
Titan's pre-packaged bundles are probably the easiest way to get started with something scalable that works with the Gremlin query language out of the box:<br />
<br />
<a href="https://github.com/thinkaurelius/titan/wiki/Downloads">https://github.com/thinkaurelius/titan/wiki/Downloads</a><br />
If you don't know the difference, just go with the latest Hadoop 2 bundle.<br />
<br />
Once you decide to work outside the cozy world of Neo4j and Cypher, you're suddenly exposed to all kinds of jargon; sometimes it's not even easy to figure out what you're downloading. And, unfortunately, there are lots of out-of-date guides out there, so as you google around, be aware that what you are reading may not even apply any more. Welcome to the bleeding edge.<br />
<br />
To get started with Titan, run<br />
<br />
<code>./titan-0.5.4-hadoop2/bin/titan.sh start</code><br />
<br />
and go to <a href="http://localhost:8182/doghouse">http://localhost:8182/doghouse</a><br />
<br />
There's a nice web interface, where you can write Gremlin, search and visualize bits of the graph. As a visualization researcher, I was actually somewhat impressed – it seems to do one simple thing reasonably well (traversing the graph one node at a time), and doesn't commit any of the typical heinous visualization sins.<br />
<br />
Titan's documentation has a good <a href="http://s3.thinkaurelius.com/docs/titan/0.9.0-M2/getting-started.html">walkthrough</a> that will give you a taste for Gremlin.<br />
<br />
<h3>
Jargon!</h3>
Technically, the interface you see at localhost:8182/doghouse is part of the <b>Rexster</b> project that Titan has nicely included for you. Rexster, in turn, is part of the <b>Tinkerpop</b> stack. The Tinkerpop stack consists of several projects, including <b>Blueprints</b>, Rexster, <b>Furnace</b>, <b>Frames</b>, Gremlin, and <b>Pipes</b>. What's really confusing about each of these is that each project defines itself in terms of the others – it's really hard to parse what the *#&amp;! each does, and why I should care.<br />
<br />
With Titan's nice bundle, we can ignore most of this crap, and only worry about Rexster and Gremlin. Rexster is a "graph server" – meaning something that exposes one or more graph databases to make it easy for programs to use the database without caring what the database actually is. In other words, as long as I've written my queries with the Gremlin language, I shouldn't have to care whether the database is Titan or Neo4j (I think Blueprints is technically the project that encapsulates this abstract idea, and Rexster is the software layer that makes it possible).<br />
<br />
Initially, I tried setting up Rexster to talk to Neo4j, but aside from the configuration file hell, there are compatibility issues between the two – for learning purposes and initial development with Gremlin, you're probably best off if you just use Titan's bundle.<br />
<br />
<h3>
Coming Soon: Using the database</h3>
The web interfaces are nice, but how to get my program to communicate? There are great libraries for connecting directly to Neo4j (py2neo, etc), but there isn't really much that can connect to Rexster. I'm in the middle of this mess – hopefully I'll do another post soon with more clear guidance on how to load data and query from Node.js. For now, in case it's useful, here are some of my notes:<br />
<br />
Mistake #1: the bulbs python libary. It's really buggy and I don't think it's maintained anymore.<br />
<br />
Mistake #2: tried to load packets of data with grex (a Node.js library), but ran into errors with no way to debug. I think I'll be able to use grex to query, but loading data is a different story. Interestingly, Titan lists bulk-loading as an "Advanced Topic"... yet it looks like the only place in the documentation that actually talks about how to get data in.<br />
<br />
Current approach (probably a mistake): I'm reshaping my data into "GraphSON format"&nbsp;(not a real thing yet, afaik), that I'll just load with the gremlin console in the web interface. Weird nuances / notes so far:<br />
<br />
<ul>
<li>g.loadGraphJSON() doesn't exist anymore – it was replaced by g.loadGraphSON()</li>
<li>I've discovered two approaches to GraphSON: while the Titan bundle ships with example files that are lists of nodes that respectively contain lists of edges, g.loadGraphSON() expects separate node and edge lists...</li>
</ul>
