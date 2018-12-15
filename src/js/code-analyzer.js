import * as esprima from 'esprima';
import * as escodegen from 'escodegen';

let parsing_arr = [];
let globals = new Map();
let locals = new Map();
let func_args = new Map();
let isFunc = false;
let sub_func = [];
let inputs = [];
let currColor = '';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc: true});
};

// main function for start to pare the code
const start_parse = (parsed, args) => {
    parsing_arr = [];
    sub_func = [];
    inputs = [];
    globals = new Map();
    locals = new Map();
    func_args = new Map();
    insert_values(args);
    let body = parsed.body;
    for(let i=0; i<body.length; i++){
        let type = body[i].type;
        if(type === 'FunctionDeclaration')
            isFunc = true;
        else
            isFunc = false;
        nav_map[type](body[i]);
    }
    return sub_func;
};

export {parseCode};
export {start_parse};
let opertors_map = {
    '<':case_small,
    '>': case_big,
    '<=': case_se,
    '>=': case_be,
    '==': case_equal,
    '!=': case_not,
    '&&': case_and,
    '||': case_or
};
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
//inserts values of the function to an array
function insert_values(args){
    args.replace(/\s/g, '');
    let parts = args.split(',');
    for(let i=0; i<parts.length;i++){
        let value=parts[i];
        if(value.charAt(0)==='\'' && value.charAt(value.length-1)=== '\'')
            inputs.push(value.slice(1,-1));
        else if(value.startsWith('['))
            i = helper_arr(parts, i);
        else
            inputs.push(value);
    }
}
//helper for the input values, check if array
function helper_arr(parts, i){
    let ans=[];
    parts[i] = parts[i].substring(1);
    while(!parts[i].endsWith(']')){
        ans.push(parts[i]);
        i++;
    }
    ans.push((parts[i].substring(0,parts[i].length-1)));
    inputs.push(ans);
    return i;
}
//parse the secondary parts in the code
function body_parser(body){
    for(let i=0; i<body.length; i++){
        let type = body[i].type;
        nav_map[type](body[i]);
    }
}
//navigate the condition inside the if statement
function check_color(condition){
    let parse_cond = esprima.parseScript(condition);
    let exp = parse_cond.body[0].expression.operator;
    return opertors_map[exp](condition);
}
//calculates the value of a condition
function calc(side){
    let value;
    if(side.type === 'BinaryExpression'){
        let temp_value = calc(side.left) + side.operator + calc(side.right);
        value = eval(temp_value);
    }
    else if(side.type==='MemberExpression')
        value = findMem(side);
    else
        value = help_calc(side);
    return value;
}
// helping functions
function help_calc(side){
    let value;
    if(locals.has(side.name))
        value = eval(locals.get(side.name));
    if(globals.has(side.name))
        value = eval(globals.get(side.name));
    if(func_args.has(side.name))
        value = eval(func_args.get(side.name));
    if(side.type === 'Literal')
        value = checkForLiteral(side);
    return value;
}
function checkForLiteral(side){
    if(side.raw ==='true' || side.raw === 'false')
        return side.raw;
    else
        return eval(side.raw);
}
function findMem(side){
    let name = side.object.name;
    let index = side.property.raw;
    let value;
    if(locals.has(name))
        value = (locals.get(name))[index];
    if(globals.has(name))
        value = (globals.get(name))[index];
    if(func_args.has(name))
        value = (func_args.get(name))[index];
    return value;
}
// cases in if statements
function case_small(cond){
    let parts = cond.split('<');
    let temp_left = esprima.parseScript(parts[0]);
    let temp_right = esprima.parseScript(parts[1]);
    let left = calc(temp_left.body[0].expression);
    let right = calc(temp_right.body[0].expression);
    return left < right;
}
function case_big(cond){
    let parts = cond.split('>');
    let temp_left = esprima.parseScript(parts[0]);
    let temp_right = esprima.parseScript(parts[1]);
    let left = calc(temp_left.body[0].expression);
    let right = calc(temp_right.body[0].expression);
    return left > right;
}
function case_se(cond){
    let parts = cond.split('<=');
    let temp_left = esprima.parseScript(parts[0]);
    let temp_right = esprima.parseScript(parts[1]);
    let left = calc(temp_left.body[0].expression);
    let right = calc(temp_right.body[0].expression);
    return left <= right;
}
function case_be(cond){
    let parts = cond.split('>=');
    let temp_left = esprima.parseScript(parts[0]);
    let temp_right = esprima.parseScript(parts[1]);
    let left = calc(temp_left.body[0].expression);
    let right = calc(temp_right.body[0].expression);
    return left >= right;
}
function case_equal(cond){
    let parts = cond.split('==');
    let temp_left = esprima.parseScript(parts[0]);
    let temp_right = esprima.parseScript(parts[1]);
    let left = calc(temp_left.body[0].expression);
    let right = calc(temp_right.body[0].expression);
    return left === right;
}
function case_not(cond){
    let parts = cond.split('!=');
    let temp_left = esprima.parseScript(parts[0]);
    let temp_right = esprima.parseScript(parts[1]);
    let left = calc(temp_left.body[0].expression);
    let right = calc(temp_right.body[0].expression);
    return left !== right;
}
function case_and(cond){
    let parts = cond.split('&&');
    let left = check_color(parts[0]);
    let right = check_color(parts[1]);
    if(left && right)
        return true;
    else
        return false;
}
function case_or(cond){
    let parts = cond.split('||');
    let left = check_color(parts[0]);
    let right = check_color(parts[1]);
    if(left || right)
        return true;
    else
        return false;
}
//check which color to insert the current if statement
function colors(color){
    if(color){
        sub_func.push('GREEN');
        currColor = 'green';
    }
    else{
        sub_func.push('RED');
        currColor = 'red';
    }
}
// Handle cases
function case_for(info){
    let exp = escodegen.generate(info.init).replace('let ','') + ';' + escodegen.generate(info.test) + ';' +escodegen.generate(info.update);
    parsing_arr.push({
        'Line':info.loc.start.line, 'Type':'for statement',
        'Name':'', 'Condition':exp, 'Value':''
    });
    body_parser(info.body.body);
}
function case_if(info){
    let test;
    if(isFunc)
        test = nav_map[info.test.type](info.test);
    else
        test = escodegen.generate(info.test);
    let type = 'if statement';
    let color = check_color(test);
    colors(color);
    sub_func.push('if('+test+'){\n');
    helper_if(info, test, type, color);
}
function helper_if(info, test, type, colored){
    parsing_arr.push({'Line':info.loc.start.line, 'Type':type, 'Name':'', 'Condition':test, 'Value':''});
    if(info.consequent.body){
        body_parser(info.consequent.body);
        sub_func.push('}\n');
    }
    else
        nav_map[info.consequent.type](info.consequent);
    if(info.alternate !== null){
        if(info.alternate.type === 'IfStatement')
            case_elif(info.alternate, colored);
        else
            case_else(info.alternate, colored);
    }
}
function case_else(info, colored) {
    parsing_arr.push({'Line':info.loc.start.line, 'Type':'else statement',
        'Name':'', 'Condition':'', 'Value':''});
    if(colored)
        sub_func.push('RED');
    else
        sub_func.push('GREEN');
    sub_func.push('else{\n');
    nav_map[info.type](info);
    sub_func.push('}\n');
}
function case_elif(info, colored){
    let test;
    if(isFunc)
        test = nav_map[info.test.type](info.test);
    else
        test = escodegen.generate(info.test);
    let type = 'else if statement';
    let color = check_color(test);
    colors(color);
    if(color)
        colored = true;
    sub_func.push('else if('+test+'){\n');
    helper_if(info, test, type, colored);
}
function case_while(info){
    let test;
    if(isFunc)
        test = nav_map[info.test.type](info.test);
    else
        test = escodegen.generate(info.test);
    parsing_arr.push({'Line':info.loc.start.line, 'Type':'while statement', 'Name':'', 'Condition':test, 'Value':''});
    sub_func.push('while('+test+')');
    if(info.body.body){
        sub_func.push('{\n');
        body_parser(info.body.body);
        sub_func.push('}\n');
    }
    else
        nav_map[info.body.type](info.body);
}
function case_dowhile(info){
    let test;
    if(isFunc)
        test = nav_map[info.test.type](info.test);
    else
        test = escodegen.generate(info.test);
    parsing_arr.push({'Line':info.loc.start.line, 'Type':'do while statement', 'Name':'', 'Condition':test, 'Value':''});
    if(info.body.body)
        body_parser(info.body.body);
    else
        nav_map[info.body.type](info.body);
}
function case_return(info){
    let exp;
    if(isFunc)
        exp = nav_map[info.argument.type](info.argument);
    else
        exp = escodegen.generate(info.argument);
    parsing_arr.push({'Line':info.loc.start.line, 'Type':'return statement', 'Name':'', 'Condition':'', 'Value':exp});
    sub_func.push('return '+exp+';\n');
}
function case_funcDeclare(info){
    let name = info.id.name;
    parsing_arr.push({'Line':info.loc.start.line, 'Type':'function declaration', 'Name':name, 'Condition':'', 'Value':''});
    sub_func.push('function '+name+'(');
    if(info.params.length !== 0){
        for(let i=0; i<info.params.length; i++){
            let name = info.params[i].name;
            func_args.set(name, inputs[i]);
            sub_func.push(name);
            if(i<info.params.length-1)
                sub_func.push(',');
        }
    }
    sub_func.push('){\n');
    body_parser(info.body.body);
    sub_func.push('}\n');
}
//handle expressions types
function case_expState(info) {
    let func = nav_map[info.expression.type];
    func.call(undefined, info.expression);
}
function case_assign(info){
    let name = escodegen.generate(info.left);  //needs a case for name is an array cell
    let value = nav_map[info.right.type](info.right);
    if(isFunc)
        helper_assign(name,value);
    else {globals.set(name, value);}
    parsing_arr.push({'Line':info.loc.start.line, 'Type':'assignment expression', 'Name':name, 'Condition':'', 'Value':value});
}

