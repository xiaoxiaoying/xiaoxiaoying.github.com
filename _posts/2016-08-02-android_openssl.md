---
layout: post
title:  "Android openssl"
date:   2016-08-02 16:32:18 +0800
categories: jni
tag: ndk、Android jni、Android openssl
---
# Android 使用自带的openssl
[原文连接][1]

### 在NDK中使用OpenSSL
Android 系统内置了OpenSSL，但是NDK没有提供相对应的库。这里需要把OpenSSL的<code>.so</code>文件放到`/myndkpath/platforms/android-23/arch-arm/usr/lib`下即可：

这里使用`adb`命令
<pre >
adb pull /system/lib/libssl.so /myndkpath/platforms/android-23/arch-arm/usr/lib<br />
adb pull /system/lib/libcrypto.so /myndkpath/platforms/android-23/arch-arm/usr/lib
</pre>
把OpenSSL头文件放`/myndkpath/platforms/android-23/arch-arm/usr/include`
<li>这里多说一句：</li>
有的手机里自带的这两个文件用不了，就比如`红米手机6.0`这个系统的；我一开始以为这样做不可以，然后找资料，这个真心累趴了。后来换了手机把两个文件重新导入了一下，其他手机可以使用，但是就这破手机还是报错。没辙，这个问题先就阁着儿。

这是使用OpenSSL的前提工作，接下来如何使用请移步[android ndk 开发][4]
##相关文件
[获取OpenSSL头文件][3]




















[1]:https://dangfan.me/zh-Hans/posts/android-ndk-openssl
[2]:https://github.com/xiaoxiaoying/Directory-Collect/android/decrypt_wechat_database.md
[3]:https://github.com/guardianproject/openssl-android/tree/master/include/openssl
[4]:{{'/jni/2016/08/02/ANDROID_JNI'}}
