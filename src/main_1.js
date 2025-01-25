const acorn = require('acorn');

// JavaScript code to parse
const code = `const x = 42; console.log(x); (function(){console.log("YES");}()); console.log("FIREEEEE");`;

// Parse code into an AST
const ast = acorn.parse(code, { ecmaVersion: 'latest' });

// Log the AST
console.log(ast);




console.log("NICE?");