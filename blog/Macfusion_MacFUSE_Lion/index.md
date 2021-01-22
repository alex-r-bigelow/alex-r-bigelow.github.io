<span style="color: var(--error-color)"><i>UPDATE (4 Nov 2013): I found the problem with Mavericks - the latest workaround is <a href="/blog/MacFusion_OSXFUSE_and_Mavericks">here</a>.</i></span>

<i><strike>UPDATE (29 Oct 2013): I just upgraded to Mavericks, and Macfusion is now broken. I've tried every combination of installations, command-line sshfs programs, etc. that I can find and nothing is working yet. I'll post again if I figure it out, but for now, I guess I'm stuck with Cyberduck. Macfusion should still work if you're running Lion (and maybe Mountain Lion), though.</strike></i>

And another by-product of the Lion upgrade... and a lesson in hasty installations.

Back in Snow Leopard, I had used Macfusion to mount many of the systems that I have ssh access to as devices on my mac - life is so much handier when you can edit and copy files directly without remembering all the proper terminal stuff. You set up the ssh connection once, and forever after you can access your servers with a pull-down menu in the Finder.

After my fresh installation of Lion (see last post), I decided I still wanted this tool, so I downloaded and installed Macfusion, forgetting that back in the day I had to install MacFUSE first. I went to connect to my favorite server, and, what do you know? I get an error:

<div style="color: var(--error-color)">
Mount process has terminated unexpectedly</div>

It took me a few minutes for the "aha! I forgot to install MacFUSE!" So, in my rushed habit, I downloaded the original MacFUSE installer I had used in Snow Leopard, installed, and in its preference pane...

<div style="color: var(--error-color)">
Macfuse does not appear to be installed</div>

Crap. Maybe I need to restart.

Nope.

Okay, maybe Macfusion messed with something by being installed first... After much googling, I figured out how to remove both MacFUSE and Macfusion via a bunch of `sudo rm -rf` statements (yikes!), and installed in the proper order.

Still the same error.

Okay, maybe this is a Lion issue. Googling that... and yes, it turns out MacFUSE doesn't like the uber-64-bit-ness of Lion. Someone suggested a patched version of MacFUSE that <i>should</i> work, no guarantees...

And, of course, it doesn't fly on my machine.

NOW what? In the same forum, someone whispered something about a proper solution that was in the works: <a href="http://osxfuse.github.com/">OSXFUSE</a>. A quick peek at the post date, and, yup, that was six months ago. I wonder if it's farther along now...

Yup. And the installer has a nice backward compatibility mode to MacFUSE—and for obsessive people like me, it also will do the uninstallation of MacFUSE for you as it installs itself so you don't have to do all the unix deleting.

Kudos to Benjamin Fleischer and Erik Larsson. You know software is great when it fixes your problem so fast you hardly remember using it.