function helper_assign(name, value){
    if(globals.has(name))
        assign_globals(name, value);
    if(func_args.has(name))
        assign_args(name,value);
    if(locals.has(name)) {
        if(currColor ==='green'){locals.set(name, value);}
    }
}
function assign_globals(name, value){
    sub_func.push(name + '=' + value + ';\n');
    if(currColor ==='green')
        globals.set(name, value);
}
function assign_args(name, value){
    sub_func.push(name + '=' + value + ';\n');
    if(currColor ==='green')
        func_args.set(name, value);
}
function case_update(info){
    let name = escodegen.generate(info.argument);
    let value;
    if(info.operator ==='++')
        value = name + '+ 1';
    else
        value = name + '- 1';
    parsing_arr.push({'Line':info.loc.start.line, 'Type':'update expression', 'Name':name, 'Condition':'', 'Value':value});
}
function case_unary(info){
    let name = info.argument.name;
    let value = info.operator + name;
    parsing_arr.push({'Line':info.loc.start.line, 'Type':'unary expression', 'Name':name, 'Condition':'', 'Value':value});
}
function case_binary(info){
    let value, right, left;
    left = nav_map[info.left.type](info.left);
    right = nav_map[info.right.type](info.right);
    if((info.operator === '*' || info.operator === '/')&& (left.length>1 || right.length>1))
        value = '(' + left + ')' + info.operator + '(' + right + ')';
    else
        value =left+ info.operator +right;
    parsing_arr.push({'Line':info.loc.start.line, 'Type':'binary expression', 'Name':'', 'Condition':'', 'Value':value});
    return value;
}
function case_id(info){
    let name = info.name;
    parsing_arr.push({'Line':info.loc.start.line, 'Type':'identifier', 'Name':name, 'Condition':'', 'Value':''});
    if(func_args.has(name))
        return name;
    if(globals.has(name))
        return name;
    if(locals.has(name))
        return locals.get(name);
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

function case_memberExp(info){
    let name = info.object.name;
    let index = info.property.raw;
    let act = info.property.name;
    parsing_arr.push({'Line':info.loc.start.line,'Type':'member expression','Name':name+'['+index+']','Condition':'', 'Value':''});
    if(index !== undefined)
        return indexMem(name, index);
    if(act === 'length')
        return actMem(name, act);
}

function indexMem(name, index){
    let fullName = name+'['+index+']';
    if(func_args.has(name))
        return fullName;
    if(globals.has(name))
        return fullName;
    if(locals.has(name))
        return (locals.get(name))[index];
}

function actMem(name, act){
    if(func_args.has(name))
        return name+'.' + act;
    if(globals.has(name))
        return name+'.' + act;
    if(locals.has(name))
        return (locals.get(name)).length; //only if length
}

function case_literal(info){
    let value = info.raw;
    parsing_arr.push({'Line':info.loc.start.line, 'Type':'literal', 'Name':'', 'Condition':'', 'Value': value});
    return value;
}

function case_block(info){
    let block_body = info.body;
    for(let i=0; i<block_body.length; i++){
        let type = block_body[i].type;
        nav_map[type](block_body[i]);
    }
}

function case_callExp(info){
    let name = escodegen.generate(info);
    parsing_arr.push({'Line':info.loc.start.line, 'Type':'call expression', 'Name': name, 'Condition':'', 'Value': ''});
}