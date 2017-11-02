/**
 * 作者：姚正新(XIN)
 * 开发日期：2017/10/26
 * 描述：通用框架
 * 版权所有
 */

//定义一个对象 - 名字是Xin
var Xin = function () {
};

//第二种写法
Xin.prototype = {
    // 将一个json拷贝给一个json
    // Xin.extend({}, boy)
    extend: function (target, source) {
        //遍历对象
        for (var i in source) {
            target[i] = source[i];
        }
        return target;
    },
    //将多个json拷贝给一个json
    //第一种用法
    // $$.extend({}, technology,shenqi)
    // 第二种用法
    // extend(boy,technology,shenqi);
    extendMany: function () {
        var key, i = 0,
            len = arguments.length,
            target = null,
            copy;
        if (len === 0) {
            return;
        } else if (len === 1) {
            target = this;
        } else {
            i++;
            target = arguments[0];
        }
        for (; i < len; i++) {
            for (key in arguments[i]) {
                copy = arguments[i][key];
                target[key] = copy;
            }
        }
        return target;
    }
};

//在框架中实例化，这样外面使用的使用就不用实例化了
X = new Xin();

/*基础模块*/
X.extend(X, {});

/*选择模块*/
X.extend(X, {
    id: function (id) {
        return document.getElementById(id);
    },
    //tag选择器
    //var spans = $$.$tag('mydiv','span');
    tag: function (context, tag) {
        if (typeof context == 'string') {
            context = X.id(context);
        }
        if (context) {
            return context.getElementsByTagName(tag);
        } else {
            return document.getElementsByTagName(tag);
        }
    },
    //class选择器
    //var spans =$$.$class('mydiv','span');
    class: function (className, context) {
        var elements;
        var dom;
        //如果传递过来的是字符串 ，则转化成元素对象
        if (X.isString(context)) {
            context = document.getElementById(context);
        } else {
            context = document;
        }
        //如果兼容getElementsByClassName
        if (context.getElementsByClassName) {
            return context.getElementsByClassName(className);
        } else {
            //如果浏览器不支持
            dom = context.getElementsByTagName('*');
            for (var i, len = dom.length; i < len; i++) {
                if (dom[i].className && dom[i].className == className) {
                    elements.push(dom[i]);
                }
            }
        }
        return elements;
    },
    //多组选择器
    //var dom = $$.$group('.moshou,.hero,#dream,h3');
    group: function (content) {
        var result = [],
            doms = [];
        var arr = X.trim(content).split(',');
        //alert(arr.length);
        for (var i = 0, len = arr.length; i < len; i++) {
            var item = X.trim(arr[i]);
            var first = item.charAt(0);
            var index = item.indexOf(first);
            if (first === '.') {
                doms = X.class(item.slice(index + 1));
                //每次循环将doms保存在reult中
                //result.push(doms);//错误来源

                //陷阱1解决 封装重复的代码成函数
                pushArray(doms, result);

            } else if (first === '#') {
                doms = [X.id(item.slice(index + 1))]; //陷阱：之前我们定义的doms是数组，但是$id获取的不是数组，而是单个元素
                //封装重复的代码成函数
                pushArray(doms, result);
            } else {
                doms = X.tag(item);
                pushArray(doms, result);
            }
        }
        return result;

        //封装重复的代码
        function pushArray(doms, result) {
            for (var j = 0, domlen = doms.length; j < domlen; j++) {
                result.push(doms[j]);
            }
        }
    },
    //层次选择器
    //var doms = X.gradation('#container .div p');
    gradation: function (select) {
        //个个击破法则 -- 寻找击破点
        var sel = X.trim(select).split(' ');
        var result = [];
        var context = [];
        for (var i = 0, len = sel.length; i < len; i++) {
            result = [];
            var item = X.trim(sel[i]);
            var first = sel[i].charAt(0);
            var index = item.indexOf(first);
            if (first === '#') {
                //如果是#，找到该元素，
                pushArray([X.id(item.slice(index + 1))]);
                context = result;
            } else if (first === '.') {
                //如果是.
                //如果是.
                //找到context中所有的class为【s-1】的元素 --context是个集合
                if (context.length) {
                    for (var j = 0, contextLen = context.length; j < contextLen; j++) {
                        pushArray(X.class(item.slice(index + 1), context[j]));
                    }
                } else {
                    pushArray(X.class(item.slice(index + 1)));
                }
                context = result;
            } else {
                //如果是标签
                //遍历父亲，找到父亲中的元素==父亲都存在context中
                if (context.length) {
                    for (var j = 0, contextLen = context.length; j < contextLen; j++) {
                        pushArray(X.tag(item, context[j]));
                    }
                } else {
                    pushArray(X.tag(item));
                }
                context = result;
            }
        }

        return context;

        //封装重复的代码
        function pushArray(doms) {
            for (var j = 0, domlen = doms.length; j < domlen; j++) {
                result.push(doms[j]);
            }
        }
    },
    //多组+层次
    //var mys = X.select('#container div p,#container .div p,strong');
    select: function (str) {
        var result = [];
        var item = X.trim(str).split(',');
        for (var i = 0, glen = item.length; i < glen; i++) {
            var select = X.trim(item[i]);
            var context = [];
            context = X.gradation(select);
            pushArray(context);
        }
        return result;
        //封装重复的代码
        function pushArray(doms) {
            for (var j = 0, domlen = doms.length; j < domlen; j++) {
                result.push(doms[j])
            }
        }
    },
    //html5实现的选择器
    all: function (selector, context) {
        context = context || document;
        return context.querySelectorAll(selector);
    },
});

