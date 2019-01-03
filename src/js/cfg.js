import * as esgraph from 'esgraph';
import * as viz from 'viz.js';
import * as esprima from 'esprima';
// import * as escodegen from 'escodegen';

let cfg = [];
let index = 1; // index 0 is entry
let exit = false;
let n_exit = '';
let types_map = {
    'declaration': case_let,
    'return': case_return,
    'assign': case_assign,
    'condition': case_condition,
    'exit': case_exit
};

export {start_cfg};

let start_cfg = (codeToParse) => {
    let parsedCode = esprima.parse(codeToParse, { range: true });
    let graph = esgraph(parsedCode.body[0].body);
    let temp = esgraph.dot(graph,{counter: 0, source: codeToParse});
    n_exit = '';
    cfg = temp.split('\n');
    exit = false;
    index = 1;
    while(index<cfg.length && !exit){
        let type=get_type(cfg[index]);
        types_map[type]();
        index++;
    }
    return build_graph();
};

function build_graph(){
    clean_cfg();
    let final='';
    for(let i=0;i<cfg.length;i++){
        final= final+cfg[i]+'\n';
    }
    return viz('digraph{'+final+'}');
}

//cleans exceptions, entry and end
function clean_cfg() {
    let i,j=0;
    let removes = [];
    for (i = 0; i < cfg.length; i++) {
        if (clean_helper(i)){
            removes[j] = i;
            j++;
        }
    }
    for (let k = 0; k < removes.length; k++) {
        cfg = cfg.splice[removes[k], 1];
    }
}

function clean_helper(i){
    return cfg[i].includes('exception') || cfg[i].includes('exit') || cfg[i].includes('n' + n_exit) || cfg[i].includes('n0');
}

function get_type(text){
    if(text.includes('let '))
        return 'declaration';
    if(text.includes('return '))
        return 'return';
    if(text.includes('exit'))
        return 'exit';
    let cond_str = text.substring(text.indexOf('label')+7, text.indexOf('label')+7+ text.substring(text.indexOf('label')+7).indexOf('"'));
    let cond = esprima.parseScript(cond_str);
    if((cond.body)[0].expression.type === 'AssignmentExpression')
        return 'assign';
    return 'condition';
}
//cases
function case_return(){
    cfg[index] = cfg[index].substring(0,cfg[index].indexOf(']'))+', '+ 'shape'+'="'+'box'+'"]';
}

function case_let(){
    cfg[index] = cfg[index].replace('let ', '');
    cfg[index] = cfg[index].substring(0,cfg[index].indexOf(']'))+', '+ 'shape'+'="'+'box'+'"]';
    //if the next with let- function for merge todo
}

function case_assign(){
    cfg[index] = cfg[index].substring(0,cfg[index].indexOf(']'))+', '+ 'shape'+'="'+'box'+'"]';
    //if the next is assign- function for merge todo
}

function case_condition(){
    cfg[index] = cfg[index].substring(0,cfg[index].indexOf(']'))+', '+ 'shape'+'="'+'diamond'+'"]';
}

function case_exit(){
    exit = true;
    n_exit = index;
}


