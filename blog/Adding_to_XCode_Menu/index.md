<span style="color: var(--error-color);">UPDATE: This tweak actually disappears (along with the apps you copy inside XCode) whenever XCode is updated! </span><br />
<br />
In spite of the agony that comes every time Apple changes where XCode and its friends live, I like the direction they're going. Now everything's bundled neatly inside the XCode app itself... almost.<br />
<br />
Today I wanted to use the handy OpenGL Shader Builder app that I remembered from a long time ago, but to my dismay I realized it wasn't installed. As of this writing, XCode had cleverly bundled its extra apps <i>inside</i> the XCode app as well - you can access them by going to XCode -&gt; Open Developer Tool. As the Shader Builder wasn't there, the "More Developer Tools..." option took me to the somewhat sluggish developer download site, where I was able to log in and download the tools I wanted.<br />
<br />
Now the tricky part, and where my OCD kicks in. I like the direction Apple took in bundling these inside XCode, so I'd like these new ones in the same place. After a wee bit of hacking, I figured out how to do this and add them to XCode's menu. As no one after a quick google search seems to document this, I thought I should:<br />
<ul>
<li>Quit XCode</li>
<li>In the Finder, navigate to the XCode app and "Show Package Contents"</li>
<li>Copy <b style="color: var(--error-color)">aliases of</b> the new apps into Contents/Applications/ (you'll be prompted for your password)</li>
<li>Add lines to Contents/Resources/IDEHelperApps.plist for each new app you add</li>
<ul>
<li>This can be a little tricky with permissions - an easy way to do it is copy the file to the desktop, and copy back, overwriting the original</li>
</ul>
<li>Open XCode again, and presto! Your new apps are in the menu:</li>
</ul>
<br />
<img src="/blog/Adding_to_XCode_Menu/screenshot.png"/>
