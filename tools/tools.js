var UglifyJS=require('uglify-js');

var compressCss=function(res) {
    return res.replace(/\s*([;|\:|,|\{|\}])\s*/img,'$1').replace(/[\r\n]/mg,'').replace(/;}/mg,'}');
}

var compressor=UglifyJS.Compressor({
    sequences: true,  // join consecutive statemets with the “comma operator”
    properties: true,  // optimize property access: a["foo"] → a.foo
    dead_code: true,  // discard unreachable code
    drop_debugger: true,  // discard “debugger” statements
    unsafe: false, // some unsafe optimizations (see below)
    conditionals: true,  // optimize if-s and conditional expressions
    comparisons: true,  // optimize comparisons
    evaluate: true,  // evaluate constant expressions
    booleans: true,  // optimize boolean expressions
    loops: true,  // optimize loops
    unused: true,  // drop unused variables/functions
    hoist_funs: true,  // hoist function declarations
    hoist_vars: false, // hoist variable declarations
    if_return: true,  // optimize if-s followed by return/continue
    join_vars: true,  // join var declarations
    cascade: true,  // try to cascade `right` into `left` in sequences
    side_effects: true,  // drop side-effect-free statements
    warnings: true,  // warn about potentially dangerous optimizations/code
    global_defs: {}
});

var compressJs=function(code) {
    code=code.replace(/\/\/<--debug[\s\S]+?\/\/debug-->/img,'');

    var ast=UglifyJS.parse(code);
    ast.figure_out_scope();
    ast=ast.transform(compressor);
    ast.compute_char_frequency();
    ast.mangle_names();
    code=ast.print_to_string();

    return code;
};

var replaceDefine=function(id,code) {
    return code.replace(/^\s*define\(([^\(]+?,){0,1}function/,function(r0,p) {

        p=eval('['+(p||'')+']');
        typeof p[0]==='string'?(p[0]=id):p.splice(0,0,id);

        return 'define('+JSON.stringify(p).replace(/(^\[)|(\]$)/g,'')+',function';
    })
};

var compressHTML=function(html) {
    return html.replace(/\s*(<(\/{0,1}[a-zA-Z]+)(?:\s+[a-zA-Z1-9_-]+="[^"]*"|\s+[^\s]+)*?\s*(\/){0,1}\s*>)\s*/img,'$1')
        .replace(/<script(?:\s+[a-zA-Z1-9_-]+="[^"]*"|\s+[^\s]+)*?\s*(?:\/){0,1}\s*>([\S\s]*?)<\/script>/img,function(r0,r1) {
            return /^\s*$/.test(r1)?r0:('<script>'+compressJs(r1)+'</script>');
        });
}

var path=require('path');
var fs=require('fs');

var Tools=function(baseDir,destDir) {
    this.baseDir=path.join(__dirname,baseDir);
    this.destDir=path.join(__dirname,destDir);
}

Tools.prototype={
    times: 0,

    compressCss: compressCss,

    compressHTML: compressHTML,

    compressJs: compressJs,

    combine: function(pathDict) {
        var that=this,
            async=require('async');

        for(var destPath in pathDict) {
            var fileList=[],
                ids=pathDict[destPath],
                isCss=/\.css$/.test(destPath);

            for(var i=0,n=ids.length;i<n;i++) {
                fileList[i]=path.join(that.baseDir,isCss?ids[i]:('js/'+ids[i]));
            }

            (function(ids,isCss) {

                async.mapSeries(fileList,fs.readFile.bind(fs),function(err,result) {
                    if(err) {
                        console.log(err)
                        return;
                    }

                    var text='';

                    result.forEach(function(data,i) {
                        data=data.toString('utf-8');
                        text+=isCss?compressCss(data):compressJs(replaceDefine(ids[i],data));
                    });

                    console.log(text)
                });

            })(ids,isCss);
        }

        return this;
    },

    html: function(fileList,api,combinedPathDict) {

        api='<meta name="api-base-url" content="'+api+'" />';
        if(!(fileList instanceof Array)) fileList=[fileList];

        var that=this,
            now=new Date().getTime();

        fileList.forEach(function(fileName) {
            fileName=path.join(that.baseDir,fileName);

            fs.readFile(fileName,{ encoding: 'utf-8' },function(err,html) {

                html=html.replace(/<script[^>]+debug[^>]*>[\S\s]*?<\/script>/img,'')
                    .replace(/<link[^>]+debug[^>]*\/*\s*>/img,'')
                    .replace(/<head>/i,'<head>'+api);

                if(combinedPathDict) {
                    var combinedFiles='';
                    for(var destCombinePath in combinedPathDict) {
                        var isCss=/\.css$/.test(destCombinePath);

                        combinedFiles+=isCss?'<link href="'+destCombinePath+'?v='+now+'" rel="stylesheet" type="text/css" />'
                            :('<script src="js/'+destCombinePath+'.js?v='+now+'"></script>');
                    }

                    combinedFiles+='<script data-template="razor" src="js/razor.text.js"></script>';

                    html=html.replace(/<\/head>/i,combinedFiles+'</head>');
                }

                html=compressHTML(html);

                console.log(html)
            });
        });

        return this;
    },

    resource: function(resource) {
        this.ajax('tools.cshtml?action=resource',{
            resource: resource.join(',')
        });
    },

    compress: function(fileList) {

        var that=this;

        fileList.forEach(fileList,function(fileName,i) {

            if(ext==='.js') {
                var id=url.replace(/\.js$/,'');
                url="js/"+url;
                $.get(url+'?'+new Date().getTime(),function(res) {
                    res=parse(replaceDefine(id,res));
                });
            } else if(ext==='.css') {
                $.get(url+'?'+new Date().getTime(),function(res) {
                    res=res.replace(/\s*([;|\:|,|\{|\}])\s*/img,'$1').replace(/[\r\n]/mg,'')
                                .replace(/;}/mg,'}');
                    that.save(url,res);
                });
            }

        });

        return this;
    },


    template: function(template) {
        var that=this;

        this.ajax('tools.cshtml?action=template',{
            template: template.join(',')
        });
    },

    razor: function(razor) {
        var that=this;

        this.ajax('tools.cshtml?action=razor',{
            razor: razor.join(',')
        });
    },

    build: function(options) {
        options.combine&&this.combine(options.combine);
        options.html&&this.html(options.html,options.api,options.combine);
        options.resource&&this.resource(options.resource);
        options.compress&&this.compress(options.compress);
        options.template&&this.template(options.template);
        options.razor&&this.razor(options.razor);
    },

    finish: function(path,text) {
        if(this.times==0) {
            $.post('tools.cshtml?action=finish',{
                path: path,
                text: text

            },function(res) {
                console.log(res);
            });
        }
    },

    ajax: function(url,data) {
        var that=this;
        that.times++;

        $.post(url,data,function(res) {
            console.log(url+' '+res);

            that.times--;
            that.finish();
        });
    },

    save: function(path,text) {
        this.ajax('tools.cshtml?action=save',{
            path: path,
            text: text
        });
    }
};

module.exports=Tools;

var tools=new Tools('./../assets','./dest');

tools.html("index.html",'',{
    'style.css': ['style.css','views.css'],
    'sl': ['zepto.js']
});