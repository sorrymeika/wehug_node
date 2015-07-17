define(function (require,exports,module) {
    var $=require('$');
    var form=require('./form');
    var util=require('util');
    var Validator=require('./validator');

    var valid_keys=['emptyAble','emptyText','regex','regexText','compare','compareText','validate','validateText','success'];
    var guid=0;

    module.exports=exports=function (options) {
        var option,
            fields;

        this.hiddens=[];
        this.fields=[];
        this.plugins=[];

        var validator={};
        for(var key in options) {
            option=options[key];

            if(key=='fields') {
                for(var i=0,len=option.length;i<len;i++) {
                    fields=option[i];
                    if(fields.type==='hidden') {
                        this.hiddens.push(fields);
                    } else {
                        if(!fields.length) fields=[fields];
                        this.fields.push(fields);

                        for(var j=0,length=fields.length;j<length;j++) {
                            var field=fields[j];
                            var valid=util.pick(field,valid_keys);

                            if(!util.isEmptyObject(valid)) {
                                validator[field.field]=valid;
                            }
                        }
                    }
                }

            } else
                this[key]=option;
        }

        this.model.set(this.name,{});
        this.data=this.model.get(this.name).data;

        this.valid=new Validator(validator,this.data);
        this.$el=$(this.template.html(this));
        this.el=this.$el[0];

        this.$el.on('blur','[name]',$.proxy(this._validInput,this))

        for(var i=0,len=this.plugins.length;i<len;i++) {
            var plugin=this.plugins[i];
            var $hidden=this.$el.find('[name="'+plugin.field+'"]');
            var compo=new exports.require(plugin.type)($hidden,plugin);
        }
    };

    exports.prototype={
        model: null,
        name: 'form',
        template: form,
        useIframe: false,
        validator: 'valid',
        url: '',
        enctype: '',
        method: "post",
        fields: [],

        submit: function (success,error) {
            var res=this.valid.validate();
            var self=this;
            this.model.set(this.validator,res);

            if(res.success) {
                if(this.useIframe||this.$el.has('[type="file"]').length) {
                    guid++;
                    var target="_submit_iframe"+guid;
                    var resultText;
                    var $iframe=$('<iframe style="top:-999px;left:-999px;position:absolute;display:none;" frameborder="0" width="0" height="0" name="'+target+'"></iframe>')
                        .appendTo(document.body)
                        .on('load',function () {
                            var result=$.trim((this.contentWindow.document.body.innerHTML));
                            if(!resultText||result!=resultText) {
                                resultText=result;
                                try {
                                    success.call(self,JSON.parse(resultText));
                                } catch(e) {
                                    error&&error.call(self,e,resultText);
                                }
                            }
                        });

                    this.$el.attr("target",target).submit();

                } else {
                    $.ajax({
                        url: this.url,
                        type: 'POST',
                        dataType: 'json',
                        data: this.$el.serialize(),
                        success: $.proxy(success,this),
                        error: error&&$.proxy(error,this)
                    });
                }
            }
        },

        _validInput: function (e) {
            var $target=$(e.currentTarget);
            var name=$target.attr('name');
            var res=this.valid.validate(name);

            if(!this.model.data[this.validator]) this.model.set(this.validator,{ result: {} });

            this.model.set(this.validator+'.result.'+name,res);
        },

        destory: function () {
            this.$el.on('off','[name]',this._validInput);
        }
    };

    var plugins={};
    exports.define=function (id,Func) {
        plugins[id.toLowerCase()]=Func;
    };

    exports.require=function (id) {
        return plugins[id.toLowerCase()];
    };

    var RichTextBox=function ($input,options) {
        var self=this;
        this.$input=$input;
        self.id='UMEditor'+(RichTextBox.guid++);
        $input.before('<script type="text/plain" id="'+self.id+'" style="width:'+(options.width||500)+'px;height:240px;"></script>');

        window.UMEDITOR_HOME_URL=seajs.resolve('components/umeditor/');

        (function (fn) {
            window.jQuery?fn():seajs.use(['components/umeditor/third-party/jquery.min'],fn);

        })(function () {
            seajs.use(['components/umeditor/umeditor.config','components/umeditor/umeditor','components/umeditor/themes/default/css/umeditor.css'],function (a) {
                var editor=UM.getEditor(self.id,{
                    toolbar: ['source | undo redo | bold italic underline strikethrough | removeformat | justifyleft justifycenter justifyright justifyjustify | link unlink | image']
                });
                editor.addListener('blur',function () {
                    var content=editor.getContent();
                    var original=$input[0].value;

                    $input.val(content);
                    if(original!==content) $input.trigger('change');
                    $input.trigger('blur');
                });
            });
        });
    };
    RichTextBox.guid=0;

    exports.define('RichTextBox',RichTextBox);
});
