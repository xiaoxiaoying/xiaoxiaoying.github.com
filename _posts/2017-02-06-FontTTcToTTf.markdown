---
layout: post
title:  "字体ttc转为ttf"
date:   2017-02-06 14:02:18 +0800
categories: font
tag: font、export font、字体转换
---

#### Mac导出字体方式
如图：![export photo]({{'/assets/img/font_exe.png'}})

导出来有的格式为：

`ttc
otf
`
#### 这里主要处理 `ttc` 格式的字体
Mac处理方式：
* 下载[Fontographer](http://download.cnet.com/Fontographer/3000-2190_4-10470546.html)
至于如何使用我没有去了解

Windows处理方式：
* 下载 `TTCtools` or [unitttc]({{'/assets/zip/unitttc.rar'}})
TTCtools下载之后始终用不了，但是 `unitttc` 是可以使用的，具体使用方式

`CMD → unitttc路径 → UniteTTC.exe xxx.ttc`

完了之后可以看到当前目录下有 `ttf` 文件生成，接下来就可以用

[http://www.fontke.com/tool/convfont/](http://www.fontke.com/tool/convfont/)

进行转换成你需要的字体格式