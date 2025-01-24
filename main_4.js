const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;
const t = require('@babel/types');


function deobfuscateCode(code) {
  // Parse the JavaScript code into an AST
  const ast = parser.parse(code, {
    sourceType: 'script', // Use 'module' for ES modules
  });

  // Traverse and modify the AST
  traverse(ast, {
    FunctionDeclaration(path) {
      handleFunction(path);
    },
    FunctionExpression(path) {
      handleFunction(path);
    },
  });

  // Generate the new code from the transformed AST
  const output = generator(ast, { compact: false }).code;

  return output;
}

function handleFunction(path) {
  const newStatements = [];

  path.node.body.body.forEach(node => {
    // Check for function calls
    if (
      t.isExpressionStatement(node) &&
      t.isCallExpression(node.expression)
    ) {
      const newAssignments = [];

      // Handle inline assignments in function call arguments
      node.expression.arguments = node.expression.arguments.map(arg => {
        if (t.isAssignmentExpression(arg)) {
          // Create a standalone assignment for each inline assignment
          newAssignments.push(t.expressionStatement(arg));
          return arg.left; // Replace the assignment with the identifier
        }
        return arg;
      });

      // Add the new assignments before the function call
      newStatements.push(...newAssignments);
    }

    // Add the current statement (function call or other statement)
    newStatements.push(node);
  });

  // Replace the function body with the new list of statements
  path.node.body.body = newStatements;
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


