---
layout: post
author: Greg E.
title: RecyclerView, SwipeRefreshLayout, and the Empty View
tags: [android,recyclerview,swiperefreshlayout,view]
excerpt: A couple of common usage patterns on Android is to use the SwipeRefreshLayout to enable pull-to-refresh, and also to have a custom "empty" view that displays when there are no items in the list. Unfortunately trying to combine these two patterns often results in problems. 
---
A couple of common usage patterns on Android is to use the SwipeRefreshLayout to enable pull-to-refresh, and also to have a custom "empty" view that displays when there are no items in the list. Unfortunately trying to combine these two patterns often results in problems.

## SwipeRefreshLayout and RecyclerView

It's a common request to enable pull-to-refresh in any Android view. This can be accomplished easily using the support library's built-in SwipeRefreshLayout:

{% highlight xml %}
<SwipeRefreshLayout ...>
    <RecyclerView ... />
</SwipeRefreshLayout>
{% endhighlight %}

Now you just implement SwipeRefreshLayout.OnRefreshListener in your code and hook it up with some trivial glue code and you are good to go.

## RecyclerView and EmptyView

It's another common request to display some custom view when the list is empty. For example, let the user know why it's empty and give them some information or options to fix it.

Again, this is easily accomplished by just adding a view (by convention using the ID of `android.R.id.empty`) and showing or hiding it based on whether your adapter getItemCount() == 0.

It's even easier if you are still using a ListView for some reason - just call `setEmptyView` and it will work automagically.

## SwipeRefreshLayout, RecyclerView, and EmptyView

Trying to combine all three views results in bugs and problems. You might first try this (In this example, my TextView is the "empty" view):

{% highlight xml %}
<SwipeRefreshLayout ...>
    <RecyclerView ... />
    <TextView ... />
</SwipeRefreshLayout>
{% endhighlight %}

But, this crashes fast. You'll get the exception that SwipeRefreshLayout can only contain one child. So, you might try moving the empty view outside it:

{% highlight xml %}
<SwipeRefreshLayout ...>
    <RecyclerView ... />
</SwipeRefreshLayout>
<TextView ... />
{% endhighlight %}

This may seem to work, until you realize that the pull-to-refresh no longer works at all when the list has no items and the empty view is shown. So naturally, the empty view must be inside it. Another try might look like this:

{% highlight xml %}
<SwipeRefreshLayout ...>
  <FrameLayout>
    <RecyclerView ... />
    <TextView ... />
  </FrameLayout>
</SwipeRefreshLayout>
{% endhighlight %}
 
Now we are close. This seems to work at first, but soon you'll realize that scrolling up doesn't work. When you scroll the list down and try to scroll it back up, the pull-to-refresh kicks in! You can't scroll up, and the list refreshes instead. 

## Understanding and Fixing the Problem
 
To understand why this happens, you need to [check out the source code for SwipeRefreshLayout](https://android.googlesource.com/platform/frameworks/support/+/refs/heads/master/v4/java/android/support/v4/widget/SwipeRefreshLayout.java#647), in particular, the method `canChildScrollUp`. This is how the layout determines if it should treat the tracking down motion as a scroll gesture, or a pull-to-refresh gesture. 

The key point in this code is that the SwipeRefreshLayout checks it's target view - it's one child that it allows - to see if it can scroll up. But in this case, the child view is just a simple `FrameLayout` and the poor FrameLayout doesn't know about scrolling, it's the RecyclerView contained within it that needs to be checked.

So the solution lies in subclassing SwipeRefreshLayout and giving it the understanding that it contains a **nested** scrollable view. And that's what this class will do:

{% highlight java %}
public class SwipeRefreshLayoutWithEmpty extends SwipeRefreshLayout {
    private ViewGroup container;

    public SwipeRefreshLayoutWithEmpty(Context context) {
        super(context);
    }

    public SwipeRefreshLayoutWithEmpty(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    @Override
    public boolean canChildScrollUp() {
        // The swipe refresh layout has 2 children; the circle refresh indicator
        // and the view container. The container is needed here
        ViewGroup container = getContainer();
        if (container == null) {
            return false;
        }

        // The container has 2 children; the empty view and the scrollable view.
        if (container.getChildCount() != 2) {
            throw new RuntimeException("Container must have an empty view and content view");
        }

        // Use whichever one is visible and test that it can scroll
        View view = container.getChildAt(0);
        if (view.getVisibility() != View.VISIBLE) {
            view = container.getChildAt(1);
        }

        return ViewCompat.canScrollVertically(view, -1);
    }

    private ViewGroup getContainer() {
        // Cache this view
        if (container != null) {
            return container;
        }

        // The container may not be the first view. Need to iterate to find it
        for (int i=0; i<getChildCount(); i++) {
            if (getChildAt(i) instanceof ViewGroup) {
                container = (ViewGroup) getChildAt(i);
                break;
            }
        }

        if (container == null) {
            throw new RuntimeException("Container view not found");
        }

        return container;
    }
}
{% endhighlight %}

