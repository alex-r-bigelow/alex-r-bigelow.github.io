If you used Babel and D3 back in the old D3 v3 days, you'd just `import d3 from 'd3';` and that was that.

But D3 v4 is a whole new beast, especially when it comes to importing stuff. If you only need the core D3 stuff, you might be able to get away with `import * as d3 from 'd3';`, and you'll be fine.

But if you need to use any of the new modularized stuff, D3 v4 often [mutates its core](https://github.com/d3/d3/issues/2733) with subsequent imports. Meaning that you can use D3 this way:

```html
<head>

</head>

```

because each subsequent script mutates `window.d3`. But we can't do this:

```javascript
import * as d3 from 'd3';
import 'd3-selection-multi';

```
because `d3-selection-multi` won't have access to the `d3` object that we just imported.

It took me a while to realize it, but D3's documentation is ultra-misleading: "If you use NPM, `npm install d3`." What they mean is, "If you're using **NPM + Rollup.js**, `npm install d3`."

This means that, to use D3 with something like Babel, we have two options:
1. Import D3 and the modules that we want the old HTML way, and assume that `window.d3` always exists
2. Build a custom D3 bundle ourselves, containing the modules that we want

The first option totally feels wrong—the whole point of using something like Babel, at least for me, is to avoid exactly this way of importing things. ES6 was supposed to save us from this crap. It gets worse if, like me, you're using webpack, and your entry point is a *javascript* file, not an HTML one!

But option two is also pretty annoying—another bloody preprocessing step, where you have to f\*ck around with a bunch of cryptic configuration files and remember extra console commands. Ideally, we *should* be able to just import what we need when we need it. But D3 wasn't built that way.

Here's what I came up with for option two, in case it helps anyone:

## Step 1
Run this command:
```bash
npm install --save-dev rollup rollup-plugin-node-resolve uglify-js
```
Also, whenever you realize you need a particular module, you'll need to do something like:
```bash
npm install --save-dev d3-selection
npm install --save-dev d3-selection-multi
```
These commands will install stuff in `node_modules`, as well as update `package.json`.

## Step 2
Create a `d3.bundle.js` file that looks something like:
```javascript
export {
  event,
  selection,
  select,
  selectAll
} from 'd3-selection';
import 'd3-selection-multi';
```
Where you have to pick and choose which pieces of D3 that you want (check out each module's `index.js` file to see what they have available). In theory, you should only include what you're actually going use. IMO, having to be this specific is pretty masochistic, but AFAIK, this is the only way to do it. Welcome to enforced optimization.

## Step 3
Make a `lib` directory in your project.

## Step 4
Create a `rollup.config.js` file:
```javascript
import npm from 'rollup-plugin-node-resolve';

export default {
  entry: 'd3.bundle.js',
  format: 'umd',
  moduleName: 'd3',
  plugins: [npm({jsnext: true})],
  dest: 'lib/d3.js'
};
```

## Step 5
Add this somewhere in your `package.json` file:
```json
{
  ...

  "scripts": {
    "prepublish": "rollup -c && uglifyjs lib/d3.js -c -m -o d3.min.js"
  }

  ...
}
```

## Step 6
Run this command:
```bash
npm run prepublish
```

## Step ∞
From here on, to import D3, you'll want to `import * as d3 from './lib/d3.min.js';` at the top of your javascript files.

Whenever you discover that you need to add a module in the future, remember to:
1. Update `d3.bundle.js` appropriately
2. `npm install --save-dev d3-some-module`
3. `npm run prepublish`
