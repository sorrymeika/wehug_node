var UglifyJS=require('uglify-js');

var compressCss=function(res) {
    return res.replace(/\s*([;|\:|,|\{|\}])\s*/img,'$1').replace(/[\r\n]/mg,'').replace(/;}/mg,'}').replace(/\s*\/\*.*?\*\/\s*/mg,'');
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
    return code.replace(/\bdefine\((\s*|\s*\[[^\]]*\]\s*,\s*)function/mg,function(r0,p) {
        return 'define('+'"'+id+'",'+p+'function';
    })
};

var compressHTML=function(html) {
    return html.replace(/\s*(<(\/{0,1}[a-zA-Z]+)(?:\s+[a-zA-Z1-9_-]+="[^"]*"|\s+[^\s]+)*?\s*(\/){0,1}\s*>)\s*/img,'$1')
        .replace(/<script(?:\s+[a-zA-Z1-9_-]+="[^"]*"|\s+[^\s]+)*?\s*(?:\/){0,1}\s*>([\S\s]*?)<\/script>/img,function(r0,r1) {
            return /^\s*$/.test(r1)?r0:('<script>'+compressJs(r1)+'</script>');
        }).replace(/<style(?:\s+[a-zA-Z1-9_-]+="[^"]*"|\s+[^\s]+)*?\s*(?:\/){0,1}\s*>([\S\s]*?)<\/style>/img,function(r0,r1) {
            return /^\s*$/.test(r1)?r0:('<style>'+compressCss(r1)+'</style>');
        });
}

var path=require('path');
var fs=require('fs');
var fse=require('fs-extra');
var Promise=require('./../core/promise');

var Tools=function(baseDir,destDir) {
    this.baseDir=baseDir;
    this.destDir=destDir;

    this.promise=new Promise().resolve();
}

Tools.prototype={

    compressCss: compressCss,

    compressHTML: compressHTML,

    compressJs: compressJs,

    combine: function(pathDict) {
        var self=this;

        for(var destPath in pathDict) {
            var fileList=[],
                ids=pathDict[destPath],
                isCss=/\.css$/.test(destPath);

            for(var i=0,n=ids.length;i<n;i++) {
                fileList[i]=path.join(self.baseDir,isCss?ids[i]:('js/'+ids[i]+'.js'));
            }

            (function(fileList,ids,isCss,destPath) {
                var promise=new Promise();

                promise.map(fileList,fs.readFile,fs)
                    .then(function(err,result) {
                        if(err) {
                            console.log(err)
                            return;
                        }

                        var text='';

                        result.forEach(function(data,i) {
                            data=data.toString('utf-8');
                            text+=isCss?compressCss(data):compressJs(replaceDefine(ids[i],data));
                        });

                        return self.save(destPath,text);
                    });

                self.promise.then(promise);

            })(fileList,ids,isCss,path.join(self.destDir,isCss?destPath:('js/'+destPath+'.js')));
        }

        return this;
    },

    html: function(fileList,api,combinedPathDict) {

        api='<meta name="api-base-url" content="'+api+'" />';
        if(!(fileList instanceof Array)) fileList=[fileList];

        var self=this,
            now=new Date().getTime();

        fileList.forEach(function(fileName) {
            var promise=new Promise();

            fs.readFile(path.join(self.baseDir,fileName),{ encoding: 'utf-8' },function(err,html) {

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

                    combinedFiles+='<script data-template="razor" src="'+self.razorUri+'?v='+now+'"></script>';

                    html=html.replace(/<\/head>/i,combinedFiles+'</head>');
                }

                html=compressHTML(html);

                self.save(path.join(self.destDir,fileName),html,promise.resolveSelf);
            });

            self.promise.then(promise);
        });

        return this;
    },

    resource: function(resourceDir) {

        var self=this;
        var promise=new Promise();
        var pathArr=[];

        resourceDir.forEach(function(dir,i) {
            pathArr.push([path.join(self.baseDir,dir),path.join(self.destDir,dir)]);
        });

        promise.map(pathArr,fse.copy,fse);

        this.promise.then(promise);
    },

    compress: function(fileList) {

        var self=this;

        fileList.forEach(function(fileName,i) {
            var promise=new Promise();

            if(/\.css$/.test(fileName)) {

                fs.readFile(path.join(self.baseDir,fileName),{
                    encoding: 'utf-8'

                },function(err,text) {
                    self.save(path.join(self.destDir,fileName),compressCss(text),promise.resolveSelf);
                });

            } else {
                var jsFileName='js/'+fileName+'.js';

                fs.readFile(path.join(self.baseDir,jsFileName),{
                    encoding: 'utf-8'
                },function(err,text) {
                    text=compressJs(replaceDefine(fileName,text));

                    self.save(path.join(self.destDir,jsFileName),text,promise.resolveSelf);
                });
            }

            self.promise.then(promise);
        });

        return this;
    },

    razorUri: 'js/razor.text.js',

    razor: function(fileList) {
        var self=this;

        var razor=require('./../core/razor');
        var promise=new Promise().resolve();
        var result='';

        fileList.forEach(promise.bind(function(fileName,i) {

            fs.readFile(path.join(self.baseDir,fileName+'.tpl'),{
                encoding: 'utf-8'

            },function(err,text) {
                text=compressJs(replaceDefine(fileName,razor.web(text)));

                result+=text;

                self.save(path.join(self.destDir,'js/'+fileName+'.js'),text,promise.resolveSelf);
            });
        }));

        self.promise.then(promise)
            .then(function() {
                return self.save(path.join(self.destDir,self.razorUri),result);
            });

        return this;
    },

    build: function(options) {
        options.combine&&this.combine(options.combine);
        options.html&&this.html(options.html,options.api,options.combine);
        options.resource&&this.resource(options.resource);
        options.compress&&this.compress(options.compress);
        options.razor&&this.razor(options.razor);

        this.promise.then(function() {
            console.log('finish')
        });
    },

    _save: function(savePath,data,isCopy,callback) {

        var promise=new Promise();
        var dir=path.dirname(savePath);

        fs.exists(dir,function(exists) {
            if(!exists) {
                fs.mkdir(dir,function() {
                    promise.resolve(null,data);
                });
            } else {
                promise.resolve(null,data);
            }
        });

        if(isCopy) {
            promise.then([data],fs.readFile,fs);
        }

        promise.then([savePath,'$1'],fs.writeFile)
            .then(function() {
                console.log('save',savePath)
            });

        if(callback) promise.then(callback);

        return promise;
    },

    save: function(savePath,data,callback) {
        return this._save(savePath,data,false,callback);
    },

    copy: function(sourcePath,destPath,callback) {
        return this._save(sourcePath,destPath,true,callback)
    }
};

module.exports=Tools;