This is for folks that don't like using macports, fink, or homebrew, but want to install cairo and possibly use it with Python.

First of all, if you're comfortable with the version of python that ships with OS X, I'd recommend these <a href="http://www.kyngchaos.com/software/frameworks">binaries</a> - they're much more mac-user friendly. You have to install a couple of them in the right order, though, but the page explains it pretty well.
(disclaimer: I didn't actually go all the way of getting py2cairo installed with these frameworks, but py2cairo's install scripts <i><b>should</b></i> just work with these binaries... feel free to comment if you try it and it doesn't!)

For those of us that are using a "real" version of python from python.org, things aren't as pretty... there are some guides for building on Leopard (note, not Snow Leopard, just Leopard!), but a lot has changed since then, especially if you're talking about 64-bit architectures. In case it's helpful to anyone, here's a script I hacked together over a couple of days (with help from this <a href="http://stackoverflow.com/questions/6886578/how-to-install-pycairo-1-10-on-mac-osx-with-default-python">stackoverflow thread</a>) to get py2cairo up and running on OS X Lion with a 64-bit python.org installation:

```bash
#!/bin/bash

rm -rf ~/Downloads/temp
mkdir ~/Downloads/temp
cd ~/Downloads/temp

curl http://pkgconfig.freedesktop.org/releases/pkg-config-0.26.tar.gz -o pkgconfig.tar.gz
curl ftp://ftp.simplesystems.org/pub/libpng/png/src/libpng-1.5.10.tar.gz -o libpng.tar.gz
curl http://www.cairographics.org/releases/pixman-0.24.4.tar.gz -o pixman.tar.gz
curl http://www.cairographics.org/releases/cairo-1.12.0.tar.gz -o cairo.tar.gz
curl http://cairographics.org/releases/py2cairo-1.10.0.tar.bz2 -o py2cairo.tar.bz2

tar -xzvf pkgconfig.tar.gz
tar -xzvf libpng.tar.gz
tar -xzvf pixman.tar.gz
tar -xzvf cairo.tar.gz
tar -xzvf py2cairo.tar.bz2

mv pkg-config-* pkgconfig
mv libpng-* libpng
mv pixman-* pixman
mv cairo-* cairo
mv py2cairo-* py2cairo

cd pkgconfig
./configure
make
sudo make install

export PKG_CONFIG=/usr/local/bin/pkg-config
export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig

export PYTHONPATH=/Library/Frameworks/Python.framework/Versions/2.7/
export LD_LIBRARY_PATH=/Library/Frameworks/Python.framework/Versions/2.7/:$LD_LIBRARY_PATH
export LD_LIBRARY_PATH=/Library/Frameworks/Python.framework/Versions/2.7/lib:$LD_LIBRARY_PATH
export LINKFLAGS='-search_dylibs_first  -L /Library/Frameworks/Python.framework/Versions/2.7/lib/'
export ARCHFLAGS='-arch x86_64'

export MACOSX_DEPLOYMENT_TARGET=10.7
export CC="gcc"
export LDFLAGS="-arch x86_64"
export CFLAGS="-arch x86_64"

cd ../libpng
./configure
make
sudo make install

cd ../pixman
./configure
make
sudo make install

cd ../cairo
./configure
make
sudo make install

cd ../py2cairo
python waf clean

python waf configure --prefix=$PYTHONPATH
python waf build
python waf install

cd ../..
rm -rf ~/Downloads/temp
```


Make sure to try "import cairo" in the interpreter to test if everything worked.
