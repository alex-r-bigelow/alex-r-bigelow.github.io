# LG e980 Flashing Guide

I recently tried to install Cyanogenmod 12.1 on my LG Optimus Pro
(I bought an unlocked one on Amazon a while ago... it's an AT&T phone,
but works fine with my T-Mobile SIM card).

I made a lot of mistakes over the course of a week, so this is one of
those here's-what-finally-worked
posts for my own future reference, as well as anyone else in the same boat.

**Typical disclaimer:** I'm not at fault if this stuff ruins your device.
Flashing phones is not for the faint of heart.

One cool thing about this process, though, is that in theory you should be
able to do all of these steps right from your phone (I took some
detours that necessitated a computer). So unless I say otherwise,
do all of this stuff right on your device:

### Getting root access
This was a little trickier than usual:

1. Download and install the [towelroot](https://towelroot.com/tr.apk) APK
file. You will need to enable installing apps from untrusted sources---the
phone will take you to the right place in the settings to turn this on if
you just try to install it.

2. Install [Superuser](https://play.google.com/store/apps/details?id=com.noshufou.android.su)

### Unlocking the bootloader
AT&T is pretty obnoxious with this one; you can't actually boot into
recovery unless you first unlock the bootloader.

3. Install [BusyBox](https://play.google.com/store/apps/details?id=stericson.busybox)

4. Open BusyBox, and click Install

5. Install [FreeGee](https://play.google.com/store/apps/details?id=edu.shell.freegee_free)

  This last step caused me all kinds of pain. The first time I installed it,
  none of the buttons would work. I never quite figured out an easy solution
  for this, and I wound up doing something silly (see the Detour section below). In the
  long run, I reset the phone to its stock condition, and then all of a
  sudden FreeGee worked just fine. If you find yourself in the same scenario,
  hopefully you can find a less drastic solution. But flashing the stock ROM
  should do it if nothing else does.

### Choosing a recovery

6. Install the CWM option in FreeGee
  I actually really like TWRP! It was much less painful for me the last
  time I flashed a phone. But on my e980, most of the buttons in TWRP
  didn't respond to tapping them. While the same thing happened in CWM,
  it's an interface well designed for navigating by using the up/down
  volume buttons and the power button.

### Downloading ROMs

I actually had some problems with the latest snapshot (as of this post,
it was the 2015-10-07 one): it couldn't recognize my SIM card. This may
have something to do with me being on T-Mobile, and the phone was
designed for AT&T. But I haven't had any problems with the nightly, so
I'd recommend going with that if there isn't a newer snapshot.

7. Download the latest nightly build [here](http://download.cyanogenmod.org/?device=e980).
The one I used was added 2016-03-02.

8. Download whatever set of Google Apps you prefer from [OpenGApps](http://opengapps.org/).
As this guide is for CM 12.1 on the e980, you'll want the ARM Platform, and
apps geared for 5.1. I went with the nano version, but I *think* any of them
should be fine.

### Reboot into Recovery

8. The e980 is a little tricky to get into recovery, even if you've set it up
correctly. Restart the phone, and hold the volume up button as it
starts up; hold the power button as well as soon as you see the LG
screen. I think in theory you're supposed to hold the power button
with the volume up button from the beginning, but for that seemed to
force the phone to keep boot cycling.

9. Do a factory reset

10. Flash the CM 12.1 zip that you downloaded

11. Flash the GApps zip as well

12. Reboot the phone

### Fixing call audio

13. There's a bug in CM 12.1 (again, as of this post) that breaks audio in
phone calls. Before you bother installing this, though, it would be a good
idea to test and see if you can call someone. If you're a T-Mobile customer
and you can't hear anything, you'll want to download the patch zip file
[here](http://forum.xda-developers.com/showpost.php?p=57337572). You'll
probably need to do something different if you're not on T-Mobile, though,
but this is where my helpfulness ends (I ran across different solutions
for different carriers as I googled around).

14. You'll also need to change some settings on the phone before you
reboot into recovery again. Download
[BuildProp Editor](https://play.google.com/store/apps/details?id=com.jrummy.apps.build.prop.editor),
and make sure your settings match these:

  ```
  persist.audio.handset.mic.type=digital
  persist.audio.dualmic.config=true
  persist.audio.fluence.voicecall=true
  persist.audio.handset.mic=dmic
  persist.audio.fluence.mode=endfire
  persist.audio.lowlatency.rec=false
  ```

15. Reboot into recovery and flash the zip patch you downloaded. Phone
call audio should be working when you reboot.

### Miscellaneous troubleshooting notes

- Issues with `com.android.phone` crashing may have something to do with the APN
settings getting some extra cruft somehow (see [this post](http://z-issue.com/wp/cyanogenmod-com-android-phone-crashing-an-unlikely-apn-fix-for-the-nullpointerexception-in-the-telephony-stack/)).
To fix it, clear the Password and Server fields (should be asterisk(s)), and set MMS Port to 80.

## Detour

When I encountered problems with FreeGee, and couldn't find anything that
seemed relevant online, so I started trying silly things. Initially, I think
I found an app on the app store that successfully installed an older
version of the ClockworkMod recovery that was able to flash CyanogenMod,
but all the Google Apps kept crashing.
After reading that it might be the old ClockworkMod's fault, I tried to install
TWRP using some command line `dd` voodoo in the terminal emulator.

Bad mistake. It totally soft bricked the device and I couldn't even get
into recovery anymore. To fix it, I had to do the following steps in Windows
(I tried a bunch of things in OS X, but it turned out I needed the
Windows drivers for the phone... and I don't think they make them for OS X, at
least not for these kinds of operations).

### Flashing the stock ROM to fix a soft brick

Download and extract this stuff on your computer (you'll need [7-zip](http://www.7-zip.org/) or something similar for the .rar file):

1. The [TOT file](http://downloads.codefi.re/houstonn/lgog_pro/factory/LGE980AT-01-V10g-310-410-APR-03-2013.zip)

2. The [DLL file](http://downloads.codefi.re/houstonn/lgog_pro/factory/LGE980_20130314_LGFLASHv151.rar)

3. [Megalock.dll](http://oceanhost.eu/o9n2mef5f2no/MegaLock.dll.htm)

4. [LGFlashTool](http://downloads.codefi.re/houstonn/lgog_pro/factory/LGFlashTool.zip)

5. [LG Drivers](http://downloads.codefi.re/houstonn/lgog_pro/factory/LGUnitedMobileDriver_S4981MAN37AP22_ML_WHQL_Ver_3.8.1.zip)

Once everything is extracted:

6. Install the LG Drivers

7. Install LGFlashTool, but *don't launch it yet*

8. Move Megalock.dll into `C:\LG\LGFlashTool` (replace the existing one)

9. Launch LGFlashTool, choose manual mode, and select the TOT and DLL files

10. Click the yellow arrow button; when you see the "READY!" message, hold both the
  up and down arrow buttons on the phone, and plug it into the computer. It *should* go
  into download mode and all the original AT&T bloatware should be on its way.

  If things don't get started, it took forever for me to figure out that
  LGFlashTool expects the phone to be on a certain port. With the drivers
  installed, your phone should at least show up in My Computer when it's
  plugged in. To set the port (I think COM41 is the default that LGFlashTool
  is looking for), you may need to find your phone in the Device Manager,
  right-click to show its Properties, and then go to Port Settings -> Advanced,
  and change the COM Port Number appropriately.

Hopefully some of this is useful. Happy modding!
