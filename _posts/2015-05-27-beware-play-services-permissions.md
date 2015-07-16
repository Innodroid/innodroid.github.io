---
layout: post
title: Beware Play Services Permissions
author: Greg E.
tags: [android,play-services,permissions]
excerpt: I needed to use the new Location Settings Dialog in an app recently. But it came with an unexpected cost.<br><br>In addition to the latest Play Services library immediately putting your app over the dex limit, it also silently includes some nasty permissions. Here's how to deal with it.
---
**Including Play Services** 

I needed to use the new <a href="http://android-developers.blogspot.com/2015/03/google-play-services-70-places-everyone.html">Location Settings Dialog</a> in an app recently. It's only available now in play services 7x, so I updated the dependency in build gradle and hooked it up. 

{% highlight text %}    
compile 'com.google.android.gms:play-services:7.5.0' 
{% endhighlight %}

So right away this immediately puts you over the <a href="http://stackoverflow.com/questions/15471772/how-to-shrink-code-65k-method-limit-in-dex">dex limit</a> but you can now enable multi-dex to fix that and use proguard to trim away all the unused library code. 

Everything was nice and smooth until a week later at about midnight as I was uploading the final build to the Play Store. I suddenly noticed something very wrong in the permissions listed for my application. There were 2 new permissions: 

{% highlight text %}    
android.permission.GET_ACCOUNTS
android.permission.USE_CREDENTIALS 
{% endhighlight %}

Uh, what's this? I'm asking for permissions for get the user accounts and use their credentials? These are some of the strongest permissions you can have. They are shown to the user with very scary wording and will be absolutely sure to generate a very harsh response (think thousands of 1-star reviews coming in a flood). 

So, it is midnight, I'm up against a deadline, and I can't ship this. What happened? I checked the manifest file in the APK and sure enough those permissions are listed even though I'm not declaring them myself.
 
**Google Wallet: Doing More Harm than Good Since 2011** 

Continuing to search around I found these listed in: build/intermediates/exploded-aar/com.google.android.gms/play-services-wallet/7.5.0. Wait, Google Wallet? I don't want that and I don't need it. I was just relying on Proguard optimizations to remove the code I'm not using, but it never even occurred to me that there would be problems with manifest merging that I had to deal with. 

Luckily there is a way to <a href="https://developers.google.com/android/guides/setup">include only the Play Services components you need</a> by including just the dependencies you are using: 

{% highlight text %}
compile 'com.google.android.gms:play-services-base:7.5.0'
compile 'com.google.android.gms:play-services-location:7.5.0' 
{% endhighlight %}

That excludes wallet and all the other bloatware included in the library. So that fixed that. 

**The Revenge of Google Wallet** 

I triumphantly clicked the build and looked forward to getting some sleep. That's when I got hit with a total bizarre error message: 

{% highlight text %}
res/values/colors.xml: Error:(1) Attribute "theme" has already been defined 
{% endhighlight %}

Argh... how can me only including a **subset** of what I had before now cause a **duplicate** definition?. 

After lots of guesswork and failed trial and error I discovered that my old dependency on segment.io was including Play Services library and it was now including the full version of an older library since I wasn't. 

And of course... yep it is our friend Google Wallet was again the problem. I found an attribute "theme" defined in Wallet's attrs.xml. Defining an attribute named "theme" is not the best idea ever, since it has to be used by the AppCompat library to replace the Android system theme attribute. So this file has the problem: 

{% highlight text %}
build\intermediates\exploded-aar\com.google.android.gms\play-services\5.0.89\res\values\wallet-attrs.xml 
{% endhighlight %}

I fixed the issue by replacing this: 

{% highlight text %}    
compile('io.segment.analytics.android:all:1.4.4@aar') 
{% endhighlight %}

With this: 

{% highlight text %}    
compile('com.segment.analytics.android:analytics-core:3.1.3@aar')
{% endhighlight %}

And I believe Google Wallet can't touch me now. 
