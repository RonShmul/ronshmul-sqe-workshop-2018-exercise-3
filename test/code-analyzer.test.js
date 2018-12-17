import assert from 'assert';
import {parseCode, start_parse} from '../src/js/code-analyzer';
//import $ from 'jquery';

/*describe('The javascript table', () => {
    it('is parsing an if statement correctly', () => {    //test 1
        let parsed = parseCode('if(a[0]>9){\n' + 'let x=1;\n' + '}');
        assert.equal(
            JSON.stringify(start_parse(parsed)),
            '[{"Line":1,"Type":"if statement","Name":"","Condition":"a[0] > 9","Value":""},{"Line":2,"Type":"variable declaration","Name":"x","Condition":"","Value":"1"}]'
        );
    });

    it('is parsing an if + else statement correctly', () => {    //test 2
        let parsed = parseCode('if(a[0]>9){\n' + 'let x=1;\n' +
            '}\n' + 'else{\n' + 'let x=2;\n' + '}\n');
        assert.equal(
            JSON.stringify(start_parse(parsed)),
            '[{"Line":1,"Type":"if statement","Name":"","Condition":"a[0] > 9","Value":""},{"Line":2,"Type":"variable declaration","Name":"x","Condition":"","Value":"1"},{"Line":4,"Type":"else statement","Name":"","Condition":"","Value":""},{"Line":5,"Type":"variable declaration","Name":"x","Condition":"","Value":"2"}]'
        );
    });
});

describe('The javascript table', () => {
    it('is parsing an if + else if +else statement correctly', () => {    //test 3
        let parsed = parseCode('if(a[0]>9){\n' + 'let x=1;\n' +
            '}\n' + 'else if(a[0]<8){\n' + 'let x=2;\n' +
            '}\n' + 'else{\n' + 'let x=0;\n' + '}');
        assert.equal(
            JSON.stringify(start_parse(parsed)),
            '[{"Line":1,"Type":"if statement","Name":"","Condition":"a[0] > 9","Value":""},{"Line":2,"Type":"variable declaration","Name":"x","Condition":"","Value":"1"},{"Line":4,"Type":"else if statement","Name":"","Condition":"a[0] < 8","Value":""},{"Line":5,"Type":"variable declaration","Name":"x","Condition":"","Value":"2"},{"Line":7,"Type":"else statement","Name":"","Condition":"","Value":""},{"Line":8,"Type":"variable declaration","Name":"x","Condition":"","Value":"0"}]'
        );
    });

    it('is parsing a function declaration correctly', () => {    //test 4
        let parsed = parseCode('function go(a, b, c){}\n' + 'function two(){\n' + 'let a=2;\n' + '}');
        assert.equal(
            JSON.stringify(start_parse(parsed)),
            '[{"Line":1,"Type":"function declaration","Name":"go","Condition":"","Value":""},{"Line":1,"Type":"identifier","Name":"a","Condition":"","Value":""},{"Line":1,"Type":"identifier","Name":"b","Condition":"","Value":""},{"Line":1,"Type":"identifier","Name":"c","Condition":"","Value":""},{"Line":2,"Type":"function declaration","Name":"two","Condition":"","Value":""},{"Line":3,"Type":"variable declaration","Name":"a","Condition":"","Value":"2"}]'        );
    });

});

describe('The javascript table', () => {
    it('is parsing a function declaration correctly, with a return statement', () => {    //test 5
        let parsed = parseCode('function go(a, b){\n' + 'return a+b;\n' + '}');
        assert.equal(
            JSON.stringify(start_parse(parsed)),
            '[{"Line":1,"Type":"function declaration","Name":"go","Condition":"","Value":""},{"Line":1,"Type":"identifier","Name":"a","Condition":"","Value":""},{"Line":1,"Type":"identifier","Name":"b","Condition":"","Value":""},{"Line":2,"Type":"return statement","Name":"","Condition":"","Value":"a + b"}]'
        );
    });

    it('is parsing a for statement correctly', () => {    //test 6
        let parsed = parseCode('for(i=0;i<5;i++){}\n' +
            'for(i=0;i<5;i++){\n' + 'x[i]=3;\n' + 'x[i]--;\n' + '}');
        assert.equal(
            JSON.stringify(start_parse(parsed)),
            '[{"Line":1,"Type":"for statement","Name":"","Condition":"i = 0;i < 5;i++","Value":""},{"Line":2,"Type":"for statement","Name":"","Condition":"i = 0;i < 5;i++","Value":""},{"Line":3,"Type":"assignment expression","Name":"x[i]","Condition":"","Value":"3"},{"Line":4,"Type":"update expression","Name":"x[i]","Condition":"","Value":"x[i]- 1"}]'
        );
    });
});

describe('The javascript table', () => {
    it('is parsing a while and do while statements correctly', () => {    //test 7
        let parsed = parseCode('while(i<10){\n' +
            'while(x[0]<3){\n' + 'let x = [];\n' + 'x[0]=i;\n' + '}\n' + 'while(true){}\n' + '}');
        assert.equal(
            JSON.stringify(start_parse(parsed)),
            '[{"Line":1,"Type":"while statement","Name":"","Condition":"i < 10","Value":""},{"Line":2,"Type":"while statement","Name":"","Condition":"x[0] < 3","Value":""},{"Line":3,"Type":"variable declaration","Name":"x","Condition":"","Value":"[]"},{"Line":4,"Type":"assignment expression","Name":"x[0]","Condition":"","Value":"i"},{"Line":6,"Type":"while statement","Name":"","Condition":"true","Value":""}]'
        );
    });
    it('is parsing a while and do while statements correctly', () => {    //test 8
        let parsed = parseCode('while(a<10)\n' + '  a=a+1;\n' + 'while(i<10){\n' +
            'while(x[0]<3){\n' + 'let x = [];\n' + 'x[0]=i;\n' + '}\n' + 'while(true){}\n' + '}\n' +
            'do\n' + 'x=x+1;\n' + 'while(x<5);\n' + 'do{\n' + 'x=x+2;\n' + '}while(x<10);');
        assert.equal(
            JSON.stringify(start_parse(parsed)),
            '[{"Line":1,"Type":"while statement","Name":"","Condition":"a < 10","Value":""},{"Line":2,"Type":"assignment expression","Name":"a","Condition":"","Value":"a + 1"},{"Line":3,"Type":"while statement","Name":"","Condition":"i < 10","Value":""},{"Line":4,"Type":"while statement","Name":"","Condition":"x[0] < 3","Value":""},{"Line":5,"Type":"variable declaration","Name":"x","Condition":"","Value":"[]"},{"Line":6,"Type":"assignment expression","Name":"x[0]","Condition":"","Value":"i"},{"Line":8,"Type":"while statement","Name":"","Condition":"true","Value":""},{"Line":10,"Type":"do while statement","Name":"","Condition":"x < 5","Value":""},{"Line":11,"Type":"assignment expression","Name":"x","Condition":"","Value":"x + 1"},{"Line":13,"Type":"do while statement","Name":"","Condition":"x < 10","Value":""},{"Line":14,"Type":"assignment expression","Name":"x","Condition":"","Value":"x + 2"}]'        );
    });
});
describe('The javascript table', () => {
    it('is parsing an expression statements (call, update, assignment) correctly', () => {    //test 9
        let parsed = parseCode('let a=1, b;\n' + 'if (a>5)\n' +
            '\tf(a);\n' + 'if (a<5){\n' + '\tfor(i=0;i<a;i++){\n' + '\t\tb=a-1;\n' + '\t\tb++;\n' +
            '\t}\n' + '}\n' + 'a+=1;\n' + 'b-=1;\n' + '-b;\n' + '7;\n' + 'a+b;\n' + 'a[0];');
        assert.equal(
            JSON.stringify(start_parse(parsed)),
            '[{"Line":1,"Type":"variable declaration","Name":"a","Condition":"","Value":"1"},{"Line":1,"Type":"variable declaration","Name":"b","Condition":"","Value":""},{"Line":2,"Type":"if statement","Name":"","Condition":"a > 5","Value":""},{"Line":3,"Type":"call expression","Name":"f(a)","Condition":"","Value":""},{"Line":4,"Type":"if statement","Name":"","Condition":"a < 5","Value":""},{"Line":5,"Type":"for statement","Name":"","Condition":"i = 0;i < a;i++","Value":""},{"Line":6,"Type":"assignment expression","Name":"b","Condition":"","Value":"a - 1"},{"Line":7,"Type":"update expression","Name":"b","Condition":"","Value":"b+ 1"},{"Line":10,"Type":"assignment expression","Name":"a","Condition":"","Value":"a+1"},{"Line":11,"Type":"assignment expression","Name":"b","Condition":"","Value":"b-1"},{"Line":12,"Type":"unary expression","Name":"b","Condition":"","Value":"-b"},{"Line":13,"Type":"literal","Name":"","Condition":"","Value":"7"},{"Line":14,"Type":"binary expression","Name":"","Condition":"","Value":"a + b"},{"Line":15,"Type":"member expression","Name":"a[0]","Condition":"","Value":""}]'
        );
    });

    it('is parsing an empty code correctly', () => {    //test 10
        let parsed = parseCode('');
        assert.equal(
            JSON.stringify(start_parse(parsed)),
            '[]'
        );
    });
});

describe('The javascript table', () => {
    it('is parsing a nested code', () => {    //test 11
        let parsed = parseCode('function binarySearch(X, V, n){\n' +
            '    let low, high, mid;\n' + '    low = 0;\n' +
            '    high = n - 1;\n' + '    while (low <= high) {\n' + '        mid = (low + high)/2;\n' +
            '        if (X < V[mid])\n' + '            high = mid - 1;\n' + '        else if (X > V[mid])\n' + '            low = mid + 1;\n' +
            '        else\n' + '            return mid;\n' + '    }\n' + '    return -1;\n' + '}');
        assert.equal(
            JSON.stringify(start_parse(parsed)),
            '[{"Line":1,"Type":"function declaration","Name":"binarySearch","Condition":"","Value":""},{"Line":1,"Type":"identifier","Name":"X","Condition":"","Value":""},{"Line":1,"Type":"identifier","Name":"V","Condition":"","Value":""},{"Line":1,"Type":"identifier","Name":"n","Condition":"","Value":""},{"Line":2,"Type":"variable declaration","Name":"low","Condition":"","Value":""},{"Line":2,"Type":"variable declaration","Name":"high","Condition":"","Value":""},{"Line":2,"Type":"variable declaration","Name":"mid","Condition":"","Value":""},{"Line":3,"Type":"assignment expression","Name":"low","Condition":"","Value":"0"},{"Line":4,"Type":"assignment expression","Name":"high","Condition":"","Value":"n - 1"},{"Line":5,"Type":"while statement","Name":"","Condition":"low <= high","Value":""},{"Line":6,"Type":"assignment expression","Name":"mid","Condition":"","Value":"(low + high) / 2"},{"Line":7,"Type":"if statement","Name":"","Condition":"X < V[mid]","Value":""},{"Line":8,"Type":"assignment expression","Name":"high","Condition":"","Value":"mid - 1"},{"Line":9,"Type":"else if statement","Name":"","Condition":"X > V[mid]","Value":""},{"Line":10,"Type":"assignment expression","Name":"low","Condition":"","Value":"mid + 1"},{"Line":12,"Type":"else statement","Name":"","Condition":"","Value":""},{"Line":12,"Type":"return statement","Name":"","Condition":"","Value":"mid"},{"Line":14,"Type":"return statement","Name":"","Condition":"","Value":"-1"}]'
        );
    });
}); */

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