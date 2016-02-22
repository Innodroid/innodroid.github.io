---
layout: post
author: Greg E.
title: A Complex Activity Transition (Part 2)
tags: [android,transitions,animations]
excerpt: Activity transitions can provide a very nice effect. They provide continuity from one screen to another and give the user nice feedback as to what's happening. Sadly, the documentation and available resources are entirely lacking on how do it right and how to handle anything more than the most simple case.
---
Activity transitions can provide a very nice effect. They provide continuity from one screen to another and give the user nice feedback as to what's happening. Sadly, the documentation and available resources are entirely lacking on how do it right and how to handle anything more than the most simple case.

[Part 1](http://innodroid.com/blog/post/a-complex-activity-transition-part-1) covered how to setup transition code and this part covers the code to make it happen and includes the demo project.

## Demo Project

<iframe width="420" height="315"
src="http://www.youtube.com/embed/On3dzeAXx-w">
</iframe>

Also check out the [demo project on GitHub](https://github.com/grennis/ComplexTransitionDemo). Now here's the code to make it happen.

### Launch the Activity

When the user clicks on the thumbnail image we'll need to start the activity with an options bundle that specifies the transition:
 
    Intent intent = new Intent(context, PagerActivity.class);
    intent.putExtra(PagerActivity.EXTRA_POSITION, position);

    Activity activity = (Activity)context;
    ActivityOptionsCompat options = ActivityOptionsCompat.makeSceneTransitionAnimation(activity, view, TRANSITION_NAME);
    ActivityCompat.startActivity(activity, intent, options.toBundle());

First note the use of the `Compat` classes so that on Android pre-Lollipop the transitions will just be skipped. The `view` parameter is the ImageView in the grid that we are going to expand fullscreen. And finally, `TRANSITION_NAME` is the name of the transition, which is used just in case we may be launching different activities in different scenarios. This will allow us, if needed, to identiy which transition is in progress. Otherwise just set it to any random string.

### Set Listeners

You'll need to set transition enter and element listener callbacks to handle the transition between the recyclerview adapter and the ViewPager adapter.
 
You must set *enter* and *exit* transition listeners to identify the view that will animate during the transition. You might think *enter* means the activity starting and *exit* means the activity stopping, but it gets a little murky when the user is going **back**. In this case, the activity they are *leaving* is still the *enter* activity and the activity they are running *to* is the still the *exit* activity. Clear as mud.

The purpose of the listener is to allow you at runtime to identify the views that you want to animate. The grid activity of thumbnails would specify an **exit** listener like this:

    // Thumbnail grid activity
    protected void onCreate(Bundle savedInstanceState) {
        ActivityCompat.setExitSharedElementCallback(this, ExitTransitionCallback);
        ...
    }

And the image viewer activity has the **enter** listener:

    // Image detail activity
    protected void onCreate(Bundle savedInstanceState) {
        ActivityCompat.setEnterSharedElementCallback(this, EnterTransitionCallback);
        ...
    }

Keep in mind these callbacks are both called when go to *and* from the detail activity.

### Delaying the Transition

When the image viewer activity starts, it doesn't yet have the data loaded into the adapter for the view pager. When Android tries to run the transition, it won't have an image to transition to yet. So in `onCreate` another call is made, to delay the transition:

    ActivityCompat.postponeEnterTransition(this);
 
 And then later, when the adapter has been populated (often from an async call, for example) and pager has done layout, the transition can be started:
 
    ActivityCompat.startPostponedEnterTransition(PagerActivity.this);

## Transition Callbacks

The exit callback of the thumbnails grid looks like this (keep in mind it's called both when leaving the activity and returning to it via the back button):

    private final SharedElementCallback ExitTransitionCallback = new SharedElementCallback() {
        @Override
        public void onMapSharedElements(List<String> names, Map<String, View> sharedElements) {
            if (PagerActivity.SelectedIndex < 0) {
                // When transitioning out, use the view already specified in makeSceneTransition
            } else {
                // When transitioning back in, use the thumbnail at index the user had swiped to in the pager activity
                sharedElements.put(names.get(0), adapter.getViewAtIndex(recycler, PagerActivity.SelectedIndex));
                PagerActivity.SelectedIndex = -1;
            }
        }
    };

When transitioning out, there's nothing to do because the ImageView was already provided in the "Launch Activity" code above. When returning, this code takes the image that was selected in the ViewPager and transitions back to the corresponding thumbnail. (See code for `getViewAtIndex` in the demo app).

The enter callback of the image viewer looks like this:

    private final SharedElementCallback EnterTransitionCallback = new SharedElementCallback() {
        @SuppressLint("NewApi")
        @Override
        public void onMapSharedElements(List<String> names, Map<String, View> sharedElements) {
            View view = null;

            if (pager.getChildCount() > 0) {
                view = adapter.getCurrentView(pager);
                view = view.findViewById(R.id.pager_image);
            }

            if (view != null) {
                sharedElements.put(names.get(0), view);
            }
        }
    };

In this code, whether coming or going from the activity, the correct ImageView to use in the transition is the one centered in the view pager. Keep in mind the ViewPager has multiple children, one onscreen and others offscreen. So this code will use a utility function find that center view. 

## Issues

The app demos how to delay the transition until the adapter has been populated using `postponeEnterTransition`, however there is no way to delay the exit transition. This means when returning to the thumbnails grid, the data has to be already populated and ready. That's OK for this simple demo app, but in a situation where the data set changes (i.e., user can add or delete photos from the pager activity), there's no way to do a return transition because the views are out of date, and no way to delay the transition while they are updated. 

If the user swipes to an image that has a thumbnail offscreen, there is no return transition bcause there is no thumbnail view to return to. It should be possible to provide an offscren view (that would not exist in the recycler) in the approximate position of where the thumbnail would be.

## Show me the code

The entire project is available on [GitHub](https://github.com/grennis/ComplexTransitionDemo). Please check it out and leave any feedback you have!
