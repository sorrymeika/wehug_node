define(['$'],function(require,exports,module) {
    var $=require('$'),
        slice=Array.prototype.slice;

    //'f@(data(")").a["asdfasdf"](a))'.match(/([^@]|^)@(?![@])(html|ajax|)([\w\d]+(?:\[\"[^\"]+\"\]|\.[\w\d]+|\([^\)]*\))*|\((?:.+?\((?:\"[^\"]+\"|[^\)]+?)\)|.+)?\))/mg)

    //'@for(var i=0;i<n;i++){ if(){} if(){ if(){if(){}} } } <div>}'.match(/([^@]|^)@(?![@])(for|if|each)\(([^\)]+?)\)\s*\{((?:[^\{\}]+?\{(?:[^\{\}]+?\{(?:[^\{\}]+?\{(?:[^\{\}]+?\{(?:[^\}]*)\}[^\{\}]*|[^\}]*)\}[^\{\}]*|[^\}]*)\}[^\{\}]*|[^\}]*)\}[^\{\}])+|.+?)\}/);

    //八层{}
    //([^@]|^)@(?![@])(?:(for|if|each|function\s+[a-zA-Z0-9_]*)\s*(?:\(([^\)]*?)\)){0,1}\s*){0,1}\{([^\{\}]+?(?:else|\))\s*\{(?:[^\{\}]+?(?:else|\))\s*\{(?:[^\{\}]+?(?:else|\))\s*\{(?:[^\{\}]+?(?:else|\))\s*\{(?:[^\{\}]+?(?:else|\))\s*\{(?:[^\{\}]+?(?:else|\))\s*\{(?:[^\{\}]+?(?:else|\))\s*\{(?:[^\{\}]+?(?:else|\))\s*\{[^\}]*\}[^\{\}]*|[^\}]*)\}[^\{\}]*|[^\}]*)\}[^\{\}]*|[^\}]*)\}[^\{\}]*|[^\}]*)\}[^\{\}]*|[^\}]*)\}[^\{\}]*|[^\}]*)\}[^\{\}]*|[^\}]*)\}[^\{\}]*|[^\}]*)\}

    //([^@]|^)@(?![@])(for|if|each)\(([^\)]+?)\)\s*\{(替换这里)\}
    //[^\{\}]+?(?:else|\))\s*\{(?:替换这里)\}[^\{\}]*|[^\}]*
    //[^\{\}]+?(?:else|\))\s*\{[^\}]*\}[^\{\}]*|[^\}]*

    var expReg=/([^@]|^|)@(?![@])(?:(for|if|each|(?:helper|function)\s+[a-zA-Z0-9_]*)\s*(?:\(([^\)]*?)\)){0,1}\s*){0,1}\{([^\{\}]+?(?:else|\))\s*\{(?:[^\{\}]+?(?:else|\))\s*\{(?:[^\{\}]+?(?:else|\))\s*\{(?:[^\{\}]+?(?:else|\))\s*\{(?:[^\{\}]+?(?:else|\))\s*\{(?:[^\{\}]+?(?:else|\))\s*\{(?:[^\{\}]+?(?:else|\))\s*\{(?:[^\{\}]+?(?:else|\))\s*\{[^\}]*\}[^\{\}]*|[^\}]*)\}[^\{\}]*|[^\}]*)\}[^\{\}]*|[^\}]*)\}[^\{\}]*|[^\}]*)\}[^\{\}]*|[^\}]*)\}[^\{\}]*|[^\}]*)\}[^\{\}]*|[^\}]*)\}[^\{\}]*|[^\}]*)\}/mg;

    var cmdReg=/([^@]|^)@(?![@])(html|)([\w\d]+(?:\[(?:\"[^\"]+\"|\w+?)\]|\.[\w\d]+|\([^\)]*\))*|\((?:.+?\((?:\"[^\"]+\"|[^\)]+?)\)|.+?)\))/mg;

    var tagReg=/<(\w+)(?:\s+[^>]+)*>(.*?)<\/\1>/img;


    $.encodeHTML=function(text) {
        return (""+text).split("<").join("&lt;").split(">").join("&gt;").split('"').join("&#34;").split("'").join("&#39;");
    };

    var razor={};

    razor.create=function(templateStr,args) {
        var result={
            helper: {}
        },
        name;

        templateStr=templateStr.replace(/\\/g,'\\\\')
            .replace(/'/g,'\\\'')
            .replace(expReg,function(text,pre,cmd,exp,code) {
                //console.log(text)

                if(/^(function|helper)\s+/.test(cmd)) {
                    cmd=cmd.split(/\s+/);
                    name=cmd[1];

                    if(cmd[0]==='helper') {
                        result.helper[name]=razor.create(code,exp).T;

                    } else {
                        result[name]=eval('[function('+exp+'){'+code+'}][0]');
                    }
                    return pre;

                } else {
                    code=code.replace(/\\'/,'\'')
                        .replace(/[\r\n\t]/g,' ')
                        .replace(tagReg,function(text,tag,html) {
                            return "__.push('"+(tag=='text'?html:text)+"');";
                        });

                    if(cmd=='each') {
                        code='$.each('+exp.replace(/\,/,',function(')+'){'+code+'});';
                    } else if(cmd) {
                        code=cmd+'('+exp+'){'+code+'}';
                    }

                    return pre+'\');'+code+'__.push(\'';
                }
            })
            .replace(cmdReg,function(text,pre,cmd,code) {
                code=code.replace(/\\'/,'\'');
                return pre+'\','+(cmd=="html"?code:'$.encodeHTML('+code+')')+',\'';
            })
            .replace(/\r/g,'\\r')
            .replace(/\n/g,'\\n')
            .replace(/\t/g,'\\t')
            .replace(/@@/g,'@');

        if(typeof args!=='string') args="$data";

        var str="var __=[];"+(args==="$data"?"with($data||{})":"")+"{__.push('"+templateStr+"');}return __.join('');",
            fn=new Function(args,str);

        result.html=result.T=fn;
        return result;
    };

    module.exports=razor;
});