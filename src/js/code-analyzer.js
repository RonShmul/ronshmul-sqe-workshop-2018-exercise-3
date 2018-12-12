import * as esprima from 'esprima';
import * as escodegen from 'escodegen';

let parsing_arr = [];
let globals = new Map();
let locals = new Map();
let func_args = new Map();
let isFunc = false;
let sub_func = new Array();

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc: true});
};

// main function for start to pare the code
const start_parse = (parsed, args) => {
    parsing_arr = [];
    sub_func = new Array();
    let body = parsed.body;
    for(let i=0; i<body.length; i++){
        let type = body[i].type;
        if(type === 'FunctionDeclaration') {
            isFunc = true;
            insert_values(args, body[i].params);
        }
        else
            isFunc = false;
        nav_map[type](body[i]);
    }
    return sub_func;
};

export {parseCode};
export {start_parse};

let nav_map = {
    'IfStatement':case_if,
    'DoWhileStatement': case_dowhile,
    'ExpressionStatement': case_expState,
    'ForStatement': case_for,
    'FunctionDeclaration': case_funcDeclare,
    'Identifier':case_id,
    'ReturnStatement':case_return,
    'VariableDeclaration':case_varDeclare,
    'WhileStatement':case_while,
    'BinaryExpression': case_binary,
    'UnaryExpression': case_unary,
    'AssignmentExpression': case_assign,
    'UpdateExpression': case_update,
    'MemberExpression':case_memberExp,
    'Literal':case_literal,
    'CallExpression': case_callExp,
    'BlockStatement':case_block
};

function insert_values(args, params){
    args.replace(/\s/g, '');
    let parts = args.split(',');
    let j=0;
    if(params != null) {
        for (let i = 0; i < params.length; i++) { //todo: check if array - different split..
            let name = params[i].name;
            let value = parts[j];

            if(value.charAt(0)==='\'' && value.charAt(value.length-1)=== '\'')
                value.slice(1,-1);
            func_args.set(name, value);
            //todo: temp++;
        }
    }
}
//parse the secondary parts in the code
function body_parser(body){
    for(let i=0; i<body.length; i++){
        let type = body[i].type;
        nav_map[type](body[i]);
    }
}

function check_color(condition){
    check_orand(condition); //??
    //if(condition.contains())

}

function check_orand(condition){
    //if(condition.contains(['||','&&'])) todo: for each part check if true with check_color
}

// Handle cases
function case_for(info){
    let exp = escodegen.generate(info.init).replace('let ','') + ';' + escodegen.generate(info.test) + ';' +escodegen.generate(info.update);
    parsing_arr.push({
        'Line':info.loc.start.line,
        'Type':'for statement',
        'Name':'',
        'Condition':exp,
        'Value':''
    });
    body_parser(info.body.body);
}

function case_if(info){
    let test;
    if(isFunc){
        test = nav_map[info.test.type](info.test);
    }
    else{
        test = escodegen.generate(info.test);
    }
    let type = 'if statement';
    sub_func.push('if('+test+')');
    helper_if(info, test, type);
}

function helper_if(info, test, type){
    parsing_arr.push({
        'Line':info.loc.start.line, 'Type':type, 'Name':'', 'Condition':test, 'Value':''});
    if(info.consequent.body){
        sub_func.push('{\n');
        body_parser(info.consequent.body);
        sub_func.push('}\n');
    }
    else{
        nav_map[info.consequent.type](info.consequent); //todo: check if need here to push to sub func or only in small funcs
    }
    if(info.alternate !== null){
        if(info.alternate.type === 'IfStatement'){
            case_elif(info.alternate);
        }
        else{
            case_else(info.alternate);
        }
    }
}
function case_else(info) {
    parsing_arr.push({
        'Line':info.loc.start.line,
        'Type':'else statement',
        'Name':'',
        'Condition':'',
        'Value':''
    });
    sub_func.push('{\n');
    nav_map[info.type](info); //todo: check if need here to push to sub func or only in small funcs
    sub_func.push('}\n');
}

function case_elif(info){
    let test;
    if(isFunc){
        test = nav_map[info.test.type](info.test);
    }
    else{
        test = escodegen.generate(info.test);
    }
    let type = 'else if statement';
    sub_func.push('else if('+test+')');
    helper_if(info, test, type);
}

function case_while(info){
    let test;
    if(isFunc)
        test = nav_map[info.test.type](info.test);
    else
        test = escodegen.generate(info.test);
    parsing_arr.push({
        'Line':info.loc.start.line, 'Type':'while statement', 'Name':'', 'Condition':test, 'Value':''
    });
    sub_func.push('while('+test+')');
    if(info.body.body){
        sub_func.push('{\n');
        body_parser(info.body.body);
        sub_func.push('}\n');
    }
    else{
        nav_map[info.body.type](info.body);
    }
}

function case_dowhile(info){
    let test;
    if(isFunc)
        test = nav_map[info.test.type](info.test);
    else
        test = escodegen.generate(info.test);
    parsing_arr.push({
        'Line':info.loc.start.line,
        'Type':'do while statement', 'Name':'', 'Condition':test, 'Value':''
    });
    if(info.body.body){
        body_parser(info.body.body);
    }
    else{
        nav_map[info.body.type](info.body);
    }
}

