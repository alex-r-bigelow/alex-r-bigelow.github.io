Of course, with another version of OS X, we have more problems with Macfusion.<br />
<br />
The first problem you'll encounter with a fresh, normal installation is the "Authentication has failed" error. With the help of <a href="https://github.com/mgorbach/macfusion2/issues/32">this thread</a>, it turns out that XQuartz needs to be installed as well (I know, <i>that's</i> intuitive...).<br />
<br />
Here's the current workaround:<br />
<br />
<ul>
<li>Install <a href="http://osxfuse.github.io/">OSXFUSE</a> (with the MacFUSE Compatibility Layer)</li>
<li>Install <a href="http://macfusionapp.org/">MacFusion</a></li>
<li>Install <a href="http://xquartz.macosforge.org/landing/">XQuartz</a></li>
</ul>
After this, I got the good old "Mount process has terminated unexpectedly" error when I tried to mount my home directory on the server as an SSHFS volume. After inspecting logs in the Console, it looks like it doesn't like an empty or relative Path (I had tried leaving it blank or setting it to ~/). It works with absolute paths, though.