/*位置模块*/
X.extend(X, {
    //元素高度宽度概述
    //计算方式：clientHeight clientWidth innerWidth innerHeight
    //元素的实际高度+border，也不包含滚动条
    width: function (id) {
        return X.id(id).clientWidth
    },
    height: function (id) {
        return X.id(id).clientHeight
    },
    //元素的滚动高度和宽度
    //当元素出现滚动条时候，这里的高度有两种：可视区域的高度 实际高度（可视高度+不可见的高度）
    //计算方式 scrollwidth
    scrollWidth: function (id) {
        return X.id(id).scrollWidth
    },
    scrollHeight: function (id) {
        return X.id(id).scrollHeight
    },
    //元素滚动的时候 如果出现滚动条 相对于左上角的偏移量
    //计算方式 scrollTop scrollLeft
    scrollTop: function (id) {
        return X.id(id).scrollTop
    },
    scrollLeft: function (id) {
        return X.id(id).scrollLeft
    },

    //获取屏幕的高度和宽度
    screenHeight: function () {
        return window.screen.height
    },
    screenWidth: function () {
        return window.screen.width
    },
    //文档视口的高度和宽度
    visualWidth: function () {
        return document.documentElement.clientWidth
    },
    visualHeight: function () {
        return document.documentElement.clientHeight
    },
    //文档滚动区域的整体的高和宽
    wScrollHeight: function () {
        return document.body.scrollHeight
    },
    wScrollWidth: function () {
        return document.body.scrollWidth
    },
    //获取滚动条相对于其顶部的偏移
    wScrollTop: function () {
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
        return scrollTop
    },
    //获取滚动条相对于其左边的偏移
    wScrollLeft: function () {
        var scrollLeft = document.body.scrollLeft || (document.documentElement && document.documentElement.scrollLeft);
        return scrollLeft
    },
    //获取相对坐标
    //X.offset('div')
    offset: function (id) {
        //获取元素的坐标值
        function offsetLeft(dom) {
            return dom.offsetLeft;
        }

        function offsetTop(dom) {
            return dom.offsetTop;
        }

        var dom = X.id(id);
        return {top: offsetTop(dom), left: offsetLeft(dom)};
    },
    //获取绝对坐标
    //$$.position('div')
    position: function (id) {
        function absolateLeft(id) {
            var dom = X.id(id);
            var left = X.offset(id).left;
            var parent = dom.offsetParent;
            while (parent !== null) {
                left += parent.offsetLeft;
                parent = parent.offsetParent;
            }
            return left;
        }

        function absolateTop(id) {
            var dom = X.id(id);
            var top = X.offset(id).top;
            var parent = dom.offsetParent;
            while (parent !== null) {
                top += parent.offsetTop;
                parent = parent.offsetParent;
            }
            return top;
        }

        return {top: absolateTop(id), left: absolateLeft(id)};
    },
});

