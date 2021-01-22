I have fallen in love with web.py over the last few weeks—if you want a site up and running using Python as a backend just as fast (or faster) than you could with PHP, check it out.

But I did have a devil of a time with sessions, so in case you're using web.py and having problems, here's what I discovered:

<b>Syntax:</b>
You'd expect a normal, pythonic dictionary, but, alas, we don't have this in web.py. To set a value (assuming my session object is named boringly "session," and I want to set "myvalue" to 1):

```
session.myvalue = 1
```

However, to <i>access</i> data, you have to use .get():

```
print session.get("myvalue")
```

will give you that same value back.

<b>Debug Mode:</b>
I spent a good three-ish hours trying to figure out why my session data kept getting nuked. There is actually a <a href="http://webpy.org/cookbook/session_with_reloader">bug</a> in web.py (feel free to comment if/when this gets fixed) that reloads your module twice if you're in debug mode. To fix it, add this after the imports in your code:

```
web.config.debug = False
```

Of course, you end up with a tradeoff while you're working on your site (do I care to see the sometimes-helpful error messages enough to have session stuff broken?), but at least it should work fine when you're ready for the world to use it.
