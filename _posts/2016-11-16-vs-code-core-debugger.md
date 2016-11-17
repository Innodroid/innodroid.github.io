---
layout: post
author: Greg E.
title: .NET Core Debugger in VS Code
tags: [.net,visual studio code,debugger]
excerpt: 
---
## Background

Using VS Code on the Mac to code up .NET has been a pretty good experience and constantly improving. 

One thing that never really seemed to work for me, however, was using the integrated debugger. I knew in theory it worked, saw it work in other demos, but it always failed with some cryptic error or another on my setup.

With the release of <a href="https://blogs.msdn.microsoft.com/dotnet/2016/11/16/announcing-net-core-1-1/">.NET Core 1.1</a> I figured it must be working these days. But, it didn't.

## The Error

I updated the app to 1.1, and attempted to debug the project and got the message:

{% highlight bash %}
Failed to start debugger: File bin/Debug/dnxcore50/libhostpolicy.dylib not found
{% endhighlight %}

OK, yeah this thing never works. Well, version 1.1 just came out so maybe something's out of date. I checked for updates to VS Code, but nothing. I did remember reading at some point that all C#-related support had been moved to the extension, and sure enough there was an update available for it. I updated and on reloading watched a lot of impressive looking updates churning in the output window. 

It still didn't work.

After floundering around for a while, with Google searches coming up empty, and Stack Overflow having nothing to say about it, I tried looking in the directory where it was complaining. 

{% highlight bash %}
Gregs-MBP:Debug grennis$ ls
dnxcore50	netcoreapp1.0	netcoreapp1.1
{% endhighlight %}

Hang on... there are output directories here, and VS code is complaining about a file in the ancient `dnxcore50` directory! It should of course be using `netcoreapp1.1`. 

I know that VS Code creates a `launch.json` file when you first attempt to run the debugger which has a bunch of settings in it. I found this file located in the `.vscode` directory, and indeed, that's the problem. In the configuration section of the file I see:

{% highlight json %}
"program": "${workspaceRoot}/bin/Debug/dnxcore50/app.dll",
{% endhighlight %}

I could just fix that directory name, but chances are there are other old items in here causing issues. Better to delete the file completely and let VS code regenerated it - and that worked. I ended up checking where `launch.json` is located (in a dir named `.vscode`) and there was one other file there (`tasks.json`). 

So, I just nuked the entire `.vscode` directory, relaunched, and the debugger worked flawlessly. It would be nice if VS Code automatically managed this file after generating it, but the fix is simple enough. 

