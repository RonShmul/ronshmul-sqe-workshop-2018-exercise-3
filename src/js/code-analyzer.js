import * as esprima from 'esprima';
import * as escodegen from 'escodegen';

let parsing_arr = [];
const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc: true});
};

// main function for start to pare the code
const start_parse = (parsed) => {
    parsing_arr = [];
    let body = parsed.body;
    for(let i=0; i<body.length; i++){
        let type = body[i].type;
        nav_map[type](body[i]);
    }
    return parsing_arr;
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

//parse the secondary parts in the code
function body_parser(body){ //todo: check if null
    for(let i=0; i<body.length; i++){
        let type = body[i].type;
        nav_map[type](body[i]);
    }
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
    body_parser(info.body.body); //todo: check if only 1 expression
}

function case_if(info){
    let test = escodegen.generate(info.test);
    let type = 'if statement';
    helper_if(info, test, type);
}

function helper_if(info, test, type){
    parsing_arr.push({
        'Line':info.loc.start.line, 'Type':type, 'Name':'', 'Condition':test, 'Value':''});
    if(info.consequent.body){
        body_parser(info.consequent.body);
    }
    else{
        nav_map[info.consequent.type](info.consequent);
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
    nav_map[info.type](info);
}

function case_elif(info){
    let test = escodegen.generate(info.test);
    let type = 'else if statement';
    helper_if(info, test, type);
}

function case_while(info){
    let test = escodegen.generate(info.test);
    parsing_arr.push({
        'Line':info.loc.start.line,
        'Type':'while statement',
        'Name':'',
        'Condition':test,
        'Value':''
    });
    if(info.body.body){
        body_parser(info.body.body);
    }
    else{
        nav_map[info.body.type](info.body);
    }
}

function case_dowhile(info){
    let test = escodegen.generate(info.test);
    parsing_arr.push({
        'Line':info.loc.start.line,
        'Type':'do while statement',
        'Name':'',
        'Condition':test,
        'Value':''
    });
    if(info.body.body){
        body_parser(info.body.body);
    }
    else{
        nav_map[info.body.type](info.body);
    }
}

function case_return(info){
    let exp = escodegen.generate(info.argument);
    parsing_arr.push({
        'Line':info.loc.start.line,
        'Type':'return statement',
        'Name':'',
        'Condition':'',
        'Value':exp
    });
}

function case_funcDeclare(info){
    let name = info.id.name;
    parsing_arr.push({
        'Line':info.loc.start.line,
        'Type':'function declaration',
        'Name':name,
        'Condition':'',
        'Value':''});
    if(info.params.length !== 0){
        body_parser(info.params);
    }
    if(info.body.body){
        body_parser(info.body.body);
    }
}

function case_expState(info) {
    let func = nav_map[info.expression.type];
    func.call(undefined, info);
}

function case_assign(info){
    let name = escodegen.generate(info.expression.left);
    let value;
    if(info.expression.operator ==='+=') {
        value = name + '+' + escodegen.generate(info.expression.right);
    }
    else if(info.expression.operator ==='-='){
        value = name + '-' + escodegen.generate(info.expression.right);
    }
    else{
        value = escodegen.generate(info.expression.right);
    }
    parsing_arr.push({
        'Line':info.loc.start.line,
        'Type':'assignment expression',
        'Name':name,
        'Condition':'',
        'Value':value
    });
}
function case_update(info){
    let name = escodegen.generate(info.expression.argument);
    let value;
    if(info.expression.operator ==='++'){
        value = name + '+ 1';
    }
    else{
        value = name + '- 1';
    }
    parsing_arr.push({
        'Line':info.loc.start.line,
        'Type':'update expression',
        'Name':name,
        'Condition':'',
        'Value':value
    });
}
function case_unary(info){
    let name = info.expression.argument.name;
    let value = info.expression.operator + name;
    parsing_arr.push({
        'Line':info.loc.start.line,
        'Type':'unary expression',
        'Name':name,
        'Condition':'',
        'Value':value
    });
}
function case_binary(info){
    let value = escodegen.generate(info.expression);
    parsing_arr.push({
        'Line':info.loc.start.line,
        'Type':'binary expression',
        'Name':'',
        'Condition':'',
        'Value':value
    });
}
function case_id(info){
    let name = info.name;
    parsing_arr.push({
        'Line':info.loc.start.line,
        'Type':'identifier',
        'Name':name,
        'Condition':'',
        'Value':''
    });
}

function case_varDeclare(info){
    for(let i=0; i<info.declarations.length; i++){
        let name = info.declarations[i].id.name;  //todo: if the left is member exp?? or something else
        let value;
        if(info.declarations[i].init == null){
            value = '';
        }
        else{
            value = escodegen.generate(info.declarations[i].init);
        }
        parsing_arr.push({
            'Line':info.declarations[i].loc.start.line,
            'Type':'variable declaration',
            'Name':name,
            'Condition':'',
            'Value':value
        });
    }
}

function case_memberExp(info){
    let name = escodegen.generate(info.expression);
    parsing_arr.push({
        'Line':info.loc.start.line,
        'Type':'member expression',
        'Name':name,
        'Condition':'',
        'Value':''
    });
}

function case_literal(info){
    let value = info.expression.raw;
    parsing_arr.push({
        'Line':info.loc.start.line,
        'Type':'literal',
        'Name':'',
        'Condition':'',
        'Value': value
    });
}

function case_block(info){
    let block_body = info.body;
    for(let i=0; i<block_body.length; i++){
        let type = block_body[i].type;
        nav_map[type](block_body[i]);
    }
}

function case_callExp(info){
    let name = escodegen.generate(info.expression);
    parsing_arr.push({
        'Line':info.loc.start.line,
        'Type':'call expression',
        'Name': name,
        'Condition':'',
        'Value': ''
    });
}