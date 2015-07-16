---
layout: post
title: Simple iBeacon Presence Detection
author: Greg E.
tags: [android,java,ibeacon]
excerpt: Android support for iBeacons is, at the time of this writing, sketchy at best. There is no actual support for it directly in the Android SDK and only a handful of phone models have the hardware necessary to support the <a href="http://en.wikipedia.org/wiki/Bluetooth_low_energy">BLE</a> technology used by iBeacons.<br><br>I have a project where we want to simply detect the presence of iBeacons and show some different UI in the app if one of "ours" is found. We're not doing anything fancier than that, so it seemed a 3rd party library might be a reasonable option until the Android OS (or actually, hopefully the compatibility/support library) adds official support for it.<br><br>I decided to try the Radius Networks library because it seemed to be open source (or so I thought) and they seem to know what they are doing.
---
Android support for iBeacons is, at the time of this writing, sketchy at best. There is no actual support for it directly in the Android SDK and only a handful of phone models have the hardware necessary to support the <a href="http://en.wikipedia.org/wiki/Bluetooth_low_energy">BLE</a> technology used by iBeacons.

I have a project where we want to simply detect the presence of iBeacons and show some different UI in the app if one of "ours" is found. We're not doing anything fancier than that, so it seemed a 3rd party library might be a reasonable option until the Android OS (or actually, hopefully the compatibility/support library) adds official support for it.

I decided to try the Radius Networks library because it seemed to be open source (or so I thought) and they seem to know what they are doing. However, the sample reference application steers you down a path that doesn't end well - you can find iBeacons all right, but it&nbsp;<em>doesn't tell you anything about them</em>. The library call to <code>setMonitorNotifier</code> accepts a <code>MonitorNotifier</code> which sounds promising - but doesn't actually give you any information about the found beacon, and there wasn't a way I could find to query the current beacons found.

So in order to actually see <em>what</em> beacon you have found (i.e., just get the major and minor numbers) you have to actually use their "ranging" API even if you don't care about range. I got it to work like this:
First derive your activity from&nbsp;<code>IBeaconConsumer</code> and <code>RangeNotifier</code>. Then declare the beacon manager and initialize it in onCreate:

{% highlight java %}
private IBeaconManager iBeaconManager = IBeaconManager.getInstanceForApplication(this);

@Override
protected void onCreate(final Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    // Code removed...
    iBeaconManager.bind(this);
}</pre>
Then implement the two interfaces you declared like this:
<pre class="prettyprint">@Override
public void onIBeaconServiceConnect() {
    Log.i(TAG, "iBeacon service connected");

    try {
        iBeaconManager.startRangingBeaconsInRegion(new Region("region1", null, null, null));
        iBeaconManager.setRangeNotifier(this);
    }
    catch (RemoteException e) {<br />        // Notify user something bad happened...
        e.printStackTrace();
    }
}

@Override
public void didRangeBeaconsInRegion(Collection iBeacons, Region region) {
    for (IBeacon b : iBeacons) {
        Log.i(TAG, "Found beacon " + b.getProximityUuid() + "." + b.getMajor() + "." + b.getMinor());
    }
}
{% endhighlight %}

And that's all you need to do - very simple, once you find it...

