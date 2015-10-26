---
layout: post
author: Greg E.
title: Controlling cookies, headers, and user agent in the Android WebView
tags: [android,reycler, java]
excerpt: Often it's necessary to set cookies and headers or set the user agent using the Android Webview. These are all done in different ways in different scenarios and API levels.
---
Often it's necessary to set cookies and headers or set the user agent using the Android Webview. These are all done in different ways in different scenarios and API levels.

<strong>Cookies (API level pre-21)</strong>

To set cookies before Lollipop, use the CookieSyncManager and it's synchronous methods:

    CookieSyncManager.createInstance(webView.getContext());
    CookieManager cookieManager = CookieManager.getInstance();
    cookieManager.removeSessionCookie();
   
    cookieManager.setCookie("name", "value");
    
    CookieSyncManager.getInstance().sync();

Note the call to `removeSessionCookie` and `sync` are synchronous and will cause the UI thread will block while they happen. Even though this is probably not an issue because the delay should not be perceptible to the user, it's not ideal.

The good news is you probably don't need those calls, `removeSessionCookie` is likely not necessary if you are replacing it anyway, and the `sync` method just flushes the RAM cache to disk. It isn't necessary because the webview and the cookie manager already share the same in-memory database. So, if you are just setting up cookies for the webview to immediately use, you don't need it.

<strong>Cookies (API level 21+)</strong>

These methods shown above to manage cookies - in face, the entire manager - was deprecated. You can now do this to do the same:

    CookieManager cookieManager = CookieManager.getInstance();
    cookieManager.setCookie("name", "value");
    cookieManager.flush();

Again, the `flush` call is synchronous but not actually necessary if you just want to setup the cookies for the webview to render.

Note these calls require API level 21. Your app will crash if you run this on a pre-21 device, so make sure you guard it wil runtime API level checks.

<strong>Headers (Initial Load)</strong>

Headers are easy to setup for a webview if you only need them to be set on the initial request for the content made by the webview:

    Map<String, String> headers = new HashMap<>();
    headers.put("name", "value");
    web.loadUrl("http://mysite.com", headers);

The call to `loadUrl` is overloaded to take an additional parameter, a map of headers.

<strong>Headers (Every Request) - API level pre-21</strong>

Settings the headers is more difficult if you want to set them on every request made by the webview. You'll need to:

* Override `shouldInterceptRequest` of the `WebViewClient`.
* Check if the URL being loaded matches the domain for the site you want to send headers to. You don't want to be sending your authentication headers all over the internet!
* If you determine to set headers, manually construct the `WebResourceResponse` from a `HttpsURLConnection`.

Here's a code sample:

    @Override
    @SuppressWarnings("deprecation")  // Deprecated until api 21
    public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
        Uri uri = Uri.parse(url);

        if (uri.getHost().equalsIgnoreCase(MY_DOMAIN_NAME)) {
            return loadRequestWithHeaders(url);
        } else {
            return super.shouldInterceptRequest(view, url);
        }
    }

    private WebResourceResponse loadRequestWithHeaders(String url) {
        try {
            URL urlObject = new URL(url);
            HttpURLConnection con = (HttpURLConnection) urlObject.openConnection();

            con.setRequestProperty("headerName", "headerValue");

            String[] types = parseContentHeader(con.getContentType());
            return new WebResourceResponse(types[0], types[1], con.getInputStream());
        } catch (Exception ex) {
            return null;
        }
    }

<strong>Headers (Every Request) - API 21+</strong>

Once again we have an API that was deprecated and replace. For API 21+, you'll want to use the overload to `shouldInterceptRequest` that passes the `WebResourceRequest` with more information, instead of just the URL string. 

<strong>User Agent</strong>

You could set the user agent by setting the `User-Agent` string as a header shown above, but it also has a dedicated API:

    webview.getSettings().setUserAgentString("My App Agent");

