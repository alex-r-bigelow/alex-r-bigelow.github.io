<i>Quick disclaimer: I'm running Tableau in VirtualBox on a mac. Much of this trick relies on the ability of OS X's Automator to convert pages of a PDF to multiple PNG files, and I also use a mac app called FrameByFrame. I'm sure there are Windows-only ways of doing this, but you'll need to do some additional googling.</i><br />
<br />
If you drag something to the Pages shelf in Tableau, there are lots of options that would be useful in animation. Animation may or may not be appropriate for your tasks and data, but we'll assume for this post that it is. As useful as some of the tools are, though, each page is updated straight from the data, making for choppy playback that's difficult to tune. Worse, you can only export pages one at a time via Worksheet -&gt; Export -&gt; Image...<br />
<br />
Here's the workaround to get a video you can control; it involves a couple external programs. As mentioned above, you'll need something that will convert the pages of a PDF to images, and you'll also need <a href="http://sourceforge.net/projects/framebyframe/?source=dlp">FrameByFrame</a>&nbsp;(which is free). You'll probably also need a healthy amount of free hard drive space if this thing is going to be very long.<br />
<br />
In Tableau, go to File -&gt; Page Setup... and check "Show all pages"<br />
<br />
<img src="/blog/Exporting_video_from_Tableau/screenshot1.jpg"/>
<br />
As we're going to sneak this out of Tableau via printing to PDF, realize your page size will determine the final shape and resolution of your video. You may want to tweak Layout setting here as well.<br />
<br />
Next, go to File -&gt; Print to PDF... Again, you'll want to choose a page size that has the right proportions. Because it has to render every frame, this step will take a while after you click "Ok".<br />
<br />
Once you've gotten your .pdf, create this workflow in Automator (<b>please</b> don't use .jpg, or you'll have an ugly mess!):<br />
<br />
<img src="/blog/Exporting_video_from_Tableau/screenshot2.jpg"/>
<br />
After running it on your .pdf, you'll have a lot of .png files named something like "results 012.png".<br />
<br />
Now open FrameByFrame. Go to Edit -&gt; Import Images... Select all the images you just generated. FrameByFrame gives you options for creating your animation - play with these settings until you're satisfied:<br />
<br />
<img src="/blog/Exporting_video_from_Tableau/screenshot3.jpg"/>
<br />
In my case, I actually want a low (3 fps) frame rate, but the awesome thing here is now you have control - the number of frames is data-driven in Tableau, and the actual playback speed can be tuned for perception. When you're done, go to File -&gt; Export... to save your video. <a href="/blog/Exporting_video_from_Tableau/results.mov">Here's</a> one I generated, showing the last 30 days of earthquake data.<br />
<br />
