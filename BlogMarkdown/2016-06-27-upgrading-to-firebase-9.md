---
layout: post
author: Greg E.
title: Upgrading to Firebase 9
tags: [android,firebase]
excerpt: Some notes on upgrading to Firebase 9
---
## Firebase 9
Google is very proud of their recent acquisition of Firebase and is feverishly working to rebrand everything under that name. I'm sure they aren't said to see Parse shutdown either and now stand as one of the few remaining backend-as-a-solution offerings. Firebase still doesn't really compare to Parse as a database, but that's a different post.

As part of this quest of Firebase-ing everything, (Firebase Cloud Messaging? Really?) Google has upgrade the Android SDK to version 9 (from version 3...) and they weren't shy about making some breaking changes. Here's what I ran into doing this upgrade.

## Upgrading all the way from version 2.5

OK so actually 2.5 was the previous version, but this must be a big deal if we jumped ahead 6 major versions?

### Imports

Looks like all package names are changed from `com.firebase.client.*` to `com.google.firebase.database.*`. You could search and replace and deal with any other changes in sub-packages, but don't bother. Just delete your imports and let Android Studio re-import everything you need. It's mostly all there.

### The dreaded google-services.json 

This code won't compile anymore:

{% highlight java %}
new Firebase(FIREBASE_URL);
{% endhighlight %}

Quick check of the sample looks like it's now:

{% highlight java %}
FirebaseDatabase.getInstance();
{% endhighlight %}

Well, that's easy enough, but how do I specify what database I'm talking to? Something is amiss. Have to actually check [the docs](https://firebase.google.com/docs/android/setup) here, and that chilling feeling of dread sinks in as I see that things "may happen automatically" (that's a quote) and the instructions to "just" go download the google-services.json file.

The first problem I have here is I don't even know how this would work if I wanted to talk to 2 different Firebase databases, since the one ID is hard-coded in that file. Or what would happen if I needed to use analytics from one google project, but firebase from another. It was only just recently that support was added for using different google projects for different build variants, so at least we have that now.

No doubt it is possible somehow to programmatically setup Firebase without the file, but you are kind of on your own doing this, and if it's anything like GCM (oh, excuse me, that's FCM - for now), it's not well documented and breaks with every new version. We're all adults here Google, we can deal with API keys. This google-services json stuff is just an abomination.

### Make it compile

FirebaseError is now DatabaseError, firebase.child(...) is now firebase.getReference(...), etc., etc, all the usual stuff being renamed for no apparent reason.

### Authentication

This code:

{% highlight java %}
firebase.authWithOAuthToken("facebook", token, new Firebase.AuthResultHandler() {
{% endhighlight %}

is now:

{% highlight java %}
AuthCredential credential = FacebookAuthProvider.getCredential(token);
authentication.signInWithCustomToken(...)
{% endhighlight %}

Alright, so I do like this a lot better. The magic "facebook" string is gone and this looks a lot more extensible and future-proof.

### Everything works now, enjoy the new console

I also do really like the new console and it's loaded up with new (or rebranded) stuff that Google is organizing into it. Firebase storage in particular looks really nice and I'll be using that as well.


