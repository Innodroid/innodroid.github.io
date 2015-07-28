---
layout: post
author: Greg E.
title: Copying iOS assets to an Android project
tags: [android,ios,assets,python]
excerpt: If you often have to migrate iOS applications to Android, you find that copying over the image assets can be a time consuming, tedious, and error prone chore. Here's a better way to deal with it.
---
<strong>TL;DR</strong>

Get the script to migrate iOS image assets to Android and map iOS scale to Android density at <a href="https://gist.github.com/grennis/ff70561750378be2e7b8">this GitHub gist</a>.

<strong>Migrating iOS assets to Android</strong>

If you often have to migrate iOS applications to Android, you find that copying over the image assets can be a time consuming, tedious, and error prone chore.

After being confronted with this task yet again I realized that I had long past the threshold for doing something manually vs taking the time to automate it.

I already have a python script that copies material design icons from the <a href="https://www.google.com/design/icons/" target="_blank">Material Design Icons</a> repository and installs the needed icons in the right place into the Android drawable tree, so I decided to build on that. The idea would be to use a script that crawls the iOS source images, parses the json index files, and extracts the various icons at given scales into the correct Android drawable directories.

There are some important differences between the way XCode organizes assets and Android expects to see them:

* XCode organizes the images by named image set, with each set containing the scaled versions of that asset. 
* Android does it the opposite way, by using the DPI designation first, and then named files within those directories.
* XCode maintains a json file (Contents.json) with an index the filenames by scale. Android has no counterpart to this.
* iOS folks seem to like using spaces and hypens in image names. You can't do this in Android as the image name translates directly to a Java constant name. Invalid characters must be replaced with underscores.

This works out really well, because I can use the json file to index what I need to copy out, but I don't need to bother with creating any json index on the Android side.

I decided to map the iOS scale to Android DPI like shown in the table below, and it seems to give good results.

| iOS Scale | | Android DPI |
| ----- | ----- | ----- |
| 1x | | hdpi |
| 2x | | xhdpi |
| 3x | | xxhdpi |

<strong>The Script<strong>

The script starts out defining the things I need:

{% highlight python %}
import shutil
import os
import json

material_dir = os.path.expanduser('~/material-design-icons-2.0/')
ios_dir = '../MyProject-ios/MyProject/Images.xcassets/'
dest_dir = 'app/src/main/res/drawable-'
ios_res = {'1x': 'hdpi', '2x': 'xhdpi', '3x': 'xxhdpi'}
{% endhighlight %}

It just defines where the iOS project is, and the important part, which is the mapping of the iOS scale to Android density.

The important part of the script where the work happens:

{% highlight python %}
def copy_ios_image(dest_name, scale, src):
    dest_name = dest_name.replace('-', '_').replace(' ', '_').lower()
    dest = dest_dir + ios_res[scale] + '/' + dest_name + os.path.splitext(src)[1]
    print dest_name + ' ' + scale
    shutil.copy(src, dest)


def copy_ios_imageset(dest_name, dir):
    with open(os.path.join(dir, 'Contents.json')) as data_file:
        data = json.load(data_file)
        for img in data['images']:
            copy_ios_image(dest_name, img['scale'], os.path.join(dir, img['filename']))
{% endhighlight %}

Starting from the iOS source dir and given an imageset name, it parses out the contents json file and copies the image for each scale into the corresponding Android directory, respecting the rules listed above.

Get the full script (which also includes copying material icons) at <a href="https://gist.github.com/grennis/ff70561750378be2e7b8">this GitHub gist</a>.
