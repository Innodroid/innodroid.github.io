---
layout: post
author: Greg E.
title: Using Hardware Layers for Complex Animations
tags: [android,performance,animations]
excerpt: The Android property animation system allows you to easily create fancy animations. But sometimes these more complex animations may stutter or jank.</p><p>The key is that there is a difference between hardware <em>acceleration</em> and hardware <em>layers</em>. Here's why, and what to do about it.
---
Recently I needed to create an animation that did some pretty complex things with a view. It wasn't just a simple view, either - it was a deeply nested hierarchy containing a couple dozen views with shadows, images, custom layouts, the whole works. I needed to take this entire view and chain together animations that would rotate and scale it while also changing item visibility halfway through.

Using the Android property animation system I was able to get it working just fine. Running under the excellent <a href="http://genymotion.com/" target="_blank">GenyMotion</a> emulator, everything was nice and smooth and looked great. But there was a problem - when I ran the app on a real device, even a modern fast device, the animation was a little jerky. It was definitely dropping frames. I set about using the various performance tools to try to determine the problem, but couldn't find anything. I wasn't doing any allocations during the animation, in fact the app was otherwise completely idle.

I knew the app was hardware accelerated and so I should be getting all those performance benefits. Just by setting your minimum API level to 14, all views are hardware accelerated already, so hey, it's <em>hardware accelerated</em>, there's nothing else I can do about that.

But wait - there is!

Buried deep in the <a href="http://developer.android.com/guide/topics/graphics/hardware-accel.html" target="_blank">hardware acceleration</a> page of the "Animation and Graphics" topics is an easily-overlooked section titled "View layers and animation". It contains some critical information:

> Running an animation at 60 frames per second is not always possible when animating complex views that issue a lot of drawing operations. This can be alleviated by using hardware layers to render the view to a hardware texture. The hardware texture can then be used to animate the view, eliminating the need for the view to constantly redraw itself when it is being animated.

So, there is hardware <em>acceleration</em> and then there is hardware <em>layers</em>. You need hardware acceleration to use the hardware layers of course, and the key point is that just because your views are hardware accelerated doesn't mean you are getting the maximum benefit of the hardware.

Another key point is that you should only enable hardware layers for a view for a short time (while you are animating it) because it is a limited resource that should only be used when needed. In fact, I have noticed that leaving a view in hardware layer actually causes graphic issues and artifacts.

The article linked above will show you how you can use <code>setLayerType</code> function before and after animating, but the code given is not really re-usable. I'm obsessed with DRY (but thats a different blog post) and so I wrote a animation listener class that you can easily hook on to any animation:

{% highlight java %}
public static class HardwareAccelerateListener extends AnimatorListenerAdapter {
    private View getView(Animator animation) {
        AnimatorSet set = (AnimatorSet)animation;
        return ((ObjectAnimator)set.getChildAnimations().get(0)).getTarget();
    }

    @Override
    public void onAnimationStart(Animator animation) {
        View view = getView(animation);

        if (view != null) {
            view.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        }
    }

    @Override
    public void onAnimationEnd(Animator animation) {         
        View view = getView(animation);

        if (view != null) {
            view.setLayerType(View.LAYER_TYPE_NONE, null);
        }
    }
}
{% endhighlight %}

Now you can easily use this by adding to your animation with **addListener**, and watch your animations get butter smooth!


