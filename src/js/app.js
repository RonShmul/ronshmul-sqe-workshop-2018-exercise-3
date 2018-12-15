import $ from 'jquery';
import {start_parse, parseCode} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        let args = $('#arguments').val();
        let arr_func = start_parse(parsedCode, args);
        //create_table(parse_arr);
        createNewFunc(arr_func);
    });
});

function createNewFunc(func){
    $('#newFunc').empty();
    let clean = document.getElementById('newFunc');
    clean.innerHTML='';
    let func_to_show='';
    for (let i=0;i<func.length;i++){
        if(func[i] ==='GREEN'){
            func_to_show = func_to_show + '<p style="color: green">' + func[i+1].replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g,'<br>') + '</p>';
            i++;
        }
        else if(func[i] === 'RED'){
            func_to_show = func_to_show + '<p style="color: red">' + func[i+1].replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g,'<br>') + '</p>';
            i++;
        }
        else
            func_to_show = func_to_show + func[i].replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g,'<br>');
        clean.innerHTML = func_to_show;
    }
}

/*function create_table(parse_arr){
    clean_table();
    let new_table = document.getElementById('info_table');
    for(let i = 0; i < parse_arr.length; i++) {
        let row = new_table.insertRow();
        let line = row.insertCell(0);
        let type = row.insertCell(1);
        let name = row.insertCell(2);
        let condition = row.insertCell(3);
        let value = row.insertCell(4);
        line.innerHTML = parse_arr[i].Line;
        type.innerHTML = parse_arr[i].Type;
        name.innerHTML = parse_arr[i].Name;
        condition.innerHTML = parse_arr[i].Condition.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        value.innerHTML = parse_arr[i].Value;
    }
}

function clean_table(){
    let new_table = document.getElementById('info_table');
    new_table.innerHTML = '<thead>'+ '<tr>' + '<th>Line</th>' + '<th>Type</th>'
    + '<th>Name</th>' + '<th>Condition</th>' + '<th>Value</th>' + '</tr>' + '</thead>';
}*/