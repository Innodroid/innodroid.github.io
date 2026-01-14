---
layout: post
author: Greg E.
title: Beware the curse of Android Studio 'import static'
tags: [android studio,java]
excerpt: Sometimes the default options aren't want you want, ever.
---
## A simple change gone wrong

I had some simple code in my Activity `onCreate` method:

{% highlight java %}
@Override
protected void onCreate(Bundle savedInstanceState) {
  // (Random code...)
  
  if (mode == MODE_EDIT) {
    // Do something
  }
}
{% endhighlight %}

I needed to do a similiar "something" elsewhere in the activity - no problem, right? The 'mode' comes from an extra I got from the intent, so can I just write this code at the bottom of the file:

{% highlight java %}
private void foobar() {}
  if (mode == MODE_EDIT) {
      // Do something
  }
}
{% endhighlight %}

Great, this code compiled and it will work fine. The only problem is, it didn't. Oh... it compiled just fine, but it didn't work. The `if` block was not executing when it should.

What's happening?

After jumping back and forth around the code, I saw the problem. The field `mode` isn't actually a member variable of the class. It was just a local variable in `onCreate`:

{% highlight java %}
@Override
protected void onCreate(Bundle savedInstanceState) {
  int mode = getIntent().getIntExtra(EXTRA_MODE, GameState.MODE_GAME);
  
  // etc..
}
{% endhighlight %}

So how could I have accessed `mode` from another method? I knew the answer already as I've run into this before. Android Studio in it's infinite wisdom had automatically inserted an import static at the top of the file:

{% highlight java %}
import static android.R.attr.mode;
{% endhighlight %}

Wow! I'm pretty sure that's **never** what anybody wants, but it's the default behavior of Android Studio since sometime recently when I started repeatedly having this problem. So, lesson learned:

* Just about every variable name you can think of can be imported static from `android.R.attr`. 
* You just about never want this to happen

So for now just turn off this behavior completely:

<img src="/blog/no_static_import.png" alt="Turn this off" />