function case_return(info){
    let exp;
    if(isFunc) {
        exp = nav_map[info.argument.type](info.argument);
    }
    else
        exp = escodegen.generate(info.argument);
    parsing_arr.push({
        'Line':info.loc.start.line,
        'Type':'return statement',
        'Name':'',
        'Condition':'',
        'Value':exp
    });
    sub_func.push('return '+exp+';\n');
}

function case_funcDeclare(info){
    let name = info.id.name;
    parsing_arr.push({'Line':info.loc.start.line, 'Type':'function declaration', 'Name':name, 'Condition':'', 'Value':''});
    sub_func.push('function '+name+'(');
    if(info.params.length !== 0){
        for(let i=0; i<info.params.length; i++){
            let name = info.params[i].name;
            func_args.set(name, '');  //todo: change it to values from app.js + push parameters+',' to the sub func
            sub_func.push(name);
            if(i<info.params.length-1)
                sub_func.push(',');
        }
    }
    sub_func.push('){\n');
    body_parser(info.body.body);
    sub_func.push('}\n');
}

function case_expState(info) {
    let func = nav_map[info.expression.type];
    func.call(undefined, info.expression);
}

function case_assign(info){
    let name = escodegen.generate(info.left);
    let value = nav_map[info.right.type](info.right);
    if(isFunc){
        if(globals.has(name) || func_args.has(name))
            sub_func.push(name + '=' + value + ';\n');
        if(locals.has(name))
            locals.set(name, value);
    }
    else
        globals.set(name, value);
    /*if(info.operator ==='+='){value = name + '+' + escodegen.generate(info.right);}
    else if(info.operator ==='-='){value = name + '-' + escodegen.generate(info.right);} */ // do not use in this work
    parsing_arr.push({
        'Line':info.loc.start.line, 'Type':'assignment expression', 'Name':name, 'Condition':'', 'Value':value
    });
}
function case_update(info){
    let name = escodegen.generate(info.argument);
    let value;
    if(info.operator ==='++'){
        value = name + '+ 1';
    }
    else{
        value = name + '- 1';
    }
    parsing_arr.push({
        'Line':info.loc.start.line, 'Type':'update expression',
        'Name':name, 'Condition':'', 'Value':value
    });
}
function case_unary(info){
    let name = info.argument.name;
    let value = info.operator + name;
    parsing_arr.push({
        'Line':info.loc.start.line,
        'Type':'unary expression',
        'Name':name,
        'Condition':'',
        'Value':value
    });
}
function case_binary(info){
    let value, right, left;
    left = nav_map[info.left.type](info.left);
    right = nav_map[info.right.type](info.right);
    if((info.operator === '*' || info.operator === '/')&& (left.length>1 || right.length>1))
        value ='(' +left+ ')'+info.operator + '(' +right+ ')'; //todo: check if numbers and add left to right with math
    else
        value =left+ info.operator +right;
    parsing_arr.push({
        'Line':info.loc.start.line,
        'Type':'binary expression',
        'Name':'',
        'Condition':'',
        'Value':value
    });
    return value;
}
function case_id(info){ //todo: maybe add a case for inside condition?
    let name = info.name;
    parsing_arr.push({
        'Line':info.loc.start.line,
        'Type':'identifier',
        'Name':name,
        'Condition':'',
        'Value':''
    });
    if(func_args.has(name)){
        return name;
    }
    if(globals.has(name)){
        return name;
    }
    if(locals.has(name)){
        return locals.get(name);
    }
}

function case_varDeclare(info){
    for(let i=0; i<info.declarations.length; i++){
        let name = info.declarations[i].id.name;
        let value = helper_varDeclare(info.declarations[i], name);
        parsing_arr.push({'Line':info.declarations[i].loc.start.line,'Type':'variable declaration','Name':name,'Condition':'','Value':value});}
}

function helper_varDeclare(declare, name){
    let value='';
    if(declare.init == null){
        if(isFunc)
            locals.set(name, value);
        else
            globals.set(name, value);
    }
    else{
        value = nav_map[declare.init.type](declare.init);
        if(isFunc)  // insert to locals map
            locals.set(name, value);
        else  //insert to globals map
            globals.set(name, value);
    }
    return value;
}

function case_memberExp(info){  // todo: need arrays?
    let name = escodegen.generate(info);
    parsing_arr.push({
        'Line':info.loc.start.line,
        'Type':'member expression',
        'Name':name,
        'Condition':'',
        'Value':''
    });
}

function case_literal(info){  //todo: return to all
    let value = info.raw;
    parsing_arr.push({
        'Line':info.loc.start.line,
        'Type':'literal',
        'Name':'',
        'Condition':'',
        'Value': value
    });
    return value;
}

function case_block(info){
    let block_body = info.body;
    for(let i=0; i<block_body.length; i++){
        let type = block_body[i].type;
        nav_map[type](block_body[i]);
    }
}

function case_callExp(info){   // todo: need calls?
    let name = escodegen.generate(info);
    parsing_arr.push({
        'Line':info.loc.start.line,
        'Type':'call expression',
        'Name': name,
        'Condition':'',
        'Value': ''
    });
}