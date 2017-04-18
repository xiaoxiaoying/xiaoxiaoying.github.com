---
layout: post
title:  "AndroidPDF"
date:   2017-04-16 22:48:18 +0800
categories: AndroidPDF
tag: pdf
type: java
---

### Android PDF 阅读器

使用开源项目muPDF作为PDF底层解析

1. [muPDF官网][1]
1. [GitHub muPDF 地址][2]
1. [muPDF 代码库][3]（实时更新）
1. [How to build the Android library][4]
    
* Windows下编译library
<pre>
1.  <a href="http://www.cygwin.com/">下载Cygwin </a><br/>
2. 安装Cygwin，过程不详细描述。
</pre>

编译环境搭建好之后下载 `muPDF源码` 

之后更新muPDF使用的第三发库
```
git submodule update --init
```
紧接着编译生成`generated`

```
make -C libmupdf generate
```
编译完之后会在generated文件夹下生成一大堆字体库之类的

最后一步就是使用 `ndk-build` 进行编译，编译之后.so文件有点大

`try add LOCAL_CFLAGS += -DTOFU in Core.mk`

可以减小到2十几M


[1]:http://mupdf.com/
[2]:https://github.com/muennich/mupdf
[3]:http://git.ghostscript.com/
[4]:http://mupdf.com/docs/android-build-library.html