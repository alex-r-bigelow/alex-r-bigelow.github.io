Here's a quick note about getting rid of PySide errors in Eclipse if you're getting them - I installed PySide and all the examples work just fine, but Eclipse is flagging everything PySide-related as an error. You have to do a couple things:<br />
<img src="/blog/PySide_in_Eclipse/screenshot.png"/>
<ul>
<li>PySide might have been installed in a non-standard location:</li>
<ul>
<li>In Spotlight, search for "PySide", probably limiting to the /Library directory</li>
<li>If you find the PySide folder, click it to see where it got installed - in my case, it was installed at /Library/Python/2.7/site-packages/PySide, even though the /Library/Frameworks/Python.framework/Versions/2.7/bin/python2.7 could import PySide without any trouble</li>
<li>If this is the case with you, go to Eclipse -&gt; Preferences -&gt; PyDev -&gt; Interpreter - Python -&gt; Libraries</li>
<li>&nbsp;Click "New Folder"</li>
<li>Navigate to the site-packages directory <b><i>that contains</i></b> PySide (not the PySide directory itself!) </li>
</ul>
<li>Like PyQt4, PySide wraps .so ("shared object") files, not actual python, so you'll also need to:</li>
<ul>
<li>In the same screen (Eclipse -&gt; Preferences -&gt; PyDev -&gt; Interpreter - Python), click the "Forced Builtins" tab, click "New...", type "PySide", and click "OK"</li>
</ul>
</ul>