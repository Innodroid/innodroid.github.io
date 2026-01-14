---
layout: post
title: How to Print via Bluetooth on Android
author: Greg E.
tags: [android,java,printing,bluetooth]
excerpt: I was working on an application that prints an image to a bluetooth printer. This application had been working fine on Android 2.3, 3.0, and 4.0, but when we upgraded one of them to Android 4.1 jelly bean, printing stopped working.<br><br>This post describes how to print on Android 4.1+.
---
**Bluetooth Printing pre-4.1**

I was working on an application that prints an image to a bluetooth printer. This application had been working fine on Android 2.3, 3.0, and 4.0, but when we upgraded one of them to Android 4.1 jelly bean, printing stopped working. This is the error in logcat:

{% highlight text %}
W/System.err(19319): java.lang.SecurityException: Permission Denial: writing com.android.bluetooth.opp.BluetoothOppProvider uri content://com.android.bluetooth.opp/btopp from pid=19319, uid=10106 requires android.permission.ACCESS_BLUETOOTH_SHARE, or grantUriPermission() {% endhighlight %}

But this error doesn't seem to make sense, because that permission is declared in the Android manifest file.

It turns out that this is just the wrong way to do things - inserting directly into another application's content provider is a security problem, and with Android 4.1, Google closed that hole in the Bluetooth Application. So how do you print? There is another method, the "right" way, although it isn't really directly documented anywhere. The right way to do it is with this "share" intent, but there are a few snags you will hit along the way.

**Bluetooth Printing 4.1+**

First start the print process with a standard Share intent. Target the bluetooth application so the user won't be prompted who to share it to:

{% highlight java %}
Intent sharingIntent = new Intent(android.content.Intent.ACTION_SEND);
sharingIntent.setType("image/jpeg");
sharingIntent.setComponent(new ComponentName("com.android.bluetooth", "com.android.bluetooth.opp.BluetoothOppLauncherActivity"));
sharingIntent.putExtra(Intent.EXTRA_STREAM, Uri.fromFile(imageFile));
startActivity(sharingIntent);
{% endhighlight %}

The sharing intent also provides the URI to the image. Note you have to put this image in a place where another application could access it. Don't put it in your internal private storage. If that's a problem, you need to expose a content provider to make the image available via a <code>content://</code> URI, but that's a whole different blog post.

This works, but the user gets a popup asking them to select which device to print to. This is kind of pointless if there is only one printer paired. And it is really bad if you are running in a kiosk mode like this application.

You can intercept this and handle the <code>android.bluetooth.devicepicker.action.LAUNCH</code> intent action and then broadcasting the message <code>android.bluetooth.devicepicker.action.DEVICE_SELECTED</code>. You don't show a UI, you just give it the printer you want to use.
First declare a new activity to handle the intent:

{% highlight java %}
<activity android:name=".BluetoothPicker" android:label="@string/app_name">
  <intent-filter>
    <action android:name="android.bluetooth.devicepicker.action.LAUNCH" />
    <category android:name="android.intent.category.DEFAULT" />
  </intent-filter>
</activity>
{% endhighlight %}

In the activity, just broadcast the device selected message, and immediately exit:

{% highlight java %}
public class BluetoothPicker extends Activity {
    private String mLaunchPackage;
    private String mLaunchClass;

    public static final String EXTRA_NEED_AUTH = "android.bluetooth.devicepicker.extra.NEED_AUTH";
    public static final String EXTRA_FILTER_TYPE = "android.bluetooth.devicepicker.extra.FILTER_TYPE";
    public static final String EXTRA_LAUNCH_PACKAGE = "android.bluetooth.devicepicker.extra.LAUNCH_PACKAGE";
    public static final String EXTRA_LAUNCH_CLASS = "android.bluetooth.devicepicker.extra.DEVICE_PICKER_LAUNCH_CLASS";

    public static final String ACTION_DEVICE_SELECTED = "android.bluetooth.devicepicker.action.DEVICE_SELECTED";
    public static final String ACTION_LAUNCH = "android.bluetooth.devicepicker.action.LAUNCH";

    /** Ask device picker to show all kinds of BT devices */
    public static final int FILTER_TYPE_ALL = 0;
    /** Ask device picker to show BT devices that support AUDIO profiles */
    public static final int FILTER_TYPE_AUDIO = 1;
    /** Ask device picker to show BT devices that support Object Transfer */
    public static final int FILTER_TYPE_TRANSFER = 2;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.device_picker);

        BluetoothDevice device = NetworkUtils.getSelectedDevice();

        if (device == null) {
            Log.e("PRINT", "Failed to get selected bluetooth device!");
            finish();
            return;
        }

        Intent intent = getIntent();
        //mNeedAuth = intent.getBooleanExtra(EXTRA_NEED_AUTH, false);
        //setFilter(intent.getIntExtra(EXTRA_FILTER_TYPE, FILTER_TYPE_ALL));
        mLaunchPackage = intent.getStringExtra(EXTRA_LAUNCH_PACKAGE);
        mLaunchClass = intent.getStringExtra(EXTRA_LAUNCH_CLASS);

        sendDevicePickedIntent(device);

        finish();
    }

    private void sendDevicePickedIntent(BluetoothDevice device) {
        Intent intent = new Intent(ACTION_DEVICE_SELECTED);
        intent.putExtra(BluetoothDevice.EXTRA_DEVICE, device);

        if (mLaunchPackage != null &amp;&amp; mLaunchClass != null) {
            intent.setClassName(mLaunchPackage, mLaunchClass);
        }

        sendBroadcast(intent);
    }
}
{% endhighlight %}

I'm calling a utility function to get the selected device. Here is that function:

{% highlight java %}
public static BluetoothDevice getSelectedDevice() {
    BluetoothAdapter btAdapter = BluetoothAdapter.getDefaultAdapter();

    if (!btAdapter.isEnabled()) {
        Log.e("PRINT", "Bluetooth adapter is not enabled!");
        return null;
    }

    Set devices = btAdapter.getBondedDevices();
    Log.i("Bluetooth", "Automatic printer selection");

    // Take the first printer paired
    for (BluetoothDevice itDevice : devices) {
      if (itDevice.getBluetoothClass().getMajorDeviceClass() == BluetoothClass.Device.Major.IMAGING) {
        Log.i("Bluetooth", "Using printer " + itDevice.getName() + " selected automatically");
        return itDevice;
    }

    Log.e("PRINT", "No usable printer!");
    return null;
}
{% endhighlight %}

This just takes the first bluetooth device which can print (IMAGING class).

There is just one problem left - the very first time you print, you get a chooser popup because there are now two applications handling the <code>android.bluetooth.devicepicker.action.LAUNCH</code>. You can't uninstall the other application, because it's in the same APK as the code that does all the printing work. In this case it was OK because you can select the "Use as default" option and then you never see it again.
I don't really know how to resolve that, so feedback is welcomed.