/*URL查询模块*/
X.extend(X, {
    /*获取页面传递过来的参数，获取？问好后面的*/
    /*X.simpleQuery()*/
    simpleQuery: function () {
        var params = window.location.search; //params:?id,date
        var arr = params.substring(1).split(",");
        return arr;
    },
    //获取URL查询字符串参数值的通用函数，获取查询字符串组成对象
    //var query = X.querystring();//调用查询字符串函数
    //for(var i in query){
    //   console.log(i+"="+query[i]);
    //}
    querystring: function () {
        var str = window.location.search.substring(1); //获取查询字符串，即"id=1&name=location"的部分
        var arr = str.split("&"); //以&符号为界把查询字符串分割成数组
        var json = {}; //定义一个临时对象
        for (var i = 0; i < arr.length; i++) //遍历数组
        {
            var c = arr[i].indexOf("="); //获取每个参数中的等号小标的位置
            if (c == -1) continue; //如果没有发现测跳到下一次循环继续操作
            var d = arr[i].substring(0, c); //截取等号前的参数名称，这里分别是id和name
            var e = arr[i].substring(c + 1); //截取等号后的参数值
            json[d] = e; //以名/值对的形式存储在对象中
        }
        return json; //返回对象
    },
    //获取url指定的查询字符串
    // GetQueryString("aa");
    getQueryString: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return decodeURI(r[2]);
        return null;
    },
    //获取url地址，不含参数，？前面的
    getDocumentUrl: function (name) {
        return location.protocol + '//' + location.host + location.pathname;
    },
});

/*判断数据类型*/
X.extend(X, {
    //数据类型检测
    isNumber: function (val) {
        return typeof val === 'number' && isFinite(val);
    },
    isBoolean: function (val) {
        return typeof val === "boolean";
    },
    isString: function (val) {
        return typeof val === "string";
    },
    isUndefined: function (val) {
        return typeof val === "undefined";
    },
    isObj: function (str) {
        if (str === null || typeof str === 'undefined') {
            return false;
        }
        return typeof str === 'object';
    },
    isNull: function (val) {
        return val === null;
    },
    isArray: function (arr) {
        if (arr === null || typeof arr === 'undefined') {
            return false;
        }
        return arr.constructor === Array;
    }
});

/*数字模块*/
X.extend(X, {
    //随机数
    random: function (begin, end) {
        return Math.floor(Math.random() * (end - begin + 1)) + begin;
    },
    // 生成一个随机唯一id的方法
    createRandomId: function () {
        var rnd = Math.random().toString().replace('.', '');
        var date = new Date().getTime();
        return rnd + date;
    }
});

