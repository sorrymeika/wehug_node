var path=require('path');
var fs=require('fs');
var Tools=require('../../../tools/tools');
var Promise=require('../../../core/promise');
var razor=require('../../../core/razor');
var tools=new Tools(__dirname,path.join(__dirname,'../../dest'));

var promise=Promise();

fs.readFile('./form.tpl',{ encoding: 'utf-8' },function (err,data) {
    var code=Tools.compressJs(Tools.replaceDefine('components/form',razor.web(data)));
    Tools.save('./form.js',code,function () {
        promise.resolve();
    });
});

promise.then(function () {
    tools.combine({
        components: {
            'components/validator': './validator',
            'components/form': './form',
            'components/formjs': './formjs',
            'components/grid': './grid',
            'components/page': './page'
        }
    });
});