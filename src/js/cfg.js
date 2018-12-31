import * as esgraph from 'esgraph';
import * as viz from 'viz.js';
import * as esprima from 'esprima';
// import * as escodegen from 'escodegen';

let cfg = [];
let index = 1; // index 0 is entry
let types_map = {
    'declaration': case_let,
    //'assignment': case_assign,
    'return': case_return,
};

export {start_cfg, parsed};
const parsed = (codeToParse) => {
    return esprima.parseScript(codeToParse, {range:true});
};
let start_cfg = (parsed, codeToParse) => {
    let graph = esgraph(parsed.body[0].body);
    let temp = esgraph.dot(graph,{counter:0,source:codeToParse});
    cfg = temp.split('\n');
    while(index<cfg.length){
        let type=get_type(cfg[index]);
        types_map[type]();
    }
    let str='';
    for(let i=0;i<cfg.length;i++){
        str+=cfg[i]+'\n';
    }
    let x = viz('digraph{'+str+'}');
    return x;
};

// function clean_cfg(){
//     //cleans exceptions, entry and end
// }
function get_type(text){
    if(text.includes('VariableDeclaration'))
        return 'declaration';
    if(text.includes('return '))
        return 'return';
    //todo: add if for the finish
}

function case_return(){
    cfg[index] = cfg[index].substring(0,cfg[index].indexOf(']'))+', '+ 'shape'+'="'+'box'+'"]';
}

function case_let(){
}


