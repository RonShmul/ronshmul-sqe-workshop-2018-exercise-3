import $ from 'jquery';
import {start_parse, parseCode} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        let parse_arr = start_parse(parsedCode);
        create_table(parse_arr);
        // find line, type, name, condition, value
        //let start = parsedCode.body[0];
        //$('start').val();
        //let tests = JSON.stringify(parse_arr);
    });
});

function create_table(parse_arr){
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

function clean_table(){  //todo: clean table
    let new_table = document.getElementById('info_table');
    new_table.innerHTML = '<thead>'+ '<tr>' + '<th>Line</th>' + '<th>Type</th>'
    + '<th>Name</th>' + '<th>Condition</th>' + '<th>Value</th>' + '</tr>' + '</thead>';
}