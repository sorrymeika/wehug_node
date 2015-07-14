define(function (require,exports,module) {
    var $=require('$');
    var form=require('./form');
    var util=require('util');
    var Validator=require('./validator');

    var valid_keys=['emptyAble','emptyText','regex','regexText','compare','compareText','validate','validateText','success'];

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
        this.data=this.model.get(this.name);

        this.valid=new Validator(validator,this.data);
        this.$el=$(this.template.html(this));
        this.el=this.$el[0];

        for(var i=0,len=this.plugins.length;i<len;i++) {
            var plugin=this.plugins[i];
            var $hidden=this.$el.find('[name="'+plugin.field+'"]');
            var compo=new exports.require(plugin.type)($hidden,plugin.options);
        }
    };

    exports.prototype={
        model: null,
        name: 'form',
        template: form,
        validator: 'valid',
        url: '',
        enctype: '',
        method: "post",
        fields: [],
        submit: function () {
            var res=this.valid.validate();
            console.log(res);

            if(res.success) {
            }
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
        this.$input=$input;

        this.$el=$('');
        this.el=this.$el[0];
    };

    exports.define('RichTextBox',RichTextBox);
});
