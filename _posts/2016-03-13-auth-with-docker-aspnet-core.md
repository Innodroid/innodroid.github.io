---
layout: post
author: Greg E.
title: Authentication with Docker in ASP.NET Core
tags: [mvc6,aspnet-core,aspnet5,docker,linux]
excerpt: Migrating an existing MVC5 site to ASP.NET Core running on Linux with Docker offered up a few unexpected challenges. This post is part of series covering these challenges and how to do deal with them.
---
Migrating an existing MVC5 site to ASP.NET Core running on Linux with Docker offered up a few unexpected challenges. This post is part of series covering these challenges and how to do deal with them.

## Conversion to Cookies Middleware

Authentication is done differently in ASP.NET Core. Instead of hooking the `AuthenticateRequest` event, you need to install [middleware](http://docs.asp.net/en/latest/fundamentals/middleware.html) that performs the authentication.

This involves putting code something like this in Startup.cs:

    app.UseCookieAuthentication(options => {
        options.LoginPath = "/Account/Login";
        options.AutomaticAuthenticate = true;
        options.AutomaticChallenge = true;
    });

Note that I'm not using [Identity](https://github.com/aspnet/Identity) here, which manages users and roles. If so I could just call `app.UseIdentity()`.

## Authentication Issue on Docker

Everything worked fine when developing locally, but when I first built things out on Docker and ran the pre-production site on Linux, I noticed an issue. Although the authentication worked properly, I would have to re-login every time the docker container was re-run (i.e., after a host reboot).

When attempting to load a secured page, the logfile from upstart shows this warning message:

    warn: Microsoft.AspNet.Authentication.Cookies.CookieAuthenticationMiddleware[0]
          Unprotect ticket failed

It turns out that ASP.NET cookie authentication has to to store the cookie data server-side somewhere. When running in a docker container, that local storage was being lost and re-created every time the container was run from the image. 

So after the container is re-run from the image, the cookie sent by the client is not recognized. That causes the error above.

## Resolving the Issue

Digging in to the log output more, I found this line when the app started:

    User profile is available. Using '/root/.aspnet/DataProtection-Keys' as key repository; keys will not be encrypted at rest.

That seems like the cause - the dot directory inside the container is being used to store the cookies. I searched for information on how to configure this directory to something else (also to understand more about the message that cookies would not be encrypted), but could not find any information how to do it.  

So, that left the option of mounting a host directory to the container on startup using the -v switch:

    docker run --name webapp -p 5000:5000 -v /var/aspnet-keys:/root/.aspnet/DataProtection-Keys

With this option the cookies are now being stored in the host directory /var/aspnet-keys. 

After running the app with this setup, I verified that logging in to the site created an XML file with some cookie information in the host directory. And, after reboot, the user stayed logged in to the site.

 