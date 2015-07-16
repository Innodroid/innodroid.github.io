---
layout: post
title: Where to put Android app init code?
author: Greg E.
tags: [android,java,asynctask,intents,services]
excerpt: I had the following requirements for a block of code that is used in an application:<ul><li>All of the code should run once and only once when the app starts up</li><li>Some of the code should run at regular intervals after that</li><li>Nothing should block the <a href="https://developer.android.com/training/multiple-threads/communicate-ui.html" target="_blank">UI Thread</a></li></ul>What's the easiest and best way to do this?
---
**The Problem**

I had the following requirements for a block of code that is used in an application:

* All of the code should run once and only once when the app starts up
* Some of the code should run at regular intervals after that
* Nothing should block the <a href="https://developer.android.com/training/multiple-threads/communicate-ui.html" target="_blank">UI Thread</a>

What's the easiest and best way to do this?

**Main Activity onCreate**

The first easiest place to put initialization code, this has a lot of problems and doesn't really address any of the requirements. The code is on the UI thread. Creating a thread or AsyncTask to do the work would solve that, but then all the views and app logic need to handle the case that initialization may not be completed yet.

**Splash Activity onCreate**

To solve that, a splash screen could do the initialization, and then don't load your main activity until you are ready. Now you have just the problem that the code should only run once. Android destroys and re-creates your activity when the user rotates the device (by default), and if the user backs out of the app and re-launches your activity onCreate is called again. These could be fixed with static boolean flags, but this is starting to smell.

**Derived Application Class onCreate**

Here is a chance to run code that truly executes only once on app startup. But, you are still on the UI thread. The user will just be looking at the blank ghost activity frame that Android creates when your app is first launched. So there are still problems here.

**In a AsyncTask called from Application onCreate**

This is getting better as we can now run code only once and on the background thread, but there is some code that must be run at regular intervals and we have no way to do that. There also needs to be a way to communicate to the splash screen that initialization is done and it should close.

**In a Service**

Running the code in a service provides the flexibility to launch it from multiple scenarios (both from onCreate in the Application class and on regular intervals using the <a href="http://developer.android.com/reference/java/util/concurrent/ScheduledExecutorService.html" target="_blank">ScheduledExecutor</a>. If the service is an <a href="http://developer.android.com/reference/android/app/IntentService.html" target="_blank">IntentService</a>, the caller can pass flags through the Intent Extras that can direct it to run the all code or exclude the initialization code. The service can send broadcast events (using <a href="http://developer.android.com/reference/android/support/v4/content/LocalBroadcastManager.html" target="_blank">LocalBroadcastManager</a>) to notify the UI that initialization has completed.

**Final Answer **

So the workflow ended up like this:

* In subclass Application onCreate:
    * Run the service with flags set to do initialization code
    * Setup executor to run service at intervals without initialization code.
* SplashActivity starts up and waits
* Service broadcasts event notifying initialization is complete
* SplashActivity receives event and closes
* At regular intervals, service runs only the interval code

Hope this helps someone else in a similar scenario.
