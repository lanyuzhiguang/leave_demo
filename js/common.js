/**
 *  响应式缩放
 * @param {Object} doc document
 * @param {Object} win window
 */
(function(doc, win) {
	var docEl = doc.documentElement,
		resizeEvt = 'orientationchange' in win ? 'orientationchange' : 'resize',
		recalc = function() {
			var clientWidth = docEl.clientWidth;
			if(!clientWidth) return;
			if(clientWidth >= 768) {
				//适配pad
				docEl.style.fontSize = 17 * (clientWidth / 768) + 'px';
			} else {
				//适配手机
				docEl.style.fontSize = 17 * (clientWidth / 375) + 'px';
			}
		};
	if(!doc.addEventListener) return;
	win.addEventListener(resizeEvt, recalc, false);
	doc.addEventListener('DOMContentLoaded', recalc, false);
	recalc();
})(document, window);

var qiniuRoot = 'http://qiniu.thdangjian.com/',
	tokenExpire = false;

var httpRoot="";//添加服务路径全局变量

// 缓存相关key
var cacheKeys = {
	user: '_currentUser',
	settings: '_settings',
	newsSearch: "_news_search", //新闻搜索历史记录
	ajaxForce: '_ajaxForce', // 缓存的网络请求，[{url,data,forceid}]
	downloads: '_downloads', // 下载的文件信息，[{type,typeId,title,url,duration,size}]
	studyDownloads: "_studyDownloads",
	curriclumDownloads: "_curriclumDownloads",
	datumDownloads: "_datumDownloads",
	intmdownloads: '_intmdownloads', // 下载的文件信息，[{_id,url,filename,downloadedSize,id}]
	ajaxCache: '_ajaxCache', // ajax请求缓存，{key(url+data):data}
	playTime: '_playTime' // 音视频播放时间缓存, {key(mediaId):time}
};

/**
 * 演示程序当前的 “注册/登录” 等操作，是基于 “本地存储” 完成的
 * 当您要参考这个演示程序进行相关 app 的开发时，
 * 请注意将相关方法调整成 “基于服务端Service” 的实现。
 **/
