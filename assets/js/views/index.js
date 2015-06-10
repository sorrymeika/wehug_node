define(function(require,exports,module) {
    var util=require('util');

    var $=require('$'),
        Activity=require('activity'),
        bridge=require('bridge'),
        Loading=require('../widget/loading'),
        Slider=require('../widget/slider'),
        RSA=require('util/rsa'),
        base64=require('util/base64');

    var animation=require('animation');

    var ScrollView=require('../widget/scrollview');

    return Activity.extend({
        template: 'template/index',

        events: {
            'tap': function() {
                this.forward('/test');
            },

            'tap .js_buy': function() { },
            'tap .js_create': function() {
            },

            'tap .js_buy': function() {
            }
        },

        //swipeLeftForwardAction: '/test',

        swipeRightForwardAction: '/menu/index.html',

        onCreate: function() {
            var that=this;

            new Slider(this.$('.js_list'),{
                itemTemplate: '<img src="<%=img%>">',
                data: [{
                    img: 'http://images3.c-ctrip.com/rk/apph5/D1/201506/app_home_ad05_640_128.jpg'
                },{
                    img: 'http://images3.c-ctrip.com/rk/apph5/C1/201505/app_home_ad36_640_128.jpg'
                },{
                    img: 'http://images3.c-ctrip.com/rk/apph5/C1/201505/app_home_ad26_640_128.png'
                },{
                    img: 'http://source.qunar.com/site/images/wap/home/recommend/small/wuzhe514.jpg'
                }]
            });

            var a=Date.now();
            /*

            var rsa=new RSA();

            rsa.setPublic("7b59c8b774ecdcbd7ab56aa273c400992d1e3adebdbb3d8ff3afe0d71d5c068b\
            f78879efdbfab5f3f4ec08b9a4544c2338a0a70e7de92d74c6955a2ff2179694\
            237fa60279da6294d55dfbcbc36876e72b7fde9dd7fa7151cea12f932ef26316\
            2b0577e5b8b172fc633e26c90f9d549a350a6d5119d20777594156f60ef1648b\
            94031129626ce897bf835b3a448eb4d4dc91ab8f592d47da72d15ffbbcc26b35\
            fb036c2880148cf4acfeef207200969ebd2f0f1bfc163cc9d945334d6d7c3cc5\
            f3ca4807cbf260d6c0f277fb115f01186df261907cd9a4ec4cb9c115c8444367\
            37ac02ebb9e33139979197d1ee2099bdb3f378c6c3f91670195f11560053a8f7","10001");

            var res=rsa.encrypt('asdf');

            var bbb='aaaaaaa'

            console.log(res);
            console.log(base64.hex2b64(res));

            console.log(base64.encode(res));
            console.log(base64.decode(base64.encode(res)));
            */
        },

        onShow: function() {
            var that=this;
        },

        onDestory: function() {
        }
    });
});
