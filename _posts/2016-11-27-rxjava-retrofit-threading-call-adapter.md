---
layout: post
author: Greg E.
title: Retrofit Call Adapter for Android RxJava Threading
tags: [java,rxjava,retrofit,threading]
excerpt: Remove the need to call repetitive boilerplate `subscribeOn` and `observeOn` for every retrofit API call
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

## Removing the subscribeOn

Recognizing that you always want the call to happen on the IO thread, the [RxJava2CallAdapterFactory](https://github.com/JakeWharton/retrofit2-rxjava2-adapter) offers an overload to set this default when you setup retrofit. Instead of calling

{% highlight java %}
Retrofit.Builder()
    .baseUrl(...)
    .addCallAdapterFactory(RxJava2CallAdapterFactory.create())
{% endhighlight %}

You can call

{% highlight java %}
Retrofit.Builder()
    .baseUrl(...)
    .addCallAdapterFactory(RxJava2CallAdapterFactory.createWithScheduler(Schedulers.io()))
{% endhighlight %}

Pass in the IO scheduler to the adapter, and it will always be used for `subscribeOn`. The code in the adapter to make this happen is found [here](https://github.com/JakeWharton/retrofit2-rxjava2-adapter/blob/master/src/main/java/com/jakewharton/retrofit2/adapter/rxjava2/RxJava2CallAdapter.java#L64).

## Removing the observeOn

The RxJava2CallAdapter does not offer a similiar method to always observe on a specific scheduler, but it can be done by creating a new adapter that wraps the existing one and modifies the observable to do this:

{% highlight java %}
@Override
public <R> Observable<?> adapt(Call<R> call) {
    Observable observable = (Observable) wrapped.adapt(call);

    // Always handle result on main thread
    return observable.observeOn(AndroidSchedulers.mainThread());
}
{% endhighlight %}

This adapter can also call `createWithScheduler` on the wrapped adapter to handle both cases. 

## RxThreadingCallAdapterFactory

The full class that eliminates need for both boilerplate calls is here:

{% highlight java %}
public class RxThreadingCallAdapterFactory extends CallAdapter.Factory {
    private final RxJava2CallAdapterFactory original;

    private RxThreadingCallAdapterFactory() {
        // Always call on background thread
        original = RxJava2CallAdapterFactory.createWithScheduler(Schedulers.io());
    }

    public static CallAdapter.Factory create() {
        return new RxThreadingCallAdapterFactory();
    }

    @Override
    public CallAdapter<?> get(Type returnType, Annotation[] annotations, Retrofit retrofit) {
        return new RxCallAdapterWrapper(original.get(returnType, annotations, retrofit));
    }

    private static class RxCallAdapterWrapper implements CallAdapter<Observable<?>> {
        private final CallAdapter<?> wrapped;

        public RxCallAdapterWrapper(CallAdapter<?> wrapped) {
            this.wrapped = wrapped;
        }

        @Override
        public Type responseType() {
            return wrapped.responseType();
        }

        @Override
        public <R> Observable<?> adapt(Call<R> call) {
            Observable observable = (Observable) wrapped.adapt(call);

            // Always handle result on main thread
            return observable.observeOn(AndroidSchedulers.mainThread());
        }
    }
}
{% endhighlight %}

And to use it, pass to retrofit:

{% highlight java %}
Retrofit.Builder()
    .baseUrl(...)
    .addCallAdapterFactory(RxThreadingCallAdapterFactory.create())
{% endhighlight %}

And now your API call can simply look like this:

{% highlight java %}
api.getUser("grennis").subscribe { ... }
{% endhighlight %}
