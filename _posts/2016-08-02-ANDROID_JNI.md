---
layout: post
title:  "android jni"
date:   2016-08-02 17:30:18 +0800
categories: jni
tag: ndk、android jni
---
# android ndk 开发

### 1.准备工作
NDK下载

1、[官网下载地址][1]需要梯子

2、[不需要梯子][2] 这里有许多资源，包括SDK、ADT、反编译工具···
### 2.配置sudio的ndk路径


<p align="left">
<img src = "{{'/assets/img/QQ20160802-02x.png'}}" />
</p>

或者

<p align="left">
<img src = "{{'/assets/img/fa639204271b5ef1.png'}}" />
</p>

接下来可以用c/c++来写hollo word了

如果英文足够好可以看官方的[连接][3]

①修改项目下的build.gradle文件
<pre style="background-color: #28323f;display: block;color: white;padding: 14px;font-size:16px;">
<span style="color:#65B042;"><span style="color:#fff;">classpath</span> 'com.android.tools.build:gradle：2.1.2'</span>
</pre>

替换为
<pre style="background-color: #28323f;display: block;color: white;padding: 14px;font-size:16px;">
<span style="color:#65B042"><span style="color:#fff">classpath</span> 'com.android.tools.build:gradle-experimental:0.7.2'</span>
</pre>
②修改gradle文件

gradle → wrapper → gradle-wrapper.properties

修改
<code style="font-size:16px;">
distributionUrl=https\://services.gradle.org/distributions/gradle-2.4-all.zip
</code>

为

<code style="font-size:16px;">
distributionUrl=https\://services.gradle.org/distributions/gradle-2.10-all.zip
</code>

③修改app下的build.gradle文件 

<pre style="background-color: #28323f;display: block;color: white;padding: 14px;font-size:16px;">
<span>apply plugin:<span style="color:#65B042"> 'com.android.application'</span></span>
<span><br />
android{<br />
	compileSdkVersion <span style="color: #3387CC">24</span><br />
	buildToolsVersion <span style="color:#65B042">"24.0.0"</span><br />
	
	defaultConfig{<br />
		applicationId <span style="color:#65B042">"com.xiaoxiaoying.ndktest"</span><br />
		minSdkVersion <span style="color: #3387CC">14</span><br />
		targetSdkVersion <span style="color: #3387CC">23</span><br />
		versionCode <span style="color: #3387CC">1</span><br />
		versionName <span style="color: #65B042">"1.0"</span><br />
	}
	<br />
	buildTypes{<br />
		release{<br />
			minifyEnabled <span style="color:#E28964">false</span><br />
			proguardFiles getDefaultProguardFile(<span style="color: #65B042">'proguard-android.txt'</span>),<span style="color:#65B042">'proguard-rules.pro'</span><br />
		}
	}
	
}
</span>
</pre>

为

<pre style="background-color: #28323f;display: block;color: white;padding: 14px;font-size:16px;">
<span>apply plugin:<span style="color:#65B042"> 'com.android.model.application'</span></span>
<span><br />
model{<br />
	android{<br />
		compileSdkVersion <span style="color: #3387CC">24</span><br />
		buildToolsVersion <span style="color:#65B042">"24.0.0"</span>
	<br />
		defaultConfig{<br />
			applicationId <span style="color:#65B042">"com.xiaoxiaoying.ndktest"</span><br />
			minSdkVersion.apiLevel <span style="color: #3387CC">14</span><br />
			targetSdkVersion.apiLevel <span style="color: #3387CC">23</span><br />
			versionCode <span style="color: #3387CC">1</span><br />
			versionName <span style="color: #65B042">"1.0"</span><br />
		}
	    <br />
		buildTypes{<br />
			release{<br />
				minifyEnabled <span style="color:#E28964">false</span><br />
				proguardFiles.add(file(<span style="color: #65B042">'proguard-android.txt'</span>))
				<br />}<br />
		}
		<br />
		ndk{
			<p style="color: #AEAEAE">//指定so名字</p>
			moduleName <span style="color: #65B042">"openssl_lib"</span>
			<p style="color: #AEAEAE">//指定调用的版本号</p>
			platformVersion <span style="color: #3387CC">23</span>
			<p style="color: #AEAEAE">//需要openssl的库来解密某平台的.db文件</p>
			<p style="color: #AEAEAE">//Android ndk里面没有这些文件，需要我们手动导入</p>
			<p style="color:#AEAEAE">//<a href="https://github.com/xiaoxiaoying/Directory-Collect/android/android_openssl.md">android 使用自带openssl</a></p>
			ldFlags.addAll([<span style="color: #65B042">"-lcrypto"</span>, <span style="color: #65B042">"-lssl"</span>])
			<br />
			abiFilters.addAll([<span style="color: #65B042">"armeabi-v7a"</span>, <span style="color: #65B042">"armeabi"</span>])

			
		}
	
	}
}
</span>
</pre>
④ project → app → com.hudun.tools.jni → WeChatJNI.class
<pre style="background-color: #28323f;display: block;color: white;padding: 14px;font-size:16px;">
<span style="color:#CC7832">static</span> {
	System.loadLibrary(<span style="color:#65B042">"openssl_lib"</span>);
}
<br />
<span style="color:#CC7832">public native int</span> <span style="color:red">decrypt</span>(String pwd,String inFile,String outFile);
</pre>
<span style="color:red">decrypt</span> 方法为红色，这里使用<code>Alt + enter</code>出现下图：
<p align="left">
<img src = "{{'/assets/img/7d1282ef0c6d8a1a.png'}}" />
</p>
点击 <code>Create function java_com_hudun_tools_jni_WeChatJNI_decrypt</code>
生成 
<p align="left">
<img src = "{{'/assets/img/QQ20160802-decrypt.png'}}" />
</p>
这里就可以把 [sqlciher-tool>decrypt.c][4] 文件编译使用了。

⑤ debug 调试
<li>点击 <img style="width:auto;" src="{{'/assets/img/5c05c8413003e670.png'}}"/></li>
<li>选择 <img style="width:auto;" src="{{'/assets/img/b9ee6ac1a3c2a1b9.png'}}"/></li>
这里可能需要一个调试ndk插件，根据提示安装插件即可
<li>在 <code>C/C++</code> 文件里打断点</li>
<li>选择 <code>debug</code> 运行就可以调试了</li>
##### 详情
[java_com_hudun_tools_jni_WeChatJNI_decrypt][5]










[1]:https://developer.android.com/ndk/downloads/index.html
[2]:https://github.com/inferjay/AndroidDevTools/
[3]:https://codelabs.developers.google.com/codelabs/android-studio-jni/index.html?index=..%2F..%2Findex#0
[4]:https://github.com/sqlcipher/sqlcipher-tools/blob/master/decrypt.c
[5]:{{'/sqlite/2016/08/26/sqlite_decrypt'}}