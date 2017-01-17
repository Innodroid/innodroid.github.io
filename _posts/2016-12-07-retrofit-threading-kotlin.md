---
layout: post
author: Greg E.
title: Kotlin Handling of Android RxJava Threading
tags: [kotlin,rxjava,retrofit,threading]
excerpt: Use Kotlin for a much more concise method to remove the need to call repetitive boilerplate `subscribeOn` and `observeOn` for every retrofit API call.
---
## Retrofit RxJava Call Pattern

If you are using retrofit with RxJava observables, you are very familiar with this code:

{% highlight java %}
api.getUser("grennis")
    .subscribeOn(Schedulers.io())
    .observeOn(AndroidSchedulers.mainThread())
    .subscribe { ... }
{% endhighlight %}

This sets up the API call to execute on the IO thread, and run your handler to process the results on the main thread using the [RxAndroid](https://github.com/ReactiveX/RxAndroid) scheduler.

Well, 100% of the time you want the call to happen on the IO thread, and you *almost* always want the result on the main thread. The one exception here I can think of is if you want to chain calls together on a background thread, but in this case you don't really need the observable pattern at all - just use the retrofit convention that returns `Call<T>`.

This is code that is repeated everywhere. It's boilerplate, does no good and can only lead to mistakes.

## Solution in Java

[In the previous post](/blog/post/rxjava-retrofit-threading-call-adapter) I discussed a solution for handling this problem in Java.

## Solution in Kotlin

Resolving this problem in Kotlin requires much less code, of course.

The key is to use an extension method to extend the Observable (or Single) returned by the retrofit interface to call these methods for you as well as `subscribe`:

{% highlight java %}
protected fun <T> Single<T>.call(callback: (T) -> Unit) : Unit {
    this.subscribeOn(Schedulers.io())
        .observeOn(AndroidSchedulers.mainThread())
        .subscribe( { callback(it) },
                    { handleApiError(it) })
}
{% endhighlight %}

Now, use this `call` extension method on all your API calls to do the work for you:

{% highlight java %}
api.getUser("grennis").call { handleResult(it) }
{% endhighlight %}

Note that the extension method can be a member of your class (unlike C# where extensions much be static), so you can call helper instance methods like `handleApiError`.

*How appropriate that this post is so much shorter than the Java version!*
