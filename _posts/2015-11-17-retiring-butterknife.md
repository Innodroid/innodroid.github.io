---
layout: post
author: Greg E.
title: Retiring Butterknife
tags: [android,data binding,butterknife,java]
excerpt: Today I've retired another library from the toolbox. Here's what I'm using now.
---
Today I have forever put aside the most excellent [Butterknife Library](https://github.com/JakeWharton/butterknife). This library has served me well but I sadly now bid it farewell. I take my leave of you and retire you back to the utensil drawer from which you came.

## The data-binding library

I was very skeptical of the new [Data-Binding Library](http://developer.android.com/tools/data-binding/guide.html), for reasons explained below. However, with some pretty smart people throwing their weight behind it, and it being an official part of the Google support 
repository, apparently it's time to actually give it a look. Even if I find it lacking, I will be sure to run across it in many future projects, so at a minimum I need to get to know it.

## Basic usage

The thing to like about both these libraries is the way they remove the need for all the bloated Android boilerplate code around accessing the views in your layout. 

Assuming you have a RecyclerView defined with ID "recycler", in Butterknife you do it like this:

{% highlight java %}
public class MyFragment extends Fragment {
    @Bind(R.id.recycler) RecyclerView recycler;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_main, container, false);

        ButterKnife.bind(this, view);

        recycler.setLayoutManager(...);
        recycler.setAdapter(...);

        return view;
    }
}
{% endhighlight %}

And with the data-binding library it's:

{% highlight java %}
public class MyFragment extends Fragment {
    private MyFragmentBinding binding;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        binding = DataBindingUtil.inflate(inflater, R.layout.fragment_main, container, false);

        binding.recycler.setLayoutManager(...);
        binding.recycler.setAdapter(...);

        return binding.getRoot();
    }
}
{% endhighlight %}

**Winner**: So, at this point it's a tie. I have no opinion which one is better, they're pretty much the same to me.

## Click Handlers

In Butterknife you bind a click handler like so:

{% highlight xml %}
@OnClick(R.id.my_button)
public void clickButton() {
    ...
}
{% endhighlight %}

Awesome, I love that. The code is in the code where it should be.

In the data binding library, you've got to go back to your layout:

{% highlight xml %}
<View ....
    onClick="handlers.clickButton">	
{% endhighlight %}

And in java:
 
{% highlight java %}
public void clickButton(View view) {
    ....
}
{% endhighlight %}

Well, that kind of sucks because I've got the click handler usage seperated from where it is actually defined. *Wait*, I remember this, the `onClick` handler has been possible to define in layout since Android 1 - and it's basically been considered a bad practice since that very day. 

**Winner**: Butterknife 

## With More Features

Alright so now we get into features that the data-binding library offers that Butterknife has no answer to. That's not Butterknife's fault - it [does one thing and does it well](https://en.wikipedia.org/wiki/Unix_philosophy).  

With the data-binding library you can do stuff like this:

{% highlight xml %}
<TextView
    android:text="@{user.name}"
    android:visibility="@{user.isAuthenticated ? View.VISIBLE : View.GONE}" ... />
{% endhighlight %}

Well, that's neat but if you have been around a while you know *we've seen this before*. I'm going to back to my days in the MS tech stack, way back to classic ASP with a soup of code mixed into markup. Move forward then to .NET with web forms, and even now in Razor syntax, the jumble of data logic hopelessly lost inside markup. 

And still it persists in modern client frameworks, with javascript binding code an unsightly lump of gnarly logic ensared inside your polluted HTML markup.

#### Just Don't Take it Too Far!! (Please)

As far as I can tell this sort of problem isn't present in the data-binding library. It only supports very simplistic conditionals that bind directly to your model. Let's hope it stays that way. Google, please resist the temptation to allow complex code to creep into these layouts where it just doesn't belong. We've seen this before, and it doesn't end well.
 
**Winner**: Data-Binding Library 

