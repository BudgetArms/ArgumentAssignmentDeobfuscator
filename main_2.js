const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;
const t = require('@babel/types');

function deobfuscateCode(code) {
  // Step 1: Parse the JavaScript code into an AST
  const ast = parser.parse(code, {
    sourceType: 'script', // You can set 'module' if working with ES modules
  });

  // Step 2: Traverse the AST to manipulate function nodes
  traverse(ast, {
    FunctionDeclaration(path) {
      // Remove assignments and variable declarations inside the function body
      path.node.body.body = path.node.body.body.filter(node => {
        // Keep all non-assignment/non-variable-declaration nodes
        return !(
          t.isVariableDeclaration(node) ||
          (t.isExpressionStatement(node) &&
            t.isAssignmentExpression(node.expression))
        );
      });
    },
    FunctionExpression(path) {
      // Similar logic for function expressions
      path.node.body.body = path.node.body.body.filter(node => {
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
function example() {
  var a = 10, b = 20;
  c = a + b;
  console.log(c); // Do not remove this
}
example();
`;

console.log('Deobfuscated Code:');
console.log(deobfuscateCode(obfuscatedCode));


