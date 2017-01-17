---
layout: post
author: Greg E.
title: RxJava vs Kotlin, and the Event Bus
tags: [rxjava,kotlin]
excerpt: RxJava offers a powerful and flexible set of features for handling decoupled scenarios. The trick is knowing when and where to apply it. This post details one situation where RxJava can be used in place of the event bus.
---
## Changing patterns moving to RxJava

I started with RxJava by just using the Retrofit support for it, making my interface methods return Observables. So, this way, I got some exposure to how things work and I've got the library already setup and ready to use in other situations.

I didn't really see the benefit of RxJava at this point though. I often see justification that I can us operators to process the results of API calls:

{% highlight java %}
// In RxJava
disposable = api.call(...)
    .subscribe { ... }
    .filter(new Func1<Thing, Boolean>() {
        @Override
        public Boolean call(Thing thing) {
            return thing.acceptable();
        }
    })
    .map(new Func1<Thing, Observable<Thing2>>() {
        @Override
        public Observable<Thing2> call(Thing1 thing) {
            return Observable.from(new Thing2(things));
        }
    })
    .subscribe(
        new Action1<Thing2>() {
        @Override
            public void call(Thing2 thing) {
                ...
            }
        });

// (In onDestroy)
if (disposable != null) {
    disposable.dispose();
}
{% endhighlight %}

But I don't think this is such a great advantage when using Kotlin. Kotlin has all these operations built in, with a more concise and readable syntax, and they work everywhere, not just on Observables:

{% highlight java %}
// In Kotlin
api.call(...)
    .subscribe { ... }
    .filter { it.acceptable() }
    .map { Thing2(it) }
{% endhighlight %}

Which would you rather work with?

But there must be compelling cases for RxJava, even with Kotlin, and one situation I knew RxJava could be applied is cases where I had been using an Event Bus. I figured I would resist any temptation to add the event bus library and instead work out how it's done with RxJava.  Indeed it turns out pretty nicely.

## The Scenario: Updating the Current User

The app holds some global data that's always present when the process is alive. One such piece of data is the user object, holding the current user name, email, and whatever else. This is held in memory and accessed wherever the UI needs to work with the current user.

When the user object changes (i.e., user logs in, or updated user information is retrieved from the API) the UI needs to be notified in some way so it can be updated.

In the past I handled this situation by using the event bus, but found a better way to do this also using RxJava.

## Using Event Bus

The event bus implementation of this scenario goes like this:

* The current user object is stored in UserData class
* The UI reads this information from UserData and displays it
* The UI (i.e., fragment) registers itself on the event bus when started
* Later, new user information is retrieved from API in the background. This new user info is set in UserData, and "user updated" event is published on worker thread
* The UI handles the "user updated" event on the main thread, gets latest user info, and updates the UI
* The UI unregisters from event bus when stopped

This all works well and gets the desired result, but it requires wiring everything up to work in each fragment and makes testing somewhat problematic. 

## Using RxJava

The event bus implementation of this scenario goes like this:

* The current user object is stored as a [BehaviorSubject](http://reactivex.io/RxJava/javadoc/rx/subjects/BehaviorSubject.html) in UserData class
* The UI gets the subject and subscribes to it, and immediately receives the first callback and displays current user info
* Later, new user information is retrieved from API in the background. This new user info is set `onNext` on the subject.
* The UI handles this callback on the main thread and updates the user info
* The UI unsubscribes from user when stopped

There are fewer steps here, but there's a much more important (although more subtle) benefit: The way the UI updates the user information is the *same* mechanism used to initially display it. 

There's only one wiring up of the handler to display user info, as opposed to an event bus where displaying the initial user information and updating it later is done via two different code paths.

## More Scenarios ahead

This is a basic scenario and one surely obvious to an RxJava veteran, but there's definitely something to the idea of learning to "think in Rx" and recognizing where it can be applied and work up to more advanced cases.

