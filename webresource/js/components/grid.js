define(function (require,exports,module) {
    var $=require('$'),
        util=require('util'),
        view=require('../core/view'),
        Page=require('./page'),
        isIE6=util.ie&&util.osVersion==6,
        tpl="<div class='grid'><div class='grid_border_r'><div class='grid_header_cont'><ol class='grid_header'></ol></div><div class='grid_body'></div></div></div>",
        sum=function (array,key) {
            var total=0;
            if(key)
                $.each(array,function (i,item) {
                    total+=parseInt(item[key]);
                });
            else
                $.each(array,function (i,item) {
                    total+=parseInt(item);
                });
            return total;
        },
        compareData=function (v1,v2,asc) {
            var flag;
            if(typeof v1=='number') {
                flag=asc?v1-v2:(v2-v1);
            } else {
                flag=(v1+"").localeCompare(v2+"")*(asc?1:-1);
            }
            return flag;
        };


    var Row=function (container,options) {
        this.$el=$(this.el).css({ height: options.height });
        this.el=this.$el[0];
        this.data=options.data;
    }

    Row.prototype={
        el: '<ul class="grid_row"></ul>',
        data: null,
        selected: false,
        select: function () {
            if(this.selected) return;

            this.selected=true;
            this.$el.addClass("grid_row_cur");
            if(this.selector)
                this.selector.prop({ checked: true });

            this.grid.selectedRows.push(row);
            this.grid.selectedRow=row;
            this.grid.trigger('SelectRow',row);
        },
        cancel: function () {
            if(!this.selected) return;
            this.selected=false;
            this.$el.removeClass("grid_row_cur");
            if(this.selector) this.selector.prop({ checked: false });

            var grid=this.grid,
                selectedRows=grid.selectedRows;

            for(var i=0,length=selectedRows.length;i<length;i++) {
                if(selectedRows[n]==row) {
                    selectedRows.splice(n,1);
                    break;
                }
            }

            if(grid.selectedRow==row) {
                grid.selectedRow=selectedRows.length!=0?selectedRows[selectedRows.length-1]:null;
            }
        },
        cells: []
    };




    var Grid=function (container,options) {
        var self=this;

        self.options=options=$.extend(true,{
            type: "grid",//grid:普通列表;tree:树形列表
            pageEnabled: false,
            rowHeight: 24,
            height: 'auto',
            multiselect: false,

            subKey: "children",//树形列表的子数据的key

            data: [],//默认数据
            columns: [],
            children: null,//子列表
            search: null,//查询表单

            onSelectRow: util.noop

        },options);

        $.each(options.columns,function (i,option) {
            options.columns[i]=$.extend({
                text: "",
                bind: "",
                render: null,
                width: 10,
                align: "left",
                valign: "top",
                type: "normal",
                style: {},
                css: "",
                defaultVal: ""
            },option);
        });

        self.$el=$(self.el);
        self.el=self.$el[0];

        self.$header=self.$el.find('.grid_header');
        self.$body=self.$el.find('.grid_body');

        self.cid=util.guid();
        self.listen(self.events);

        self.adjustWidth();
        self.createHead();
    }

    Grid.prototype={
        events: {
            'click .grid_header .sortable': function (e) {
                var self=this,
                    $target=$(e.currentTarget),
                    ajaxData=self.ajaxSettings.data,
                    bind=$target.data('bind');

                ajaxData.page=1;
                ajaxData.sort=column.bind;

                if(settings.currentSort!=this) {
                    $(settings.currentSort).removeClass("sort_desc sort_asc");
                    settings.currentSort=this;
                }
                var asc=!$target.hasClass("sort_asc");
                if(asc) {
                    $target.removeClass("sort_asc").addClass("sort_desc");
                } else {
                    $target.removeClass("sort_desc").addClass("sort_asc");
                }
                ajaxData.asc=asc;

                if(self.options.pageEnabled) self.load(settings);
                else {
                    self.data.sort(function (a,b) {
                        return compareData(a[bind],b[bind],asc);
                    });
                    self.rows.sort(function (a,b) {
                        var flag=compareData(a.data[bind],b.data[bind],asc);
                        if(flag) {
                            a.$el.before(b.$el);
                        }
                        return flag;
                    });
                }
                return false;
            },
            'click .grid_header .grid_spread,.grid_fold': function (e) {
                var $target=$(e.currentTarget);

                if($target.hasClass("grid_spread")) {
                    $target.removeClass("grid_spread").addClass("grid_fold");
                    $.each(this.rows,function (i,row) {
                        row.spread();
                    });
                } else {
                    $target.removeClass("grid_fold").addClass("grid_spread");
                    $.each(this.rows,function (i,row) {
                        row.fold();
                    });
                }

                return false;
            },

            'click .js_grid_selector': function (e) {
                var $target=$(e.currentTarget);

                this.$el.find("input[name='__gs_"+$target.data('cid')+"']")
                    .prop({ checked: this.checked });

                var fn=this.checked?"select":"unselect";
                settings.selectedRows.length=0;
                settings.selectedRow=false;
                $.each(this.rows,function (i,item) {
                    item[fn]();
                });
                if(settings.selectedRows.length==0)
                    settings.selectedRow=null;
                else {
                    var row=settings.selectedRows[0];
                    settings.selectedRow=row;
                    if($.isFunction(settings.onRowSelect)) settings.onRowSelect(row,row.data);
                }

                return false;
            },

            'click .grid_row': function (e) {
                if(settings.multiselect) {
                    if(e.target.name!="__gs_"+guid)
                        row[row.selected?"unselect":"select"]();
                } else if(settings.selectedRow!=row) {
                    if(settings.selectedRow)
                        settings.selectedRow.unselect();
                    row.select();
                }
                return false;
            }
        },

        listen: view.prototype.listen,
        ajaxSettings: {},

        el: '<div class="grid"><div class="grid_border_r"><div class="grid_header_cont"><ol class="grid_header"></ol></div><div class="grid_body"></div></div></div>',
        load: function () {
        },

        adjustWidth: function () {
            var options=this.options,
                length=options.columns.length-1,
                percent=0,
                totalPercent=0,
                total=0,
                column,
                width,
                widths=[];

            $.each(options.columns,function (i,column) {
                column.width=parseInt(column.width);
                if(!column.hide) total+=column.width;
            });

            for(var i=0;i<length;i++) {
                column=options.columns[i];
                percent=Math.round(100*column.width/total);
                widths[i]=percent;
                totalPercent+=percent;
            }
            widths[length]=util.ie?"auto":(100-totalPercent);

            this.columnWidths=widths;
        },

        createHead: function () {
            var self=this,
                options=self.options,
                columnWidths=self.columnWidths,
                columnWidth;

            $.each(settings.columns,function (i,column) {
                var columnWidth=typeof columnWidths[i]=="number"?columnWidths[i]+'%':columnWidths[i],
                    headCell=$("<li></li>"),
                    text,
                    css;

                column.index=i;

                if(column.type=="selector"&&options.multiselect) {
                    text=$('<input class="js_grid_selector" type="checkbox" data-cid="'+self.cid+'" />').prop({ checked: false });
                    column.align="center";
                    columnWidth=50;
                } else {
                    text=$("<a>"+column.text+"</a>");

                    if(i==0) {
                        if(settings.children) {
                            $("<div class='grid_spread'></div>").append(text).appendTo(cell);
                            column.align="left";
                        }
                    }
                    if((column.sortAble||column.sortable)&&column.bind) {
                        text.addClass("sortable").attr('data-bind',column.bind);
                    }
                }

                column.curWidth=columnWidth;
                css={
                    textAlign: column.align,
                    width: columnWidth
                }
                if(columnWidth=='auto') css['float']='none';

                headCell.append(text).css(css).appendTo(this.$header);
            });

        },

        msg: function (msg) {
            this.$body.html('<div style="padding:10px;border-bottom: 1px solid #cdcdcd;height:100px;">'+msg+'</div>');
        },

        loadData: function () {
            if(!settings.data||!settings.data.length) {
                showMsg("暂无数据");
                return;
            }

            settings.body.html("");
            var select=!$.isFunction(settings.onRowSelect)?
                function (row) {
                    settings.selectedRow=row;
                } :
                function (row) {
                    settings.selectedRow=row;
                    if(row) settings.onRowSelect(row,row.data);
                },
                treeRowNumber=[],
                dataForEach=function (item,treeDeep,parentTree) {
                    var rowEl=$("<ul class='grid_row'></ul>")
                            .css({ height: settings.rowHeight })
                            .click(function (e) {
                                if(settings.multiselect) {
                                    if(e.target.name!="__gs_"+guid)
                                        row[row.selected?"unselect":"select"]();
                                } else if(settings.selectedRow!=row) {
                                    if(settings.selectedRow)
                                        settings.selectedRow.unselect();
                                    row.select();
                                }
                            })
                            .appendTo(settings.body),
                        row={
                            el: rowEl,
                            data: item,
                            selected: false,
                            select: function () {
                                row.selected=true;
                                rowEl.addClass("grid_row_cur");
                                if(row.selector) row.selector.prop({ checked: true });
                                settings.selectedRows.push(row);
                                if(settings.selectedRow!==false) {
                                    settings.selectedRow=row;
                                    select(row);
                                }
                            },
                            unselect: function () {
                                row.selected=false;
                                rowEl.removeClass("grid_row_cur");
                                if(row.selector) row.selector.prop({ checked: false });
                                for(var n=0;n<settings.selectedRows.length;n++) {
                                    if(settings.selectedRows[n]==row) {
                                        settings.selectedRows.splice(n,1);
                                        break;
                                    }
                                }
                                if(settings.selectedRow==row) {
                                    if(settings.selectedRows.length!=0)
                                        select(settings.selectedRows[settings.selectedRows.length-1]);
                                    else
                                        settings.selectedRow=null;
                                }
                            },
                            cells: []
                        };
                    settings.rows.push(row);

                    if(settings.type!="tree"&&settings.children) {
                        var childGrid,
                            childContainer=$('<div class="grid_child_non"></div>').appendTo(settings.body);
                        row.childContainer=childContainer;
                        row.children=[];

                        $.each(settings.children,function (ci,childOpt) {
                            if(typeof childOpt.render==="function") {
                                row.children.push(childOpt.render(childContainer,item,row));
                            } else {
                                if(settings.subKey)
                                    childOpt.data=item[settings.subKey];
                                childGrid=$("<div></div>").appendTo(childContainer).grid(childOpt);
                                childGrid.parentRow=row;
                                row.children.push(childGrid);
                            }
                        });
                    } else if(settings.type=="tree") {
                        treeDeep=treeDeep||0;
                        treeRowNumber[treeDeep]=treeRowNumber[treeDeep]?treeRowNumber[treeDeep]+1:1;
                    }

                    $.each(settings.columns,function (j,column) {
                        var css={
                            width: column.curWidth,
                            height: settings.rowHeight
                        };
                        if(column.curWidth=='auto'&&util.ie)
                            css['float']='none';
                        var cellEl=$("<li class='grid_cell'></li>").css(css),
                            cellContent=cellEl,
                            val=column.bind?(item[column.bind]||(item[column.bind]===0?0:column.defaultVal)):"",
                            cell={
                                data: val,
                                row: row,
                                append: function (a) {
                                    cellContent.append(a);
                                },
                                html: function (a) {
                                    if(typeof a==="undefined")
                                        return cellContent.html();
                                    cellContent.html(a);
                                },
                                val: function (a) {
                                    if(typeof a=="undefined")
                                        return val;

                                    row.data[column.bind]=val=a;
                                    if(typeof cell.onChange=="function") cell.onChange(a);
                                },
                                find: function (a) {
                                    return cellEl.find(a);
                                }
                            };

                        if(typeof val=="string"&&/^\/Date\(\d+\)\/$/.test(val)) {
                            val=util.formatDate(val);
                        }

                        row.cells.push(cell);
                        if(j==0) {
                            if(settings.type=="tree") {
                                //if(treeDeep!=0) rowEl.hide();
                                parentTree=parentTree||0;
                                var childTree=parentTree+'_'+treeRowNumber[treeDeep];
                                rowEl.attr({ parenttree: childTree });

                                for(var i=0;i<treeDeep;i++) {
                                    $("<i class='grid_tree_space'></i>").appendTo(cellEl);
                                }

                                var children=item[settings.subKey];
                                if(children&&children.length) {
                                    var $body=settings.body;
                                    $("<i class='grid_tree'></i>")
                                        .click(function () {
                                            var $show=$body.find("[parenttree^='"+childTree+"_']");
                                            if(rowEl.hasClass("grid_tree_fold")) {
                                                rowEl.removeClass("grid_tree_fold").addClass("grid_tree_spread");
                                                if(isIE6) $show.css({ height: 0,marginTop: -1 });
                                                else $show.hide();
                                            } else {
                                                rowEl.removeClass("grid_tree_spread").addClass("grid_tree_fold");
                                                $show.each(function (i,$s) {
                                                    $s=$($s);
                                                    if($body.find("[parenttree='"+$s.attr('parenttree').replace(/_\d+$/,'')+"']").hasClass('grid_tree_fold')) {
                                                        $s.show();
                                                        if(isIE6) $s.css({ height: settings.rowHeight,marginTop: '' });
                                                    }
                                                });
                                            }
                                        })
                                        .appendTo(cellEl);
                                    rowEl.addClass("grid_tree_fold");
                                    $.each(children,function (i,item) {
                                        dataForEach(item,treeDeep+1,childTree);
                                    });
                                } else
                                    $("<i class='grid_tree_nochild'></i>").appendTo(cellEl);

                            } else if(settings.children) {
                                cellContent=$('<div class="grid_spread"></div>')
                                    .appendTo(cellEl)
                                    .on("click",function (e) {
                                        if(e.target==this) {
                                            if(this.minus) {
                                                $(this).removeClass("grid_fold").addClass("grid_spread");
                                                row.childContainer.removeClass('grid_child_con').addClass("grid_child_non");

                                            } else {
                                                $(this).removeClass("grid_spread").addClass("grid_fold");
                                                row.childContainer.removeClass('grid_child_non').addClass("grid_child_con");
                                            }
                                            this.minus=!this.minus;
                                        }
                                    }).prop("minus",false);
                                row.spread=function () {
                                    if(!cellContent.prop('minus'))
                                        cellContent.trigger("click");
                                };
                                row.fold=function () {
                                    if(cellContent.prop('minus'))
                                        cellContent.trigger("click");
                                };
                            }
                        }

                        if(column.style) cellEl.css(column.style);
                        if(column.align) cellEl.css({ "text-align": column.align });
                        if(column.render) {
                            column.render(cell,row.data,settings.data);
                        } else if(column.type=="textbox") {
                            var textbox=$("<textarea class='grid_cell_textbox'></textarea>")
                                .css({ height: settings.rowHeight })
                                .blur(function () {
                                    cell.validate();
                                })
                                .val(val);
                            cell.textbox=textbox;
                            cell.append(textbox);
                            cell.onChange=function (a) {
                                textbox.value=a;
                                textbox.validate();
                            };
                            cell.validate=function () {
                                var error=false;

                                if(column.emptyAble===false&&textbox.value=="")
                                    error=column.emptyText||(column.text+"不可为空！");
                                else if(column.regex&&!column.regex.test(textbox.value))
                                    error=column.regexText||(column.text+"格式错误！");

                                if(!!error)
                                    cellEl.addClass("grid_cell_err").title=error;
                                else
                                    cellEl.removeClass("grid_cell_err").title="";

                                return !error;
                            };
                        } else if(column.type=="selector") {
                            var selector=$("<input type='"+(settings.multiselect?"checkbox":"radio")+"' name='__gs_"+guid+"'>").prop({ "isselector": true,"checked": false });
                            cell.append(selector);
                            cell.selector=row.selector=selector;

                            if(settings.multiselect)
                                selector.click(function () {
                                    if(this.checked) row.select();
                                    else row.unselect();
                                });

                        } else if(column.valign=="center") {
                            cell.append('<table style="height:100%;width:100%;"><tr><td>'+val+'</td></tr></table>');
                        } else
                            cell.append("<i class='grid_cell_item'>"+val+"</i>");
                        cellEl.appendTo(rowEl);
                    });
                };
            $.each(settings.data,function (i,item) {
                dataForEach(item);
            });
        }
    };


    var GridGuid=0,
        Grid=function (container,options) {
            GridGuid++;

            var me=this,
                container=$(container).eq(0),
                settings=$.extend(true,{
                    type: "grid",//grid:普通列表;tree:树形列表
                    pageEnabled: false,
                    rowHeight: 20,
                    multiselect: false,
                    //树形列表的子数据的key
                    subKey: "children",
                    rows: [],
                    //默认数据
                    data: [],
                    columns: [],
                    children: null,
                    ajaxSettings: {},
                    search: null,
                    height: 'auto'
                },options),
                columnsOpt=settings.columns;

            $.each(columnsOpt,function (i,columnOpt) {
                columnsOpt[i]=$.extend({
                    text: "",
                    bind: "",
                    render: null,
                    width: 10,
                    align: "left",
                    valign: "top",
                    type: "normal",
                    style: {},
                    css: "",
                    defaultVal: ""
                },columnOpt);
            });

            me._settings=settings;

            var guid=GridGuid,
            getColumnWidths=function (settings) {
                var length=settings.columns.length-1,
                    percent=0,
                    totalPercent=0,
                    total=0,
                    column,
                    width,
                    widths=new Array(length);

                $.each(settings.columns,function (i,item) {
                    if(!item.hide) total+=parseInt(item.width);
                });

                for(var i=0;i<length;i++) {
                    column=settings.columns[i];
                    percent=Math.round(100*column.width/total);
                    widths[i]=percent;
                    totalPercent+=percent;
                }
                widths[length]=util.ie?"auto":(100-totalPercent);

                return widths;
            },
            createColumns=function () {

                var columnWidths=getColumnWidths(settings),
                    columnWidth;

                $.each(settings.columns,function (i,column) {
                    columnWidth=columnWidths[i];
                    if(typeof columnWidth=="number") columnWidth+="%";
                    column.index=i;
                    var cell=$("<li></li>"),
                        text;
                    if(column.type=="selector"&&settings.multiselect) {
                        text=$("<input type='checkbox'/>")
                          .prop({ checked: false })
                          .click(function () {
                              settings.body.find("input[name='__gs_"+guid+"']").prop({ checked: this.checked });
                              var f=this.checked?"select":"unselect";
                              settings.selectedRows.length=0;
                              settings.selectedRow=false;
                              $.each(settings.rows,function (i,item) {
                                  item[f]();
                              });
                              if(settings.selectedRows.length==0)
                                  settings.selectedRow=null;
                              else {
                                  var row=settings.selectedRows[0];
                                  settings.selectedRow=row;
                                  if($.isFunction(settings.onRowSelect)) settings.onRowSelect(row,row.data);
                              }
                          });
                        column.align="center";
                        columnWidth=50;
                    } else {
                        text=$("<a>"+column.text+"</a>").appendTo(cell);

                        if(i==0) {
                            if(settings.children) {
                                $("<div class='grid_spread'></div>")
                                    .click(function () {
                                        if($(this).hasClass("grid_spread")) {
                                            $(this).removeClass("grid_spread").addClass("grid_fold");
                                            $.each(settings.rows,function (ri,row) {
                                                row.spread();
                                            });
                                        } else {
                                            $(this).removeClass("grid_fold").addClass("grid_spread");
                                            $.each(settings.rows,function (ri,row) {
                                                row.fold();
                                            });
                                        }
                                    })
                                    .appendTo(cell)
                                    .append(text);
                                column.align="left";
                            }
                        }
                        var bind=column.bind;
                        if((column.sortAble||column.sortable)&&bind) {
                            text
                                .addClass("sortable")
                                .click(function () {
                                    var ajaxData=settings.ajaxSettings.data;
                                    ajaxData.page=1;
                                    ajaxData.sort=column.bind;

                                    if(settings.currentSort!=this) {
                                        $(settings.currentSort).removeClass("sort_desc sort_asc");
                                        settings.currentSort=this;
                                    }
                                    var asc;
                                    if($(this).hasClass("sort_asc")) {
                                        asc=false;
                                        $(this).removeClass("sort_asc").addClass("sort_desc");
                                    } else {
                                        asc=true;
                                        $(this).removeClass("sort_desc").addClass("sort_asc");
                                    }
                                    ajaxData.asc=asc;

                                    if(settings.pageEnabled) load(settings);
                                    else {
                                        settings.data.sort(function (a,b) {
                                            return compareData(a[bind],b[bind],asc);
                                        });
                                        settings.rows.sort(function (a,b) {
                                            var flag=compareData(a.data[bind],b.data[bind],asc);
                                            if(flag) {
                                                a.el.before(b.el);
                                            }
                                            return flag;
                                        });
                                    }
                                });
                        }
                    }

                    column.curWidth=columnWidth;
                    var css={
                        "text-align": column.align,
                        width: columnWidth
                    }
                    if(columnWidth=='auto'&&util.ie)
                        css['float']='none';

                    cell.css(css)
                        .appendTo(settings.header);
                });
            },
            showMsg=function (msg) {
                settings.body.html('<div style="padding:10px;border-bottom: 1px solid #cdcdcd;">'+msg+'</div>');
            },
            loadData=function () {
                if(!settings.data||!settings.data.length) {
                    showMsg("暂无数据");
                    return;
                }

                settings.body.html("");
                var select=!$.isFunction(settings.onRowSelect)?
                function (row) {
                    settings.selectedRow=row;
                } :
                function (row) {
                    settings.selectedRow=row;
                    if(row) settings.onRowSelect(row,row.data);
                },
                treeRowNumber=[],
                dataForEach=function (item,treeDeep,parentTree) {
                    var rowEl=$("<ul class='grid_row'></ul>")
                            .css({ height: settings.rowHeight })
                            .click(function (e) {
                                if(settings.multiselect) {
                                    if(e.target.name!="__gs_"+guid)
                                        row[row.selected?"unselect":"select"]();
                                } else if(settings.selectedRow!=row) {
                                    if(settings.selectedRow)
                                        settings.selectedRow.unselect();
                                    row.select();
                                }
                            })
                            .appendTo(settings.body),
                        row={
                            el: rowEl,
                            data: item,
                            selected: false,
                            select: function () {
                                row.selected=true;
                                rowEl.addClass("grid_row_cur");
                                if(row.selector) row.selector.prop({ checked: true });
                                settings.selectedRows.push(row);
                                if(settings.selectedRow!==false) {
                                    settings.selectedRow=row;
                                    select(row);
                                }
                            },
                            unselect: function () {
                                row.selected=false;
                                rowEl.removeClass("grid_row_cur");
                                if(row.selector) row.selector.prop({ checked: false });
                                for(var n=0;n<settings.selectedRows.length;n++) {
                                    if(settings.selectedRows[n]==row) {
                                        settings.selectedRows.splice(n,1);
                                        break;
                                    }
                                }
                                if(settings.selectedRow==row) {
                                    if(settings.selectedRows.length!=0)
                                        select(settings.selectedRows[settings.selectedRows.length-1]);
                                    else
                                        settings.selectedRow=null;
                                }
                            },
                            cells: []
                        };
                    settings.rows.push(row);

                    if(settings.type!="tree"&&settings.children) {
                        var childGrid,
                            childContainer=$('<div class="grid_child_non"></div>').appendTo(settings.body);
                        row.childContainer=childContainer;
                        row.children=[];

                        $.each(settings.children,function (ci,childOpt) {
                            if(typeof childOpt.render==="function") {
                                row.children.push(childOpt.render(childContainer,item,row));
                            } else {
                                if(settings.subKey)
                                    childOpt.data=item[settings.subKey];
                                childGrid=$("<div></div>").appendTo(childContainer).grid(childOpt);
                                childGrid.parentRow=row;
                                row.children.push(childGrid);
                            }
                        });
                    } else if(settings.type=="tree") {
                        treeDeep=treeDeep||0;
                        treeRowNumber[treeDeep]=treeRowNumber[treeDeep]?treeRowNumber[treeDeep]+1:1;
                    }

                    $.each(settings.columns,function (j,column) {
                        var css={
                            width: column.curWidth,
                            height: settings.rowHeight
                        };
                        if(column.curWidth=='auto'&&util.ie)
                            css['float']='none';
                        var cellEl=$("<li class='grid_cell'></li>").css(css),
                            cellContent=cellEl,
                            val=column.bind?(item[column.bind]||(item[column.bind]===0?0:column.defaultVal)):"",
                            cell={
                                data: val,
                                row: row,
                                append: function (a) {
                                    cellContent.append(a);
                                },
                                html: function (a) {
                                    if(typeof a==="undefined")
                                        return cellContent.html();
                                    cellContent.html(a);
                                },
                                val: function (a) {
                                    if(typeof a=="undefined")
                                        return val;

                                    row.data[column.bind]=val=a;
                                    if(typeof cell.onChange=="function") cell.onChange(a);
                                },
                                find: function (a) {
                                    return cellEl.find(a);
                                }
                            };

                        if(typeof val=="string"&&/^\/Date\(\d+\)\/$/.test(val)) {
                            val=util.formatDate(val);
                        }

                        row.cells.push(cell);
                        if(j==0) {
                            if(settings.type=="tree") {
                                //if(treeDeep!=0) rowEl.hide();
                                parentTree=parentTree||0;
                                var childTree=parentTree+'_'+treeRowNumber[treeDeep];
                                rowEl.attr({ parenttree: childTree });

                                for(var i=0;i<treeDeep;i++) {
                                    $("<i class='grid_tree_space'></i>").appendTo(cellEl);
                                }

                                var children=item[settings.subKey];
                                if(children&&children.length) {
                                    var $body=settings.body;
                                    $("<i class='grid_tree'></i>")
                                        .click(function () {
                                            var $show=$body.find("[parenttree^='"+childTree+"_']");
                                            if(rowEl.hasClass("grid_tree_fold")) {
                                                rowEl.removeClass("grid_tree_fold").addClass("grid_tree_spread");
                                                if(isIE6) $show.css({ height: 0,marginTop: -1 });
                                                else $show.hide();
                                            } else {
                                                rowEl.removeClass("grid_tree_spread").addClass("grid_tree_fold");
                                                $show.each(function (i,$s) {
                                                    $s=$($s);
                                                    if($body.find("[parenttree='"+$s.attr('parenttree').replace(/_\d+$/,'')+"']").hasClass('grid_tree_fold')) {
                                                        $s.show();
                                                        if(isIE6) $s.css({ height: settings.rowHeight,marginTop: '' });
                                                    }
                                                });
                                            }
                                        })
                                        .appendTo(cellEl);
                                    rowEl.addClass("grid_tree_fold");
                                    $.each(children,function (i,item) {
                                        dataForEach(item,treeDeep+1,childTree);
                                    });
                                } else
                                    $("<i class='grid_tree_nochild'></i>").appendTo(cellEl);

                            } else if(settings.children) {
                                cellContent=$('<div class="grid_spread"></div>')
                                    .appendTo(cellEl)
                                    .on("click",function (e) {
                                        if(e.target==this) {
                                            if(this.minus) {
                                                $(this).removeClass("grid_fold").addClass("grid_spread");
                                                row.childContainer.removeClass('grid_child_con').addClass("grid_child_non");

                                            } else {
                                                $(this).removeClass("grid_spread").addClass("grid_fold");
                                                row.childContainer.removeClass('grid_child_non').addClass("grid_child_con");
                                            }
                                            this.minus=!this.minus;
                                        }
                                    }).prop("minus",false);
                                row.spread=function () {
                                    if(!cellContent.prop('minus'))
                                        cellContent.trigger("click");
                                };
                                row.fold=function () {
                                    if(cellContent.prop('minus'))
                                        cellContent.trigger("click");
                                };
                            }
                        }

                        if(column.style) cellEl.css(column.style);
                        if(column.align) cellEl.css({ "text-align": column.align });
                        if(column.render) {
                            column.render(cell,row.data,settings.data);
                        } else if(column.type=="textbox") {
                            var textbox=$("<textarea class='grid_cell_textbox'></textarea>")
                                .css({ height: settings.rowHeight })
                                .blur(function () {
                                    cell.validate();
                                })
                                .val(val);
                            cell.textbox=textbox;
                            cell.append(textbox);
                            cell.onChange=function (a) {
                                textbox.value=a;
                                textbox.validate();
                            };
                            cell.validate=function () {
                                var error=false;

                                if(column.emptyAble===false&&textbox.value=="")
                                    error=column.emptyText||(column.text+"不可为空！");
                                else if(column.regex&&!column.regex.test(textbox.value))
                                    error=column.regexText||(column.text+"格式错误！");

                                if(!!error)
                                    cellEl.addClass("grid_cell_err").title=error;
                                else
                                    cellEl.removeClass("grid_cell_err").title="";

                                return !error;
                            };
                        } else if(column.type=="selector") {
                            var selector=$("<input type='"+(settings.multiselect?"checkbox":"radio")+"' name='__gs_"+guid+"'>").prop({ "isselector": true,"checked": false });
                            cell.append(selector);
                            cell.selector=row.selector=selector;

                            if(settings.multiselect)
                                selector.click(function () {
                                    if(this.checked) row.select();
                                    else row.unselect();
                                });

                        } else if(column.valign=="center") {
                            cell.append('<table style="height:100%;width:100%;"><tr><td>'+val+'</td></tr></table>');
                        } else
                            cell.append("<i class='grid_cell_item'>"+val+"</i>");
                        cellEl.appendTo(rowEl);
                    });
                };
                $.each(settings.data,function (i,item) {
                    dataForEach(item);
                });
            },
            load=function () {
                showMsg("正在载入...");
                if(settings.page) settings.page.clear();

                var ajaxSettings=settings.ajaxSettings,
                    ajaxData=ajaxSettings.data;

                $.ajax({
                    url: ajaxSettings.url,
                    type: ajaxSettings.type||'POST',
                    beforeSend: ajaxSettings.beforeSend,
                    data: ajaxData,
                    dataType: 'json',
                    cache: false,
                    success: function (res) {
                        if(res.success) {
                            settings.data=$.extend([],res.data);
                            loadData();

                            if(settings.pageEnabled) {
                                settings.page.change({
                                    page: ajaxData.page,
                                    pageSize: ajaxData.pageSize,
                                    total: res.total
                                });
                                settings.onPageChange&&settings.onPageChange(ajaxData.page);
                            }

                            if(ajaxSettings.success) ajaxSettings.success.call(me,res.data);
                        } else
                            showMsg(res.msg);
                    },
                    error: function (xhr) {
                        if(ajaxSettings.error) ajaxSettings.error.call(me,xhr);
                    }
                });
            };

            me._load=load;
            me._loadData=loadData;

            var searchOpt=settings.search;
            if(!searchOpt) {
                me._search=me.load;

            } else {
                var controls=[],
                    searchControls={},
                    searchData=searchOpt.data;

                if(searchData) {
                    $.each(searchData,function (controlName,controlOpt) {
                        if($.isPlainObject(controlOpt)) {
                            searchControls[controlName]=controlOpt;
                            searchData[controlName]="";
                        }
                    });
                }

                me._search=function () {
                    settings.ajaxSettings=$.extend(true,{},searchOpt,settings.ajaxSettings);
                    var ajaxSettings=settings.ajaxSettings;

                    searchData=ajaxSettings.data||(ajaxSettings.data={});
                    if(settings.pageEnabled) searchData.page=1;

                    if(ajaxSettings.beforeSend) ajaxSettings.beforeSend.call(me,searchData);
                    delete ajaxSettings.beforeSend;

                    $.each(controls,function (j,item) {
                        searchData[item.name]=item.control.val();
                    });

                    me._load();
                };

                me.searchCurrentPage=function () {
                    settings.ajaxSettings=$.extend(true,{},searchOpt,settings.ajaxSettings);
                    var ajaxSettings=settings.ajaxSettings;

                    searchData=ajaxSettings.data||(ajaxSettings.data={});

                    if(ajaxSettings.beforeSend) ajaxSettings.beforeSend.call(me);
                    delete ajaxSettings.beforeSend;

                    $.each(controls,function (j,item) {
                        searchData[item.name]=item.control.val();
                    });

                    me._load();
                };

                if(searchControls&&!$.isEmptyObject(searchControls)) {

                    var searchEl=$('<div class="search"></div>').appendTo(container),
                        searchVisible=false;
                    me._searchEl=searchEl;

                    $.each(searchControls,function (j,inputopt) {

                        var opt=$.extend({
                            label: '',
                            name: ''||j,
                            type: 'text',
                            value: '',
                            render: null,
                            width: null,
                            options: null,
                            newLine: false
                        },inputopt);

                        if(inputopt.newLine) {
                            searchEl.append('<br>')
                        }

                        opt.label&&$('<i>'+opt.label+'</i>').appendTo(searchEl)||searchEl.append(' ');

                        var name=opt.name,
                            control={
                                name: name,
                                type: opt.type
                            };

                        if($.isFunction(opt.render)) {
                            var input=opt.render.call(me,searchEl);
                            if(typeof input=="string")
                                searchEl.append(input);

                            control.type='render';
                            control.control=earchEl.find('[name="'+name+'"]');
                        } else {

                            if(opt.type=="calendar") {
                                input=$('<input name="'+name+'" class="text" type="text"/>');
                                seajs.use(['lib/jquery.datepicker','lib/jquery.datepicker.css'],function () {
                                    input.datePicker($.extend(opt.options,{
                                        clickInput: true
                                    }));
                                });
                            } else if(opt.type=="select") {
                                input=$('<select name="'+name+'"></select>');
                                if($.isArray(opt.options)) {
                                    $.each(opt.options,function (j,selopt) {
                                        input.each(function () {
                                            this.options.add(new Option(selopt.text,selopt.value));
                                        });
                                    });
                                }
                                if(opt.change) input.change(opt.change);
                            } else {
                                input=$('<input type="'+opt.type+'" name="'+name+'" class="text"/>');
                            }
                            input.appendTo(searchEl).val(opt.value);

                            control.control=input;

                            if(opt.width) input.css({ width: width });
                        }
                        controls.push(control);

                        if(control.type!='hidden')
                            searchVisible=true;
                    });

                    delete searchOpt.controls;

                    if(searchVisible) {
                        me._searchBtn=$('<button class="button">搜索</button>')
                        .appendTo(searchEl)
                        .click($.proxy(me._search,me));
                    } else
                        searchEl.hide();
                }
            }
            container.append(tpl);

            settings.selectedRows=[];

            settings.header=container.find(".grid_header");
            settings.body=container.find(".grid_body");
            if(settings.pageEnabled)
                settings.page=new Page({
                    id: $("<DIV class='page'>共0条数据</DIV>")
                        .appendTo(container.find(".grid")),
                    page: 1,
                    pageSize: 10,
                    total: 0,
                    onChange: function (page) {
                        settings.ajaxSettings.data.page=page;
                        load();
                    }
                });

            createColumns();
            loadData();
        };

    Grid.prototype={
        search: function () {
            var me=this;
            me._search&&me._search();
            return me;
        },
        searchInput: function (name) {
            var me=this;
            return me._searchEl?me._searchEl.find('[name="'+name+'"]'):$('');
        },
        selectedRow: function () {
            return this._settings.selectedRow;
        },
        row: function (i) {
            return this._settings.rows[i];
        },
        cell: function (rowIndex,columnIndex) {
            return this._settings.rows[rowIndex].cells[columnIndex];
        },
        acceptChanges: function () {
        },
        loadData: function (data) {
            var me=this,
                settings=me._settings;
            settings.data=$.extend([],data);
            me._loadData();
        },
        prepareAjax: function (url,data,fn) {
            var me=this,
                args=arguments,
                i=0,
                ajaxSettings=url&&typeof url=="object"?$.extend({},url):function () {
                    if($.isFunction(data)) {
                        fn=data;
                        data=fn;
                    }
                    return {
                        url: url,
                        success: fn,
                        data: data
                    }
                } ();

            var settings=me._settings;
            ajaxSettings.data=$.extend(settings.pageEnabled?{ page: 1,pageSize: 10}:{},ajaxSettings.data);
            settings.ajaxSettings=ajaxSettings;

            return me;
        },
        load: function () {
            var me=this;
            if(arguments.length) me.prepareAjax.apply(me,arguments);
            me._load();
        }
    };

    Grid.cellItem=function (html) {
        return '<i class="grid_cell_item">'+html+'</i>';
    }

    module.exports=Grid;
});
