Setup:
======
    npm install

Development:
============
    webpack-dev-server --progress --colors

Deployment:
===========
    webpack
Bundles everything into `build/`

    git subtree push --prefix build origin/master
Make the built site live on gh-pages (TODO: haven't tried this yet... may need some tweaking)
