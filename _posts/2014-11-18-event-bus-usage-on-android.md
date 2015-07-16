---
layout: post
title: Event Bus Usage on Android
author: Greg E.
tags: [android,java,eventbus]
excerpt: Using an AsyncTask to do background work is common, but has pitfalls when used to send results back to the UI. An AsyncTask should never be tied to the lifecycle of the Activity or Fragment where it was created. Here's a simple example of how to use an Event Bus to decouple the background work from the elements that started it.
---
**Doing Background Work**

Let's say you have an app that requires some work to be done on a background thread, and then it needs to update the UI when the work completes. This work could be some database access or network communication.

The typical pattern in Android to do some background work is to use AsyncTask. In this example, my work is just going to be sleeping for a few seconds, and when finished, I'm going to show a message box to the user. Here is a complete implementation in a simple fragment:

{% highlight java %}
public class TestFragment extends Fragment {
    public TestFragment() {
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_main, container, false);
    }

    @Override
    public void onAttach(Activity activity) {
        super.onAttach(activity);

        new WorkTask().execute((Void)null);
    }

    private class WorkTask extends AsyncTask&lt;Void, Void, String&gt; {
        @Override
        protected String doInBackground(Void... params) {
            Thread.sleep(3000);

            return "Work Complete";
        }

        @Override
        protected void onPostExecute(String result) {
            super.onPostExecute(result);

            new AlertDialog.Builder(getActivity()).setTitle(result).create().show();
        }
    }
}
{% endhighlight %}

**Bugs**

This may seem to work, but there is a major problem. &nbsp;If the user navigates away from your activity with the back button while the work is in progress, the app crashes because the fragment has been detached and the activity has been destroyed. The call to getActivity() returns null, resulting in NullPointerException. You could easily work around this problem by doing a null check:

{% highlight java %}
if (getActivity() != null) {
 // Do stuff            
}
{% endhighlight %}

That may be good enough for the simple cases. But it quickly becomes error-prone and tedious to always remember to handle detached fragments, especially when the app becomes more complex. And what if you really need to handle the result in the UI? What if you want to show the dialog immediately even if the user is now in a different activity?

**Event Bus**

Stepping back for a moment, the problem here is that the AsyncTask is now tied to the lifecycle of the Activity or Fragment where it was created. This is the cause of the issues because the task&nbsp;in reality&nbsp;lives independently from those things. So how can it be decoupled?

The event bus can solve these problems. Use the bus to pass events up to any activity (or any other object) that is interested in it. There are a few common event buses to choose from, such as Green Robot or Otto. I will use Otto for this example. FIrst include this in build.gradle:

{% highlight text %}
dependencies {
    compile 'com.squareup:otto:1.3.+'
}
{% endhighlight %}

Then define the bus and event:

{% highlight java %}
public class Events {
    public static final Bus BUS = new Bus();

    public static class WorkCompleted {
        public String Result;

        public WorkCompleted(String result) {
            this.Result = result;
        }
    }
}
{% endhighlight %}

Here's how the event is published from the AsyncTask:

{% highlight java %}
@Override
protected void onPostExecute(String result) {
    super.onPostExecute(result);

    Events.BUS.post(new Events.WorkCompleted(result));
}
{% endhighlight %}

And the code to receive the event in the activity:

{% highlight java %}
@Override
protected void onStart() {
    super.onStart();

    Events.BUS.register(this);
}

@Override
protected void onStop() {
    super.onStop();

    Events.BUS.unregister(this);
}

@Subscribe
public void onWorkCompleted(Events.WorkCompleted e) {
    new AlertDialog.Builder(this).setTitle(e.Result).create().show();
}
{% endhighlight %}

Notice how the data is passed through the event. The activity registers and unregisters itself to only receive the event when it is started. Therefore the dialog is guaranteed to be shown only when the user is running the activity, and you don't need to remember any null checks or handle state management yourself. You can also handle the event and respond to it differently in different activities, and not have to check if the activity is null or destroyed.

