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
                    field=items[j];
                    <th>@field.label @if (!field.emptyAble){<i>*</i>}</th>
                    <td colspan="@(field.colSpan||1)">

                    @if (field.type=='text'||!field.type){
                        <input class="text" type="text" name="@(field.field)" sn-model="@(name).@(field.field)" sn-binding="value:@(name).@(field.field)">

                    } else if (field.type=='textarea') {
                        <textarea class="text" name="@(field.field)" sn-model="@(name).@(field.field)" sn-binding="value:@(name).@(field.field)"></textarea>

                    } else if (field.type=='select') {
                        <select class="text" name="@(field.field)" sn-model="@(name).@(field.field)" sn-binding="value:@(name).@(field.field)" sn-options="@(field.options.text),@(field.options.value) in @(field.options.data)">
                        </select>

                    } else if (field.type=='number'){
                        <input class="text_normal" type="number" name="@(field.field)" sn-model="@(name).@(field.field)" sn-binding="value:@(name).@(field.field)">

                    }  else if (field.type=='password'){
                        <input class="text" type="password" name="@(field.field)" sn-model="@(name).@(field.field)" sn-binding="value:@(name).@(field.field)">

                    } else {
                        $data.plugins.push(field);
                    <input type="hidden" name="@(field.field)" sn-model="@(name).@(field.field)" sn-binding="value:@(name).@(field.field)">
                    }
                    <span sn-binding="class:@(validator).@(field.field).success|case:-1:'msg_tip':true:'right_tip':false:'error_tip':'hide',html:@(validator).@(field.field).msg"></span>
                    </td>
                }
            </tr>
        }
    </tbody>
</table>
</form>
