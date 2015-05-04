define(['$',"./linklist","graphics/matrix2d"],function(require) {
    var $=require("$");
    var LinkList=require("./linklist");
    var Matrix2D=require("graphics/matrix2d");

    var vendors=['webkit'/*,'moz','o','ms'*/];

    for(var x=0;x<vendors.length&&!window.requestAnimationFrame;++x) {
        window.requestAnimationFrame=window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame=window[vendors[x]+'CancelAnimationFrame']||
                                      window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if(!window.requestAnimationFrame) {
        window.requestAnimationFrame=function(callback) {
            return setTimeout(function() {
                callback(currTime+timeToCall);
            },16.7);
        };
        window.cancelAnimationFrame=function(id) {
            clearTimeout(id);
        };
    }

    var list=new LinkList();
    var animationStop=true;
    var body=document.body;
    var TRANSFORM='-webkit-transform',
        defaultStyle={
            opacity: 1
        },
        numReg=/\d+\.\d+|\d+/g,
        percentReg=/(\d+\.\d+|\d+)\%/g,
        translatePercentReg=/translate\((\-{0,1}\d+(?:\.\d+){0,1}(?:\%|px){0,1})\s*\,\s*(\-{0,1}\d+(?:\.\d+){0,1}(?:\%|px){0,1})\)/,
        matrixReg=/matrix\((\-{0,1}\d+\.\d+|\-{0,1}\d+)\s*\,\s*(\-{0,1}\d+\.\d+|\-{0,1}\d+)\s*\,\s*(\-{0,1}\d+\.\d+|\-{0,1}\d+)\s*\,\s*(\-{0,1}\d+\.\d+|\-{0,1}\d+)\s*\,\s*(\-{0,1}\d+\.\d+|\-{0,1}\d+)\s*\,\s*(\-{0,1}\d+\.\d+|\-{0,1}\d+)\s*\)/,
        transformReg=/(translate|skew|rotate|scale|matrix)\(([^\)]+)\)/g,
        matrixEndReg=/matrix\([^\)]+\)\s*$/;


    var Tween={
        linear: function(t,b,c,d) { return c*t/d+b; },
        ease: function(t,b,c,d) {
            //return c*((t=t/d-1)*t*t*t*t+1)+b;
            return -c*((t=t/d-1)*t*t*t-1)+b;
        },
        easeIn: function(t,b,c,d) {
            return c*(t/=d)*t+b;
        },
        easeOut: function(t,b,c,d) {
            return -c*(t/=d)*(t-2)+b;
        },
        easeInOut: function(t,b,c,d) {
            if((t/=d/2)<1) return c/2*t*t+b;
            return -c/2*((--t)*(t-2)-1)+b;
        },
        easeInCubic: function(t,b,c,d) {
            return c*(t/=d)*t*t+b;
        },
        easeOutCubic: function(t,b,c,d) {
            return c*((t=t/d-1)*t*t+1)+b;
        },
        easeInOutCubic: function(t,b,c,d) {
            if((t/=d/2)<1) return c/2*t*t*t+b;
            return c/2*((t-=2)*t*t+2)+b;
        },
        easeInQuart: function(t,b,c,d) {
            return c*(t/=d)*t*t*t+b;
        },
        easeOutQuart: function(t,b,c,d) {
            return -c*((t=t/d-1)*t*t*t-1)+b;
        },
        easeInOutQuart: function(t,b,c,d) {
            if((t/=d/2)<1) return c/2*t*t*t*t+b;
            return -c/2*((t-=2)*t*t*t-2)+b;
        },
        easeInQuint: function(t,b,c,d) {
            return c*(t/=d)*t*t*t*t+b;
        },
        easeOutQuint: function(t,b,c,d) {
            return c*((t=t/d-1)*t*t*t*t+1)+b;
        },
        easeInOutQuint: function(t,b,c,d) {
            if((t/=d/2)<1) return c/2*t*t*t*t*t+b;
            return c/2*((t-=2)*t*t*t*t+2)+b;
        },
        easeInSine: function(t,b,c,d) {
            return -c*Math.cos(t/d*(Math.PI/2))+c+b;
        },
        easeOutSine: function(t,b,c,d) {
            return c*Math.sin(t/d*(Math.PI/2))+b;
        },
        easeInOutSine: function(t,b,c,d) {
            return -c/2*(Math.cos(Math.PI*t/d)-1)+b;
        },
        easeInExpo: function(t,b,c,d) {
            return (t==0)?b:c*Math.pow(2,10*(t/d-1))+b;
        },
        easeOutExpo: function(t,b,c,d) {
            return (t==d)?b+c:c*(-Math.pow(2,-10*t/d)+1)+b;
        },
        easeInOutExpo: function(t,b,c,d) {
            if(t==0) return b;
            if(t==d) return b+c;
            if((t/=d/2)<1) return c/2*Math.pow(2,10*(t-1))+b;
            return c/2*(-Math.pow(2,-10* --t)+2)+b;
        },
        easeInCirc: function(t,b,c,d) {
            return -c*(Math.sqrt(1-(t/=d)*t)-1)+b;
        },
        easeOutCirc: function(t,b,c,d) {
            return c*Math.sqrt(1-(t=t/d-1)*t)+b;
        },
        easeInOutCirc: function(t,b,c,d) {
            if((t/=d/2)<1) return -c/2*(Math.sqrt(1-t*t)-1)+b;
            return c/2*(Math.sqrt(1-(t-=2)*t)+1)+b;
        },
        easeInElastic: function(t,b,c,d,a,p) {
            if(t==0) return b;if((t/=d)==1) return b+c;if(!p) p=d*.3;
            if(!a||a<Math.abs(c)) { a=c;var s=p/4; }
            else var s=p/(2*Math.PI)*Math.asin(c/a);
            return -(a*Math.pow(2,10*(t-=1))*Math.sin((t*d-s)*(2*Math.PI)/p))+b;
        },
        easeOutElastic: function(t,b,c,d,a,p) {
            if(t==0) return b;if((t/=d)==1) return b+c;if(!p) p=d*.3;
            if(!a||a<Math.abs(c)) { a=c;var s=p/4; }
            else var s=p/(2*Math.PI)*Math.asin(c/a);
            return (a*Math.pow(2,-10*t)*Math.sin((t*d-s)*(2*Math.PI)/p)+c+b);
        },
        easeInOutElastic: function(t,b,c,d,a,p) {
            if(t==0) return b;if((t/=d/2)==2) return b+c;if(!p) p=d*(.3*1.5);
            if(!a||a<Math.abs(c)) { a=c;var s=p/4; }
            else var s=p/(2*Math.PI)*Math.asin(c/a);
            if(t<1) return -.5*(a*Math.pow(2,10*(t-=1))*Math.sin((t*d-s)*(2*Math.PI)/p))+b;
            return a*Math.pow(2,-10*(t-=1))*Math.sin((t*d-s)*(2*Math.PI)/p)*.5+c+b;
        },
        easeInBack: function(t,b,c,d,s) {
            if(s==undefined) s=1.70158;
            return c*(t/=d)*t*((s+1)*t-s)+b;
        },
        easeOutBack: function(t,b,c,d,s) {
            if(s==undefined) s=1.70158;
            return c*((t=t/d-1)*t*((s+1)*t+s)+1)+b;
        },
        easeInOutBack: function(t,b,c,d,s) {
            if(s==undefined) s=1.70158;
            if((t/=d/2)<1) return c/2*(t*t*(((s*=(1.525))+1)*t-s))+b;
            return c/2*((t-=2)*t*(((s*=(1.525))+1)*t+s)+2)+b;
        },
        easeInBounce: function(t,b,c,d) {
            return c-Tween.Bounce.easeOut(d-t,0,c,d)+b;
        },
        easeOutBounce: function(t,b,c,d) {
            if((t/=d)<(1/2.75)) {
                return c*(7.5625*t*t)+b;
            } else if(t<(2/2.75)) {
                return c*(7.5625*(t-=(1.5/2.75))*t+.75)+b;
            } else if(t<(2.5/2.75)) {
                return c*(7.5625*(t-=(2.25/2.75))*t+.9375)+b;
            } else {
                return c*(7.5625*(t-=(2.625/2.75))*t+.984375)+b;
            }
        },
        easeInOutBounce: function(t,b,c,d) {
            if(t<d/2) return Tween.easeInOutBounce(t*2,0,c,d)*.5+b;
            else return Tween.easeInOutBounce(t*2-d,0,c,d)*.5+c*.5+b;
        }
    };

    var getEase=function(ease) {
        if(!ease) ease=[Tween.easeOut];
        else {
            if(!(ease instanceof Array)) ease=[ease];

            for(var i=0,n=ease.length;i<n;i++) {
                if(typeof ease[i]=="string")
                    ease[i]=Tween[ease[i].replace(/\-([a-z])/g,function($0,$1) {
                        return $1.toUpperCase();
                    })];
            }
        }
        return ease;
    }

    var toFloatArr=function(arr) {
        var result=[];
        $.each(arr,function(i,item) {
            result.push(isNaN(parseFloat(item))?0:parseFloat(item))
        });
        return result;
    }

    var getCurrent=function(from,end,d) {
        return parseFloat(from)+(parseFloat(end)-parseFloat(from))*d;
    }

    var getMatrixByTransform=function(transform) {
        var m2d=new Matrix2D();
        transform.replace(transformReg,function($0,$1,$2) {
            m2d[$1=='matrix'?'append':$1].apply(m2d,toFloatArr($2.split(',')));
        });

        return m2d;
    }

    var toTransform=function(css) {
        var result={},
            origTransform,
            m2d;

        $.each(css,function(key,val) {
            if(/matrix|translate|skew|rotate|scale|invert/.test(key)) {
                if(key==='translate') {
                    val=(result[TRANSFORM]||'')+' '+key+'('+val+')';

                } else {
                    if(!m2d) m2d=new Matrix2D();
                    origTransform=(result[TRANSFORM]||'');
                    val=m2d[key=='matrix'?'append':key].apply(m2d,toFloatArr(val.split(','))).toString();
                    val=matrixEndReg.test(origTransform)?origTransform.replace(matrixEndReg,val):(origTransform+' '+val);
                }

                key=TRANSFORM;

            } else if(key==='transform') {
                key=TRANSFORM;
                m2d=null;
            }
            result[key]=val;
        });

        return { css: result,matrix: m2d };
    };

    $.fn.transform=function(css) {
        this.css(toTransform(css).css);

        return this;
    };

    $.fn.matrix=function(matrix) {
        if(matrix instanceof Matrix2D) {
            this.css(TRANSFORM,matrix.toString());

            return this;
        } else
            return getMatrixByTransform(getComputedStyle(this[0],null)[TRANSFORM]);
    };

    var run=function() {
        if(list.length) {
            animationStop=false;

            var start,
                ease,
                arr,
                flag=false,
                startTime= +new Date,
                item=list._idlePrev,
                nextItem;

            while(item!=list) {
                nextItem=item._idlePrev;
                first=item.data;

                start=Date.now()-first.startTime;
                arr=[];
                ease=first.ease;

                if(start<=first.duration) {
                    for(var i=0,n=ease.length;i<n;i++) {
                        arr.push(ease[i](start,first.from,first.to-first.from,first.duration)/100);
                    }
                    first.step.apply(first,arr);

                } else {
                    var to=first.to/100;
                    for(var i=0,n=ease.length;i<n;i++) {
                        arr.push(to);
                    }
                    first.step.apply(first,arr);

                    list._remove(item);

                    first.finish&&first.finish(to);
                }

                item=nextItem;
            }


            //$('header').html((+new Date)-startTime)

            requestAnimationFrame(run);
        } else {
            animationStop=true;
        }
    };


    var init=function(item) {
        item.startTime=Date.now();
        item.ease=getEase(item.ease);
        item.stop=function() {
            list.remove(item);
        };
        if(item.from===void 0) item.from=0;
        if(item.to===void 0) item.to=100;
        if(!item.duration) item.duration=300;

        return item;
    }

    var parallel=function(animations) {
        for(var i=0,n=animations.length,item;i<n;i++) {
            list.append(init(animations[i]));
        }

        if(animationStop) run();
    }

    var prepareElement=function(el,css) {
        el.each(function() {
            var that=this,
                animationStyle={},
                originStyle={},
                style=getComputedStyle(that,null);

            $.each(css,function(key,val) {
                if(typeof val==='string') {
                    if(key==TRANSFORM) {
                        val=val.replace(translatePercentReg,function($0,$1,$2) {
                            return 'translate('+($1.indexOf('%')!== -1?that.offsetWidth*parseFloat($1)/100:parseFloat($1))+'px,'+($2.indexOf('%')!== -1?that.offsetHeight*parseFloat($2)/100:parseFloat($2))+'px)';
                        });
                        //console.log(val)
                    } else if(/^(top|margin(-t|T)op)$/.test(key)) {
                        val=val.replace(percentReg,function($0) {
                            return that.parentNode.offsetHeight*parseFloat($0)/100+"px";
                        });
                    } else if(/^(left|margin(-l|L)eft|padding(-l|L)eft|padding(-t|T)op)$/.test(key)) {
                        val=val.replace(percentReg,function($0) {
                            return that.parentNode.offsetWidth*parseFloat($0)/100+"px";
                        });
                    }
                }

                originStyle[key]=style[key];
                animationStyle[key]=val;
            });

            this._animationStyle=animationStyle;
            this._originStyle=originStyle;
            //console.log('new',animationStyle,'original',originStyle);
        });
    }

    var animationStep=function(d) {
        var style,
            originStyle,
            originVal,
            val,
            newStyle;

        this.el.each(function() {
            style=this._animationStyle;
            originStyle=this._originStyle;

            if(d==0) {
                newStyle=originStyle;
            } else if(d<1) {
                newStyle={};
                for(var key in style) {
                    val=style[key];
                    originVal=originStyle[key];

                    if(key==TRANSFORM) {
                        var m=originVal.match(matrixReg)||['',1,0,0,1,0,0];
                        var i=0;
                        var m2d=getMatrixByTransform(val);

                        m2d.a=getCurrent(m[1],m2d.a,d);
                        m2d.b=getCurrent(m[2],m2d.b,d);
                        m2d.c=getCurrent(m[3],m2d.c,d);
                        m2d.d=getCurrent(m[4],m2d.d,d);
                        m2d.tx=getCurrent(m[5],m2d.tx,d);
                        m2d.ty=getCurrent(m[6],m2d.ty,d);

                        newStyle[key]=m2d.toString();

                    } else if(!isNaN(parseFloat(val))) {
                        originVal=isNaN(parseFloat(originVal))?(defaultStyle[key]||0):parseFloat(originVal);
                        newStyle[key]=getCurrent(originVal,val,d);
                    } else {
                        newStyle[key]=val;
                    }
                }
            } else {
                newStyle=style;
            }

            $(this).css(newStyle);
            //console.log(this.style.cssText)
        });

        this._step&&this._step(d);
    }

    var animationFinish=function(per) {
        //console.log('end',this.css)
        if(per==1) this.el.css(this.css);

        this._finish&&this._finish(per);
    }

    var prepare=function(animations) {
        var anims=[],
            anim,
            el,
            css,
            m2d,
            origTransform;

        for(var i=0,n=animations.length,item;i<n;i++) {
            anim=animations[i];

            if(anim.css) {
                css=toTransform(anim.css);
                anim.matrix=css.matrix;
                css=anim.css=css.css;

                anim.selector=anim.el;
                el=anim.el=$(anim.el);

                if(typeof anim.start==='object') {
                    el.transform(anim.start);
                }

                prepareElement(el,css);

                anim._step=anim.step;
                anim.step=animationStep;

                anim._finish=anim.finish;
                anim.finish=animationFinish;
            }
        }

        return animations;
    }

    var parallelAnimation=function(animations) {
        parallel(prepare(animations));
    }

    Tween.prepare=function(animations) {
        if(!$.isArray(animations)) animations=[animations];
        var ret={
            step: function(per) {
                for(var i=0,anim,n=animations.length;i<n;i++) {
                    anim=animations[i];
                    anim.from=per;
                    anim.step(per/100);
                }
                return this;
            },
            animate: function(duration,per,callback) {
                var anim;
                for(var i=0,n=animations.length;i<n;i++) {
                    anim=animations[i];
                    anim.duration=duration;
                    anim.to=per;
                    anim.finish=null;
                    anim.start=void 0;
                }
                anim.finish=callback;
                parallel(animations);

                return this;
            }
        };

        prepare(animations);

        return ret;
    };

    Tween.parallel=parallelAnimation;

    Tween.animate=function(step,duration,ease,finish) {
        var first={
            step: step,
            duration: duration,
            ease: ease,
            finish: finish
        };
        parallel([first]);

        return first;
    };


    var momentum={
        momentums: null,
        momentumStep: $.noop,
        end: $.noop,
        step: function(d) {
            for(var i=0,n=this.momentums.length,m;i<n;i++) {
                m=this.momentums[i];
                m.current=m.start+(m.result-m.start)*d;
            }

            this.momentumStep.apply(this.ctx,this.momentums);
        },
        finish: function() {
            this.bounce();
        },
        bounce: function() {
            var count=0,
                divisor,
                current;

            for(var i=0,n=this.momentums.length,m;i<n;i++) {
                m=this.momentums[i];

                current=m.current<m.min?m.min:m.current>m.max?m.max:m.current;
                if(current!=m.current) {
                    m.start=m.current;
                    m.result=current;
                    count++;

                } else if(m.divisor&&current%m.divisor!=0) {
                    divisor=m.divisor;
                    m.start=m.current;
                    m.result=(current%divisor<divisor/2)?current-current%divisor:(current-current%divisor+divisor);
                    count++;
                }
            }

            if(count==0) {
                this.end.call(this.ctx);
            } else {
                this.duration=400;
                parallel([this]);
            }
        }
    };

    Tween.momentum=function(options,maxDuration,step,ease,end,context) {
        var momentums=[],
            anim={},
            newDuration=0;

        if(typeof options[0]==='number') options=[options];
        else if(!options.length) { end.call(context);return; }

        for(var i=0,n=options.length,m;i<n;i++) {
            m=this._momentum.apply(this,options[i]);

            if(m.dist!=0) newDuration=Math.max(newDuration,m.time);
            momentums.push(m);
        }

        for(var i=0,n=momentums.length,m;i<n;i++) {
            m=momentums[i];
            if(m.outside!=0) m.result=m.result-m.outside+m.outside*400/newDuration;
        }

        $.extend(anim,momentum,{
            ctx: context||anim,
            momentums: momentums,
            momentumStep: step,
            duration: newDuration,
            ease: ease,
            end: end
        });

        if(newDuration!=0) {
            if(maxDuration&&anim.duration>maxDuration) anim.duration=maxDuration;
            parallel([anim]);
        } else {
            anim.bounce();
        }

        return anim;
    };

    Tween._momentum=function(start,current,time,min,max,size,divisor) {
        var dist=current-start,
            maxDistUpper=max-current,
            maxDistLower=current-min,
            deceleration=0.0006,
            speed=Math.abs(dist)/time,
            newDist=(speed*speed)/(2*deceleration),
            newTime=0,
            outsideDist=0,
            outSpeed,
            result;

        size=divisor||size;

        if(dist>0&&newDist>maxDistUpper) {
            outsideDist=size/(6/(newDist/speed*deceleration))/2;
            maxDistUpper=maxDistUpper+outsideDist;
            speed=speed*maxDistUpper/newDist;
            newDist=maxDistUpper;
        } else if(dist<0&&newDist>maxDistLower) {
            outsideDist=size/(6/(newDist/speed*deceleration))/2;
            maxDistLower=maxDistLower+outsideDist;
            speed=speed*maxDistLower/newDist;
            newDist=maxDistLower;
        }

        newDist=newDist*(dist<0?-1:1);
        outsideDist=outsideDist*(dist<0?-1:1);
        newTime=speed/deceleration;
        result=current+newDist;

        if(outsideDist!=0) {
            outSpeed=(0.15/(outsideDist/newDist));
            if(outSpeed>1) {
                newDist-=outsideDist;
                outsideDist/=outSpeed;
                newDist+=outsideDist;
                result=current+newDist;
            }
        }

        if((current<min&&result<min)||(current>max&&result>max))
            newDist=0,newTime=0,outside=0,result=current;

        else if(divisor&&outsideDist==0) {
            result=result%divisor==0?result:(result%divisor<divisor/2)?result-result%divisor:(result-result%divisor+divisor);
            result=result>max?max:result<min?min:result;
            if(newTime<300) newTime=300;
            newDist=result-current;
        }

        return { dist: newDist,time: Math.round(newTime),outside: outsideDist,result: result,current: current,start: current,max: max,min: min,divisor: divisor };
    }

    return Tween;
});
