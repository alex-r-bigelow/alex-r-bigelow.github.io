The problem with the Toshiba Portégé M200 tablet is it can only boot from a select few external CD drives. It can't boot from USB, so if you don't have one of these special CD drives, you're stuck with messing with an SD Card (at the moment, I don't have an SD Card reader for any other computer that isn't a camera), or setting up a net install.<br />
<br />
Here's one other way to do this <b>without SD cards</b>, but you'll need a &nbsp;<a href="https://www.google.com/shopping/product/5266498069522446691?q=pata+usb&amp;safe=active&amp;bav=on.2,or.r_cp.r_qf.&amp;bvm=bv.50500085,d.b2I,pv.xjs.s.en_US.ciY8R2R6XC8.O&amp;biw=1837&amp;bih=1039&amp;tch=1&amp;ech=1&amp;psi=MpwKUqbfK4eC2wXxs4CwAw.1376427059523.3&amp;sa=X&amp;ei=NZwKUtqoBaqY2AW_soGwAQ&amp;ved=0CHwQ8wIwAQ">PATA/USB cable</a> instead.<br/>
For this guide, you'll also need another computer that <b>can</b> boot from a CD or flash drive, and at least one spare flash drive (you will need two if you boot Parted Magic from a flash drive).<br />
<br />
I wasted a whole day trying to use Unetbootin to install the&nbsp;<a href="http://xubuntu.org/getxubuntu/">xubuntu .iso</a>&nbsp;to a small partition (1GB), and then use that to install to the rest of the drive. I almost pulled it off, but the installer insisted on unmounting the installation partition. Here are a few notes, though, in case you try something similar:<br />
<br />
<ul>
<li>I don't think the Portégé works with Unetbootin disks created in OS X (my guess is they need to be ext4 formatted, which OS X doesn't support)</li>
<li>The Portégé is&nbsp;<a href="http://askubuntu.com/questions/117744/how-can-i-install-on-a-non-pae-cpu-error-kernel-requires-features-not-present">non-PAE</a>&nbsp;hardware; make sure whatever you install is compatible (in my case with xubuntu, use 12.04)</li>
</ul>
<div>
I eventually gave up and did something a little more complicated, but probably cleaner in the long run:</div>
<div>
<br /></div>
<div>
Boot another computer with a&nbsp;<a href="http://partedmagic.com/doku.php?id=downloads">Parted Magic</a>&nbsp;CD or flash drive, and plug in (1) the Portégé hard drive via PATA/USB and (2) a reasonably large spare flash drive (mine was 4GB). Using the Parted Magic Utilities:</div>
<div>
<ol>
<li>Format both the hard drive and spare flash drive to ext4 with the Partition Editor (gparted)</li>
<li>Use Unetbootin to make the <i><b>hard drive</b></i> a bootable installation disk for your desired distribution</li>
<li>Unmount the hard drive and spare flash drive, put the hard drive back in the&nbsp;Portégé, and plug in the flash drive</li>
<li>Turn on the&nbsp;Portégé, and install the distribution to the flash drive (it might be a good idea to try the live version first to make sure the stylus drivers, etc. in your distribution work like you think they should... for the record, xubuntu works just fine!).</li>
<li>When the&nbsp;Portégé reboots after installation, it will start up to the Unetbootin screen again (remember, it can't boot from USB)... just turn the machine off (you have to hold the power switch for a second).</li>
<li>Remove the hard drive and flash drive, and plug them back into the computer running Parted Magic</li>
<li>Using gparted, re-format the hard drive to ext4 (this may not be strictly necessary, but it's a good way to check which drive is sda, sdb, etc. before the next step)</li>
<li>Using the Disk Cloning utility, do a local disk to local disk copy... copy the flash drive to the hard drive, and copy the bootloader when asked</li>
<li>Open gparted again:</li>
<ol>
<li>Delete the swap and extended partition so you can expand the first (make a note of how big the extended partition was... I think the installer picks 510MB)</li>
<li>Expand the first partition to fill the disk, leaving room to recreate the swap space at the end</li>
<li>Recreate the extended partition and the swap space inside it</li>
<li>Click Apply (you may need to create the swap space twice... it failed the first time I tried it)</li>
</ol>
<li>Finally, put the hard drive back in the&nbsp;Portégé, and start it up... if you did exactly what I did, you'll probably see some anomalies in the loading screen (mine was all fuzzy), but everything's fine once the desktop comes up.</li>
<li>Open Synaptic Package Manager, click "Mark All Upgrades", and then click "Apply." At some point in the installation, it will ask about where to install grub - I installed on both sda and sda1.</li>
</ol>
</div>
