---
layout: post
author: Greg E.
title: Did you ever forget to call Toast.show()?
tags: [android,toast]
excerpt: Don't feel bad if you did that - look who else did it.
---
In starting Android development it is inevitable that a developer new to the framework will call `Toast.makeText`, but then forget to call `show`.

I thought this was the kind of mistake I would only make once until it happened again recently. But then I realized, this wasn't code I wrote - this is code I copied and pasted. And from where? None other than [Google's Own Documentation](https://developer.android.com/guide/topics/ui/drag-drop.html#RespondEventSample) on drag and drop.

![Something Missing?](/blog/toast_missing.png)

So hey, if it happens to you, don't worry - it happens to best of us.
