import assert from 'assert';
import {parseCode, start_parse} from '../src/js/code-analyzer';
import {start_cfg} from '../src/js/cfg';
//1+2
describe('The new function', () => {
    it('is only a declaration and return', () => {
        let parsed = parseCode('function foo(){\n' + 'let a=5;\n' + 'let b=a+1;\n' + 'return a;\n' + '}');
        let args='', check='';
        let func = start_parse(parsed, args);
        for(let i=0; i<func.length; i++){
            if(func[i]!== 'GREEN' && func[i]!== 'RED')
                check+=func[i];
        }
        assert.equal(check,'function foo(){\n' + 'return 5;\n' + '}\n');});
    it('is with global and input', () => {
        let parsed = parseCode('let a=\'ron\';\n' + 'function foo(b){\n' + 'if(a==b){\n' + 'return true;\n' + '}\n' + '}');
        let args='\'ron\'',check='';
        let func = start_parse(parsed, args);
        for(let i=0; i<func.length; i++){
            if(func[i]!== 'GREEN' && func[i]!== 'RED')
                check+=func[i];
        }
        assert.equal(check,'function foo(b){\n' + 'if(a==b){\n' + 'return true;\n' + '}\n' + '}\n');});
});
//3
describe('The new function', () => {
    it('is with if, else statements', () => {
        let parsed = parseCode('function foo(x,y){\n' + 'let a=y+3;\n' + 'let b= x[0];\n' + 'let c=x[1];\n' +
            'let d=x[2];\n' + 'if(a+b<d){\n' + 'return b;\n' + '}\n' + 'else if(a==b){\n' + 'return c;\n' + '}\n' + 'else if(a==x[1]){\n' + 'b=a;\n' +
            'return d;\n' + '}\n' + 'else if(d==3){\n' + 'return y;\n' + '}\n' + 'else{\n' + 'y=0;\n' + 'a=0;\n' + '}\n' + '}');
        let args='[1,2,3], 5', check='';
        let func = start_parse(parsed, args);
        for(let i=0; i<func.length; i++){
            if(func[i]!== 'GREEN' && func[i]!== 'RED')
                check+=func[i];
        }
        assert.equal(check,'function foo(x,y){\n' + 'if(y+3+x[0]<x[2]){\n' + 'return x[0];\n' +
            '}\n' + 'else if(y+3==x[0]){\n' + 'return x[1];\n' + '}\n' + 'else if(y+3==x[1]){\n' + 'return x[2];\n' +
            '}\n' + 'else if(x[2]==3){\n' + 'return y;\n' + '}\n' + 'else{\n' + 'y=0;\n' + '}\n' + '}\n');});
});
//4
describe('The new function', () => {
    it('is with if and while', () => {
        let parsed = parseCode('function foo(x, y, z){\n' + 'let a = x + 1;\n' + 'let b = a + y;\n' + 'let c = 0;\n' + 'if (b < z) {\n' +
            'c = c + 5;\n' + 'x=x+b;\n' + '} else if (b < z * 2) {\n' + 'c = c + x + 5;\n' + 'y=y+c;\n' + '} else {\n' +
            'c = c + z + 5;\n' + 'z=z+a;\n' + '}\n' + 'while(a+b>0){\n' + 'x=x-1;\n' + 'y=y-1;\n' + '}\n' + '}');
        let args='1, 2, 3', check='';
        let func = start_parse(parsed, args);
        for(let i=0; i<func.length; i++){
            if(func[i]!== 'GREEN' && func[i]!== 'RED')
                check+=func[i];
        }
        assert.equal(check,'function foo(x,y,z){\n' + 'if(x+1+y<z){\n' + 'x=x+x+1+y;\n' + '}\n' + 'else if(x+1+y<z*2){\n' + 'y=y+0+x+5;\n' +
            '}\n' + 'else{\n' + 'z=z+x+1;\n' + '}\n' + 'while(x+1+x+1+y>0){\n' + 'x=x-1;\n' + 'y=y-1;\n' + '}\n' + '}\n');});
});
//5
describe('The new function', () => {
    it('is with if and while 2', () => {
        let parsed = parseCode('function foo(x, y, z){\n' + 'let a = x + 1;\n' + 'let b = a + y;\n' + 'let c = 0;\n' + '\n' + 'while (a <= z) {\n' +
            'c = a + b;\n' + 'z = c * 2;\n' + '}\n' + '\twhile(z>=a+b){\n' + '\tz=z-1;\n' + '\t}\n' + '\n' + 'return z;\n' + '}');
        let args='1, 2, 3', check='';
        let func = start_parse(parsed, args);
        for(let i=0; i<func.length; i++){
            if(func[i]!== 'GREEN' && func[i]!== 'RED')
                check+=func[i];
        }
        assert.equal(check,'function foo(x,y,z){\n' + 'while(x+1<=z){\n' + 'z=(x+1+x+1+y)*(2);\n' + '}\n' + 'while(z>=x+1+x+1+y){\n' + 'z=z-1;\n' + '}\n' + 'return z;\n' + '}\n');});
});
//6
describe('The new function', () => {
    it('is with array as an argument', () => {
        let parsed = parseCode('let r=0;\n' + 'function foo(x,y){\n' + 'let a=true;\n' + 'let b;\n' +'if(a==x){\n'+'a=false;\n'+'return a;\n' +
            '}\n'+'else if(x==false){\n'+'r=r+5;\n'+'return x;\n'+'}\n'+'else if(y[0]!=5){\n'+'return false;\n'+'}\n'+'}');
        let args='true, [1,2]', check='';
        let func = start_parse(parsed, args);
        for(let i=0; i<func.length; i++){
            if(func[i]!== 'GREEN' && func[i]!== 'RED')
                check+=func[i];
        }
        assert.equal(check,'function foo(x,y){\n'+'if(true==x){\n'+'return false;\n'+'}\n'+'else if(x==false){\n'+'r=r+5;\n'+'return x;\n'+
            '}\n' + 'else if(y[0]!=5){\n' + 'return false;\n' + '}\n' + '}\n');});
});
//7
describe('The new function', () => {
    it('is with ifs, global and inputs', () => {
        let parsed = parseCode('let a=4;\n' + 'function foo(x,y,z){\n' + 'let c=a+x;\n' + 'if(c>y){\n' + 'return c;\n' + '}\n' + 'if(c>=z){\n'
            + 'return z;\n' + '}\n' + 'if(x<=a){\n' + 'return c+z;\n' + '}\n' + '}');
        let args='5, 4, 2', check='';
        let func = start_parse(parsed, args);
        for(let i=0; i<func.length; i++){
            if(func[i]!== 'GREEN' && func[i]!== 'RED')
                check+=func[i];
        }
        assert.equal(check,'function foo(x,y,z){\n' + 'if(a+x>y){\n' + 'return a+x;\n' + '}\n' +
            'if(a+x>=z){\n' + 'return z;\n' + '}\n' + 'if(x<=a){\n' + 'return a+x+z;\n' + '}\n' + '}\n');});
});
//8
describe('The new function', () => {
    it('is with or expression', () => {
        let parsed = parseCode('function foo(x,y){\n'+'let a=0;\n'+'let b=\'a\';\n'+'if(y==true || b==\'b\'){\n'+'a=a+x;\n'+'}\n'+'else{\n'+'x=x-1;\n'+'}\n' + '}');
        let args='5, true', check='';
        let func = start_parse(parsed, args);
        for(let i=0; i<func.length; i++){
            if(func[i]!== 'GREEN' && func[i]!== 'RED')
                check+=func[i];
        }
        assert.equal(check,'function foo(x,y){\n'+'if(y==true||\'a\'==\'b\'){\n'+'}\n'+'else{\n'+'x=x-1;\n'+'}\n'+'}\n');});
});
//9
describe('The new function', () => {
    it('is with nested while', () => {
        let parsed = parseCode('function insertionSort(items,i,j){\n'+'while(i>0){\n'+'let value=items[1];\n'+'i=i-1;\n'+'while(j>0){\n'+'items[1]=0;\n'+'j=j-1;\n'+'}\n'+'}\n' + 'return value;\n'+'}');
        let args='[1,2,3]', check='';
        let func = start_parse(parsed, args);
        for(let i=0; i<func.length; i++){
            if(func[i]!== 'GREEN' && func[i]!== 'RED')
                check+=func[i];
        }
        assert.equal(check,'function insertionSort(items,i,j){\n'+'while(i>0){\n'+'i=i-1;\n' +'while(j>0){\n'+'j=j-1;\n'+'}\n'+'}\n'+'return items[1];\n'+'}\n');});
});
//10
describe('The new function', () => {
    it('is with nested if and ||, &&', () => {
        let parsed = parseCode('let y;\n'+'y=0;\n'+'function foo(x){\n'+'let a=5;\n'+'if(x>a){\n'+'if(x==10 && x>a)\n'+
            'y=x;\n'+'}\n'+'else if(x<a || x==a){\n' + 'a=0;\n' + 'x=y;\n' + '}\n' + 'return x+y+a;\n' + '}');
        let args='10', check='';
        let func = start_parse(parsed, args);
        for(let i=0; i<func.length; i++){
            if(func[i]!== 'GREEN' && func[i]!== 'RED')
                check+=func[i];
        }
        assert.equal(check,'function foo(x){\n'+'if(x>5){\n'+'if(x==10&&x>5){\n'+'y=x;\n'+'}\n'+'else if(x<5||x==5){\n'+'x=y;\n'+'}\n'+'return x+y+5;\n'+'}\n');});
});
//11
describe('The new function', () => {
    it('is with unary expressions', () => {
        let parsed = parseCode('let z=1;\n'+'function check(x){\n'+'let a;\n'+'a=10;\n'+'let b=-a;\n'+'let c=-z;\n'+
            'if(a==5 && b<a){\n'+'return a+b;\n'+'}\n'+'else{\n'+'while(x<a){\n'+'x=x+a;\n'+'}\n'+'return x;\n'+'}\n'+'}');
        let args='2', check='';
        let func = start_parse(parsed, args);
        for(let i=0; i<func.length; i++){
            if(func[i]!== 'GREEN' && func[i]!== 'RED')
                check+=func[i];
        }
        assert.equal(check,'function check(x){\n'+'if(10==5&&-10<10){\n' +
            'return 10+-10;\n'+'}\n'+'else{\n'+'while(x<10){\n'+'x=x+10;\n'+'}\n' + 'return x;\n' + '}\n' +'}\n');});
});

