---
layout: post
title:  "Setting up this site"
date:   2016-1-1 15:00:00
categories: web design
---
It's a new year, and it's time for a new site design. Until now, I've had all my stuff scattered everywhere, relying on other services to host my content. It's been split between Blogger and my personal site (which was really just an ugly single HTML page built by scraping my Github README.md files).

The time has come to integrate, and helping build my research group's [web page](http://vdl.sci.utah.edu) has inspired me to rebuild my own site with Jekyll and host it on Github Pages.

Consequently, I followed [this](https://help.github.com/articles/using-jekyll-with-pages/) guide to get started.

## Scrapping the boilerplate design
Of course, being a design control freak, my first reaction was to start hacking the contents of `css` and `_sass` in the template that I was given. At first, I only did little things for educational purposes. Eventually, I realized that there wasn't really all that much magic going on in the various class names that the boilerplate had, so I decided to start from scratch. I emptied all of the `.css` and `.scss` files (except `_syntax-highlighting`) so I could establish my own rules and not have to deal with whatever crap they already had there. This also liberated me, so that I didn't have to care about class names and special `div` nesting conventions in all the HTML snippets.

Sure, by doing this, I sacrificed the nice reactive CSS that they've got going on there. But I personally hate reactive CSS: layout is, in many ways, the most important piece of design, and I prefer to respond to varying display and window sizes myself with Javascript, D3, and my own CSS rules than to trust it to some magic reactive CSS voodoo that's supposed to "solve" layout for me. As of this writing, I know, the layout isn't all that impressive. But it should look much better soon.

## Using my Github project README files
My old site, though terrible, had one nice thing going for it. To update the site, I just ran a shell script that scraped my Github README.md files, which in turn were embedded into the web page using [showdown.js](https://github.com/showdownjs/showdown). Consequently, my most important content—information about my projects—was always fresh and direct from the repository.

### Detour: Trying to do it with Jekyll
I wanted this kind of farm-to-table magic in Jekyll, but doing it is tricky. Ultimately, I realized a better approach without even using Jekyll, but here are some ideas if you're trying to accomplish it this way.

Unfortunately, you can't just `{% raw %}{% include https://some.url/README.md %}{% endraw %}`, because `include` expects a local file, not a URL.

The [gist](http://jekyllrb.com/docs/templates/#gist) command is <i>really</i> close to what we want... but it's specific to gists, not regular repositories.

There are some plugins that people have put on [stackoverflow](http://stackoverflow.com/questions/14958294/including-external-files-in-a-jekyll-template) [and](http://stackoverflow.com/questions/21820032/in-jekyll-liquid-can-include-be-used-to-import-from-absolute-links-other-urls) [Github](https://github.com/Rolinh/jekyll-remote-markdown/blob/master/remote_markdown.rb) that do this sort of thing, but unfortunately, Github Pages doesn't support plugins. There's a workaround to use plugins with Github Pages outlined [here](http://www.sitepoint.com/jekyll-plugins-github/) (there's another bonus way of doing it in the comments), but these approaches are pretty hacky.

If I was going to go as far as the last idea and make a rakefile to let me use a plugin just to pull some Markdown files from the web, I realized I might as well resurrect my old scraping shell script, add `bundle exec jekyll build` to the end of it, and run it instead.

### Doing it on the fly in the browser
It occurred to me that I'd always have to run `jekyll build` and push to Github Pages every time I updated one of my repository README files if I wanted those changes reflected in my site.

A cooler idea that occurred to me would be to reuse a technique I used on my old site: load and parse the pages live in the browser. Granted, performance suffers a little by doing the Markdown-to-HTML conversion on the fly. But there are advantages: the live approach guarantees that we have the freshest content (as soon as I commit to a repository, the changes are automatically updated on my webpage without any special hooks), and I wouldn't have to do any of the hacky things from the last section.

On the old site, I used this approach because I was too lazy to figure out how to convert stuff before hosting, but either way I had to scrape Github with a script to avoid cross-domain scripting problems. But now that I'm shifting to Github Pages, we have a cool side-effect: the READMEs that we're pulling are from the same domain (Github)!

I ended up creating a `projects` directory containing HTML files with *only* header material like this (though extra content wouldn't be problematic if I wanted to add something to the project web page, but not the README):

{% highlight yaml %}{% raw %}
---
name: hanpuku
layout: project
readme: https://raw.githubusercontent.com/alex-r-bigelow/hanpuku/master/README.md
downloads:
    Illustrator Extension: http://www.cs.utah.edu/~abigelow/Downloads/hanpuku/hanpuku.0.1.7.zxp
repository: https://github.com/alex-r-bigelow/hanpuku
---
{% endraw %}{% endhighlight %}

I then added a `project.html` template to the `_layouts` directory that does the strange Markdown embedding stuff:

{% highlight html %}{% raw %}

---
layout: default
---

<script type="application/javascript" src="/scripts/showdown/showdown.min.js"></script>

<div class="project">
    <div class="downloads">
        {% for download in page.downloads %}
            <a href="{{ download[1] }}">Download {{ download[0] }}</a>
        {% endfor %}
    </div>
    <div id="markdownContent">{{ page.readme }}</div>
</div>

<script type="application/javascript">
var githubConverter = new showdown.Converter();

function embedMarkdown(url, target) {
    "use strict";
    jQuery.ajax({
        url: url,
        type: 'get',
        dataType: 'text',
        async: false,
        success: function (result) {
            target.innerHTML = githubConverter.makeHtml(result);
        },
        error: function () {
            target.innerHTML = "<p>Error loading page.</p>";
        }
    });
}

var contentObj = document.getElementById('markdownContent');
embedMarkdown(contentObj.textContent, contentObj);
</script>

{% endraw %}{% endhighlight %}

## Enough for now
I'm sure I'll add more to the site in the future; it still needs a lot of pop and sparkle, but for now all the typography is set nicely to the background grid, and the basic project content from Github is working.

The landing page still just boringly lists the posts, and I still need to fill in the CV content---I'm thinking about whether there would be a way to parse BibTeX files for my publication entries.

I'm also planning to design and implement some kind of crazy, integrated visualization of my data from lots of sources---integrating blog posts with stuff like tweets, Facebook posts, Github commits, and progress toward Beeminder goals.

But these are separate undertakings, so I should probably break them into their own articles.