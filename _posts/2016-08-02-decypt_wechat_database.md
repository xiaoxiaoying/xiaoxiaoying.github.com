---
layout: post
title:  "Decrypt wechat database"
date:   2016-08-02 16:32:18 +0800
categories: jni
tag: 微信数据库解密、decrypt wechat database
---
# 解密微信数据库
<div >
	<span>
	其实微信数据库安全问题在2013年的时候在国外论坛开始讨论了，这也不是什么新鲜事了；只不过我最近才研究微信数据库。为了破解微信数据库，找了好多资料，墙是翻回来翻出去···那个累呀！
	</span>
	<br /><br />
	<span>
		微信数据库解密是和SQLCipher加密方式是一样的，有的说微信使用的是SQLcipher开源库，但是我反编译之后并没有，而是他自己根据SQLite接口写的加密，属于标准加密。那既然SQLCipher开源了我们就使用他的开源文件呗！
		<br />
		<a href="https://www.zetetic.net/sqlcipher/design/">SQLCipher设计文档</a>
		<br />
		<a href="https://github.com/sqlcipher/android-database-sqlcipher/releases">android-database-sqlcipher
		</a>
		<br />
		<a href = "https://www.zetetic.net/sqlcipher/sqlcipher-for-android/">android-database-sqlcipher文档</a>
		<br />
		需要那个版本可以直接在项目中<code>app/build.gradle</code>文件中
		<pre style="background-color: #28323f;display: block;color: white;padding: 14px;font-size:16px;">
<span style="color:#65B042"><span style="color:#fff">compile</span> 'net.zetetic:android-database-sqlcipher:3.5.3@aar'</span>
</pre>
		SQLCipher和Android自带的SQLite一样使用
		<pre style="background-color: #28323f;display: block;color: white;padding: 14px;font-size:14px;">
SQLiteDatabase sqliteDatabase = SQLiteDatabase.openOrCreateDatabase(file,pwd,<span style="color:#E28964">null</span>);</pre>
	这里用到的密码可以使用以下方法得到：<br />
	<li>获取手机的IMEI 或者 获取<code>CompatibleInfo.cfg</code>文件中的IMEI 《你会发现这个文件里面存的是<code>map</code> → 读取文件》</li>
<pre>
<code>
	FileInputStream fileInputStream = new FileInputStream(fiilePath);
	ObjectInputStream objStream = new ObjectInputStream(fileInputStream);
	Map<Integer,Object> map = (Map<Integer,Object>)objStream.readObject();
	objStream.close();
	fileInputStream.close();
	</code>
</pre>
从读取出来的<code>Map《Integer,Object》</code>中取IMEI
<li>获取<code>uin</code> 这里的uin应该是用户识别码吧！</li>
1、可以根据32位文件名获取UIN
2、读取<code>shared_prefers</code>目录下的<code>auth_info_key_prefs.xml</code>文件

<li><code>MD5</code> IMEI+uin 取前七位，得到的前七位就是这数据库的密码</li>
<span style="color:red;font-size:16px;">* 获取uin最好是根据32文件夹名来获取，因为每个用户的uin不一样，导致读取XML文件中的uin是最后一个用户在手机登录的uin</span>
	<br />
	你会发现根本打不开，这不是一样的吗？哎吆我的妈呀！咋么办？只能在去找资料，发现微信用的版本号是
	<span style="color: #3387CC">2.1</span>版本的,查看
	<a href="https://www.zetetic.net/sqlcipher/sqlcipher-api/">SQLCipher API</a>；英文，又是英文，英文不好看着真是累啊！
	<br />
	还好我有翻译
	<pre ><span style="font-size:16px;color:#146A94"> PRAGMA cipher_migrate</span>
	
	<span style="color:#E28964">Below shows an example of migrating a 2x SQLCipher database to the new 3.0.0 format. SQLCipher will upgrade the database in place:</span>