/*属性模块*/
X.extend(X, {
    //显示
    //$$.on('show','click',function(){
    show: function (content) {
        var doms = X.all(content);
        for (var i = 0, len = doms.length; i < len; i++) {
            X.css(doms[i], 'display', 'block');
        }
    },
    //隐藏和显示元素
    //$$.on('hide','click',function(){
    hide: function (content) {
        var doms = X.all(content);
        for (var i = 0, len = doms.length; i < len; i++) {
            X.css(doms[i], 'display', 'none');
        }
    },
    //样式
    //X.css('p','color','yellow')
    //X.css('p','opacity','0.2')
    css: function (context, key, value) {
        var dom = X.isString(context) ? X.all(context) : context;
        //如果是数组
        if (dom.length) {
            //先骨架骨架 -- 如果是获取模式 -- 如果是设置模式
            //如果value不为空，则表示设置
            if (value) {
                for (var i = dom.length - 1; i >= 0; i--) {
                    setStyle(dom[i], key, value);
                }
                //            如果value为空，则表示获取
            } else {
                return getStyle(dom[0]);
            }
            //如果不是数组
        } else {
            if (value) {
                setStyle(dom, key, value);
            } else {
                return getStyle(dom);
            }
        }

        function getStyle(dom) {
            if (dom.currentStyle) {
                return dom.currentStyle[key];
            } else {
                return getComputedStyle(dom, null)[key];
            }
        }

        function setStyle(dom, key, value) {
            dom.style[key] = value;
        }
    },
    //属性操作，获取属性的值
    // attr（'test','target','_blank'）
    attr: function (content, key, value) {
        var dom = X.all(content);
        //如果是数组  比如tag
        if (dom.length) {
            if (value) {
                for (var i = 0, len = dom.length; i < len; i++) {
                    dom[i].setAttribute(key, value);
                }
            } else {
                return dom[0].getAttribute(key);
            }
            //如果是单个元素  比如id
        } else {
            if (value) {
                dom.setAttribute(key, value);
            } else {
                return dom.getAttribute(key);
            }
        }
    },
    //动态添加和移除class
    //X.addClass('#div',"testClass")
    addClass: function (context, name) {
        var doms = X.all(context);
        //如果获取的是集合
        if (doms.length) {
            for (var i = 0, len = doms.length; i < len; i++) {
                addName(doms[i]);
            }
            //如果获取的不是集合
        } else {
            addName(doms);
        }
        function addName(dom) {
            dom.className = dom.className + ' ' + name;
        }
    },
    removeClass: function (context, name) {
        var doms = X.all(context);
        if (doms.length) {
            for (var i = 0, len = doms.length; i < len; i++) {
                removeName(doms[i]);
            }
        } else {
            removeName(doms);
        }

        function removeName(dom) {
            dom.className = dom.className.replace(name, '');
        }
    },
    //判断是否有
    //console.log(X.hasClass('#div',"testClass"));
    hasClass: function (context, name) {
        var doms = X.all(context);
        var flag = true;
        for (var i = 0, len = doms.length; i < len; i++) {
            flag = flag && check(doms[i], name);
        }

        return flag;
        //判定单个元素
        function check(element, name) {
            return -1 < (" " + element.className + " ").indexOf(" " + name + " ");
        }
    },
    //获取
    getClass: function (id) {
        var doms = $$.$all(id);
        return $$.trim(doms[0].className).split(" ");
    },
});

/*内容模块*/
X.extend(X, {
    //innerHTML的函数版本
    html: function (context, value) {
        var doms = X.all(context);
        //设置
        if (value) {
            for (var i = 0, len = doms.length; i < len; i++) {
                doms[i].innerHTML = value;
            }
        } else {
            return doms[0].innerHTML;
        }
    },
});

/*字符串模块*/
X.extend(X, {
    //去除左边空格
    ltrim: function (str) {
        return str.replace(/(^\s*)/g, '');
    },
    //去除右边空格
    rtrim: function (str) {
        return str.replace(/(\s*$)/g, '');
    },
    //去除空格
    trim: function (str) {
        return str.replace(/(^\s*)|(\s*$)/g, '');
    },
    //简单的数据绑定formateString
    // user={"name":"wangyun"}
    // console.log(X.formateString("欢迎@(name)来到百度世界",user))
    formateString: function (str, data) {
        return str.replace(/@\((\w+)\)/g, function (match, key) {
            return typeof data[key] === "undefined" ? '' : data[key];
        });
    },
    //正则匹配关键字
    // X.keyword("12312313",'1',"red")
    keyword: function (content, keyword, color) {
        return content.replace(new RegExp(keyword, 'ig'), '<font color="' + color + '">' + keyword + '</font>');
    },


});

/*时间模块*/
X.extend(X, {
    //获取当前时间戳
    nowTimestamp: function () {
        return Date.parse(new Date())
    },
    //获取指定时间戳的日期格式
    timestamp: function (timestamp) {
        return new Date(timestamp).Format("yyyy-MM-dd hh:mm:ss")
    }
});