(function(mui, owner) {
	// 是否debug模式
	var debug = true;
	// 计数器
	var counter = 1;
	// 服务器地址
//	 var rootUri = 'http://192.168.19.104:8080/dangjian/r/';
//	 var rootUri = 'http://dj.thdangjian.com/dangjian/r/';
//	var rootUri = 'http://192.168.3.54:8080/dangjian/r/';
	//var rootUri = 'http://192.168.0.114:8080/dangjian/r/';
	//var rootUri = 'http://192.168.31.254:8080/dangjian/r/';
	//var rootUri = 'http://192.168.1.135:8080/dangjian/r/';
//	var rootUri = 'http://192.168.19.112:8080/dangjian/r/';
	var rootUri = 'http://192.168.3.71:8080/dangjian/r/';
//	var rootUri = 'http://192.168.3.3/dangjian/r/';
	//var rootUri = 'http://47.93.41.183:80/dangjian/r/';
	//var rootUri = 'http://djzx.thdangjian.com/dangjian/r/';
//   var rootUri='http://qzirgv.natappfree.cc/dangjian/r/';
//   var rootUri='http://msriw8.natappfree.cc/dangjian/r/';
	httpRoot=rootUri;//赋值全局变量

	/**
	 * 退出当前用户登陆
	 */
	owner.logout = function() {
		owner.currentUserSet(null);
		owner.set(cacheKeys.ajaxForce, null);
		owner.set(cacheKeys, null);
	}

	/**
	 * 获取用户设置存储
	 * 
	 * @return {Object} 用户设置存储对象
	 */
	owner.setting = function() {
		return owner.getObj(cacheKeys.settings) || {};
	};

	/**
	 * 获取用户设置某个key的值
	 * 
	 * @param {Object} key
	 * @return {String} 指定key的用户设置值
	 */
	owner.settingValue = function(key) {
		return owner.setting()[key];
	};

	/**
	 * 设置用户设置选项
	 * 
	 * @param {Object} key
	 * @param {Object} val
	 */
	owner.settingSet = function(key, val) {
		var s = owner.setting();
		s[key] = val;
		owner.set(cacheKeys.settings, s);
	};

	/*c
	 * 删除用户设置选项
	 * 
	 * @param {Object} key
	 */
	owner.settingRemove = function(key) {
		var s = owner.setting();
		delete s[key];
		owner.set(cacheKeys.settings, s);
	};

	/**
	 * 获取本地持久化存储数据，Object格式
	 * 
	 * @param {Object} key
	 * @return {Object} 根据key获取持久化存储value对象格式
	 */
	owner.getObj = function(key) {
		var s = owner.get(key);
		if(s)
			s = JSON.parse(s);
		return s;
	};

	/**
	 * 获取本地持久化存储数据，String格式
	 * 
	 * @param {Object} key
	 * @return {String} 根据key获取持久化存储value字符串格式
	 */
	owner.get = function(key) {
		return localStorage.getItem(key);
	};

	/**
	 * 设置本地持久化存储数据，Object类型值将转换为JSON格式字符串存储
	 * 
	 * @param {Object} key
	 * @param {Object} val
	 */
	owner.set = function(key, val) {
		if(!val)
			localStorage.removeItem(key);
		else {
			if(typeof val != 'string')
				val = JSON.stringify(val);
			try {
				localStorage.setItem(key, val);
			} catch(e) {
				//TODO handle the exception
			}
		}
	};

	/**
	 * 当前是否已登陆
	 */
	owner.isLogined = function() {
		var u = owner.currentUser();
		if(u && u._id)
			return true;
		else
			return false;
	};

	/**
	 * 获取当前登陆用户信息
	 * 
	 * @return {Object}
	 * @return {Object} 当前登录用户对象
	 **/
	owner.currentUser = function() {
		var u = owner.getObj(cacheKeys.user);
		if(u) {
			return u.user;
		}
		return u;
	};
	/**
	 * 获取当前登陆用户token信息
	 * 
	 * @return {Object}
	 * @return {Object} 当前登录用户token信息
	 **/
	owner.currentToken = function() {
		var u = owner.getObj(cacheKeys.user);
		if(u) {
			return u.token;
		}
		return u;
	};

	/**
	 * 持久化存储当前登录用户信息对象
	 * 
	 * @param {Object} u
	 */
	owner.currentUserSet = function(u) {
		return owner.set(cacheKeys.user, u);
	};

	owner.networkState = function() {
		var types = {};
		types[plus.networkinfo.CONNECTION_UNKNOW] = "unknown";
		types[plus.networkinfo.CONNECTION_NONE] = "none";
		types[plus.networkinfo.CONNECTION_ETHERNET] = "ethernet";
		types[plus.networkinfo.CONNECTION_WIFI] = "wifi";
		types[plus.networkinfo.CONNECTION_CELL2G] = "2g";
		types[plus.networkinfo.CONNECTION_CELL3G] = "3g";
		types[plus.networkinfo.CONNECTION_CELL4G] = "4g";
		return types[plus.networkinfo.getCurrentType()];
	};

	/**
	 * 网络连接api
	 * 
	 * @param {Object} url 网络请求的url，'~'开头则保留原始url
	 * @param {Object} data
	 * @param {Object} callback
	 * @param {Object} method GET or POST
	 * @param {Object} noload 是否不显示加载中
	 * @param {Object} force 是否提交失败时，下次应用激活时再次尝试提交(只缓存url和data)
	 * @param {Object} forceid 本次请求的id，force为true时自动生成，下次请求时根据id判断是否同一请求
	 * @param {Object} cache 是否缓存此请求的返回结果，下次网络不可用或后天出错时直接返回缓存数据
	 */
	owner.ajax = function(url, data, callback, method, noload, force, forceid, cache) {
		// 已登录用户添加token参数
		var ct = owner.currentToken();
		if(ct && ct.access_token) {
			if(!data) {
				data = {};
			}
			data.access_token = ct.access_token;
		}
		method = method || 'POST';

		if(force) { // 如果提交失败，下次应用激活时再次尝试提交，则缓存当前提交信息
			var af = owner.get(cacheKeys.ajaxForce);
			if(!af) {
				af = [];
			} else {
				af = JSON.parse(af);
			}
			var rd = Math.random() + '';
			forceid = rd.substring(2);
			af.push({
				url: url,
				data: data,
				forceid: forceid
			});
			owner.set(cacheKeys.ajaxForce, af);
		}

		if(!url.startsWith('~')) {
			if(url.startsWith('/'))
				url = url.substring(1);
			url = rootUri + url;
		} else {
			url = url.substring(1);
		}

		var d = '';
		if(data) {
			for(var v in data) {
				d += encodeURI(v) + '=' + encodeURI(data[v]) + '&';
			}
		}
		if(d.endsWith('&'))
			d = d.substring(0, d.length - 1);

		var isGood = false; // 网络质量是否好
		var state = owner.networkState();
		if('none' == state) {
			var ic = false;
			if(cache) {
				var ac = owner.getObj(cacheKeys.ajaxCache);
				if(ac) {
					var key = url + d;
					var acv = ac[key];
					if(acv) {
						if(callback)
							callback(acv);
						ic = true;
					}
				}
			}
			if(!ic && !noload)
				osg.alert("无网络连接！");
			if(!ic && callback) {
				try {
					callback(null);
				} catch(e) {}
			}
			return;
		} else if('wifi' == state) {
			isGood = true;
		}

		//alert(plus.device.imei); //设备的国际移动设备身份码
		// plus.device.imsi //设备的国际移动用户识别码
		// plus.device.model //设备的型号
		// plus.device.vendor // 设备的生产厂商
		// plus.device.uuid // 设备的唯一标识
		//alert(plus.os.language); // 系统语言信息, zh_CN
		//alert(plus.os.version); // 系统版本信息, 6.0.1
		//alert(plus.os.name); // 系统的名称, Android
		//alert(plus.os.vendor); // 系统的供应商信息, Google

		var xhr = new plus.net.XMLHttpRequest();
		xhr.onreadystatechange = function() {
			switch(xhr.readyState) {
				case 0:
					//alert("xhr请求已初始化");
					break;
				case 1:
					//alert("xhr请求已打开");
					break;
				case 2:
					//alert("xhr请求已发送");
					break;
				case 3:
					//alert("xhr请求已响应");
					if(!noload)
						osg.unload();
					break;
				case 4:
					if(!noload)
						osg.unload();
					if(xhr.status == 200) {
						//{"access_token":"186e9d26-4bcb-480d-8d20-112b70fa1148","token_type":"bearer","refresh_token":"9b90388f-bb20-42ad-b6c6-eac7b34705a0","expires_in":2590430}
						var data = xhr.responseText;
						if(xhr.responseText)
							try {
								data = JSON.parse(xhr.responseText);
							} catch(e) { /*ignore it*/ }
						if(debug)
							console.log("xhr请求返回：" + xhr.responseText);
						if(data.fl == "error") {
							owner.alert(data.me);
							return;
						}
						if(cache) {
							var ac = owner.getObj(cacheKeys.ajaxCache);
							if(!ac)
								ac = {};
							var key = url + d;
							ac[key] = data;
							osg.set(cacheKeys.ajaxCache, ac);
						}
						if(forceid) {
							var af = owner.get(cacheKeys.ajaxForce);
							if(af) {
								af = JSON.parse(af);
								for(var i = 0; i < af.length; i++) {
									var afd = af[i];
									if(afd.forceid == forceid) {
										af.remove(afd);
										osg.set(cacheKeys.ajaxForce, af);
										break;
									}
								}
							}
						}
						if(data.message && !data.success) {
							owner.alert(data.message);
							return;
						}
						if(callback) {
							callback(data);
						}
					} else if(xhr.status == 400) {
						// 后台抛出BaseException或其他类型异常
						var tk = JSON.parse(xhr.responseText);
						owner.alert(tk.errorMessage);
					} else {
						if(xhr.status == 401) {
							var tk = JSON.parse(xhr.responseText);
							if(tk.errorCode == 1003) { // token会话过期处理
								if(!tokenExpire && owner.currentUser()) {
									tokenExpire = true;
									//注销账号
									owner.currentUserSet(null);
									owner.closeMe();
									plus.webview.getLaunchWebview().show("pop-in");
									console.log("token会话过期");
									owner.toast("会话过期，请重新登陆!");
								}
							} else
								owner.alert("未授权的请求！");
						} else {
							if(debug)
								console.log("xhr请求失败：" + xhr.readyState + "：http state:" + xhr.status);
							if(!noload)
								owner.alert("网络请求失败！");
						}
					}
					break;
				default:
					break;
			}
		}
		if(!noload)
			osg.loading();
		if('GET' == method) {
			if(url.indexOf('?') == -1)
				url += '?';
			else
				url += '&';
			url += d;

			if(debug)
				console.log("GET:" + url);
			xhr.open(method, url);
		} else {
			if(debug) {
				console.log("POST:" + url);
				console.log("POST data:" + d);
				
			}
			xhr.open(method, url);
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
			xhr.send(d);
		}

		//Basic Auth:获取登陆token
		//xhr.open("GET", "http://47.93.194.99:9180/oauth/oauth/token?grant_type=password&username=admin&password=123456");
		//xhr.setRequestHeader('Authorization', 'Basic ZWhNb2JpbGVDbGllbnQ6ZWhNb2JpbGU=');
		//xhr.send();

		//body为json数据格式，尚未验证成功！
		//xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
		//xhr.send('{"phone":"18612980491","password":"123456"}');
	};

	/**
	 * 创建Webview对象，如果已经存在则不重新创建
	 * 
	 * @param {Object} url
	 * @param {Object} id
	 * @param {Object} extras
	 */
	owner.createWebview = function(url, id, extras) {
		id = id || url;
		extras = extras || {};
		var wvs = plus.webview.all(),
			wv;
		for(var i = 0; i < wvs.length; i++) {
			if(wvs[i].id == id) {
				wv = wvs[i];
				break;
			}
		}
		if(!wv)
			wv = plus.webview.create(url, id, extras);
		return wv;
	};

	/**
	 * 打开新窗口
	 * 
	 * @example osg.open('regist.html');
	 * 
	 * @param {Object} url
	 * @param {Object} id
	 * @param {Object} extras
	 * @param {Object} callbacks show->loading->rendering->loaded->rendered--->hide->show
	 * @param {Object} noSwipeBack true为禁用侧滑返回
	 * @param {Object} styles 其它自定义样式
	 */
	owner.open = function(url, id, extras, callbacks, noSwipeBack, styles) {
		id = id || url;
		extras = extras || {};
		styles = styles || {};
		styles.popGesture = noSwipeBack ? 'none' : 'hide';
		styles.videoFullscreen = 'landscape'; //视频全屏播放时为横屏，适用于android系统
		//styles.softinputMode = 'adjustResize';
		//		var cu = owner.currentUser;
		//		if(cu && cu.token && cu.token.access_token) {
		//			if(url.indexOf('?') == -1)
		//				url += '?';
		//			else
		//				url += '&';
		//			url += "access_token=" + cu.token.access_token;
		//		}

		var wv = mui.openWindow({
			url: url,
			id: id,
			preload: true,
			extras: extras,
			show: {
				aniShow: 'pop-in',
				duration: 250
			},
			styles: styles,
			waiting: {
				autoShow: false
			}
		});
		if(callbacks) {
			if(callbacks.loading)
				wv.addEventListener("loading", callbacks.loading, false);
			if(callbacks.rendering)
				wv.addEventListener("rendering", callbacks.rendering, false);
			if(callbacks.rendered)
				wv.addEventListener("rendered", callbacks.rendered, false);
			if(callbacks.loaded)
				wv.addEventListener("loaded", callbacks.loaded, false);
			if(callbacks.show)
				wv.addEventListener("show", callbacks.show, false);
			if(callbacks.hide) {
				wv.addEventListener("hide", callbacks.hide, false);
			}
		}
		// 隐藏时彻底关闭打开窗口，避免缓存导致页面内容不刷新的问题
		wv.addEventListener("hide", function() {
			wv.close();
		}, false);
		//wv.show();
		return wv;
	};

	/**
	 * 打开原生新窗口
	 * 
	 * @example osg.openWithTitle('regist.html');
	 * 
	 * @param {Object} url
	 * @param {Object} id
	 * @param {Object} extras
	 * @param {Object} callbacks loading->rendering->loaded->rendered->show--->hide->show
	 */
	owner.openWithTitle = function(url, id, extras, title, callbacks) {
		id = id || url;
		extras = extras || {};
		title = title || '标题';
		if(title && title.length > 10)
			title = title.substring(0, 10) + '...';
		var wv = mui.openWindowWithTitle({
			url: url,
			id: id,
			preload: true,
			extras: extras,
			show: {
				aniShow: 'pop-in',
				duration: 250
			},
			styles: {
				popGesture: 'hide'
			},
			waiting: {
				autoShow: true
			}
		}, {
			id: id, //导航栏ID,默认为title,若不指定将会使用WebviewOptions中指定的 [webviewID+ "_title"] 作为id
			height: "44px", //导航栏高度值
			backgroundColor: "#d61的d", //导航栏背景色
			bottomBorderColor: "#ffcccccc", //底部边线颜色
			title: { //标题配置
				text: title, //标题文字
				position: { //绘制文本的目标区域，参考：http://www.html5plus.org/doc/zh_cn/nativeobj.html#plus.nativeObj.Rect
					top: 0,
					left: 0,
					width: "100%",
					height: "100%"
				},
				styles: { //绘制文本样式，参考：http://www.html5plus.org/doc/zh_cn/nativeobj.html#plus.nativeObj.TextStyles
					color: "#fff",
					align: "center",
					family: "'Helvetica Neue',Helvetica,sans-serif",
					size: "17px",
					style: "normal",
					weight: "normal"
				}
			},
			back: { //左上角返回箭头
				image: { //图片格式
					base64Data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAb1BMVEUAAAAAev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8AAACubimgAAAAI3RSTlMAGfUTGfQTGPMSGPIYGhgaGBsXGxcbFxwXHBccFhwWHRYdHWufDPQAAAABYktHRACIBR1IAAAAB3RJTUUH4QETEBwooeTlkQAAAJVJREFUSMft1EkSgkAQRNFGUXFWHBDBibr/HTUwD5B/48Ig1y+io7u6MqUhf5hsNEY+j5hMgZ/FJ8Xc9ovos3T96utjbfqN/Nb0O/m96Uv5g+mP8ifTn+Ur01/ka9Nf5RvTt/I309/lH6Z/yr9Mn+Q71/MT8B34K/E58Enzv8R/K98HvnF8p3lr8F7izce7lbf3kJ/lDQp9HdBhgg3PAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE3LTAxLTE5VDE2OjI4OjQwKzA4OjAwpTDFwQAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxNy0wMS0xOVQxNjoyODo0MCswODowMNRtfX0AAAAASUVORK5CYII=', //加载图片的Base64编码格式数据 base64Data 和 imgSRC 必须指定一个.否则不显示返回箭头
					//									imgSrc: '', //要加载的图片路径
					sprite: { //图片源的绘制区域，参考：http://www.html5plus.org/doc/zh_cn/nativeobj.html#plus.nativeObj.Rect
						top: '0px',
						left: '0px',
						width: '100%',
						height: '100%'
					},
					position: { //绘制图片的目标区域，参考：http://www.html5plus.org/doc/zh_cn/nativeobj.html#plus.nativeObj.Rect
						top: "10px",
						left: "10px",
						width: "24px",
						height: "24px"
					}
				},
				click: function() {
					plus.webview.getTopWebview().close(); //重写 点击返回图标时执行的回调函数，默认执行mui.back();
				}
			}
		});
		if(callbacks) {
			if(callbacks.loading)
				wv.addEventListener("loading", callbacks.loading, false);
			if(callbacks.rendering)
				wv.addEventListener("rendering", callbacks.rendering, false);
			if(callbacks.rendered)
				wv.addEventListener("rendered", callbacks.rendered, false);
			if(callbacks.loaded)
				wv.addEventListener("loaded", callbacks.loaded, false);
			if(callbacks.show)
				wv.addEventListener("show", callbacks.show, false);
			if(callbacks.hide)
				wv.addEventListener("hide", callbacks.hide, false);
		}
		// 隐藏时彻底关闭打开窗口，避免缓存导致页面内容不刷新的问题
		wv.addEventListener("hide", function() {
			wv.close();
		}, false);
		return wv;
	}

	/**
	 * 关闭当前窗口
	 */
	owner.closeMe = function() {
		var ws = plus.webview.getDisplayWebview();
		//var ws = plus.webview.currentWebview();
		plus.webview.close(ws[0]);
	};

	/**
	 * 获取传入页面参数
	 * 
	 * @param {Object} key
	 */
	owner.param = function(key) {
		var data = plus.webview.currentWebview();
		return data[key];
	};

	/**
	 * toast消息组件
	 * 
	 * @param {Object} msg
	 */
	owner.toast = function(msg) {
		plus.nativeUI.toast(msg);
	};

	/**
	 * alert提示框组件
	 * 
	 * @param {Object} msg
	 * @param {Object} callback
	 */
	owner.alert = function(msg, callback) {
		mui.alert(msg, "提示", function() {
			if(callback) callback();
		});
	};

	/**
	 * confirm确认框组件
	 * 
	 * @param {Object} msg
	 * @param {Object} callback
	 */
	owner.confirm = function(msg, callback) {
		mui.confirm(msg, '确认', function(e) {
			if(e.index == 1 && callback) callback();
		});
	};

	/**
	 * 显示加载中
	 * 
	 * @param {Object} msg
	 */
	owner.loading = function(msg) {
		if(!msg)
			msg = "加载中...";
		plus.nativeUI.showWaiting(msg);
	};
	/**
	 * 隐藏加载中
	 */
	owner.unload = function() {
		plus.nativeUI.closeWaiting();
	};

	var shares;
	/**
	 * 分享
	 * 
	 * @param {Object} title
	 * @param {Object} href
	 * @param {Object} logo
	 */
	owner.share = function(title, href, logo, content, what, kind, callback) {
		if(!shares) { // 首次初始化
			shares = {};
			plus.share.getServices(function(s) {
				if(s && s.length > 0) {
					for(var i = 0; i < s.length; i++) {
						var t = s[i];
						shares[t.id] = t;
					}
				}
				shareKind(what, kind);
			}, function() {
				console.log("获取分享服务列表失败");
			});

		} else {
			shareKind(what, kind);
		}
		//var ids = [{
		//id: "weixin",
		//ex: "WXSceneSession"
		//}, {
		//id: "weixin",
		//ex: "WXSceneTimeline"
		//}/*, {
		//}, {
		//id: "sinaweibo"
		//}, {
		//id: "tencentweibo"
		//}, {
		//id: "qq"
		//}*/],
		//bts = [{
		//title: "发送给微信好友"
		//}, {
		//title: "分享到微信朋友圈"
		//}/*, {
		//title: "分享到新浪微博"
		//}, {
		//title: "分享到腾讯微博"
		//}, {
		//title: "分享到QQ"
		//}*/];

		//		plus.nativeUI.actionSheet({
		//			cancel: "取消",
		//			buttons: bts
		//		}, function(e) {
		//			var i = e.index;
		//			if(i > 0) {
		//				var s_id = ids[i - 1].id;
		//				var share = shares[s_id];
		//				if(share.authenticated) {
		//					shareMessage(share, ids[i - 1].ex, title, href, logo, content, callback);
		//				} else {
		//					share.authorize(function() {
		//						shareMessage(share, ids[i - 1].ex, title, href, logo, content, callback);
		//					}, function(e) {
		//						console.log("认证授权失败：" + e.code + " - " + e.message);
		//					});
		//				}
		//			}
		//		});

		function shareKind(sId, ex) { //id是weixin   ex 是[朋友圈 或者 好友]
			var s_id = sId;
			console.log(s_id)
			var shareB = shares[s_id];
			console.log(shareB);
			if(shareB.authenticated) { //用于标识此分享是否已经授权认证过，true表示已完成授权认证；false表示未完成授权认证。
				shareMessage(shareB, ex, title, href, logo, content, callback);
			} else {
				shareB.authorize(function() { //分享认证成功回调
					shareMessage(shareB, ex, title, href, logo, content, callback);
				}, function(e) { //分享认证失败回调
					console.log("认证授权失败：" + e.code + " - " + e.message);
				});
			}
		}

		function shareMessage(share, ex, title, href, logo, content, callback) {
			var msg = {
				extra: {
					scene: ex
				}
			};
			if(!href.startsWith('http'))
				href = rootUri + href;
			msg.href = href;
			msg.title = title;
			if(!content)
				content = title;
			if(content.length > 30)
				content = content.substring(0, 30);
			msg.content = content;
			if(~share.id.indexOf('weibo')) {
				msg.content += "";
			}
			msg.thumbs = [logo];
			share.send(msg, function() {
				if(callback)
					callback();
			}, function(e) {
				console.log("分享到\"" + share.description + "\"失败: " + e.code + " - " + e.message);
			});
		}
		//		if(!href.startsWith('http'))
		//			href = rootUri + href;
		//		plus.share.sendWithSystem({
		//			content: title,
		//			href: href
		//		}, function() {
		//			if(debug)
		//				console.log('分享成功，title:' + title + ";href:" + href + ";logo:" + logo);
		//		}, function(e) {
		//			if(debug)
		//				console.log('分享失败：' + JSON.stringify(e));
		//		});
	}

	/**
	 * 表单数据校验
	 * 
	 * @param {Object} id
	 */
	owner.validate = function(id) {
		var v = true,
			msg;
		mui("#" + id + " input").each(function(i, o) {
			var value = o.value,
				lb = o.getAttribute('label');
			if(!lb)
				lb = '';
			if(o.required && !value) {
				v = false;
				msg = "请输入" + lb;
			}
			if(v && o.getAttribute('mobile')) {
				if(value) {
					v = (value.length == 11 && /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(16[0-9]{1})|(17[0-9]{1})|(18[0-9]{1})|(19[0-9]{1}))+\d{8})$/
						.test(value));
					if(!v)
						msg = '请输入正确的手机号';
				}
			}
			if(v && o.getAttribute('minlength')) {
				var ml = parseInt(o.getAttribute('minlength'));
				if(value) {
					if(value.length < ml)
						v = false;
					msg = lb + '长度不能少于' + ml;
				}
			}
			if(v && o.getAttribute('maxlength')) {
				var ml = parseInt(o.getAttribute('maxlength'));
				if(value) {
					if(value.length > ml)
						v = false;
					msg = lb + '长度不能大于' + ml;
				}
			}
		});
		if(!v && msg)
			owner.toast(msg);
		return v;
	};

	/**
	 * id: 播放按钮元素id
	 * playing:是否播放中;
	 * p:player对象id;
	 * btnEle:按钮对象
	 * url:音频url
	 * pauseCallback:暂停回调函数
	 */
	owner.audioList = {}, c = 1;
	owner.audioPauseAll = function(leave) {
		for(var o in owner.audioList) {
			var v = owner.audioList[o];
			if(v.playing && v.p && (!leave || v.id != leave)) {
				v.playing = false;
				v.p.jPlayer("pause");
				if(v.pauseCallback)
					v.pauseCallback(v.btnEle, v.url, v.p);
			}
		}
	}

	/**
	 * 音频Audio播放组件
	 * 
	 * @param {Object} btnEle
	 * @param {Object} url
	 * @param {Object} playCallback
	 * @param {Object} pauseCallback
	 * @param {Object} successCallback
	 * @param {Object} progressCallback
	 */
	owner.audio = function(btnEle, url, playCallback, pauseCallback, successCallback, progressCallback) {
		var id = btnEle.id || btnEle.name;
		if(!id) {
			id = c;
			c++;
			btnEle.id = id;
		}
		var pcache = owner.audioList[id];
		if(!pcache) {
			pcache = {};
			pcache.playing = false;
			owner.audioList[id] = pcache;
		}
		pcache.id = id;
		pcache.btnEle = btnEle;
		pcache.url = url;
		pcache.pauseCallback = pauseCallback;

		if(!pcache.p) {
			$("body").append('<div id="jp_' + id + '"></div>');
			$("#jp_" + id).jPlayer({
				ready: function() {
					pcache.p = $("#jp_" + id);
					pcache.p.jPlayer("setMedia", {
						mp3: url // Defines the mp3 url
					});
				},
				ended: function() {
					// 播放完成
					if(successCallback)
						successCallback(btnEle, url, pcache.p);
					pcache.playing = false;
					var pt = owner.get(cacheKeys.playTime);
					if(pt)
						pt = JSON.parse(pt);
					else
						pt = {};
					var dt = $(pcache.btnEle).data("data");
					if(dt && pt[dt._id]) {
						pt[pcache.url] = undefined;
						owner.set(cacheKeys.playTime, pt);
					}
				},
				timeupdate: function() {
					var dr = pcache.p.data('jPlayer').status.duration,
						tm = pcache.p.data('jPlayer').status.currentTime;
					var pt = owner.get(cacheKeys.playTime);
					if(pt)
						pt = JSON.parse(pt);
					else
						pt = {};

					var dt = $(pcache.btnEle).data("data"),
						cbd = false;
					if(dt) {
						if(tm == 0) {
							if(pt[dt._id]) {
								tm = pt[dt._id];
								cbd = true;
							}
						} else {
							pt[dt._id] = tm;
							owner.set(cacheKeys.playTime, pt);
						}
					}
					if(!cbd && progressCallback)
						progressCallback(btnEle, url, pcache.p, dr, tm);
				},
				error: function(event) {
					if(pcache.p) {
						if(pauseCallback)
							pauseCallback(btnEle, url, pcache.p, true);
						pcache.playing = false;
						pcache.p.jPlayer("pause");
					}
					//owner.alert("播放错误:" + event.jPlayer.error.message);
				}
			});
		}
		btnEle.addEventListener('tap', function(event) {
			if(!pcache.p) {
				owner.alert("音频不可用，请稍后重试！");
				return;
			}
			if(!pcache.playing) {
				pcache.playing = true;
				owner.audioPauseAll(pcache.id); // 暂停其它音频
				// 是否有上次播放进度缓存
				var pt = owner.get(cacheKeys.playTime);
				if(pt)
					pt = JSON.parse(pt);
				else
					pt = {};
				var dt = $(pcache.btnEle).data("data");
				if(dt && pt[dt._id]) {
					// 如果断点续播出错，则直接调用播放
					try {
						pcache.p.jPlayer("play", pt[dt._id]);
					} catch(e) {
						pcache.p.jPlayer("play");
					}
				} else
					pcache.p.jPlayer("play");
				if(playCallback)
					playCallback(btnEle, url, pcache.p);
			} else {
				if(pcache.p) {
					if(pauseCallback)
						pauseCallback(btnEle, url, pcache.p);
					pcache.playing = false;
					pcache.p.jPlayer("pause");
				}
			}
			// 禁止事件传递到父节点
			event.stopPropagation();
			return false;
		});
	};

	/**
	 * 视频Audio播放组件
	 * 
	 * @param {Object} btnEle
	 * @param {Object} url
	 * @param {Object} playCallback
	 * @param {Object} pauseCallback
	 * @param {Object} successCallback
	 * @param {Object} progressCallback
	 */
	owner.video = function(btnEle, url, playCallback, pauseCallback, successCallback, progressCallback) {
		var id = btnEle.id || btnEle.name,
			cover = btnEle.getAttribute("videoCover") || 'http://www.jplayer.org/video/poster/Big_Buck_Bunny_Trailer_480x270.png';
		if(!id) {
			id = c;
			c++;
			btnEle.id = id;
		}
		var pcache = owner.audioList[id];
		if(!pcache) {
			pcache = {};
			pcache.playing = false;
			owner.audioList[id] = pcache;
		}
		pcache.id = id;
		pcache.btnEle = btnEle;
		pcache.url = url;
		pcache.pauseCallback = pauseCallback;
		$("#" + id).parent().prepend('<div id="jp_' + id + '"></div>');
		// 非ios系统需要全屏按钮
		if(!mui.os.ios) {
			$(".btnFullscreen").show();
		}
		//		alert($("#" + id).parent().html());
		$("#" + id).parent().find(".btnFullscreen").on("tap", function(e) {
			pcache.p.data('jPlayer')._setOption("fullScreen", true);
		});
		if(!pcache.p) {
			$("#jp_" + id).jPlayer({
				supplied: "webmv, ogv, m4v",
				size: {
					width: "100%",
					height: "auto"
				},
				fullScreen: false,
				fullWindow: true,
				useStateClassSkin: true,
				autoBlur: false,
				smoothPlayBar: true,
				keyEnabled: true,
				remainingDuration: true,
				toggleDuration: true,
				ready: function() {
					pcache.p = $("#jp_" + id);
					pcache.p.jPlayer("setMedia", {
						m4v: url,
						poster: cover
					});
				},
				play: function() {
					if(pcache.p) {
						owner.audioPauseAll(pcache.id); // 暂停其它音频
						if(playCallback)
							playCallback(btnEle, url, pcache.p);
						pcache.playing = true;
					}
				},
				pause: function() {
					if(pcache.p) {
						if(pauseCallback)
							pauseCallback(btnEle, url, pcache.p);
						pcache.playing = false;
					}
				},
				ended: function() {
					// 播放完成
					if(successCallback)
						successCallback(btnEle, url, pcache.p);
					pcache.playing = false;

					var pt = owner.get(cacheKeys.playTime);
					if(pt)
						pt = JSON.parse(pt);
					else
						pt = {};
					var dt = $(pcache.btnEle).data("data");
					if(dt && pt[dt._id]) {
						pt[pcache.url] = undefined;
						owner.set(cacheKeys.playTime, pt);
					}
				},
				timeupdate: function() {
					var dr = pcache.p.data('jPlayer').status.duration,
						tm = pcache.p.data('jPlayer').status.currentTime;
					var pt = owner.get(cacheKeys.playTime);
					if(pt)
						pt = JSON.parse(pt);
					else
						pt = {};

					var dt = $(pcache.btnEle).data("data"),
						cbd = false;
					if(dt) {
						if(tm == 0) {
							if(pt[dt._id]) {
								tm = pt[dt._id];
								cbd = true;
							}
						} else {
							pt[dt._id] = tm;
							owner.set(cacheKeys.playTime, pt);
						}
					}
					if(!cbd && progressCallback)
						progressCallback(btnEle, url, pcache.p, dr, tm);
				},
				error: function(event) {
					if(pcache.p) {
						if(pauseCallback)
							pauseCallback(btnEle, url, pcache.p, true);
						pcache.playing = false;
						pcache.p.jPlayer("pause");
					}
					//owner.alert("播放错误:" + event.jPlayer.error.message);
				}
			});
		}
		btnEle.addEventListener('tap', function(event) {
			if(!pcache.p) {
				owner.alert("音频不可用，请稍后重试！");
				return;
			}
			if(!pcache.playing) {
				// 是否有上次播放进度缓存
				var pt = owner.get(cacheKeys.playTime);
				if(pt)
					pt = JSON.parse(pt);
				else
					pt = {};
				var dt = $(pcache.btnEle).data("data");
				if(dt && pt[dt._id]) {
					pcache.p.jPlayer("play", pt[dt._id]);
				} else{
					pcache.p.jPlayer("play");
				}
//					pcache.p.jPlayer("play");
			} else {
				if(pcache.p) {
					pcache.p.jPlayer("pause");
				}
			}
			// 禁止事件传递到父节点
			event.stopPropagation();
			return false;
		});
	};
	//	互动,互动详情视频
	owner.video1 = function(btnEle, url, playCallback, pauseCallback, successCallback, progressCallback) {
		var id = btnEle.id || btnEle.name,
			cover = btnEle.getAttribute("videoCover") || 'http://www.jplayer.org/video/poster/Big_Buck_Bunny_Trailer_480x270.png';
		if(!id) {
			id = c;
			c++;
			btnEle.id = id;
		}
		var pcache = owner.audioList[id];
		if(!pcache) {
			pcache = {};
			pcache.playing = false;
			owner.audioList[id] = pcache;
		}
		pcache.id = id;
		pcache.btnEle = btnEle;
		pcache.url = url;
		pcache.pauseCallback = pauseCallback;
		$("#" + id).parent().prepend('<div id="jp_' + id + '"></div>');
		if(!pcache.p) {
			$("#jp_" + id).jPlayer({
				supplied: "webmv, ogv, m4v",
				size: {
					width: "100%",
					height: "100%",
					cssClass: "fullvideo"
				},
				autohide: {
					full: false
				},
				fullScreen: false,
				fullWindow: false,
				useStateClassSkin: true,
				autoBlur: false,
				smoothPlayBar: true,
				keyEnabled: true,
				remainingDuration: true,
				toggleDuration: true,
				ready: function() {
					pcache.p = $("#jp_" + id);
					pcache.p.jPlayer("setMedia", {
						m4v: url,
						poster: cover
					});
					pcache.p.jPlayer("pause");

					
					// 全屏状态下，随便点一个地方就取消全屏
					plus.key.addEventListener('backbutton', function() {
						if(pcache.p.data('jPlayer').options.fullScreen) {
							setTimeout(function() {
								pcache.p.data('jPlayer')._setOption("fullScreen", false);
							}, 0);
						}

					})
				},
				play: function() {
					if(pcache.p) {
						owner.audioPauseAll(pcache.id); // 暂停其它音频
						if(playCallback)
							playCallback(btnEle, url, pcache.p);
						pcache.playing = true;
					}
					var first = null;
							mui.back = function() {
								if(!first) { //首次按键，提示‘再按一次退出应用’
									first = null;
									//mui.toast('再按一次退出应用');
									setTimeout(function() {
										first = null;
									}, 1000);
								} else {
									if((new Date()).getTime() - first < 1000) {
										plus.runtime.quit();
									}
								}
							};
				},
				pause: function() {
					if(pcache.p) {
						if(pauseCallback)
							pauseCallback(btnEle, url, pcache.p);
						pcache.playing = false;
					}
				},
				ended: function() {
					// 播放完成
					if(successCallback)
						successCallback(btnEle, url, pcache.p);
					pcache.playing = false;

					var pt = owner.get(cacheKeys.playTime);
					if(pt)
						pt = JSON.parse(pt);
					else
						pt = {};
					var dt = $(pcache.btnEle).data("data");
					if(dt && pt[dt._id]) {
						pt[pcache.url] = undefined;
						owner.set(cacheKeys.playTime, pt);
					}
				},
				timeupdate: function() {
					var dr = pcache.p.data('jPlayer').status.duration,
						tm = pcache.p.data('jPlayer').status.currentTime;
					var pt = owner.get(cacheKeys.playTime);
					if(pt)
						pt = JSON.parse(pt);
					else
						pt = {};

					var dt = $(pcache.btnEle).data("data"),
						cbd = false;
					if(dt) {
						if(tm == 0) {
							if(pt[dt._id]) {
								tm = pt[dt._id];
								cbd = true;
							}
						} else {
							pt[dt._id] = tm;
							owner.set(cacheKeys.playTime, pt);
						}
					}
					if(!cbd && progressCallback)
						progressCallback(btnEle, url, pcache.p, dr, tm);
				},
				error: function(event) {
					if(pcache.p) {
						if(pauseCallback)
							pauseCallback(btnEle, url, pcache.p, true);
						pcache.playing = false;
						pcache.p.jPlayer("pause");
					}
					//owner.alert("播放错误:" + event.jPlayer.error.message);
				}
			});
		}
		btnEle.addEventListener('tap', function(event) {
			if(!pcache.p) {
				owner.alert("音频不可用，请稍后重试！");
				return;
			}
			if(!pcache.playing) {
				// 是否有上次播放进度缓存
				var pt = owner.get(cacheKeys.playTime);
				if(pt)
					pt = JSON.parse(pt);
				else
					pt = {};
				var dt = $(pcache.btnEle).data("data");
				if(dt && pt[dt._id]) {
					pcache.p.jPlayer("play", pt[dt._id]);
				} else{
					pcache.p.jPlayer("play");
				}
					
				// 自动全屏
				if(!mui.os.ios) {
					setTimeout(function() {
						pcache.p.data('jPlayer')._setOption("fullScreen", true);
					}, 0);
				}

			} else {
				if(pcache.p) {
					pcache.p.jPlayer("pause");
				}
			}
			// 禁止事件传递到父节点
			event.stopPropagation();
			return false;
		});
	};
	owner.video2 = function(btnEle, url, options) {
		var options = options || {};
		var id = btnEle.id || btnEle.name,
			cover = btnEle.getAttribute("videoCover") || 'http://www.jplayer.org/video/poster/Big_Buck_Bunny_Trailer_480x270.png',
			jpid = 'jp_' + id,
			jpContainer = $(btnEle).parent();

		var jpcid = jpContainer.attr('id');
		if(!jpcid) {
			jpcid = "jp_container_" + counter;
			jpContainer.attr('id', jpcid);
			counter++;
		}
		var playCallback = options.playCallback,
			pauseCallback = options.pauseCallback,
			successCallback = options.successCallback,
			progressCallback = options.progressCallback;
		if(!id) {
			id = c;
			c++;
			btnEle.id = id;
		}
		var pcache = owner.audioList[id];
		if(!pcache) {
			pcache = {};
			pcache.playing = false;
			owner.audioList[id] = pcache;
		}
		pcache.id = id;
		pcache.btnEle = btnEle;
		pcache.url = url;
		pcache.pauseCallback = pauseCallback;
		if($("#" + jpid).length == 0)
			jpContainer.prepend('<div id="' + jpid + '"></div>');
		// 非ios系统需要播放器控件
		var ios = mui.os.ios,
			iosBar = !ios,
			ctr = true;
		var iosVer = mui.os.version;
		if(iosVer) {
			var ver = parseInt(iosVer.split('.')[0]);
			//			if(ver < 11)
			//				ctr = false;
		}

		if(ctr)
			jpContainer.append('<div class="jp-gui jp-controll-div"><div class="icon iconfont jp-play" role="button" tabindex="0"></div><div class="jp-bottom-bar"><div class="jp-current-time" role="timer" aria-label="time">&nbsp;</div><div class="jp-progress"><div class="jp-seek-bar"><div class="jp-play-bar"><div class="jp-play-bar-dot"></div></div></div></div><div class="jp-bottom-bar-right"><div class="jp-duration" role="timer" aria-label="duration">&nbsp;</div><div class="jp-full-screen"><i class="icon iconfont icon-full-screen"></i></div></div></div></div>');
		if(!pcache.p) {
			$("#" + jpid).jPlayer({
				cssSelectorAncestor: "#" + jpcid,
				supplied: "webmv, ogv, m4v",
				size: {
					width: "100%",
					height: "100%"
				},
				fullScreen: false,
				fullWindow: false,
				useStateClassSkin: true,
				smoothPlayBar: true,
				volume: 1,
				muted: false,
				autohide: {
					restored: iosBar,
					full: true,
					hold: 2000
				},
				ready: function() {
					pcache.p = $("#" + jpid);
					pcache.p.jPlayer("setMedia", {
						m4v: url,
						poster: cover
					});
					// 自动播放
//					pcache.p.jPlayer("play");
				},
				play: function() {
					if(pcache.p) {
						owner.audioPauseAll(pcache.id); // 暂停其它音频
						if(playCallback)
							playCallback(btnEle, url, pcache.p);
						pcache.playing = true;
					}
				},
				pause: function() {
					if(pcache.p) {
						if(pauseCallback)
							pauseCallback(btnEle, url, pcache.p);
						pcache.playing = false;
					}
				},
				ended: function() {
					// 播放完成
					if(successCallback)
						successCallback(btnEle, url, pcache.p);
					pcache.playing = false;

					var pt = owner.get(cacheKeys.playTime);
					if(pt)
						pt = JSON.parse(pt);
					else
						pt = {};
					var dt = $(pcache.btnEle).data("data");
					if(dt && pt[dt._id||dt.chapterId]) {
						pt[pcache.url] = undefined;
						owner.set(cacheKeys.playTime, pt);
					}
				},
				timeupdate: function() {
					var dr = pcache.p.data('jPlayer').status.duration,
						tm = pcache.p.data('jPlayer').status.currentTime;
					var pt = owner.get(cacheKeys.playTime);
					if(pt)
						pt = JSON.parse(pt);
					else
						pt = {};

					var dt = $(pcache.btnEle).data("data"),
						cbd = false;
					if(dt) {
						if(tm == 0) {
							if(pt[dt.chapterId]) {
								tm = pt[dt.chapterId];
								cbd = true;
							}
						} else {
							pt[dt.chapterId] = tm;
							owner.set(cacheKeys.playTime, pt);
						}
					}
					if(!cbd && progressCallback)
						progressCallback(btnEle, url, pcache.p, dr, tm);
				},
				error: function(event) {
					if(pcache.p) {
						if(pauseCallback)
							pauseCallback(btnEle, url, pcache.p, true);
						pcache.playing = false;
						pcache.p.jPlayer("pause");
					}
					//owner.alert("播放错误:" + event.jPlayer.error.message);
				},
				resize: function(event) {
					if(plus)
						if($(".jp-state-full-screen").length == 1) {
							if(!pcache._pw) {
								pcache._ow = $(".jp-state-full-screen").width();
								pcache._oh = $(".jp-state-full-screen").height();
							}
							$(".jp-state-full-screen").width(plus.screen.resolutionHeight).height(plus.screen.resolutionWidth);
						} else {
							$('.div_img').width(pcache._ow).height(pcache._oh);
						}
				}
			});
		}
		$(btnEle).parent().children()[0].addEventListener('tap', function(event) {
			if(!pcache.p) {
				owner.alert("视频不可用，请稍后重试！");
				return;
			}
			if(!pcache.playing) {
				// 是否有上次播放进度缓存
				var pt = owner.get(cacheKeys.playTime);
				if(pt)
					pt = JSON.parse(pt);
				else
					pt = {};
				var dt = $(pcache.btnEle).data("data");
				if(dt && pt[dt.chapterId]) {
					pcache.p.jPlayer("play", pt[dt.chapterId]);
				} else
					pcache.p.jPlayer("play");
			} else {
				if(pcache.p) {
					pcache.p.jPlayer("pause");
				}
			}
			// 禁止事件传递到父节点
			event.stopPropagation();
			return false;
		});
	};
	//	上传的方法
	owner.uploadFiles = function(fps, isPrivate, style, callback) {
		var task = plus.uploader.createUpload(rootUri +
			'file/uploadPublic', {
				method: "POST"
			},
			function(data, status) {
				console.log(JSON.stringify(status) + ":" + data.responseText)
				if(data.length > 0) {
					plus.nativeUI.closeWaiting();
				}
				var returnData = JSON.parse(data.responseText);
				if(returnData.data) {
					var fileIds = new Array();
					for(var i = 0; i < returnData.data.length; i++) {
						var url = '';
						var urlVal = '';
						if(isPrivate == 'true' || isPrivate == true) {
							var urlTmp = returnData.data[i];
							urlTmp = urlTmp.split('~');
							url = urlTmp[1];
							urlVal = urlTmp[0];
						} else {
							url = qiniuRoot + returnData.data[i] + '!' + style;
							urlVal = returnData.data[i];
						}
						fileIds.push(urlVal);
					}
					if(callback) {
						callback(fileIds);
					}
				} else {
					if(callback) {
						callback(new Array());
					}
				}
			}
		);
		for(var k = 0; k < fps.length; k++) {
			var f = fps[k];
			if(mui.os.ios && f.indexOf('file://') != 0)
				f = 'file://' + f;
			task.addFile(f, {
				key: "file" + k
			});
			console.log("我是" + f);
		}
		task.addData("access_token", osg.currentToken().access_token);
		task.setRequestHeader("isPrivate", isPrivate);
		task.setRequestHeader("style", style);
		plus.nativeUI.showWaiting();
		task.start();
	}
	//录像上传视频
	owner.uploadVideoFromCamera = function(maxNum, callback, sizeLimit) { //outSet('开始拍摄：');
		var num = maxNum - $("#imgList .imgItem").length;
		if(num <= 0) {
			osg.alert("对不起您不能再添加视频了");
			return;
		}
		if(!sizeLimit)
			sizeLimit = 600;
		sizeLimit = sizeLimit * 1024; // kb转换为字节数
		var token = osg.currentToken();
		var cmr = plus.camera.getCamera();
		cmr.startVideoCapture(function(path) { //图片路径 
			//遍历上传的图片
			var fp = path;
			console.log("fp:" + fp); //如：fp:file:///storage/emulated/0/Pictures/Screenshots/Screenshot_2017-03-11-11-45-40.jpeg
			//plus.io.resolveLocalFileSystemURL 通过URL参数获取目录对象或文件对象
			//url 要操作文件或目录的URL地址
			plus.io.resolveLocalFileSystemURL(fp, function(entry) { //成功回调
				// 可通过entry对象操作test.html文件 
				entry.file(function(file) {
					console.log('原始文件字节数：' + file.size);
					addFile(file.fullPath);
				});

			});

			function addFile(f) {
				console.log(f);
				if(callback) {
					callback(f);
				}
			};
		}, function(e) {
			mui.toast('取消了选择');
		}, {
			filename: '_doc/camera/',
			index: 1
		});
	}
	//拍照上传图片
	owner.uploadPictureFromCamera = function(maxNum, callback, sizeLimit) { //outSet('开始拍照：');
		if(!sizeLimit)
			sizeLimit = 600;
		sizeLimit = sizeLimit * 1024; // kb转换为字节数
		var token = osg.currentToken();
		var num = maxNum - $("#imgList .imgItem").length;
		if(num <= 0) {
			osg.alert("对不起您不能再添加图片了");
			return;
		}
		var cmr = plus.camera.getCamera();
		cmr.captureImage(function(path) { //图片路径 
			//遍历上传的图片
			var fp = path;
			console.log("fp:" + fp); //如：fp:file:///storage/emulated/0/Pictures/Screenshots/Screenshot_2017-03-11-11-45-40.jpeg
			//plus.io.resolveLocalFileSystemURL 通过URL参数获取目录对象或文件对象
			//url 要操作文件或目录的URL地址
			plus.io.resolveLocalFileSystemURL(fp, function(entry) { //成功回调
				// 可通过entry对象操作test.html文件 
				entry.file(function(file) {
					console.log('原始文件字节数：' + file.size);
					if(file.size > sizeLimit) { //1048576) {
						var fp = file.fullPath, //fullpath  目录操作对象的完整路径，文件系统的绝对路径
							nfp;
						var sc = sizeLimit / file.size,
							w = (sc + (1 - sc) * 0.7) * 100 + '%';
						if(!mui.os.ios) // android按照100%压缩，一般也是到500kb左右
							w = '100%';
						var rd = Math.random() + '';
						rd = rd.substring(2);
						if(mui.os.ios) {
							if(!fp.indexOf('file://') == 0)
								fp = 'file://' + fp;
							var dix = fp.lastIndexOf('.'),
								idx = fp.lastIndexOf('/'),
								nfp;
							nfp = fp.substring(0, idx) + '/' + rd + fp.substring(dix);
						} else {
							//convertLocalFileSystemURL 将本地URL路径转换成平台绝对路径
							nfp = plus.io.convertLocalFileSystemURL('_documents/' + rd + fp.substring(dix));
						}
						//图片压缩转换 
						//options 图片压缩转换的参数
						//图片压缩转换操作成功回调，操作成功时调用。
						//图片压缩转换操作失败回调，操作失败时调用。
						plus.zip.compressImage({
								src: fp,
								dst: nfp,
								width: w
							},
							function(event) { //图片压缩转换操作成功回调，操作成功时调用。
								//resolveLocalFileSystemURL通过URL参数获取目录对象或文件对象
								plus.io.resolveLocalFileSystemURL(event.target, function(entry) { //成功回调
									entry.file(function(file) {
										console.log('压缩后字节数:' + file.size + ';压缩比：' + w + "；地址:" + event.target);
									});
								});
								addFile(event.target);
							},
							function(error) { //图片压缩转换操作失败回调，操作失败时调用。
								addFile(fp);
								console.log('压缩失败:' + JSON.stringify(error));
							});
					} else {
						addFile(file.fullPath);
					}
				});
			});

			function addFile(f) {
				console.log(f);
				if(callback) {
					callback(f);
				}
			};
		}, function(e) {
			mui.toast('取消了选择');
		}, {
			filename: '_doc/camera/',
			index: 1,
		});
	}
	/**
	 * 从相册中选择文件上传
	 * @param {Object} maxNum 总共最大上传几个
	 * @param {Object} isPrivate 是否上传私有库
	 * @param {Object} style 图片回显七牛云存储样式
	 * @param {Object} callback 图片上传成功后的回调
	 * @param {Object} sizeLimit 图片压缩尺寸限制，单位：kb，默认600kb
	 */
	owner.pickFileUpload = function(maxNum, callback, sizeLimit) {
		if(!sizeLimit)
			sizeLimit = 600;
		sizeLimit = sizeLimit * 1024; // kb转换为字节数
		var token = osg.currentToken();
		var num = maxNum - $("#imgList .imgItem").length;
		if(num <= 0) {
			osg.alert("对不起您不能再添加图片了");
			return;
		}
		plus.gallery.pick(
			function(paths) {
				if(num < paths.files.length) {
					osg.alert("对不起，你选择的图片太多了");
					return;
				}
				for(var k = 0; k < paths.files.length; k++) {
					var fp = paths.files[k];
					console.log("fp:" + fp);
					plus.io.resolveLocalFileSystemURL(fp, function(entry) {
						// 可通过entry对象操作test.html文件 
						entry.file(function(file) {
							console.log('原始文件字节数：' + file.size);
							if(file.size > sizeLimit) { //1048576) {
								var fp = file.fullPath,
									nfp;
								var sc = sizeLimit / file.size,
									w = (sc + (1 - sc) * 0.7) * 100 + '%';
								if(!mui.os.ios) // android按照100%压缩，一般也是到500kb左右
									w = '100%';
								var rd = Math.random() + '';
								rd = rd.substring(2);
								if(mui.os.ios) {
									if(!fp.indexOf('file://') == 0)
										fp = 'file://' + fp;
									var dix = fp.lastIndexOf('.'),
										idx = fp.lastIndexOf('/'),
										nfp;
									nfp = fp.substring(0, idx) + '/' + rd + fp.substring(dix);
								} else {
									nfp = plus.io.convertLocalFileSystemURL('_documents/' + rd + fp.substring(dix));
								}
								plus.zip.compressImage({
										src: fp,
										dst: nfp,
										width: w
									},
									function(event) {
										plus.io.resolveLocalFileSystemURL(event.target, function(entry) {
											entry.file(function(file) {
												console.log('压缩后字节数:' + file.size + ';压缩比：' + w + "；地址:" + event.target);
											});
										});
										addFile(event.target);
									},
									function(error) {
										addFile(fp);
										console.log('压缩失败:' + JSON.stringify(error));
									});
							} else {
								addFile(file.fullPath);
							}
						});

					});
				}

				function addFile(f) {
					console.log(f);
					if(callback) {
						callback(f);
					}
				};
			},
			function(e) {
				mui.toast('取消了选择');
			}, {
				multiple: true,
				maximum: num,
				filter: "image",
				system: false
			}
		);
	};
	/**
	 * 从相册中选择文件上传
	 * @param {Object} maxNum 总共最大上传几个
	 * @param {Object} isPrivate 是否上传私有库
	 * @param {Object} style 图片回显七牛云存储样式
	 * @param {Object} callback 图片上传成功后的回调
	 * @param {Object} sizeLimit 图片压缩尺寸限制，单位：kb，默认600kb
	 */
	owner.pickFileUpload1 = function(maxNum, isPrivate, style, callback, sizeLimit) {
		if(!sizeLimit)
			sizeLimit = 600;
		sizeLimit = sizeLimit * 1024; // kb转换为字节数
		var token = osg.currentToken();
		var num = maxNum - $("#imgList .imgItem").length;
		if(num <= 0) {
			osg.alert("对不起您不能再添加图片了");
			return;
		}
		plus.gallery.pick(
			function(paths) {
				if(num < paths.files.length) {
					osg.alert("对不起，你选择的图片太多了");
					return;
				}
				var task = plus.uploader.createUpload(rootUri +
					'file/uploadPublic', {
						method: "POST"
					},
					function(data, status) {
						console.log(JSON.stringify(status) + ":" + data.responseText)
						plus.nativeUI.closeWaiting();
						var returnData = JSON.parse(data.responseText);
						if(returnData.data) {
							for(var i = 0; i < returnData.data.length; i++) {
								var url = '';
								var urlVal = '';
								if(isPrivate == 'true' || isPrivate == true) {
									var urlTmp = returnData.data[i];
									urlTmp = urlTmp.split('~');
									url = urlTmp[1];
									urlVal = urlTmp[0];
								} else {
									url = qiniuRoot + returnData.data[i] + '!' + style;
									urlVal = returnData.data[i];
								}
								if(callback) {
									callback(url, urlVal);
								}
							}
						}
					}
				);
				var c = 0;
				for(var k = 0; k < paths.files.length; k++) {
					var fp = paths.files[k];
					console.log("fp:" + fp);
					plus.io.resolveLocalFileSystemURL(fp, function(entry) {
						// 可通过entry对象操作test.html文件 
						entry.file(function(file) {
							console.log('原始文件字节数：' + file.size);
							if(file.size > sizeLimit) { //1048576) {
								var fp = file.fullPath,
									nfp;
								var sc = sizeLimit / file.size,
									w = (sc + (1 - sc) * 0.7) * 100 + '%';
								if(!mui.os.ios) // android按照100%压缩，一般也是到500kb左右
									w = '100%';
								var rd = Math.random() + '';
								rd = rd.substring(2);
								if(mui.os.ios) {
									if(!fp.indexOf('file://') == 0)
										fp = 'file://' + fp;
									var dix = fp.lastIndexOf('.'),
										idx = fp.lastIndexOf('/'),
										nfp;
									nfp = fp.substring(0, idx) + '/' + rd + fp.substring(dix);
								} else {
									nfp = plus.io.convertLocalFileSystemURL('_documents/' + rd + fp.substring(dix));
								}
								plus.zip.compressImage({
										src: fp,
										dst: nfp,
										width: w
									},
									function(event) {
										plus.io.resolveLocalFileSystemURL(event.target, function(entry) {
											entry.file(function(file) {
												console.log('压缩后字节数:' + file.size + ';压缩比：' + w + "；地址:" + event.target);
											});
										});
										addTask(event.target);
									},
									function(error) {
										addTask(fp);
										console.log('压缩失败:' + JSON.stringify(error));
									});
							} else {
								addTask(file.fullPath);
							}
						});

					});
				}

				function addTask(f) {
					if(mui.os.ios && f.indexOf('file://') != 0)
						f = 'file://' + f;
					task.addFile(f, {
						key: "file" + c
					});
					if(c >= paths.files.length - 1) {
						task.addData("access_token", token.access_token);
						task.setRequestHeader("isPrivate", isPrivate);
						task.setRequestHeader("style", style);
						plus.nativeUI.showWaiting();
						task.start();
					} else
						c++;
				}
			},
			function(e) {
				mui.toast('取消了选择');
			}, {
				multiple: true,
				maximum: num,
				filter: "image",
				system: false
			}
		);
	};

	/**
	 * 文件下载api
	 * 
	 * @param {Object} url 下载文件地址
	 * @param {Object} callback 下载成功回调
	 * @param {Object} silent 是否静默模式下载文件，不显示下载信息
	 */
	owner.download = function(url, callback, silent) {
		var dtask = plus.downloader.createDownload(url, {}, function(d, status) {
			if(!silent)
				owner.unload();
			// 下载完成
			if(status == 200) {
				if(callback)
					callback(d.filename);
			} else {
				if(!silent)
					owner.toast("下载失败:" + status);
			}
		});
		dtask.addEventListener("statechanged", function(task, status) {
			if(!dtask) {
				return;
			}
			switch(task.state) {
				case 1: // 开始
					break;
				case 2: // 已连接到服务器
					if(!silent) {
						owner.loading('下载中');
						mui('body').progressbar({
							progress: 0
						}).show();
					}
					break;
				case 3: // 已接收到数据
					if(!silent) {
						var progress = parseInt(task.downloadedSize / task.totalSize * 100);
						mui('body').progressbar().setProgress(progress);
					}
					break;
				case 4: // 下载完成
					if(!silent) {
						owner.unload();
						mui('body').progressbar().hide();
						owner.toast("下载完成！");
					}
					break;
			}
		});
		dtask.start();
	};
}(mui, window.osg = {}));

