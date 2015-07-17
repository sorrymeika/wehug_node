﻿<form action="@(url)" method="@method" enctype="@(enctype||"multipart/form-data")" class="form">
@for (var i=0,len=hiddens.length;i<len;i++) {
    var field=hiddens[i];
    <input type="hidden" name="@(field.field)" sn-model="@(name).@(field.field)" sn-binding="value:@(name).@(field.field)" />
}
<table width="100%">
    <tbody>
        @for (var i=0,len=fields.length;i<len;i++) {
            var items=fields[i],
                field;
            <tr>
                @if (!items.length){
                    items=[items];
                }
                @for (var j=0,length=items.length;j<length;j++){
                    field=items[j];var attr=' name="'+field.field+'" sn-model="'+name+'.'+field.field+'" sn-binding="value:'+name+'.'+field.field+'"';

                    <th @html(field.vAlign?'style="vertical-align:'+field.vAlign+'"':'')>@field.label @if (field.emptyAble!==false){<i>*</i>}</th>
                    <td colspan="@(field.colSpan||1)">

                    @if (field.type=='text'||!field.type){
                        <input class="@(field.className||'text')" type="text"@html(attr)/>

                    } else if (field.type=='textarea') {
                        <textarea class="@(field.className||'text')"@html(attr)></textarea>

                    } else if (field.type=='select') {
                        <select class="@(field.className||'text')"@html(attr) sn-options="@(field.options.text),@(field.options.value) in @(field.options.data)">
                        </select>

                    } else if (field.type=='number'){
                        <input class="@(field.className||'text_normal')" type="number"@html(attr)/>

                    }  else if (field.type=='password'){
                        <input class="@(field.className||'text')" type="password"@html(attr)/>

                    }   else if (field.type=='file'){
<input type="file" name="@(field.field)" sn-model="@(name).@(field.field)"/>
                    } else {
                        $data.plugins.push(field);
                    <input type="hidden"@html(attr)>
                    }
                    <span sn-binding="class:@(validator).result.@(field.field).success|case:-1:'msg_tip':true:'right_tip':false:'error_tip':'hide',html:@(validator).result.@(field.field).msg"></span>
                    </td>
                }
            </tr>
        }
    </tbody>
</table>
</form>