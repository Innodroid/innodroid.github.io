---
layout: post
title: Tracking Selected Item in RecyclerView
author: Greg E.
tags: [android,java,recyclerview]
excerpt: The RecyclerView widget is the next generation ListView for presenting a list (or grid) of items. It is more lightweight and flexible than ListView, but also therefore requires more application code to craft it to do specifically what's needed.<br><br>This post describes one such example, where the application must take care of tracking a 'selected item' in the list because the RecyclerView doesn't do that like the ListView did.
---
***Update - Please Note***

Since this article was written 2 years ago, more robust solutions are available in open source libraries. For example, see the [Flexible Adapter](https://github.com/davideas/FlexibleAdapter) among others.

**Recycler View**

The ListView widget has been around since Android 1.0 in 2009. It has been the backbone of any list-driven user interface. However, over the years the ListView has taken on too much responsibility and layer on layer of functionality has turned it into a beast. Just check the <a href="https://android.googlesource.com/platform/frameworks/base/+/refs/heads/master/core/java/android/widget/ListView.java">ListView Source Code</a>. That's 4,000 lines of state management and conditional logic just to handle a list of things.
The <a href="https://developer.android.com/reference/android/support/v7/widget/RecyclerView.html">RecyclerView</a> is the next generation widget for presenting a list (or grid) of items. It is more lightweight and flexible, but also therefore requires more application code to craft it to do specifically what's needed.

**Tracking Selection State**

One such example of where the ListView handled functionality (but the RecyclerView leaves it to the application code) is for tracking selection. The ListView will automatically keep track of a selected item (or items) and handle keyboard presses and touch events to automatically select and deselect items for you.

The RecyclerView does not attempt to do this. If you want to select an item, do it yourself. It's not that much code, but could be tricky to get it right.
First create a custom class derived from RecyclerView Adapter which uses a custom ViewHolder. This class will perform two major functions:

* Select an item when the item is clicked
* Select next/previous item when the keyboard arrow keys are clicked

To select items when they are clicked, the ViewHolder constructor attaches a click listener:

{% highlight java %}
public class ViewHolder extends RecyclerView.ViewHolder {
    public ViewHolder(View itemView) {
        super(itemView);

        // Handle item click and set the selection
        itemView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Redraw the old selection and the new
                notifyItemChanged(selectedItem);
                selectedItem = getLayoutPosition();
                notifyItemChanged(selectedItem);
            }
        });
    }
}
{% endhighlight %}

One interesting thing to note here is the user of notifyItemChanged. Instead of calling notifyDataSetChanged, which rebuilds everything in view, the notifyItemChanged method allows more fine-grained control of what gets updated. This helps improve performance.
To navigate the selection from item to item using the keyboard, the adapter attaches a keyboard event listener to the view and tries to select a different item using this helper function:

{% highlight java %}
// If still within valid bounds, move the selection, notify to redraw, and scroll
if (nextSelectItem >= 0 && nextSelectItem < getItemCount()) {
    notifyItemChanged(selectedItem);
    selectedItem = nextSelectItem;
    notifyItemChanged(selectedItem);
    lm.scrollToPosition(selectedItem);
    return true;
}
{% endhighlight %}

The interesting thing here is the call to the LayoutManager's scrollToPosition method. I was very happily surprised to see this method does just what I wanted. If the item is already visible, the view does not scroll. The view only scrolls enough to bring the item into view if it was offscreen. The ListView implementation, on the other hand, scrolls the item to the top - if you wanted to keep the list from scrolling, you had to do a bunch of math with offsets and call selectItemFromTop.
And that's it - the only other key point is that the adapter sets the itemView selection state based on the selected item position. You need to use a state list drawable on the item background to visually indicate the selected item.
Here's the whole class:

{% highlight java %}
public abstract class TrackSelectionAdapter<VH extends TrackSelectionAdapter.ViewHolder> extends RecyclerView.Adapter<VH> {
    // Start with first item selected
    private int selectedItem = 0;

    @Override
    public void onAttachedToRecyclerView(final RecyclerView recyclerView) {
        super.onAttachedToRecyclerView(recyclerView);

        // Handle key up and key down and attempt to move selection
        recyclerView.setOnKeyListener(new View.OnKeyListener() {
            @Override
            public boolean onKey(View v, int keyCode, KeyEvent event) {
                RecyclerView.LayoutManager lm = recyclerView.getLayoutManager();

                // Return false if scrolled to the bounds and allow focus to move off the list
                if (event.getAction() == KeyEvent.ACTION_DOWN) {
                    if (keyCode == KeyEvent.KEYCODE_DPAD_DOWN) {
                        return tryMoveSelection(lm, 1);
                    } else if (keyCode == KeyEvent.KEYCODE_DPAD_UP) {
                        return tryMoveSelection(lm, -1);
                    }
                }

                return false;
            }
        });
    }

    private boolean tryMoveSelection(RecyclerView.LayoutManager lm, int direction) {
        int nextSelectItem = selectedItem + direction;

        // If still within valid bounds, move the selection, notify to redraw, and scroll
        if (nextSelectItem &gt;= 0 &amp;&amp; nextSelectItem &lt; getItemCount()) {
            notifyItemChanged(selectedItem);
            selectedItem = nextSelectItem;
            notifyItemChanged(selectedItem);
            lm.scrollToPosition(selectedItem);
            return true;
        }

        return false;
    }

    @Override
    public void onBindViewHolder(VH viewHolder, int position) {
        // Set selected state; use a state list drawable to style the view
        viewHolder.itemView.setSelected(selectedItem == position);
    }

    public class ViewHolder extends RecyclerView.ViewHolder {
        public ViewHolder(View itemView) {
            super(itemView);

            // Handle item click and set the selection
            itemView.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    // Redraw the old selection and the new
                    notifyItemChanged(selectedItem);
                    selectedItem = mRecyclerView.getChildPosition(v);
                    notifyItemChanged(selectedItem);
                }
            });
        }
    }
}
{% endhighlight %}

Having fun with the RecyclerView? Leave a comment below.