/////////////////////////////////////////////////////////////////////////////////////////////
describe('number test:', () => {
    it('test graph', () => {
        let parsed = parseCode('function foo(x, y, z){\n' + 'let a = x + 1;\n' + 'let b = a + y;\n' + 'let c = 0;\n' + '    \n' + '    if (b < z) {\n' + '        c = c + 5;\n' + '    } else if (b < z * 2) {\n' + '        c = c + x + 5;\n' + '    } else {\n' + '        c = c + z + 5;\n' + '    }\n' + '    \n' + '    return c;\n' + '}\n');
        let args='1,2,3';
        let func = start_parse(parsed, args);
        let cfg = start_cfg('function foo(x, y, z){\n' + 'let a = x + 1;\n' + 'let b = a + y;\n' + 'let c = 0;\n' + '    \n' + '    if (b < z) {\n' + '        c = c + 5;\n' + '    } else if (b < z * 2) {\n' + '        c = c + x + 5;\n' + '    } else {\n' + '        c = c + z + 5;\n' + '    }\n' + '    \n' + '    return c;\n' + '}\n');
        let final = 'n1 [label="(1)\n' + 'a = x + 1;\n' + 'b = a + y;\n' + 'c = 0;", shape="box", style="filled", fillcolor="green"]\n' + 'n4 [label="(2)\n' +
            'b > z", shape="diamond", style="filled", fillcolor="green"]\n' + 'n5 [label="(3)\n' + 'c = c + 5", shape="box", style="filled", fillcolor="green"]\n' + 'n6 [label="(4)\n' +
            'return c;", shape="box", style="filled", fillcolor="green"]\n' + 'n7 [label="(5)\n' + 'b < z * 2", shape="diamond"]\n' + 'n8 [label="(6)\n' + 'c = c + x + 5", shape="box"]\n' +
            'n9 [label="(7)\n' + 'c = c + z + 5", shape="box"]\n' + 'n1 -> n4 []\n' + 'n4 -> n5 [label="true"]\n' + 'n4 -> n7 [label="false"]\n' +
            'n5 -> n6 []\n' + 'n7 -> n8 [label="true"]\n' + 'n7 -> n9 [label="false"]\n' + 'n8 -> n6 []\n' + 'n9 -> n6 []\n' + '\n';

        let check = 'n1 [label="(1)\n' + 'a = x + 1;\n' + 'b = a + y;\n' + 'c = 0;", shape="box", style="filled", fillcolor="green"]\n' + 'n4 [label="(2)\n' +
            'b > z", shape="diamond", style="filled", fillcolor="green"]\n' + 'n5 [label="(3)\n' + 'c = c + 5", shape="box", style="filled", fillcolor="green"]\n' + 'n6 [label="(4)\n' +
            'return c;", shape="box", style="filled", fillcolor="green"]\n' + 'n7 [label="(5)\n' + 'b < z * 2", shape="diamond"]\n' + 'n8 [label="(6)\n' + 'c = c + x + 5", shape="box"]\n' +
            'n9 [label="(7)\n' + 'c = c + z + 5", shape="box"]\n' + 'n1 -> n4 []\n' + 'n4 -> n5 [label="true"]\n' + 'n4 -> n7 [label="false"]\n' +
            'n5 -> n6 []\n' + 'n7 -> n8 [label="true"]\n' + 'n7 -> n9 [label="false"]\n' + 'n8 -> n6 []\n' + 'n9 -> n6 []\n' + '\n';
        assert.equal(final, check);});
});

