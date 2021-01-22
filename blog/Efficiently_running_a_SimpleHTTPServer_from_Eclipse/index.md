I've started working a lot more with straight javascript and HTML, and I've never been quite satisfied with the workflow in Eclipse. Sure, there's a built-in web browser or real-ish Apache or Tomcat servers you can set up with a lot of reading and patience. There's also a cute Eclipse web browser that rarely renders anything the same as Chrome, Firefox, Safari, or anything that anyone actually uses... that, and you're just looking at files like you'd see them if, in Chrome, you went to File ->; Open File...

Sometimes all you need is just a quick way to actually serve files and see how they behave in a real browser. There probably <b>is</b> a better way to do this in Eclipse, but I couldn't find any good documentation about how to pull it off.

Here's my workaround for OS X (it shouldn't be too hard to adapt to Linux or Windows):

Create a file like this in the project:

```bash
#!/bin/bash
cd `dirname "${BASH_SOURCE[0]}"`
python -m SimpleHTTPServer 8123
```

Save it as "run.command" in the directory you want to serve files from.

Open a terminal, `cd` to the directory, and `chmod a+x run.command`

In Eclipse, right+click on the file, and go to "Open With ->; System Editor"

From now on, every time you double click run.command, a server will start up (you'll get a terminal window that spits out python's logs). When you're done testing, you'll want to hit Control+C in this window to shut it down. To prevent lots of terminal windows from accumulating, you can go to "Terminal ->; Preferences... ->; Settings ->; Shell" and under "When the shell exits", select "Close if the shell exited cleanly"

Point your favorite web browser at <a href="http://localhost:8123/">http://localhost:8123</a>.&nbsp;You should see the files of that directory listed, and pages should display normally.

For an even more efficient workflow, make a system bookmark by dragging the icon next to the address to the desktop.

<img src="/blog/Efficiently_running_a_SimpleHTTPServer_from_Eclipse/screenshot.jpg"/>

OS X will call it something like "Directory Listing for -.webloc". Rename it to "run.webloc" and add it to your project directory next to run.command.

Now to test a project, there are just two double clicks: first on run.command, then on run.webloc. When you're done testing, close the browser window, click the terminal, and hit Control-C.