/*存储模块*/
X.extend(X, {
    //设置coolie
    setCookie: function (name, value, days, path) {
        var name = escape(name);
        var value = escape(value);
        var expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        path = path == "" ? "" : ";path=" + path;
        _expires = (typeof hours) == "string" ? "" : ";expires=" + expires.toUTCString();
        document.cookie = name + "=" + value + _expires + path;
    },
    //获取cookie值
    getCookie: function (name) {
        var name = escape(name);
        //读cookie属性，这将返回文档的所有cookie
        var allcookies = document.cookie;

        //查找名为name的cookie的开始位置
        name += "=";
        var pos = allcookies.indexOf(name);
        //如果找到了具有该名字的cookie，那么提取并使用它的值
        if (pos != -1) {                                    //如果pos值为-1则说明搜索"version="失败
            var start = pos + name.length;                  //cookie值开始的位置
            var end = allcookies.indexOf(";", start);       //从cookie值开始的位置起搜索第一个";"的位置,即cookie值结尾的位置
            if (end == -1) end = allcookies.length;         //如果end值为-1说明cookie列表里只有一个cookie
            var value = allcookies.substring(start, end);   //提取cookie的值
            return unescape(value);                         //对它解码
        }
        else return "";                                     //搜索失败，返回空字符串
    },
    //删除cookie
    deleteCookie: function (name, path) {
        var name = escape(name);
        var expires = new Date(0);
        path = path == "" ? "" : ";path=" + path;
        document.cookie = name + "=" + ";expires=" + expires.toUTCString() + path;
    },
    //本地存储localStorage
    //X.store.set('aq','ac')
    //X.store.remove('aq')
    store: (function () {
        var api = {},
            win = window,
            doc = win.document,
            localStorageName = 'localStorage',
            globalStorageName = 'globalStorage',
            storage;

        api.set = function (key, value) {
        };
        api.get = function (key) {
        };
        api.remove = function (key) {
        };
        api.clear = function () {
        };

        if (localStorageName in win && win[localStorageName]) {
            storage = win[localStorageName];
            api.set = function (key, val) {
                storage.setItem(key, val)
            };
            api.get = function (key) {
                return storage.getItem(key)
            };
            api.remove = function (key) {
                storage.removeItem(key)
            };
            api.clear = function () {
                storage.clear()
            };

        } else if (globalStorageName in win && win[globalStorageName]) {
            storage = win[globalStorageName][win.location.hostname];
            api.set = function (key, val) {
                storage[key] = val
            };
            api.get = function (key) {
                return storage[key] && storage[key].value
            };
            api.remove = function (key) {
                delete storage[key]
            };
            api.clear = function () {
                for (var key in storage) {
                    delete storage[key]
                }
            };

        } else if (doc.documentElement.addBehavior) {
            function getStorage() {
                if (storage) {
                    return storage
                }
                storage = doc.body.appendChild(doc.createElement('div'));
                storage.style.display = 'none';
                // See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
                // and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
                storage.addBehavior('#default#userData');
                storage.load(localStorageName);
                return storage;
            }

            api.set = function (key, val) {
                var storage = getStorage();
                storage.setAttribute(key, val);
                storage.save(localStorageName);
            };
            api.get = function (key) {
                var storage = getStorage();
                return storage.getAttribute(key);
            };
            api.remove = function (key) {
                var storage = getStorage();
                storage.removeAttribute(key);
                storage.save(localStorageName);
            };
            api.clear = function () {
                var storage = getStorage();
                var attributes = storage.XMLDocument.documentElement.attributes;
                storage.load(localStorageName);
                for (var i = 0, attr; attr = attributes[i]; i++) {
                    storage.removeAttribute(attr.name);
                }
                storage.save(localStorageName);
            }
        }
        return api;


    })(),
});

