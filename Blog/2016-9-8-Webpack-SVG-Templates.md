Problem: imagine we create an SVG file as a template for a view using webpack:

```xml
<svg>
<g id="Hamburger">
	<image xlink:href="../images/menu/Hamburger.svg"/>
</g>
</svg>
```

You can probably see right off the bat that we're going to have problems. We want to load the *outer* SVG file as a DOM tree, but we want to load the *inner* SVG file as an image.

In the file that loads this template, you can get away with doing this:

```javascript
import template from '-!html?attrs=image:xlink:href!./template.svg';
```

Bit of a summary of what's going on here:

The first `-!` tells webpack to ignore the default loaders for SVG files in `webpack.config.js` (imagine it looks something like this):

```javascript
module.exports = {
  module: {
    loaders: [
      ...
      {
        test: /\.html$/,
        loader: 'html?attrs=img:src'
      },
      {
        test: /\.jpe?g$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$/,
        loader: 'url'
      }
      ...
    ]
  }
};
```

In this specific instance, we *don't* want it to load as an image, so the `-!` skips the default loaders.

The next chunk tells webpack to use the `html` loader for the SVG file. I've found that it doesn't really care whether it's traversing an HTML tree or an SVG one.

The middle `?attrs=image:xlink:href` bit is where we tell webpack to follow links specified by the `xlink:href` attributes on `image` tags in the SVG DOM. I was a bit surprised that this worked, even with the second colon—but it does!

The final `!./template.svg` bit, of course, tells webpack which file to load.

## For purists
Webpack discourages the use of the `-!` override, and it's often not great to have to specify a loader in each import statement (although, this is a case that probably warrants both).

But if inline loader specification bothers you, there's another alternative: we can create a distinct loader for templates in `webpack.config.js`:

```javascript
module.exports = {
  module: {
    loaders: [
      ...
      {
        test: /\.html$/,
        loader: 'html?attrs=img:src'
      },
      {
        test: /\.jpe?g$|\.gif$|\.png$|(?!template\b)\b\w+\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$/,
        loader: 'url'
      },
      {
        test: /template\.svg$/,
        loader: 'html',
        query: {
          attrs: 'image:xlink:href'
        }
      }
      ...
    ]
  }
};
```
Now, `import template from './template.svg'` will load the file as a document instead of an image. Actually, *any* file ending in `template.svg` will load this way—which might be handy if you're building an app with lots of SVG template files.
