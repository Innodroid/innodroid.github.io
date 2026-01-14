---
layout: post
title: Migrating from In-App Billing v2 to v3
author: Greg E.
tags: [android,services,billing]
excerpt: Like many other developers I got the email "Google Play In-app Billing Version 2 will be shut down in January 2015". But this isn't just a matter of dropping in a new library and recompiling. This is a completely new pattern for doing in-app purchasing.<br><br>In this post I ran through the experience I had switching from the V2 to V3 billing API for a couple of my apps. I also threw out some thoughts on why this API really is better and easier to work with.
---
**The Dreaded Email**

I was having a good day when I received this email from Google:

> Beginning January 2015, we will end support for the In-app Billing Version 2 API. After this date, users will no longer be able to make in-app purchases using your app until you upgrade your app to use the Version 3 API.

I'm actually pretty surprised by this because, although I was aware of the V3 billing API and was in fact using it already in my newer apps, I thought this was merely a client-side library upgrade. But apparently this upgrade also reflects a wholesale change in the protocol that requires Google to actually shut down the server support for the older API.

They then went on to name a couple of apps I have that apparently are still using V2 of the billing API. What's weird is that one of the apps they named is already on V3 and as far as I can tell, never used V2 at all. So I'm not sure what's going on there, but I can only hope that app will continue to work after January 15. That did leave 1 remaining app which is definitely on the V2 API.

**Out with the Old, In with the New**

The way I normally go about this is just remove the old stuff, drop in the new stuff, and let the compiler tell me where to fix things. Once I get it compiling I'm mostly done. I'm not going to look at the docs and I sure am not going to even consider the sample code. So let's see what this will involve in this case. Here's the V2 interface, in IMarketBillingService.aidl:

{% highlight java %}
interface IMarketBillingService {
  Bundle sendBillingRequest(in Bundle bundle);
}
{% endhighlight %}

And here's the V3 interface in IInAppBillingService.aidl:

{% highlight java %}
interface IInAppBillingService {
  int isBillingSupported(int apiVersion, String packageName, String type);
  Bundle getSkuDetails(int apiVersion, String packageName, String type, in Bundle skusBundle);
  Bundle getBuyIntent(int apiVersion, String packageName, String sku, String type, String developerPayload);
  Bundle getPurchases(int apiVersion, String packageName, String type, String continuationToken);
  int consumePurchase(int apiVersion, String packageName, String purchaseToken);
}
{% endhighlight %}

Uh oh, so yeah... my drop and replace method isn't going to work so easily here, these are totally different. And the fact is anyway, it's foolish to code directly to these interfaces anyway. It turns out both the V2 and V3 interfaces require you to dig into the sample code and pull out the various helper classes and integrate them in your app.

**Dump and Replace**

This basically amounts to deleting all the supporting code around the V2 and adding in all the supporting code for the V3 API. You need to get this from the samples, but it's not installed with the "Samples" in the SDK manager. It's installed in a different samples directory under the play_billing package. The files are:

{% highlight text %}
Base64.java
Base64DecoderException.java
IabException.java
IabHelper.java 
Iabresult.java 
Inventory.java 
Purchase.java 
Security.java 
SkuDetails.java
{% endhighlight %}

These files replace all the files that were used with the V2 service (BillingService, BillingReceiver, PurchaseObserver...) so you'll delete those - but this is no small amount of code either. The main file, IabHelper.java, is ~1000 lines and is doing a whole lot of work. But it's all necessary stuff due to the details of how in-app billing works (for example, restoring purchases from history). The IabHelper basically hides a lot of this from us and you don't really need to understand it all to use it.

**Code Changes**

* Here's a few of the critical V2 calls into the supporting code, and their rough equivalents in V3 supporting code:

    | Old           | New           |
    | ------------- | ------------- |
    | BillingService.checkBillingSupported &nbsp;| IabHelper.startSetup |
    | BillingService.restoreTransactions | IabHelper.queryInventoryAsync |
    | BillingService.requestPurchase | IabHelper.launchPurchaseFlow |
    | | |
    
* You need to override onActivityResult and pass it through IabHelper.onActivityResult(...). This replaces the code that was registering/unregistering the purchase observer in onStart/onStop, which should be deleted.

* You also need to implement IabHelper.QueryInventoryFinishedListener and IabHelper.OnIabPurchaseFinishedListener and pass those through to the calls to startSetup and launchPurchaseFlow.

* AndroidManifest.xml: Just delete the aforementioned BillingService and BillingReceiver from the manifest, since those are gone now. You'll still need the com.android.vending.BILLING permission, but that's it - that's the only thing in your manifest now related to billing. So things are a little cleaner there, as well.

**Enjoy**

Overall I found the direct callback pattern used in the V3 API to be cleaner, easier to understand and manage, and less code cluttering my app than I had in the V2 billing system which used broadcast receivers and observers and mysteriously invoke my application code at various times. The new V3 billing is definitely an improvement.

So now sit back, relax, and watch your app continue to work after January 15!