/*ajax模块*/
X.extend(X, {
    //基于jquery的ajax二次封装
    // handleAjax('getCradits.json', {page: 10}).done(function (resp) {
    //  当result为true的回调
    //  console.log(resp)
    //  }).fail(function (err) {
    //  当result为false的回调
    //  console.log(err)
    //  });
    handleAjax: function (url, param, type, dataType) {
        function ajax(url, param, type, dataType) {
            return $.ajax({
                url: url,
                data: param || {},
                type: type || 'GET',
                dataType: dataType || 'json'
            });
        }

        return ajax(url, param, type, dataType).then(function (resp) {
            // 成功回调
            if (resp.resultCode == 0) {
                // 直接返回要处理的数据，作为默认参数传入之后done()方法的回调
                return resp.result.data;
            }
            else {
                // 返回一个失败状态的deferred对象，把错误代码作为默认参数传入之后fail()方法的回调
                return $.Deferred().reject(resp.errorMsg);
            }
        }, function (err) {
            // 失败回调
            // 打印状态码
            console.log(err.status);
        });
    },

});

/*对象操作模块*/
X.extend(X, {
    //深克隆json对象和数组
    clone: function (jsonObj) {
        var buf;
        if (jsonObj instanceof Array) {
            buf = [];
            var i = jsonObj.length;
            while (i--) {
                buf[i] = X.clone(jsonObj[i]);
            }
            return buf;
        } else if (jsonObj instanceof Object) {
            buf = {};
            for (var k in jsonObj) {
                buf[k] = X.clone(jsonObj[k]);
            }
            return buf;
        } else {
            return jsonObj;
        }
    },
    // var array2 = [{kcxz: "专业课", xf: 8},{kcxz: "大类基础课", xf: 2},{kcxz: "通识课", xf: 2}]
    // var array1 = [{kcxz: "通识课", xf: 18},{kcxz: "大类基础课", xf: 20},{kcxz: "专业课", xf: 18},{kcxz: "拓展课", xf: 18}]
    // console.log(X.compare(array1,array2,'kcxz'))
    //array1是父级数组，array2是array1的子集，array2的所有元素array1都有
    //要取array2在array1中的补集
    //key是以哪个键为标准
    compare: function (array1, array2, key) {
        var result = [];
        for (var i = 0; i < array1.length; i++) {
            var obj = array1[i];
            var kcxz = obj[key];
            var isExist = false;
            for (var j = 0; j < array2.length; j++) {
                var aj = array2[j];
                var n = aj[key];
                if (n == kcxz) {
                    isExist = true;
                    break;
                }
            }
            if (!isExist) {
                result.push(obj);
            }
        }
        return result;
    }
});





// 时间格式化
// var time1 = new Date().Format("yyyy-MM-dd");
// var time2 = new Date().Format("yyyy-MM-dd HH:mm:ss");
Date.prototype.Format = function (format) {
    var args = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
        "S": this.getMilliseconds()
    };
    if (/(y+)/.test(format))
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var i in args) {
        var n = args[i];
        if (new RegExp("(" + i + ")").test(format))
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? n : ("00" + n).substr(("" + n).length));
    }
    return format;
};


/*浏览器种类模块*/
//判断是否IE内核
// if(browser.versions.trident){ alert(“is IE”); }
//判断是否webKit内核
// if(browser.versions.webKit){ alert(“is webKit”); }
//判断是否移动端
// if(browser.versions.mobile||browser.versions.android||browser.versions.ios){ alert(“移动端”); }
var browser = {
    versions: function () {
        var u = navigator.userAgent,
            app = navigator.appVersion;
        return {
            trident: u.indexOf('Trident') > -1, //IE内核
            presto: u.indexOf('Presto') > -1, //opera内核
            webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1,//火狐内核
            mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
            android: u.indexOf('Android') > -1 || u.indexOf('Adr') > -1, //android终端
            iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
            iPad: u.indexOf('iPad') > -1, //是否iPad
            webApp: u.indexOf('Safari') == -1, //是否web应该程序，没有头部与底部
            weixin: u.indexOf('MicroMessenger') > -1, //是否微信 （2015-01-22新增）
            qq: u.match(/\sQQ/i) == " qq" //是否QQ
        };
    }(),
    language: (navigator.browserLanguage || navigator.language).toLowerCase()
};







