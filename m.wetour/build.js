var config=require('./config');
var Promise=require('./../core/promise');
var Tools=require('./../tools/tools');
var tools=new Tools(path.join(__dirname,'./'),path.join(__dirname,config.dest));

var build=function (config,routes) {
    var tmplPromise=Promise.resolve();
    var views={};
    var Route=require('./../core/route');
    var route=new Route(routes);

    tmplPromise.each(route.routes,function (i,buildConfig) {
        var templatePath='./'+buildConfig.template+'.tpl',
            viewPath='./'+buildConfig.view+'.js',
            count=2,
            callback=function () {
                count--;
                if(count==0) {
                    tmplPromise.next(i);
                }
            },
            root=buildConfig.root=='/'?'/':(buildConfig.root+'/');

        if(!views[root]) views[root]='';

        fs.readFile(templatePath,{ encoding: 'utf-8' },function (err,data) {
            var nodeCode=Tools.compressJs(razor.node(data));
            var code=Tools.compressJs(Tools.replaceDefine(buildConfig.template,razor.web(data)));

            Tools.save(config.node_dest+'/'+buildConfig.template+'.js',nodeCode);

            views[root]+=code;

            callback();
        });

        fs.readFile(viewPath,{ encoding: 'utf-8' },function (err,data) {
            var code=Tools.compressJs(Tools.replaceDefine(buildConfig.view,data));

            views[root]+=code;
            callback();
        });
    })
    .then(function () {
        for(var key in views) {
            Tools.save(config.dest+key+'controller.js',views[key]);
        }

        Tools.save(path.join(config.node_dest,'config.js'),'module.exports='+JSON.stringify(config));
        Tools.copy(path.join(config.node_dest,'index.js'),'./index.js');
    });

    return tmplPromise;
}

var configloader=require('./configloader');

configloader('./config',function (config,routes) {
});