(function(mui, doc) {
	mui.plusReady(function() {
		/**页面字体大小控制方法**/
		if(window.localStorage.getItem("new_Font")) {
			var localFont = window.localStorage.getItem("new_Font")
			$("html").css("font-size", localFont + "px");
		}
		plus.screen.lockOrientation('portrait-primary');
		// 设置系统状态栏文字为白色
		plus.navigator.setStatusBarStyle('light');
		// 设置系统状态栏背景为红色
		plus.navigator.setStatusBarBackground('#d61d1d');

		mui.init({
			swipeBack: false //启用右滑关闭功能
		});

		var oback = mui.back;
		mui.back = function(event) {
			// 暂停全部音频播放
			osg.audioPauseAll();
			// var cWebview = plus.webview.currentWebview();
			// 加这个导致重复关闭窗口了 plus.webview.close(cWebview);
			oback();
		};
	});
}(mui, document));

// Array扩展contains函数
Array.prototype.contains = function(val) {
	for(var i = 0; i < this.length; i++) {
		if(this[i] == val) {
			return true;
		}
	}
	return false;
};

if(typeof String.prototype.startsWith != 'function') {
	String.prototype.startsWith = function(prefix) {
		return this.slice(0, prefix.length) === prefix;
	};
}

if(typeof String.prototype.endsWith != 'function') {
	String.prototype.endsWith = function(suffix) {
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};
}

Array.prototype.remove = function(b) {
	var a = this.indexOf(b);
	if(a >= 0) {
		this.splice(a, 1);
		return true;
	}
	return false;
};

var newFont = 0;
try {
	document.getElementById("big").addEventListener("tap", function() {
		window.localStorage.removeItem("new_Font");
		newFont = 19;
		console.log(newFont)
		$("html").css("font-size", newFont + 'px');
		window.localStorage.setItem("new_Font", newFont);
	})
	document.getElementById("mid").addEventListener("tap", function() {
		window.localStorage.removeItem("new_Font");
		newFont = 17;
		console.log(newFont)
		$("html").css("font-size", newFont + 'px');
		window.localStorage.setItem("new_Font", newFont);
	})
	document.getElementById("small").addEventListener("tap", function() {
		window.localStorage.removeItem("new_Font");
		newFont = 15;
		$("html").css("font-size", newFont + 'px');
		window.localStorage.setItem("new_Font", newFont);
	})
} catch(e) {}