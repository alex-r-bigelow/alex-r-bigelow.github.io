Setup:
======
    git clone https://github.com/alex-r-bigelow/alex-r-bigelow.github.io.git
    cd alex-r-bigelow
    npm install
    cd ..
    git clone https://github.com/alex-r-bigelow/alex-r-bigelow.github.io.git alex-r-bigelow-deploy

Development:
============
    cd alex-r-bigelow
    webpack-dev-server --progress --verbose --colors

Deployment:
===========
    cd alex-r-bigelow
    webpack
    cd ../alex-r-bigelow-deploy
    git add -A
    git commit -m "some commit message..."
    git push
