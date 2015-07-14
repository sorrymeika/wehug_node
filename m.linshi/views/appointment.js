define(function (require,exports,module) {

    var $=require('$');
    var util=require('util');
    var Activity=require('activity');
    var Loading=require('../widget/extend/loading');
    var model=require('../core/model');
    var Scroll=require('../widget/scroll');
    var animation=require('animation');

    return Activity.extend({
        events: {
            'tap .js_submit:not(.disabled)': function (e) {
                if(!this.model.data.validCode) {
                    sl.tip('请输入验证码');
                    return;
                }

                this.$submit.addClass('disabled');

                this.loading.setParam({
                    valid_code: this.model.data.validCode
                }).load();
            },
            'tap .js_valid:not(.disabled)': function (e) {
                this.$valid.addClass('disabled');

                this.valid.load();
            }
        },

        onCreate: function () {
            var self=this;

            var $main=this.$('.main');

            Scroll.bind($main);

            var member=localStorage.getItem('member');
            var teacher=JSON.parse(localStorage.getItem('teacher'));

            this.teacher=teacher;

            this.model=new model.ViewModel(this.$el,{
                title: '预约试听',
                back: '/teacher/'+teacher.basic_info.teacher_id,
                teacher: teacher.basic_info,
                valid: '获取验证码'
            });

            if(!member) {
                this.forward('/login?success=/appointment&from=/teacher/'+teacher.basic_info.teacher_id);
            }
        },

        validTimeout: function () {
            var self=this;
            var sec=localStorage.getItem('valid_time');

            console.log(util.formatDate(new Date(parseInt(sec))))

            if(sec&&parseInt(sec)>60) {
                sec=Math.round((new Date(parseInt(sec)).getTime()-Date.now())/1000);

                if(sec<=0) return;

                self.$valid.addClass('disabled');

                setTimeout(function () {
                    if(sec<=0) {
                        self.$valid.removeClass('disabled');
                        self.model.set('valid','获取验证码');
                        localStorage.removeItem('valid_time');

                    } else {
                        self.model.set('valid',sec+'秒后获取');
                        sec--;
                        setTimeout(arguments.callee,1000);
                    }
                },1000);
            }
        },

        onShow: function () {
            var self=this;

            var member=localStorage.getItem('member');
            var teacher=this.teacher;

            if(!member) {
                this.forward('/login?success=/appointment&from=/teacher/'+teacher.basic_info.teacher_id);
                return;
            }

            if(this.created) return;

            this.created=true;

            member=JSON.parse(member);

            this.model.set({
                mobile: member.mobile,
                userName: member.user_name,
                member_id: member.member_id
            });


            this.$submit=this.$('.js_submit');
            this.$valid=this.$('.js_valid');


            self.validTimeout();

            this.loading=new Loading({
                url: '/student/appointment_teacher',
                method: 'POST',
                xhrFields: {
                    withCredentials: true
                },
                params: {
                    teacher_id: teacher.basic_info.teacher_id,
                    student_id: this.model.data.member_id,
                    discipline: teacher.basic_info.discipline,
                    student_name: this.model.data.userName,
                    student_mobile: this.model.data.mobile,
                    teacher_name: teacher.basic_info.teacher_name,
                    appointment_time: util.formatDate(new Date),
                    valid_type: 7
                },
                check: false,
                checkData: false,
                $el: this.$el,
                success: function (res) {
                    if(res.error_code==1) {
                        sl.tip(res.error_msg)
                    } else {
                        sl.tip(res.error_msg);
                        self.back(self.model.data.back);
                    }
                    self.$submit.removeClass('disabled');
                }
            });

            this.valid=new Loading({
                url: '/sms/send_valid_code',
                method: 'POST',
                xhrFields: {
                    withCredentials: true
                },
                params: {
                    mobile: self.model.data.mobile,
                    type: 7
                },
                check: false,
                checkData: false,
                $el: this.$el,
                success: function (res) {
                    if(res.error_code==1) {
                        sl.tip(res.error_msg)
                    } else {
                        localStorage.setItem('valid_time',Date.now()+60000);

                        self.validTimeout();

                    }
                }
            });
        },

        onDestory: function () {
        }
    });
});