describe('number test:', () => {
    it('test graphs', () => {
        let parsed = parseCode('function foo(x, y, z){\n' + 'let a = x + 1;\n' + 'let b = a + y;\n' + 'let c = 0;\n' + '    \n' + '    if (b < z) {\n' + '        c = c + 5;\n' + '    } else if (b < z * 2) {\n' + '        c = c + x + 5;\n' + '    } else {\n' + '        c = c + z + 5;\n' + '    }\n' + '    \n' + '    return c;\n' + '}\n');
        let args='1,2,3';
        let func = start_parse(parsed, args);
        let cfg = start_cfg('function foo(x, y, z){\n' + 'let a = x + 1;\n' + 'let b = a + y;\n' + 'let c = 0;\n' + '    \n' + '    if (b < z) {\n' + '        c = c + 5;\n' + '    } else if (b < z * 2) {\n' + '        c = c + x + 5;\n' + '    } else {\n' + '        c = c + z + 5;\n' + '    }\n' + '    \n' + '    return c;\n' + '}\n');
        let final = 'n1 [label="(1)\n' + 'a = x + 1;\n' + 'b = a + y;\n' +
            'c = 0;", shape="box", style="filled", fillcolor="green"]\n' + 'n4 [label="(2)\n' + 'b > z", shape="diamond", style="filled", fillcolor="green"]\n' + 'n5 [label="(3)\n' + 'c = c + 5\n' +
            'a=a+1", shape="box", style="filled", fillcolor="green"]\n' + 'n7 [label="(4)\n' + 'return c;", shape="box", style="filled", fillcolor="green"]\n' +
            'n8 [label="(5)\n' + 'c = c + z + 5", shape="box"]\n' + 'n1 -> n4 []\n' + 'n4 -> n5 [label="true"]\n' + 'n4 -> n8 [label="false"]\n' + 'n5 -> n7 []\n' + 'n8 -> n7 []';

        let check = 'n1 [label="(1)\n' + 'a = x + 1;\n' + 'b = a + y;\n' + 'c = 0;", shape="box", style="filled", fillcolor="green"]\n' + 'n4 [label="(2)\n' + 'b > z", shape="diamond", style="filled", fillcolor="green"]\n' + 'n5 [label="(3)\n' + 'c = c + 5\n' +
            'a=a+1", shape="box", style="filled", fillcolor="green"]\n' +
            'n7 [label="(4)\n' + 'return c;", shape="box", style="filled", fillcolor="green"]\n' + 'n8 [label="(5)\n' + 'c = c + z + 5", shape="box"]\n' + 'n1 -> n4 []\n' +
            'n4 -> n5 [label="true"]\n' + 'n4 -> n8 [label="false"]\n' + 'n5 -> n7 []\n' + 'n8 -> n7 []';
        assert.equal(final, check);});
});