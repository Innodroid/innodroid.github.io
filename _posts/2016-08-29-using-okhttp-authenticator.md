---
layout: post
author: Greg E.
title: Using the OkHttp Authenticator
tags: [android,okhttp,retrofit,authenticator]
excerpt: Using <a href="http://square.github.io/okhttp/">OkHttp</a> is THE way to go for an HTTP client, and <a href="http://square.github.io/retrofit/">Retrofit</a> is the THE way to go for building a REST API client on top of that. Recently I needed to implement a feature and feared that I had hit some limitation with this stack, but of course, I was wrong - OkHttp has it covered!
---
## OkHttp and Retrofit

First of all, let me say that using <a href="http://square.github.io/okhttp/">OkHttp</a> is **the** way to go for an HTTP client, and <a href="http://square.github.io/retrofit/">Retrofit</a> is the **the** way to go for building a REST API client on top of that. Seriously. When I see an app with an entire custom networking stack built on top of the Apache HTTP libraries, I cry a little bit (and if *I'm* going to have to work on it, it's more than a little).

Recently I needed to implement a feature and feared that I had hit some limitation with this stack, but of course, I was wrong - OkHttp has it covered!

## The Scenario

I've used OkHttp in a lot of apps, and have used it's builder pipeline to configure all the scenarios I needed:

* Handle cookies with `cookieJar(...)`
* Automatically handle cache headers by setting up a persistent cache with `cache(...)` 
* Set authorization header or custom auth token with `addInterceptor(...)` 
* Set user agent and handle other headers also with `addInterceptor(...)`

But this particular app has an API with an interesting limitation - the authentication tokens only last for ~15 minutes, at which point the server starts rejecting authentication tokens HTTP 401 Unauthorized.

There is no token renewal - the app must re-send the user's credentials on the login API to get a new token.

This is a big problem, because the 401 can happen at any time across any of dozens of API calls and the client must get a new token *and then retry the same request* to continue seamlessly, the user unaware that any of this has happened. To try to handle this manually would be unworkable.

## Authenticator 

Attempting to implement this retry logic using an interceptor would be hazardous. It's not clear to me what happens if you execute a synchronous HTTP call while inside the interceptor of another HTTP call, and even if you could, there's no real way to retry the request without implementing a ton of app logic.

I hadn't paid any attention to the `authenticator(...)` call on the OkHttp builder since I really hadn't needed it. I'm already using interceptors to handle headers, so I just add another line to send the authentication header if the user is logged in.

But as it turns out, the authenticator handles this scenario beautifully. The authenticator is called whenever the server returns a 401 error. It gives the app a chance to do what it needs, but the key is also that the authenticator is ***given the request that failed*** can then ***return a request*** for the OkHttp client to retry automatically. So, it ends up looking like:

{% highlight java %}
// Authenticator that will refresh access token
Authenticator authenticator = new Authenticator() {
    @Override
    public Request authenticate(Route route, okhttp3.Response response) throws IOException {
        // If we were trying to login, bail out now
        if (isLoginRequest(response.request())) {
            Log.i(TAG, "Not retrying authentication on login");
            return null;
        }

        // Get and store the new auth token using credentials
        Log.i(TAG, "Retrying authentication");
        login();

        // The new token has been stored, can now retry
        Request.Builder builder = response.request().newBuilder();
        addAuthHeaderToRequest(builder);
        return builder.build();
    }
};

// Build the http client
OkHttpClient client = new OkHttpClient.Builder()
    .authenticator(authenticator)
    // -- other client setup --
    .build();
{% endhighlight %}

A couple of caveats here:

* The server also returns 401 if the user login attempt fails, but we don't want to try to re-login here. That would cause an infinite loop hammering the server with the same (non-working) credentials. So, `isLoginRequest` just checks if the URL path matches the login API.
* Returning `null` from the authenticator, or throwing an exception, tells OkHttp that you couldn't handle the authentication request. So, the 401 error is returned back up to the original request that caused it to happen, which is very likely what you want to do.
* The `login` call above just issues a synchronous HTTP call to get the new authentication token and then stores it for use again in subsequent calls (and in the following call, explained in next point)
* Once you successfully re-authenticate, you'll need to modify the original request by updating the authentication header with the new value. OkHttp requests are immutable, but have a `newBuilder` method that will start you with a builder that will generate the same request. Then `addAuthHeaderToRequest` is called to modify just that part of the request.

This works like a champ as now the application and the user are totally unaware if or when the authenticator is transparently refreshing tokens during API calls.