<code >
> ./sqlcipher 2xdatabase.db
> PRAGMA key = 'YourKeyGoesHere';
> PRAGMA cipher_migrate;
</code></pre>
	哦，原来是有说的啊，只不过是我们做的时候太粗心了，修改代码，升级数据库的版本号：
	<pre><code>
	SQLiteDatabaseHook hook = <span style="color:#E28964">new</span> SQLiteDatabaseHook() {
                                <span style="color:#E28964">public void</span> <span style="color:#A8C023">preKey</span>(SQLiteDatabase database) {
                                }

                                <span style="color:#E28964">public void</span> <span style="color:#A8C023">postKey</span>(SQLiteDatabase database) {
                                    database.rawExecSQL(<span style="color: #65B042">"PRAGMA cipher_migrate;"</span>);  <span style="color: #AEAEAE">//最关键的一句！！！</span>
                                }
                            };
SQLiteDatabase sqliteDatabase = SQLiteDatabase.openOrCreateDatabase(file,pwd,<span style="color:#E28964">null</span>,hook);</code></pre>
		这样终于可以了，那如果我想要把这个加密的<code>.db</code>文件直接转换为一般的数据库文件该咋么办？继续看<code>API</code>,其中有<span style="font-size:18px;color:#146A94">sqlcipher_export()</span>函数
		<pre ><code>
$ ./sqlcipher encrypted.db
sqlite> PRAGMA key = 'testkey';
sqlite> ATTACH DATABASE 'plaintext.db' AS plaintext KEY '';  -- empty key will disable encryption
sqlite> SELECT sqlcipher_export('plaintext');
sqlite> DETACH DATABASE plaintext;
</code>
		</pre>
		好了我们可以用这个函数导出我们想要的文件：
		<pre  ><code>

		<span style="color:#E28964">if</span>(sqliteDatabase.isOpen()){
			sqliteDatabase.rawExeecSQL(<span style="color:#65B042" >"ATTACH DATABASE 'plaintext.db' AS plaintext KEY '';"</span>);
			<span style="color:red">···同上···</span>
		}
		</code>
		</pre>
	</span>
	找到导出的文件，可以使用<code>sql</code>可视化工具查看
</div>
---
虽然这数据库解密成功了，但是不知道里面做了什么操作，这个时候要求来了。不用这个工具，直接把<code>加密的.db</code>文件解密成<code>普通的.db</code>文件。咋么办？？？找资料呗！网上有人在14年的时候解开了，我这解不开说不过去啊啊啊啊啊啊！！！！<br />
SQLCipher开源的，翻一下他的[SQLCipher gitHub][3] <br />
看着好像有一个[sqlcipher-tools][4]项目，反正也没有思路，进去逛逛呗！啊，好像发现了<code>decrypt.c</code>文件，这咋么是c语言啊！『 我是做Android开发的，虽然说Android里面也可以用<code>NDK</code>但是我没有用过啊！ 』当时一阵的蒙逼；管他呐，先拉下来在说呗！公司有做C/C++的大牛，我想到的是先找资料看看咋么能把这个文件给编译过去，尝试了好多次都失败了；寻求大牛的帮助呗！还能咋么做，项目做不出来是一件很丢人的事。得到大牛的指点说『 网上查资料把这个文件编译过，给我说的是这个是用<code>GCC</code>编译过 』说啥呐！我觉得别人这样做已经很不错了，没有说不知道就真的很感谢，毕竟我没有给别人一毛钱的利益，别人凭什么把自己的工作放下来搞我的活，没有这样的道理，毕竟谁都得生活不是嘛！

折腾呗，在电脑安装了<code>Ubuntu</code> → 然后安装eclipse → 关联本地的openssl文件

就到了这一步在咋么搞，一头雾水；既然这个搞不明白用<code>android ndk</code>编译呗！android studio这么强大，应该可以的。不然这什么时候才能搞定呐！要赶项目：

接下来请看另外一篇[Android ndk 开发][5]

### 参考

[MaskRay Android微信数据导出][2]

[Slinuxer 微信聊天记录分析][1]


[1]:https://blog.slinuxer.com/2015/10/%E5%BE%AE%E4%BF%A1%E8%81%8A%E5%A4%A9%E8%AE%B0%E5%BD%95
[2]:http://maskray.me/blog/2014-10-14-wechat-export
[3]:https://github.com/sqlcipher
[4]:https://github.com/sqlcipher/sqlcipher-tools
[5]:{{'/jni/2016/08/02/ANDROID_JNI'}}