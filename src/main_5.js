const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;
const t = require('@babel/types');

function deobfuscateCode(code) {
  const ast = parser.parse(code, {
    sourceType: 'script',
  });

  traverse(ast, {
    FunctionDeclaration(path) {
      handleFunction(path);
    },
    FunctionExpression(path) {
      handleFunction(path);
    },
  });

  const output = generator(ast, { compact: false }).code;
  return output;
}

function handleFunction(path) {
  const newStatements = [];

  path.node.body.body.forEach(node => {
    if (
      t.isExpressionStatement(node) &&
      t.isCallExpression(node.expression)
    ) {
      const newAssignments = [];
      node.expression.arguments = node.expression.arguments.map(arg => {
        if (t.isAssignmentExpression(arg)) {
          newAssignments.push(t.expressionStatement(arg));
          return arg.left;
        }
        return arg;
      });
      newStatements.push(...newAssignments);
    }
    newStatements.push(node);
  });

  path.node.body.body = newStatements;
}

function writeOutputWithIncrement(baseOutputName, content) {
  let counter = 1;
  let outputPath;

  do {
    outputPath = path.resolve(`${baseOutputName}_${counter}.js`);
    counter++;
  } while (fs.existsSync(outputPath));

  fs.writeFileSync(outputPath, content, 'utf-8');
  return outputPath;
}

function processFile(inputPath) {
  try {
    const inputCode = fs.readFileSync(inputPath, 'utf-8');
    console.log(`Successfully read file: ${inputPath}`);

    const deobfuscatedCode = deobfuscateCode(inputCode);

    const outputPath = writeOutputWithIncrement('output', deobfuscatedCode);
    console.log(`Deobfuscated code written to: ${outputPath}`);
  } catch (error) {
    console.error(`Error processing file: ${error.message}`);
  }
}

// Example Usage: Node.js command-line arguments
const inputFilePath = process.argv[2];
if (inputFilePath) {
  processFile(inputFilePath);
} else {
  console.error('Please provide an input file path as the first argument.');
}



