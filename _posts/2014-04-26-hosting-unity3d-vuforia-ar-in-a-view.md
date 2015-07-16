---
layout: post
title: Hosting Unity3D/Vuforia AR in a View
author: Greg E.
tags: [android,java,unity,vuforia]
excerpt: Normally a <a href="http://unity3d.com/">Unity 3D</a> application is built as a stand-alone app that has a thin wrapper over it for running natively on the various mobile platforms.<br><br>I had a project where I needed to host the Unity 3D view inside the app, but the app still has many functions and features of a normal native app and those cannot be done in the 3D engine. This is not documented and not supported, but it's possible. To make things a little more interesting I also had to do this with the <a href="http://www.qualcomm.com/solutions/augmented-reality">Vuforia</a> augmented reality library in the mix as well.
---
Normally a <a href="http://unity3d.com/">Unity 3D</a> application is built as a stand-alone app that has a thin wrapper over it for running natively on the various mobile platforms.

I had a project where I needed to host the Unity 3D view inside the app, but the app still has many functions and features of a normal native app and those cannot be done in the 3D engine. This is not documented and not supported, but it's possible. To make things a little more interesting I also had to do this with the <a href="http://www.qualcomm.com/solutions/augmented-reality">Vuforia</a>&nbsp;augmented reality library in the mix as well.

I got started with posts I found <a href="https://developer.vuforia.com/forum/android/qcarunityplayer-subview">here</a> and <a href="http://forum.unity3d.com/threads/98315-Using-Unity-Android-In-a-Sub-View/page4">here</a>, but these were out of date and incomplete. After much trial and error I did end up with this code that works well. Put this inside the onCreate:

{% highlight java %}
mUnityPlayer = new UnityPlayer(getActivity());
final int mode = mUnityPlayer.getSettings().getInt("gles_mode", 1);
 
this.mQCARShared = new QCARPlayerSharedActivity();
this.mQCARShared.onCreate(getActivity(), mode, new QCARPlayerSharedActivity.IUnityInitializer() {
    @Override
    public void InitializeUnity() {
        mUnityPlayer.init(mode, false);
        FrameLayout container = (FrameLayout)view.findViewById(R.id.unity_container);
        FrameLayout.LayoutParams lp = new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT);
        container.addView(mUnityPlayer, 0, lp);
 
        mUnityPlayer.windowFocusChanged(true);
        mUnityPlayer.resume();
    }
});
{% endhighlight %}

In the layout, <code>R.id.unity_container</code> is the view that you want the 3D scene to render in. You can size and position it wherever you need it.

That will handle most of the work for you, but there's one crucial detail to attend to. The engine is running inside your activity and doesn't see the Android lifecycle events. This is exactly the problem Fragments handle, but unfortunately there is no UnityFragment (as of today) you can use. So you need to pass through the lifecycle events so the engine can respond appropriately. For example, when your app moves to the background and the activity is stopped, the engine should stop recognizing and stop rendering. Here is how that is done:

{% highlight java %}
@Override
protected void onResume() {
    super.onResume();

    if (mUnityPlayer != null) {
        mUnityPlayer.resume();
    }
}

@Override
protected void onPause() {
    super.onPause();

    if (mUnityPlayer != null) {
        mUnityPlayer.pause();
    }
}

@Override
protected void onDestroy() {
    super.onDestroy();

    if (mUnityPlayer != null) {
        mUnityPlayer.quit();
        mUnityPlayer = null;
    }
}
{% endhighlight %}

That's all there is to it. Another challenge might be to run the Unity/Vuforia libraries in two different views at the same time, but I'll leave that for another day.
