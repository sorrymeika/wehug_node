define(function (require,exports,module) {
    var $=require('$');
    var util=require('util'),
        Page=require('core/page');

    return Page.extend({
        initialize: function () {
            var self=this;
            Page.prototype.initialize.call(this,arguments);
            $.get('/api/manage/islogin',function (res) {
                if(!res.success)
                    self.forward('/login');

            },'json');
        }
    });
});

