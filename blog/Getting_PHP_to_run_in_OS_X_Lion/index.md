So I upgraded to OS X Lion over the weekend. Because I'm obsessive, I burned it to a DVD, and did a fresh install on a hard drive I swapped in from a neighbor's dead laptop. Luckily I have a USB-PATA adapter, and just plugged in my old hard drive to copy my files straight over after the installation (check out thinkgeek.com if this sounds like it might help you; they're really handy. You can also probably find a cheaper one than thinkgeek's on ebay if you want to do the leg work).

Anyway, I had a sad little php website in my sites folder—nothing serious for public consumption, but as I work on lots of computers at once, it's handy to just throw a file into my Sites folder so I can access it on another computer without breaking out a flash drive. With the upgrade to OS X Lion, I went through my System Preferences, and turned on Web Sharing, hoping things would work like they did before. Back in Snow Leopard, I had edited /Library/WebServer/Documents/index.html to redirect to /~home/index.php ("home" is my username - yet another obsessive quirk), but when I added this tweak in OS X Lion, I just got the php code itself dumped to the browser.

Obviously, this won't do.

Per much advice on the internets, I tried un-commenting this line in /etc/apache2/httpd.conf:

```
LoadModule php5_module libexec/apache2/libphp5.so
```

(Note: you'll need to change permissions of the file in order to do this... if you don't like the hassle of doing this on the command line, TextWrangler streamlines this a bit if you try to edit the file directly).

Still just gettting php code. Again, this won't do.

After much playing around with options, I tried dropping the "index.php" from my redirect in /Library/WebServer/Documents/index.html

... and suddenly we're in business.

I'm still a little vague on why - if I find the time to investigate, I'll update.
