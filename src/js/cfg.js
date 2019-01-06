import * as esgraph from 'esgraph';
import * as viz from 'viz.js';
import * as esprima from 'esprima';

import {conditions_colors} from './code-analyzer';

let cfg = [];
let final = '';
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

export {start_cfg, final};

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
    color_path();
    numbering();
    for(let i=0;i<cfg.length;i++){
        final= final+cfg[i]+'\n';
    }
    return viz('digraph{'+final+'}');
}

//cleans exceptions, entry and end
function clean_cfg() {
    let i = 0;
    while(i<cfg.length){
        if(clean_helper(i))
            cfg.splice(i,1);
        else
            i++;
    }
}

function clean_helper(i){
    return cfg[i].includes('exception') || cfg[i].includes('exit') || cfg[i].includes(n_exit) || cfg[i].includes('n0');
}

function numbering() {
    for(let i=0; i < cfg.length; i++){
        if(cfg[i].includes(' -> ') || cfg[i]==='')
            break;
        else {
            let temp = cfg[i].substring(cfg[i].indexOf('label')+7, cfg[i].indexOf('label')+7+ cfg[i].substring(cfg[i].indexOf('label')+7).indexOf('"'));
            let number='('+(i+1)+')\n'+temp;
            cfg[i]=cfg[i].substring(0,cfg[i].indexOf('label')+7)+number+'"'+cfg[i].substring(cfg[i].indexOf(','));
        }
    }
}


function get_type(text){
    if(text.includes('let '))
        return 'declaration';
    if(text.includes('return '))
        return 'return';
    if(text.includes('exit'))
        return 'exit';
    return check_assignment(index);
}

function check_assignment(i){
    if(cfg[i].includes('return'))
        return 'return';
    let cond_str = cfg[i].substring(cfg[i].indexOf('label')+7, cfg[i].indexOf('label')+7+ cfg[i].substring(cfg[i].indexOf('label')+7).indexOf('"'));
    let cond = esprima.parseScript(cond_str);
    if((cond.body)[0].expression)
        if ((cond.body)[0].expression.type === 'AssignmentExpression')
            return 'assign';
    return 'condition';
}
//cases
function case_return(){
    cfg[index] = cfg[index].substring(0,cfg[index].indexOf(']'))+', '+ 'shape'+'="'+'box'+'"]';
}

function case_let(){
    cfg[index] = cfg[index].replace('let ', '');
    cfg[index] = cfg[index].substring(0,cfg[index].indexOf(']'))+', '+ 'shape'+'="'+'box'+'"]'; //todo: check if its array - last ']'
    if(cfg[index+1].includes('let ')){
        index++;
        cfg[index] = cfg[index].replace('let ', '');
        merge_cases('let');
    }
}

function case_assign(){
    cfg[index] = cfg[index].substring(0,cfg[index].indexOf(']'))+', '+ 'shape'+'="'+'box'+'"]';
    let n_first = cfg[index].substring(0,cfg[index].indexOf(' ['));
    let n_second = cfg[index+1].substring(0,cfg[index+1].indexOf(' ['));
    if(check_assignment(index+1) === 'assign' && check_else(n_first, n_second)){
        index++;
        merge_cases('assign');
    }
}
function check_else(n_first, n_second){
    for(let i=index; i<cfg.length; i++){
        if(cfg[i].includes(n_first+' -> '+n_second))
            return true;
    }
    return false;
}
function merge_cases(case_type){
    let temp1 = cfg[index-1].substring(0, cfg[index-1].indexOf('label')+7+ cfg[index-1].substring(cfg[index-1].indexOf('label')+7).indexOf('"'));
    let temp2 = cfg[index].substring(cfg[index].indexOf('label')+7, cfg[index].indexOf('label')+7+ cfg[index].substring(cfg[index].indexOf('label')+7).indexOf('"'));
    cfg[index-1] = temp1 + '\n' + temp2+'", shape="box"]';
    remove_arrows(cfg[index-1].substring(0,cfg[index-1].indexOf(' [')), cfg[index].substring(0,cfg[index].indexOf(' [')));
    cfg.splice(index,1);
    let n1 = cfg[index-1].substring(0,cfg[index-1].indexOf(' ['));
    let n2 = cfg[index].substring(0,cfg[index].indexOf(' ['));
    if(cfg[index].includes('let ')&& case_type === 'let'){
        cfg[index] = cfg[index].replace('let ', '');
        merge_cases('let');
    }
    else if(assign_helper(case_type, n1, n2))
        merge_cases('assign');
    else
        index--;
}

function assign_helper(type, n1, n2){
    if(check_assignment(index) ==='assign' && type === 'assign' && check_else(n1, n2))
        return true;
    return false;
}
function remove_arrows(curr, removed){
    let i =index+1;
    while(i<cfg.length){
        if(cfg[i].includes(curr+' -> '+removed)){
            cfg.splice(i,1);
            i--;
        }
        else if(cfg[i].includes(removed))
            cfg[i] = curr + cfg[i].substring(cfg[i].indexOf(removed)+removed.length);
        i++;
    }
}
function case_condition(){
    cfg[index] = cfg[index].substring(0,cfg[index].indexOf(']'))+', '+ 'shape'+'="'+'diamond'+'"]';
}

function case_exit(){
    exit = true;
    n_exit = cfg[index].substring(0,cfg[index].indexOf(' ['));
}

function color_path(){
    let i=0; let curr = cfg[i].substring(0,cfg[i].indexOf(' ['));
    while(!cfg[i].includes('return')){
        cfg[i] = cfg[i].substring(0,cfg[i].lastIndexOf(']')) +', style="filled", '+ 'fillcolor="green"]';
        if(check_assignment(i) !== 'condition') {
            i = find_next(i, curr); curr = cfg[i].substring(0,cfg[i].indexOf(' ['));
        }
        else{
            let condition = cfg[i].substring(cfg[i].indexOf('label')+7,cfg[i].indexOf('label')+7+ cfg[i].substring(cfg[i].indexOf('label')+7).indexOf('"'));
            if(conditions_colors.get(condition)){
                i = find_next_for_cond(i, curr, 'true'); curr = cfg[i].substring(0,cfg[i].indexOf(' ['));
            }
            else{
                i = find_next_for_cond(i, curr, 'false'); curr = cfg[i].substring(0,cfg[i].indexOf(' ['));
            }
        }
    }
    cfg[i] = cfg[i].substring(0,cfg[i].lastIndexOf(']')) +', style="filled", '+ 'fillcolor="green"]';
}

function find_next(i, n){
    let next;
    for (let j = i+1; j < cfg.length; j++){
        if(cfg[j].includes(n+' ->')){
            next = cfg[j].substring(cfg[j].indexOf('->')+3, cfg[j].indexOf(' ['));
            break;
        }
    }
    for (let j = 1; j < cfg.length; j++){
        if(cfg[j].includes(next))
            return j;
    }
}
function find_next_for_cond(i, n, is_true){
    let next = helper(i, n, is_true);
    for (let j = 1; j < cfg.length; j++){
        if(cfg[j].includes(next))
            return j;
    }
}

function helper(i, n, is_true){
    let next ='';
    for (let j = i+1; j < cfg.length; j++){
        if(cfg[j].includes(n+' ->') && cfg[j].includes(is_true)){
            next = cfg[j].substring(cfg[j].indexOf('->')+3, cfg[j].indexOf(' ['));
            break;
        }
    }
    return next;
}


