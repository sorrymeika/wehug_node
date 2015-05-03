define(function () {
    var ArrayProto=Array.prototype,
        push=ArrayProto.push,
        slice=ArrayProto.slice,
        concat=ArrayProto.concat,
        ua=navigator.userAgent,
        ios=ua.match(/(iPhone|iPad|iPod).*OS\s([\d_]+)/i),
        android=ua.match(/(Android);?[\s\/]+([\d.]+)?/),
        isAndroid=!!android,
        osVersion,
        guid=0;

    if(ios) osVersion=ios[2].split('_');
    else if(android) osVersion=android[2].split('.');

    var util={
        ios: !!ios,
        android: isAndroid,
        osVersion: osVersion?parseFloat(osVersion[0]+'.'+osVersion[1]):0,
        guid: function () {
            return ++guid;
        },
        indexOf: function (arr,val) {
            var fn=typeof val==='function'?val:function (item) { return item==val; }
            for(var i=0,n=arr.length;i<n;i++) {
                if(fn(arr[i],i)) return i;
            }
            return -1;
        },

        lastIndexOf: function (arr,val) {
            var fn=typeof val==='function'?val:function (item) { return item==val; }
            for(var i=arr.length-1;i>=0;i--) {
                if(fn(arr[i],i)) return i;
            }
            return -1;
        },

        where: function (arr,fn) {
            var result=[];
            var item;
            for(var i=0,n=arr.length;i<n;i++) {
                item=arr[i];

                if(fn(item,i))
                    result.push(item);
            }
            return result;
        },

        select: function (arr,fn) {
            var result=[];
            for(var i=0,n=arr.length;i<n;i++)
                result.push(fn(arr[i],i));

            return result;
        },

        pick: function (obj,iteratee) {
            var result={},key;
            if(obj==null) return result;
            if(typeof iteratee==='function') {
                for(key in obj) {
                    var value=obj[key];
                    if(iteratee(value,key,obj)) result[key]=value;
                }
            } else {
                var keys=concat.apply([],slice.call(arguments,1));
                for(var i=0,length=keys.length;i<length;i++) {
                    key=keys[i];
                    if(key in obj) result[key]=obj[key];
                }
            }
            return result;
        },
        s2i: function (s) {
            return parseInt(s.replace(/^0+/,'')||0);
        },
        pad: function (num,n) {
            var a='0000000000000000'+num;
            return a.substr(a.length-(n||2));
        },

        formatDate: function (d,f) {
            if(typeof d==="string"&&/^\/Date\(\d+\)\/$/.test(d)) {
                d=new Function("return new "+d.replace(/\//g,''))();
            }

            var y=d.getFullYear()+"",M=d.getMonth()+1,D=d.getDate(),H=d.getHours(),m=d.getMinutes(),s=d.getSeconds(),mill=d.getMilliseconds()+"0000",pad=this.pad;
            return (f||'yyyy-MM-dd HH:mm:ss').replace(/\y{4}/,y)
                .replace(/y{2}/,y.substr(2,2))
                .replace(/M{2}/,pad(M))
                .replace(/M/,M)
                .replace(/d{2,}/,pad(D))
                .replace(/d/,d)
                .replace(/H{2,}/i,pad(H))
                .replace(/H/i,H)
                .replace(/m{2,}/,pad(m))
                .replace(/m/,m)
                .replace(/s{2,}/,pad(s))
                .replace(/s/,s)
                .replace(/f+/,function (w) {
                    return mill.substr(0,w.length)
                })
        },
        style: function (css) {
            var doc=document,style=doc.createElement("style");
            style.type="text/css";
            try {
                style.appendChild(doc.createTextNode(css));
            } catch(ex) {
                style.styleSheet.cssText=css;
            }
            var head=doc.getElementsByTagName("head")[0];
            head.appendChild(style);

            return style;
        },

        template: function (str,data) {
            var tmpl='var __p=[];var $data=obj||{};with($data){__p.push(\''+
                str.replace(/\\/g,'\\\\')
                .replace(/'/g,'\\\'')
                .replace(/<%=([\s\S]+?)%>/g,function (match,code) {
                    return '\','+code.replace(/\\'/,'\'')+',\'';
                })
                .replace(/<%([\s\S]+?)%>/g,function (match,code) {
                    return '\');'+code.replace(/\\'/,'\'')
                            .replace(/[\r\n\t]/g,' ')+'__p.push(\'';
                })
                .replace(/\r/g,'\\r')
                .replace(/\n/g,'\\n')
                .replace(/\t/g,'\\t')+
                '\');}return __p.join("");',

            func=new Function('obj',tmpl);

            return data?func(data):func;
        },

        encodeHTML: function (text) {
            return (""+text).split("<").join("&lt;").split(">").join("&gt;").split('"').join("&#34;").split("'").join("&#39;");
        },

        getUrlPath: function (url) {
            var index=url.indexOf('?');
            if(index!= -1) {
                url=url.substr(0,index);
            }
            return url.toLowerCase();
        },

        cookie: function (a,b,c,p) {
            if(typeof b==='undefined') {
                var res=document.cookie.match(new RegExp("(^| )"+a+"=([^;]*)(;|$)"));
                if(res!=null)
                    return unescape(res[2]);
                return null;
            } else {
                if(typeof b===null) {
                    b=this.cookie(name);
                    if(b!=null) c= -1;
                    else return;
                }
                if(c) {
                    var d=new Date();
                    d.setTime(d.getTime()+c*24*60*60*1000);
                    c=";expires="+d.toGMTString();
                }
                document.cookie=a+"="+escape(b)+(c||"")+";path="+(p||'/')
            }
        },
        store: window.localStorage?function (key,value) {
            if(typeof value==='undefined')
                return JSON.parse(localStorage.getItem(key));
            if(value===null)
                localStorage.removeItem(key);
            else
                localStorage.setItem(key,JSON.stringify(value));
        } :function () {
            if(typeof value==='undefined')
                return JSON.parse(this.cookie(key));
            if(value===null)
                this.cookie(key,null);
            else
                this.cookie(key,JSON.stringify(value));
        },
        noop: function () { },

        validateEmail: function (email) {
            return /^[-_a-zA-Z0-9\.]+@([-_a-zA-Z0-9]+\.)+[a-zA-Z0-9]{2,3}$/.test(email)
        },
        validateMobile: function (str) {
            return /^1[0-9]{10}$/.test(str)
        }
    };

    return util;
})