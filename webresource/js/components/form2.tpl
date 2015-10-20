<form action="@(url)" method="@method" enctype="@(enctype||"multipart/form-data")" class="form">
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
                    field = items[j];
                    var attr = 'style="' + (field.width ? "width:" + field.width+"px;" : '') + (field.height ? "height:" + field.height+"px;" : '') + '" name="' + field.field + '" sn-model="' + name + '.' + field.field + '" value="{{' + name + '.' + field.field + '}}"';

                    <th @html(field.vAlign?'style="vertical-align:'+field.vAlign+'"':'')>@field.label @if (field.emptyAble===false){<i>*</i>}</th>
                    <td colspan="@(field.colSpan||1)">

                    @if (field.type=='text'||!field.type){
                        <input class="@(field.className||'text')" type="text"@html(attr)/>

                    } else if (field.type=='textarea') {
                        <textarea class="@(field.className||'text')"@html(attr)></textarea>

                    } else if (field.type=='select') {
                        <select class="@(field.className||'text')"@html(attr)>
                            @for (var ii=0,len1=field.options.data.length;ii<len1;ii++){
                                var option=field.options.data[ii];
                            <option value="@option[field.options.value||"value"]">@option[field.options.text||"text"]</option>
                            }
                        </select>

                    } else if (field.type=='number'){
                        <input class="@(field.className||'text_normal')" type="text"@html(attr)/>

                    } else if (field.type=='password'){
                        <input class="@(field.className||'text')" type="password"@html(attr)/>

                    } else if (field.type=='captcha'){
                        <input class="@(field.className||'text_normal')" type="text"@html(attr)/>
                        <img class="captcha" src="@(field.captcha)?v=@(Date.now())" onclick="this.src='@(field.captcha)?v='+Date.now()" sn-binding="src:captcha|or:'@(field.captcha)'"/>

                    } else if (field.type=='file'){
                        <input type="file" name="@(field.field)" sn-model="@(name).@(field.field)"/>

                    }  else if (field.type=='radio'||field.type=='checkbox'){
                        <input type="@(field.type)" name="@(field.field)" sn-model="@(name).@(field.field)" sn-binding="checked:@(name).@(field.field)|or:undefined"/>

                    } else {
                        $data.plugins.push(field);
                        <input type="hidden"@html(attr)>
                    }
                        <span class="{{@(validator).result.@(field.field).success==-1?'msg_tip':@(validator).result.@(field.field).success===true?'right_tip':@(validator).result.@(field.field).success===false?'error_tip':'hide'}}">{{@(validator).result.@(field.field).msg}}</span>
                    </td>
                }
            </tr>
        }
    </tbody>
</table>
</form>
