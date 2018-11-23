import assert from 'assert';
import {parseCode, start_parse} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('')),
            '{"type":"Program","body":[],"sourceType":"script"}'
        );
    });

    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let a = 1;')),
            '{"type":"Program","body":[{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"a"},"init":{"type":"Literal","value":1,"raw":"1"}}],"kind":"let"}],"sourceType":"script"}'
        );
    });

    it('is parsing an if statement correctly', () => {    //test 3
        let parsed = parseCode('if(a[0]>9){\n' + 'let x=1;\n' + '}');
        assert.equal(
            JSON.stringify(start_parse(parsed)),
            '[{"Line":1,"Type":"if statement","Name":"","Condition":"a[0] > 9","Value":""},{"Line":2,"Type":"variable declaration","Name":"x","Condition":"","Value":"1"}]"'
        );
    });

    it('is parsing an if + else statement correctly', () => {    //test 4
        let parsed = parseCode('if(a[0]>9){\n' + 'let x=1;\n' +
            '}\n' + 'else{\n' + 'let x=2;\n' + '}\n');
        assert.equal(
            JSON.stringify(start_parse(parsed)),
            '[{"Line":1,"Type":"if statement","Name":"","Condition":"a[0] > 9","Value":""},{"Line":2,"Type":"variable declaration","Name":"x","Condition":"","Value":"1"},{"Line":4,"Type":"else statement","Name":"","Condition":"","Value":""},{"Line":5,"Type":"variable declaration","Name":"x","Condition":"","Value":"2"}]'
        );
    });

    it('is parsing an if + else if +else statement correctly', () => {    //test 5
        let parsed = parseCode('if(a[0]>9){\n' + 'let x=1;\n' +
            '}\n' + 'else if(a[0]<8){\n' + 'let x=2;\n' +
            '}\n' + 'else{\n' + 'let x=0;\n' + '}');
        assert.equal(
            JSON.stringify(start_parse(parsed)),
            '[{"Line":1,"Type":"if statement","Name":"","Condition":"a[0] > 9","Value":""},{"Line":2,"Type":"variable declaration","Name":"x","Condition":"","Value":"1"},{"Line":4,"Type":"else if statement","Name":"","Condition":"a[0] < 8","Value":""},{"Line":5,"Type":"variable declaration","Name":"x","Condition":"","Value":"2"},{"Line":7,"Type":"else statement","Name":"","Condition":"","Value":""},{"Line":8,"Type":"variable declaration","Name":"x","Condition":"","Value":"0"}]'
        );
    });

    it('is parsing a function declaration correctly, without body, with params', () => {    //test 6
        let parsed = parseCode('function go(a, b, c){}\n');
        assert.equal(
            JSON.stringify(start_parse(parsed)),
            '[{"Line":1,"Type":"function declaration","Name":"go","Condition":"","Value":""},{"Line":1,"Type":"identifier","Name":"a","Condition":"","Value":""},{"Line":1,"Type":"identifier","Name":"b","Condition":"","Value":""},{"Line":1,"Type":"identifier","Name":"c","Condition":"","Value":""}]'
        );
    });

    it('is parsing a function declaration correctly, with a return statement', () => {    //test 7
        let parsed = parseCode('function go(a, b){\n' +
            'return a+b;\n' +
            '}');
        assert.equal(
            JSON.stringify(start_parse(parsed)),
            '[{"Line":1,"Type":"function declaration","Name":"go","Condition":"","Value":""},{"Line":1,"Type":"identifier","Name":"a","Condition":"","Value":""},{"Line":1,"Type":"identifier","Name":"b","Condition":"","Value":""},{"Line":2,"Type":"return statement","Name":"","Condition":"","Value":"a + b"}]'
        );
    });

    it('is parsing a for statement correctly', () => {    //test 8
        let parsed = parseCode('for(i=0;i<5;i++){}\n' +
            'for(i=0;i<5;i++){\n' + 'x[i]=3;\n' +
            'x[i]--;\n' + '}');
        assert.equal(
            JSON.stringify(start_parse(parsed)),
            '[{"Line":1,"Type":"for statement","Name":"","Condition":"i = 0;i < 5;i++","Value":""},{"Line":2,"Type":"for statement","Name":"","Condition":"i = 0;i < 5;i++","Value":""},{"Line":3,"Type":"assignment expression","Name":"x[i]","Condition":"","Value":"3"},{"Line":4,"Type":"update expression","Name":"x[i]","Condition":"","Value":"x[i]- 1"}]'
        );
    });

    it('is parsing a while and do while statements correctly', () => {    //test 9
        let parsed = parseCode('while(i<10){\n' +
            'while(x[0]<3){\n' + 'let x = [];\n' + 'x[0]=i;\n' +
            '}\n' + 'while(true){}\n' + '}');
        assert.equal(
            JSON.stringify(start_parse(parsed)),
            '[{"Line":1,"Type":"while statement","Name":"","Condition":"i < 10","Value":""},{"Line":2,"Type":"while statement","Name":"","Condition":"x[0] < 3","Value":""},{"Line":3,"Type":"variable declaration","Name":"x","Condition":"","Value":"[]"},{"Line":4,"Type":"assignment expression","Name":"x[0]","Condition":"","Value":"i"},{"Line":6,"Type":"while statement","Name":"","Condition":"true","Value":""}]'
        );
    });

    it('is parsing a while and do while statements correctly', () => {    //test 9
        let parsed = parseCode('while(i<10){\n' + 'while(x[0]<3){\n' +
            'let x = [];\n' + 'x[0]=i;\n' + '}\n' +
            'while(true){}\n' + '}\n' + 'do{\n' +
            'x=x+2;\n' + '}while(x<10);');
        assert.equal(
            JSON.stringify(start_parse(parsed)),
            '[{"Line":1,"Type":"while statement","Name":"","Condition":"i < 10","Value":""},{"Line":2,"Type":"while statement","Name":"","Condition":"x[0] < 3","Value":""},{"Line":3,"Type":"variable declaration","Name":"x","Condition":"","Value":"[]"},{"Line":4,"Type":"assignment expression","Name":"x[0]","Condition":"","Value":"i"},{"Line":6,"Type":"while statement","Name":"","Condition":"true","Value":""},{"Line":8,"Type":"do while statement","Name":"","Condition":"x < 10","Value":""},{"Line":9,"Type":"assignment expression","Name":"x","Condition":"","Value":"x + 2"}]'
        );
    });

    it('is parsing an expression statements (call, update) correctly', () => {    //test 9
        let parsed = parseCode('let a=1, b;\n' + 'if (a>5)\n' +
            'f(a);\n' + 'if (a<5){\n' + 'for(i=0;i<a;i++){\n' +
            'b=a-1;\n' + 'b++;\n' + '}\n' + '}');
        assert.equal(
            JSON.stringify(start_parse(parsed)),
            '[{"Line":1,"Type":"variable declaration","Name":"a","Condition":"","Value":"1"},{"Line":1,"Type":"variable declaration","Name":"b","Condition":"","Value":""},{"Line":2,"Type":"if statement","Name":"","Condition":"a > 5","Value":""},{"Line":3,"Type":"call expression","Name":"f(a)","Condition":"","Value":""},{"Line":4,"Type":"if statement","Name":"","Condition":"a < 5","Value":""},{"Line":5,"Type":"for statement","Name":"","Condition":"i = 0;i < a;i++","Value":""},{"Line":6,"Type":"assignment expression","Name":"b","Condition":"","Value":"a - 1"},{"Line":7,"Type":"update expression","Name":"b","Condition":"","Value":"b+ 1"}]'
        );
    });

    it('is parsing an empty code correctly', () => {    //test 10
        let parsed = parseCode('');
        assert.equal(
            JSON.stringify(start_parse(parsed)),
            '[]'
        );
    });

    /*it('is parsing a functioin example correctly', () => {    //test 11
        let parsed = parseCode('function toCelsius(fahrenheit) {\n' +
            '    return (5/9) * (fahrenheit-32);\n' +
            '}\n' +
            'document.getElementById("demo").innerHTML = toCelsius;');
        assert.equal(
            JSON.stringify(start_parse(parsed)),
            '[{"Line":1,"Type":"function declaration","Name":"toCelsius","Condition":"","Value":""},{"Line":1,"Type":"identifier","Name":"fahrenheit","Condition":"","Value":""},{"Line":2,"Type":"return statement","Name":"","Condition":"","Value":"5 / 9 * (fahrenheit - 32)"},{"Line":4,"Type":"assignment expression","Name":"document.getElementById(\'demo\').innerHTML","Condition":"","Value":"toCelsius"}]'
        );
    }); */
});
