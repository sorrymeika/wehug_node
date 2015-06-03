define(function (require,exports,module) {

    var $=require('$'),
        util=require('util'),
        standardizeHash=function (hash) {
            return (hash.replace(/^#+/,'')||'/').toLowerCase();
        };

    var Route=function (options) {
        var routes=[];

        for(var key in options) {
            var option=options[key],
                parts=[],
                namedParam,
                regex='^(?:\/{0,1})'+key.replace(/(\/|^|\?)\{((?:.+?\{[^\}]+\}){0,}[^\}]*)\}/g,function (match,first,param) {
                    namedParam=param.split(':');

                    if(namedParam.length>1) {
                        parts.push(namedParam.shift());
                        param=namedParam.join(':');
                    }

                    return first+'('+param+')';
                })+'$';

            routes.push({
                reg: new RegExp(regex),
                parts: parts,
                view: typeof option==='string'?option:option.view
            });
        }

        this.routes=routes;
    };

    Route.prototype.match=function (url) {
        var result=null,
            queries={},
            hash=url=standardizeHash(url),
            index=url.indexOf('?'),
            query,
            routes=this.routes,
            route,
            m;

        if(index!= -1) {
            query=url.substr(index+1);

            url=url.substr(0,index);

            query.replace(/(?:^|&)([^=&]+)=([^&]*)/g,function (r0,r1,r2) {
                queries[r1]=decodeURIComponent(r2);
                return '';
            })
        } else {
            query='';
        }

        for(var i=0,length=routes.length;i<length;i++) {
            route=routes[i];

            m=route.reg?url.match(route.reg):null;

            if(m) {
                result={
                    path: m[0],
                    url: hash,
                    hash: '#'+hash,
                    view: route.view,
                    data: {},
                    queryString: query,
                    queries: queries
                };

                for(var j=0,len=route.parts.length;j<len;j++) {
                    result.data[route.parts[j]]=m[j+1];
                }
                break;
            }
        }

        return result;
    }

    Route.standardizeHash=standardizeHash;

    module.exports=Route;
});