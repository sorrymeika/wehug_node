define(function (require, exports, module) {
    var $ = require('$');
    var form = require('./form2.html');
    var util = require('util');
    var Validator = require('./validator');
    var model = require('core/model2');
    var Promise = require('core/promise');
    var TimePicker = require('./timepicker');

    var valid_keys = ['emptyAble', 'emptyText', 'regex', 'regexText', 'compare', 'compareText', 'validate', 'validateText', 'success'];
    var guid = 0;

    module.exports = exports = function (options) {
        var self = this,
            option,
            fields;

        this.hiddens = [];
        this.fields = [];
        this.plugins = [];
        this.compo = {};

        var validator = {};
        for (var key in options) {
            option = options[key];

            if (key == 'fields') {
                for (var i = 0, len = option.length; i < len; i++) {
                    fields = option[i];
                    if (fields.type === 'hidden') {
                        this.hiddens.push(fields);
                    } else {
                        if (!fields.length) fields = [fields];
                        this.fields.push(fields);

                        for (var j = 0, length = fields.length; j < length; j++) {
                            var field = fields[j];
                            var valid = util.pick(field, valid_keys);

                            if (!util.isEmptyObject(valid)) {
                                validator[field.field] = valid;
                            }
                        }
                    }
                }

            } else
                this[key] = option;
        }
        
        this.validator = 'Valid';
        
        this.$el = $(this.template.html(this));
        this.el = this.$el[0];

        this.model = new model.ViewModel(this.$el, {
        });
        
        this.valid = new Validator(validator, this.model.data);

        this.$el.on('blur', '[name]', $.proxy(this._validInput, this))

        for (var i = 0, len = this.plugins.length; i < len; i++) {
            var plugin = this.plugins[i];
            var $hidden = this.$el.find('[name="' + plugin.field + '"]');
            var compo = this.compo[plugin.field] = new (exports.require(plugin.type))($hidden, plugin);
            var value = this.model.data[plugin.field];
            if (value)
                compo.val(this.model.data[plugin.field]);

            this.model.on('change:' + plugin.field, (function (compo) {
                return function (e, value) {
                    compo.val(value);
                }
            })(compo))
        }
    };

    exports.prototype = {
        model: null,
        name: 'form',
        template: form,
        useIframe: false,
        url: '',
        enctype: '',
        method: "post",
        fields: [],

        reset: function () {
            for (var key in this.compo) {
                this.compo[key].val('');
            }
            this.el.reset();
        },

        submit: function (success, error) {
            var res = this.valid.validate();
            var self = this;
            this.model.set(this.validator, res);

            if (res.success) {
                if (this.useIframe || this.$el.has('[type="file"]').length) {
                    guid++;
                    var target = "_submit_iframe" + guid;
                    var resultText;
                    var $iframe = $('<iframe style="top:-999px;left:-999px;position:absolute;display:none;" frameborder="0" width="0" height="0" name="' + target + '"></iframe>')
                        .appendTo(document.body)
                        .on('load', function () {
                            var result = $.trim((this.contentWindow.document.body.innerHTML));
                            if (!resultText || result != resultText) {
                                resultText = result;
                                try {
                                    success.call(self, JSON.parse(resultText));
                                } catch (e) {
                                    error && error.call(self, e, resultText);
                                }
                            }
                        });

                    this.$el.attr("target", target).submit();

                } else {
                    $.ajax({
                        url: this.url,
                        type: 'POST',
                        dataType: 'json',
                        data: this.$el.serialize(),
                        success: $.proxy(success, this),
                        error: error && $.proxy(error, this)
                    });
                }
            } else {
                sl.tip("请检查填写是否有误");
            }
        },

        _validInput: function (e) {
            var $target = $(e.currentTarget);
            var name = $target.attr('name');
            var res = this.valid.validate(name);

            if (!this.model.data[this.validator]) this.model.set(this.validator, { result: {} });

            this.model.set(this.validator + '.result.' + name, res);
        },

        destory: function () {
            this.$el.on('off', '[name]', this._validInput);
        }
    };

    var plugins = {};
    exports.define = function (id, Func) {
        plugins[id.toLowerCase()] = Func;
    };

    exports.require = function (id) {
        return plugins[id.toLowerCase()];
    };

    var RichTextBox = function ($input, options) {
        var self = this;
        self.$input = $input;
        self.id = 'UMEditor' + (RichTextBox.guid++);

        var $script = $('<script type="text/plain" id="' + self.id + '" style="width:' + (options.width || 640) + 'px;height:300px;"></script>').insertBefore($input);

        window.UMEDITOR_HOME_URL = seajs.resolve('components/umeditor/');
        self.promise = Promise();

        (function (fn) {
            window.jQuery ? fn() : seajs.use(['components/umeditor/third-party/jquery.min'], fn);

        })(function () {
            seajs.use(['components/umeditor/umeditor.config', 'components/umeditor/umeditor', 'components/umeditor/themes/default/css/umeditor.css'], function (a) {
                var editorOptions = {};
                if (options.toolbar) editorOptions.toolbar = options.toolbar;
                else if (options.simple) editorOptions.toolbar = ['source | undo redo | bold italic underline strikethrough | removeformat | justifyleft justifycenter justifyright justifyjustify | link unlink | image'];

                var editor = UM.getEditor(self.id, editorOptions);
                editor.addListener('blur', function () {
                    var content = editor.getContent();
                    var original = $input[0].value;

                    $input.val(content);
                    if (original !== content) $input.trigger('change');
                    $input.trigger('blur');
                });

                self.editor = editor;
                editor.ready(function () {
                    self.promise.resolve();
                });
            });
        });
    };

    RichTextBox.prototype = {
        val: function (val) {
            var self = this;
            self.promise.then(function () {
                self.editor.setContent(val, false);
            });
            self.$input.val(val).trigger('change');
        }
    }

    RichTextBox.guid = 0;

    exports.define('RichTextBox', RichTextBox);
    exports.define('TimePicker', TimePicker);
});
