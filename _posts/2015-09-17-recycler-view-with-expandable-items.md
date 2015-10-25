---
layout: post
author: Greg E.
title: Recycler View with Expandable Items
tags: [android,reycler, java]
excerpt: Take advantage of the Recycler View's ability to animate individual items in and out of the list to build a recycler view that has expandable and collapsible sections.
---
<strong>Demo</strong>

<iframe width="420" height="315"
src="http://www.youtube.com/embed/2_E4ky0uXd8">
</iframe>

<strong>Code</strong>

View the source and demo project <a href="https://github.com/grennis/ExpandableRecyclerView">on GitHub</a>.

<strong>How it Works</strong>

This is an implementation of the recycler view adapter that provides a re-usable way to implement expandable and collapsible header items. The user clicks a header item, which expands the arrow in the right side and "expands" the section by dynamically inserting the items belonging to that header.

I implemented this by defining a base class, `ExpandableRecyclerAdapter`. It is a generic class that takes one parameters, the list item type:

    public abstract class ExpandableRecyclerAdapter<T extends ExpandableRecyclerAdapter.ListItem> extends RecyclerView.Adapter<ExpandableRecyclerAdapter.ViewHolder> {

All the work is done in the adapter class. You do not need to subclass or alter the Reycler View itself.

When the user clicks a header item, the base adapter will automatically handle the click event and expand or collapse the section by inserting or removing items using the fine-grained notify methods available on the adapter.

<strong>Usage</strong>

To use in your app,

1. Derive your adapter class from `ExpandableRecyclerAdapter`
2. Define a `ListItem` class that derives from the base adapter's ListItem and populate your list with those items via `setItems`
3. Define the layouts for the header and list items, inflate those in your `onCreateViewHolder` method. ViewHolders must derive from the base adapter ViewHolder.
4. In `onBindViewHolder` make sure you `bind` the header item, as this will allow it to manage the arrow properly.

There are some nuances to working with the adapter, so be sure to <a href="https://github.com/grennis/ExpandableRecyclerView">check the example code on GitHub</a> and try it out!



