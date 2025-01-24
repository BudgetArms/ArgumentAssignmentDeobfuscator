const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;
const t = require('@babel/types');

function deobfuscateCode(code) {
  // Step 1: Parse the JavaScript code into an AST
  const ast = parser.parse(code, {
    sourceType: 'script', // Change to 'module' for ES modules
  });

  // Step 2: Traverse the AST to manipulate function nodes
  traverse(ast, {
    FunctionDeclaration(path) {
      // Remove assignments from the parameter list
      path.node.params = path.node.params.map(param => {
        if (t.isAssignmentPattern(param)) {
          return param.left; // Replace with the identifier
        }
        return param; // Retain other parameters
      });

      // Remove variable declarations and inline assignments
      path.node.body.body = path.node.body.body.map(node => {
        if (
          t.isExpressionStatement(node) &&
          t.isCallExpression(node.expression)
        ) {
          // Remove assignments in function call arguments
          node.expression.arguments = node.expression.arguments.map(arg => {
            if (t.isAssignmentExpression(arg)) {
              return arg.left; // Replace assignment with the left-hand side
            }
            return arg;
          });
        }
        return node; // Retain other nodes
      }).filter(node => {
        // Remove standalone assignments and variable declarations
        return !(
          t.isVariableDeclaration(node) ||
          (t.isExpressionStatement(node) &&
            t.isAssignmentExpression(node.expression))
        );
      });
    },
    FunctionExpression(path) {
      // Same logic for function expressions
      path.node.params = path.node.params.map(param => {
        if (t.isAssignmentPattern(param)) {
          return param.left;
        }
        return param;
      });

      path.node.body.body = path.node.body.body.map(node => {
        if (
          t.isExpressionStatement(node) &&
          t.isCallExpression(node.expression)
        ) {
          node.expression.arguments = node.expression.arguments.map(arg => {
            if (t.isAssignmentExpression(arg)) {
              return arg.left;
            }
            return arg;
          });
        }
        return node;
      }).filter(node => {
        return !(
          t.isVariableDeclaration(node) ||
          (t.isExpressionStatement(node) &&
            t.isAssignmentExpression(node.expression))
        );
      });
    },
  });

  // Step 3: Generate new code from the modified AST
  const output = generator(ast, { compact: false }).code;

  return output;
}



// Example usage
const obfuscatedCode = `

var Array1,
  Array2,
  Function9,
  index1,
  Function5,
  index6,
  Function6,
  index7,
  index0,
  Function7;

function Function20() {
  Function20 = function () {  };
}

function Function1(Array1) {
  var Array2 =
    'CpXAiS:ax]IuPD#5;0kvs1HEQlV*2ZfoF%UJ)7KWLh_+|Rr(NbT,Y>B}<d@e~^yMq6g{9m.?nGc[!/8=tj3w"4&$zO';
  var Function9, index1, Function5, index6, Function6, index7, index0;

  Function20(
    (Function9 = '' + (Array1 || '')),
    (index1 = Function9.length),
    (Function5 = []),
    (index6 = 0),
    (Function6 = 0),
    (index7 = -1)
  );

  console.log('Array2: ', Array2);
 
}


(function() 
{
console.log("TESTING");
Function1();


})

`;

console.log('Deobfuscated Code:');
console.log(deobfuscateCode(obfuscatedCode));


