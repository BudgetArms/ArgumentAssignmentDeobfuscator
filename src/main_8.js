const fs        = require("fs");
const path      = require('path');
const parser    = require("@babel/parser");
const traverse  = require("@babel/traverse").default;
const generator = require("@babel/generator").default;
const t         = require("@babel/types");


function DeobfuscateCode(code) 
{
    const ast = parser.parse(code, { sourceType: "script",  } ); // 'module' for ES6+ modules

    traverse(ast, 
    {
        // When a function get called:
        FunctionDeclaration(path) 
        {
            path.node.params = path.node.params.map(param => 
            {
                if (t.isAssignmentPattern(param))
                    return param.left; // Remove assignments from parameter list

                return param;
            });

            // Move assignment arguments out of calls, and remove unwanted calls
            path.node.body.body = path.node.body.body.filter(node =>
            {
                if (t.isExpressionStatement(node) && t.isCallExpression(node.expression)) 
                {
                    const call = node.expression;
                    let containsOnlyAssignments = true;
                  
                    // Check if the call arguments are pure assignment expressions
                    // e.g. only based on 
                    call.arguments.forEach(arg => {
                        if(!t.isAssignmentExpression(arg) && !t.isLiteral(arg) && !t.isIdentifier(arg)) 
                            containsOnlyAssignments = false;
                    });
                        
                    if (containsOnlyAssignments) 
                    {
                        // Create individual assignment statements for each argument
                        call.arguments.forEach(arg => 
                        {
                            if (t.isAssignmentExpression(arg))
                                path.insertBefore(t.expressionStatement(arg));
                        });

                        // Remove the call entirely
                        return false; 
                    }
                }

                // what does this do??
                return true;
            });
    },

    // what is this?
    FunctionExpression(path) 
    {
        path.node.params = path.node.params.map(param => 
        {
            if (t.isAssignmentPattern(param))
                return param.left;

            return param;
        });


        path.node.body.body = path.node.body.body.filter(node => 
        {
            if (t.isExpressionStatement(node) && t.isCallExpression(node.expression)) 
            {
                const call = node.expression;
                let containsOnlyAssignments = true;

                call.arguments.forEach(arg => {
                    if (!t.isAssignmentExpression(arg) && !t.isLiteral(arg) && !t.isIdentifier(arg) ) 
                        containsOnlyAssignments = false;
                });

                if (containsOnlyAssignments) 
                {
                    call.arguments.forEach(arg => 
                    {
                        if (t.isAssignmentExpression(arg))
                            path.insertBefore(t.expressionStatement(arg));
                    });

                    return false;
                }

            }
            return true;
        });
    },
  });

  return generator(ast, { compact: false }).code;
}



function WriteOutputWithIncrement(baseName, code) 
{
  try 
  {
    // set output directory
    const outDir = path.join(__dirname, '..', 'out'); 
    console.log('Output directory:', outDir); 
    
    // Create the output directory if it doesn't exist
    if (!fs.existsSync(outDir))
      fs.mkdirSync(outDir);

    
    let countIndex = 0;
    let outputFileName = path.join(outDir, `${baseName}_${countIndex}.js`);

    // Increment the countIndex if file already exists
    while (fs.existsSync(outputFileName)) 
    {
      countIndex++;
      outputFileName = path.join(outDir, `${baseName}_${countIndex}.js`);
    }
  
    // Write the code to the output file
    fs.writeFileSync(outputFileName, code);
    return outputFileName;
  }
  catch (error) 
  {
    console.log("ERROR: ", error); 
    process.exit(-1);
  }

}


function ProcessFile(inputFile) 
{
  try 
  {
    if (!fs.existsSync(inputFile)) 
    {
      console.error(`Error: Input file '${inputFile}' not found.`);
      return;
    }

    const code = fs.readFileSync(inputFile, "utf-8");
    const deobfuscatedCode = DeobfuscateCode(code);

    const outputFileName = WriteOutputWithIncrement("output", deobfuscatedCode);
    console.log(`Deobfuscation complete! Output written to '${outputFileName}'.`);
  
  } 
  catch (err) 
  {
    console.error("An error occurred:", err.message);
  }

}

if (require.main === module) 
{
  const inputFile = process.argv[2];
  if (!inputFile) 
  {
    console.error("Usage: node deobfuscator.js <input_file>");
    process.exit(1);
  }

  ProcessFile(inputFile);

}


