I was having some issues with .eps files in TeXShop and the default installation of MacTeX on OS X Lion. Specifically, I was getting this error:<br />
<br />
<span style="color: var(--error-color); font-family: Courier New, Courier, monospace;">repstopdf: command not found</span><br />
<br />
After much googling, I was able to figure out that I need to add the "--shell-escape" option to both fields in TeXShop -&gt; Preferences -&gt; Engine:<br />
<br />
Tex:<br />
<span style="font-family: Courier New, Courier, monospace;">pdftex --shell-escape --file-line-error --synctex=1</span><br />
<br />
Latex:<br />
<span style="font-family: Courier New, Courier, monospace;">pdflatex --shell-escape --file-line-error --synctex=1</span><br />
<br />
Now I get this error:<br />
<br />
<span style="color: var(--error-color); font-family: Courier New, Courier, monospace;">epstopdf: command not found</span><br />
<br />
At least this is supposed to be the name of the tool we need. After much more misleading googling, I decided to hack it myself. Here's my solution:<br />
<br />
<span style="font-family: Courier New, Courier, monospace;">curl -O&nbsp;http://mirrors.ctan.org/support/epstopdf.zip</span><br />
<span style="font-family: Courier New, Courier, monospace;">unzip epstopdf.zip</span><br />
<span style="font-family: Courier New, Courier, monospace;">cd epstopdf</span><br />
<span style="font-family: Courier New, Courier, monospace;">chmod a+x epstopdf.pl</span><br />
<span style="font-family: Courier New, Courier, monospace;">mv epstopdf.pl epstopdf</span><br />
<span style="font-family: Courier New, Courier, monospace;">sudo mv epstopdf /usr/textbin</span><br />
<span style="font-family: Courier New, Courier, monospace;">cd ..</span><br />
<span style="font-family: Courier New, Courier, monospace;">rm -rf epstopdf*</span><br />
<br />
Hope that's useful for someone out there.
