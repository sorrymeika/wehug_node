var rcmd=/^(for|(?:function|helper|each)\s+([a-zA-Z_$][a-zA-Z_$1-9]*))\s*\(([^\)]*)\)\s*(?={)/m;
var rparam=/^(html|)([\w]+(?:\[(?:\"[^\"]+\"|\w+?)\]|\.[\w]+|\([^\)]*\))*|\((?:.+?\((?:\"[^\"]+\"|[^\)]+?)\)|.+?)\))/m;

var rif='^if\\s*\\(([^\\)]*)\\)\\s*{...}';
var relseif='^\\s*else\\s+if\s*\\(([^\\)]*)\\)\\s*{...}';
var relse='^\\s*else\\s*{...}';

var matchPair=function(input,left,right) {
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

var match=function(input,part) {
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

var isEmpty=function(c) {
    return c==' '||c=='\t'||c=='\n'||c=='\r';
}

var rdom=/<(\/{0,1}[a-zA-Z]+)(?:\s+[a-zA-Z1-9_-]+=\"[^"]*")*?>/;
var matchDom=function(input) {
    var m=rdom.exec(input);
    while(m) {
        console.log(m);

        input=input.substr(m[0].length);
        m=rdom.exec(input);
    }
}

matchDom('<div style="widt>h:100%"></div>')

var razor={};

razor.create=function(templateStr,args) {
    if(typeof args!=='string') args="$data";

    var result={
        helper: {}
    },
    name,
    i=0,
    len=templateStr.length,
    prev,
    curr,
    c,
    code='',
    codeStr,
    str="var __=[];"+(args==="$data"?"with($data||{})":"")+"{__.push('";

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
                        i+=m[0].length;
                        name=m[2];
                        if('if'==m[1]) {
                            code=match(codeStr,rif);

                        } else {
                            code=match(codeStr,'{...}');
                            codeStr=code[1];

                            if('for'==m[1]) {
                                console.log(m,codeStr);

                            } else if(/^function\s/.test(m[1])) {
                                result[name]=eval('[function('+m[3]+'){'+codeStr+'}][0]');

                            } else if(/^helper\s/.test(m[1])) {
                                //result.helper[name]=razor.create(codeStr,m[3]).T;
                            }

                            i+=code.match.length;
                        }

                        curr='';
                    } else {
                        m=rparam.exec(codeStr);
                    }
                }

            } else {
                str+='@';
            }

        } else {
            str+=curr=='\\'?'\\\\':curr=='\''?'\\\'':curr=='\r'?'\\r':curr=='\n'?'\\n':curr=='\t'?'\\t':curr;
        }

        prev=curr;
        i++;
    }

    //console.log(str);

    str+="');}return __.join('');";
}


var fs=require('fs');

fs.readFile('./test.tpl',{
    encoding: 'utf8'
},function(err,data) {
    //razor.create(data);
});
