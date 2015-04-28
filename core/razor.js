var rcmd=/^(for|if|(?:function|helper|each)\s+([a-zA-Z_$][a-zA-Z_$1-9]*))\s*\(([^\)]*)\)\s*(?={)/m;
var rparam=/^(html|)([\w]+(?:\[(?:\"[^\"]+\"|\w+?)\]|\.[\w]+|\([^\)]*\))*|\((?:.+?\((?:\"[^\"]+\"|[^\)]+?)\)|.+?)\))/m;

var rif='^if\\s*\\(([^\\)]*)\\)\\s*{...}';
var relse='^\\s*(else\\s+if\s*\\(([^\\)]*)\\)|else)\\s*{...}';

var matchPair=function (input,left,right) {
    var i=0,
        len=input.length,
        count=0,
        c,
        prev,
        quote,
        quoteCount=0,
        res='',
        start=false;

    while(i<len) {
        c=input.charAt(i);

        if(quoteCount==0) {
            if(c=='"'||c=="'") {
                quote=c;
                quoteCount++;
            } else if(c==left&&quoteCount==0) {
                count++;

            } else if(c==right) {
                count--;
                if(count<=0) {
                    break;
                }
            }
        } else if(c==quote) {
            quoteCount--;
        }

        if(count>=1) {
            if(start) res+=c;
            else start=true;
        }

        prev=c;
        i++;
    }
    return res;
}

var match=function (input,part) {
    var result=[];

    result.input=input;
    result.match='';
    part=part.split('...');

    for(var i=0,n=part.length-1;i<=n;i++) {
        var m=new RegExp(part[i],'m').exec(input);
        if(!m) return null;

        for(var j=0,l=m.length;j<l;j++) {
            result.push(m[j]);
        }
        input=input.substr(m.index+m[0].length);

        result.match+=m[0];

        if(i==0) {
            result.index=m.index;
        }

        if(i!=n) {
            var left=part[i].charAt(part[i].length-1),
                right=part[i+1].charAt(part[i+1].length-1),
                res=matchPair(left+input,left,right);

            result.match+=res;
            result.push(res);

            input=input.substr(res.length);
        }
    }

    return result;
}

match('for(var i=0;i<1;i++){as"{"dfasdf} ','{...}');

var isEmpty=function (c) {
    return c==' '||c=='\t'||c=='\n'||c=='\r';
}

var rdom=/<(\/{0,1}[a-zA-Z]+)(?:\s+[a-zA-Z1-9_-]+="[^"]*"|\s+[^\s]+)*?\s*(\/){0,1}\s*>/;
var matchDom=function (input) {
    if(!input) return '';
    var m=rdom.exec(input),
        tagName,
        count=0,
        str='',
        dom='',
        code;

    while(m) {
        code=input.substr(0,m.index);

        if(count==0) {
            if(code) str+=code;

            if(m[2]=='/') {
                str+=parse(m[0]);
            } else {
                tagName=m[1];
                if(tagName!='text') dom+=m[0];

                count++;
            }

        } else {
            dom+=code;

            if(m[1]!='/text') dom+=m[0];

            if(m[1]==tagName) {
                count++;

            } else if(m[1]=='/'+tagName) {
                count--;
                if(count<=0) {
                    str+=parse(dom);
                    dom='';
                }
            }
        }

        input=input.substr(m.index+m[0].length);
        m=rdom.exec(input);
    }

    return str+input;
}
var parse=function (templateStr,result) {

    var name,
        i=0,
        len=templateStr.length,
        prev,
        curr,
        c,
        code='',
        codeStr,
        str="__.push('";

    while(i<len) {
        curr=templateStr.charAt(i);

        if(curr=='@') {
            c=templateStr.charAt(i+1);

            if(prev!='@'&&!isEmpty(c)) {
                codeStr=templateStr.substr(++i);

                if(c=='{'||c=='[') {
                    code=match(codeStr,c=='['?'[...]':'{...}');

                    str+="');"+code[1]+"__.push('";
                    i+=code.match.length;
                } else {
                    var m=rcmd.exec(codeStr);

                    if(m) {
                        name=m[2];
                        if('if'==m[1]) {
                            code=match(codeStr,rif);
                            str+="');"

                            do {
                                str+=code[0]+matchDom(code[2])+"}"
                                i+=code.match.length;
                                code=match(templateStr.substr(i),relse);
                            }
                            while(code);

                            str+="__.push('";

                        } else {
                            i+=m[0].length;

                            code=match(codeStr,'{...}');

                            if('for'==m[1]) {
                                str+="');"+m[0]+"{"+matchDom(code[1])+"}"+"__.push('";

                            } else if(/^function\s/.test(m[1])) {
                                result[name]=eval('[function('+m[3]+'){'+code[1]+'}][0]');

                            } else if(/^helper\s/.test(m[1])) {
                                result.helper[name]=razor.parse(code[1],m[3]).T;
                            }

                            i+=code.match.length;
                        }

                    } else {
                        m=rparam.exec(codeStr);

                        str+="',"+(m[1]=="html"?m[2]:"this.encodeHTML("+m[2]+")")+",'";
                        i+=m[0].length;
                    }
                }
                prev='';
                continue;

            } else {
                str+='@';
            }

        } else {
            str+=curr=='\\'?'\\\\':curr=='\''?'\\\'':curr=='\r'?'\\r':curr=='\n'?'\\n':curr=='\t'?'\\t':curr;
        }

        prev=curr;
        i++;
    }

    return str+"');";
};

var encodeHTML=function (text) {
    return (""+text).split("<").join("&lt;").split(">").join("&gt;").split('"').join("&#34;").split("'").join("&#39;");
};

var razor={};

razor.parse=function (templateStr,args) {
    if(typeof args!=='string') args="$data";

    var result={
        helper: {},
        encodeHTML: encodeHTML
    },
    str="var __=[];"+(args==="$data"?"with($data||{})":"")+"{";

    str+=parse(templateStr,result);

    str+="}return __.join('');";

    //console.log(str)

    var fn=new Function(args,str);

    result.template=result.T=function () {
        return fn.apply(result,arguments);
    };
    return result;
}


var fs=require('fs');

fs.readFile('./test.tpl',{
    encoding: 'utf8'
},function (err,data) {
    var t=razor.parse(data).T;

    console.log(t())
});
