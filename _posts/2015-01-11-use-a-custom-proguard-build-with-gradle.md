---
layout: post
title: Use a custom ProGuard build with Gradle
author: Greg E.
tags: [android,gradle,proguard]
excerpt: ProGuard is a minifier and obfuscator for Android code. It is an essential step of the process to publish you app to the Play Store. But what happens if you run into a bug in ProGuard itself? Fortunately, ProGuard is open source and you can run your own patched build. Here's how.
---
**Background**

ProGuard is a minifier and obfuscator for Android code. It is an essential step of the process to publish you app to the Play Store. But what happens if you run into a bug in ProGuard itself? Fortunately, ProGuard is open source and you can run your own patched build. Here's how.
A project I have involves the use of the <a href="http://unity3d.com/">Unity 3D Game Engine</a> to display some 3D content in one of the views in the app. Unfortunately, due to a <a href="http://sourceforge.net/p/proguard/bugs/420/">known incompatibility in Proguard itself</a>, the build would fail with a stack trace containing messages such as:

{% highlight text %}
Can't process class [com/unity3d/player/e$a$e.class] (Unknown verification type [69] in stack map frame
{% endhighlight %}

And it's dead in the water. Any attempt to use the Unity 3D library in any way results in this error. Eric Lafortune, the ProGuard maintainer, has asserted that this problem is due to an issue with the way Unity 3D is built and has already marked the bug as <a href="http://sourceforge.net/p/proguard/bugs/420/">won't fix</a>, But regardless of where the blame lies, your only options are to either skip the ProGuard step, or patch the code yourself.

Skipping the ProGuard step is not an option for me, and fortunately Eric mentioned in the discussion how to work around the issue. So here's how to update the library to do just that:

**Get and Patch the Code**

First, get the code from <a href="http://proguard.sourceforge.net/">the ProGuard site</a> on SourceForge. You can either fork or clone the repository using mercurial or just download the source archive. Note that you're not going to be submitting a pull request for this, so it doesn't matter too much unless you want to maintain your own fork.

In the src directory, open the file ClassContacts.java and replace this line:

{% highlight java %}
public static final String ATTR_StackMapTable = "StackMapTable";
{% endhighlight %}

with this:

{% highlight java %}
public static final String ATTR_StackMapTable = "dummy";
{% endhighlight %}

This effectively disables some parsing of metadata that ProGuard does. The metadata in question is not relevant to Android builds anyway, and so this should not cause any harm.

**Build the ProGuard Library**

Build the ProGuard library with the build.xml script provided for <a href="http://ant.apache.org/">Apache Ant</a>. If you already have the Android development environment setup, you should have all the pre-requisites already for building successfully.

The result of this will be a "proguard.jar" file located in the build directory.

**Use the Patched Library**

Now you need to tell the Gradle build process to use the patched custom jar file instead of the one that comes with the SDK.
First, copy the jar file somewhere in your project structure - I put it in a directory named "proguard" off the root. Then, modify the build.gradle at the root of the directory structure (not the project root) to let it know where to find the jar:

{% highlight text %}
buildscript {
    repositories {
        flatDir { dirs 'proguard' }
        mavenCentral()
    }
    dependencies {
        classpath 'proguard.io:proguard:5.0'
        classpath 'com.android.tools.build:gradle:1.0.+'
    }
}
{% endhighlight %}

Note that I am using ProGuard 5.0, but you may need to adjust this version based on which version you downloaded.

Thanks to Eric Lafortune for originally mentioning how to work around this problem.
