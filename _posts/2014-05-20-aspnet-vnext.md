---
layout: post
title: ASP.NET vNext
author: Greg E.
tags: [c#,asp.net,nodejs]
excerpt: Watching Scott Hanselman on stage at TechEd using a Mac must have raised some eyebrows but then watching him deploy and run an ASP.NET app on the Mac OS command line must have seriously blown some minds.<br><br>Microsoft just recently announced ASP.NET vNext. What is interesting about this is it is not just some new features or new tooling. This is a total re-write and re-think of ASP.NET itself. But it isn't really new.
---
Microsoft just recently announced ASP.NET vNext at the TechEd conference. What is interesting about this is it is not just some new features or new tooling. This is a total re-write and re-think of ASP.NET itself. But it isn't really new.

Watching <a href="audience.%20http:/www.hanselman.com/blog/TheFutureOfNETOnTheServerASPNETVNextContentAndVideosFromTechEd2014.aspx">Scott Hanselman on stage</a> using a Mac must have raised some eyebrows but then watching him deploy and run an ASP.NET app on the Mac OS command line must have seriously blown some minds. It is kind of bizarre - here is what hit me:

* all this code is on github (or will be soon)
* it's cross platform
* there is no compilation build step
* there is no .csproj, .sln, web.config anymore
* it is very very node-like

It's the last bullet point that is very cool and yet really fizzles out at the same time. If I'm a skilled cross-platform developer looking at this, why do I need it? I already have something just like it and I'm already using that. But here's where it differs:

* It's not javascript. Sometimes it's nice to do some static & strong typed coding
* It's multi-threaded
* To the point above, but worth calling out: no need for deeply nested async callback chains. (Yes you could also use a promise library of your choosing - and hack and patch it in with others and Node core APIs).
* It's from Microsoft so plenty of developers will never give it a chance.

So we'll see if Microsoft can pull this off as a new re-imaging of ASP.NET, or if this cloud-optimized runtime just is too little too late and ignored both by the open source/cross-platform community and the enterprise alike.
