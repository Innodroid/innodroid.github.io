---
layout: post
author: Greg E.
title: A Complex Activity Transition (Part 1)
tags: [android,transitions,animations]
excerpt: Activity transitions can provide a very nice effect. They provide continuity from one screen to another and give the user nice feedback as to what's happening. Sadly, the documentation and available resources are entirely lacking on how do it right and how to handle anything more than the most simple case.
---
##Activity Transitions
Activity transitions can provide a very nice effect. They provide continuity from one screen to another and give the user nice feedback as to what's happening. Sadly, the documentation and available resources are entirely lacking on how do it right and how to handle anything more than the most simple case. 

This is Part 1 of a series on how to setup and run one of these non-trivial transitions. This part covers the introduction and setup. Part 2 will cover the code and runtime behavior. Part 3 will consist of the demo app itself.

##The Goal

This is what I want to do:

![Mockup](/blog/transition_example.png)

The requirements are:

1. The app will show a grid of thumbnails. I will use a RecyclerView with GridLayoutManager for this.
2. The user can tap a thumbnail, which will open a full screen activity to view the high-resolution image.
3. The app will show a transition animation from the grid activity to the image activity. The image will zoom and scale to the fullscreen position. I will use a SharedElementTransition for this.
4. On the image view screen, the user can swipe between the images. I will use a ViewPager for this.
5. When the user hits the back button, the app will show a transition back to the image in the grid.    
6. If the user swiped to a different image, the transition will occur back to the corresponding thumbnail - not necessrily the one they tapped.
7. The user may have swiped so many times that the corresponding thumbnail is offscreen. In this case, there is nothing to transition back to, so skip the shared element transition.

##Initial Problems
 
I have found the Android developer documentation to be quite good for most things. Unfortunately, the [activity transition documentation](http://developer.android.com/training/material/animations.html) is buried in another page about animations, and is somewhat lacking. 

For example, the example XML shown for the image shared element transition looks like this:

{% highlight xml %}
<!-- This is wrong! -->
<transitionSet xmlns:android="http://schemas.android.com/apk/res/android">
    <changeImageTransform/>
</transitionSet>
{% endhighlight %}

It's strangely missing the `changeBounds` transform, so this transition just doesn't work right. If you copy and paste from the docs, the end result is bad and you have no idea why. 

Another problem is in the steps listed there:

>   - Enable window content transitions in your theme.  
>   - Specify a shared elements transition in your style.  
>   - Define your transition as an XML resource.  
>   - ~~Assign a common name to the shared elements in both layouts with the android:transitionName attribute.~~  
>   - Use the ActivityOptions.makeSceneTransitionAnimation() method.  

The step I crossed out above creates problem. While you *can* specify a transitionName attribute to make things easy in a very simple use case (just two images on each activity), that's rarely the use case in a real application. But the documentation leads you to believe you must use the transitionName. So, you may experiment with solutions that at runtime call `setTransitionName` dynamically on the image you want to transition. But you just don't need to go down that path. In fact, you don't need to use it at all!

In general I have stumbled into strange problems with transitions crashing, being glitchy, unreliable, or just not working at all. It's difficult to determine the cause of the problem with nothing to go on. Ultimately you see this resulting in [pull requests like this](https://github.com/MythTV-Clients/MythtvPlayerForAndroid/commit/cf67ee294a9c6358ff3dcabecba4a6cdc76d148e) where the Myth TV folks "fixed" a bug with transitions by just removing them completely. 

##The Setup

First setup , define your app theme to include these elements:

{% highlight xml %}
<style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
    ... other items ...
    <item name="android:windowContentTransitions">true</item>
    <item name="android:windowSharedElementEnterTransition">@transition/change_image</item>
    <item name="android:windowSharedElementExitTransition">@transition/change_image</item>
    <item name="android:windowEnterTransition">@transition/fade_no_flash</item>
    <item name="android:windowExitTransition">@transition/fade_no_flash</item>
    <item name="android:windowAllowEnterTransitionOverlap">true</item>
    <item name="android:windowAllowReturnTransitionOverlap">true</item>
</style>
{% endhighlight %}

What this does is enable the content transitions, setup a crossfade between activities, and enable shared element transitions using the change_image transition. There are some interesting points to note here already. First, note the elements to enable overlap. To quote directly from the documentation linked above:

> This lets you have more dramatic enter transitions

Well that sounds awesome, but I still don't know what this actually *does*. We'll have to guess that from the name.

Also, note that I am using a custom fade animation. This fade animation (`transit/fade_no_flash.xml`) is:

{% highlight xml %}
<fade xmlns:android="http://schemas.android.com/apk/res/android">
    <targets>
      <target android:excludeId="@android:id/statusBarBackground"/>
      <target android:excludeId="@android:id/navigationBarBackground"/>
      <target android:excludeId="@id/toolbar"/>
    </targets>
</fade>
 {% endhighlight %}

The purpose of these `exclude` elements is to remove the fade in/out effect on the toolbar, status bar, and navigation bar. Otherwise these elements will flash white during the activity transition. It's quite ugly and it's strange to me these elements (at least the Android system ones) weren't excluded by default.
 
As I mentioned above, the change image transition (`transit/change_image.xml`) looks like:
 
{% highlight xml %}
<transitionSet xmlns:android="http://schemas.android.com/apk/res/android">
    <changeBounds />
    <changeImageTransform />
</transitionSet>
{% endhighlight %}

This will both transform the image and move/resize it during the transition. Both transforms are required for the shared element transition to work right.

##Performing the Transition 

The real work happens at runtime where enter/exit listeners are used to map the shared elements together. That will be the next post in this series, coming soon.

