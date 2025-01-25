const fs = require("fs");
const path = require('path');
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generator = require("@babel/generator").default;
const t = require("@babel/types");


function DeobfuscateCode(code) {
    const ast = parser.parse(code, {
        sourceType: "script", // 'module' for ES6+ modules
    });

    // Step 1: Identify empty functions and single-assignment variables
    const emptyFunctions = new Set();
    const variableAssignments = new Map();

    traverse(ast, {
        FunctionDeclaration(path) {
            if (path.node.body.body.length === 0) {
                emptyFunctions.add(path.node.id.name);
            }
        },
        VariableDeclarator(path) {
            if (
                t.isIdentifier(path.node.id) &&
                t.isCallExpression(path.node.init) &&
                t.isIdentifier(path.node.init.callee)
            ) {
                // Map variable to the function it calls
                variableAssignments.set(path.node.id.name, path.node.init.callee.name);
            }
        },
    });

    // Step 2: Replace empty functions with their argument assignments
    traverse(ast, {
        CallExpression(path) {
            const calleeName = path.node.callee.name;
            if (emptyFunctions.has(calleeName)) {
                // Check if the variable being called is a known variable with a single assignment
                const assignedVariable = [...variableAssignments.entries()].find(
                    ([variable, functionName]) => functionName === calleeName
                );

                if (assignedVariable) {
                    const [variable, functionName] = assignedVariable;
                    const args = path.node.arguments;

                    // Insert assignments in place of the function call
                    const assignmentStatements = args.map((arg, index) => {
                        const paramName = `param${index + 1}`;
                        return t.expressionStatement(
                            t.assignmentExpression("=", t.identifier(paramName), arg)
                        );
                    });

                    path.replaceWithMultiple(assignmentStatements);
                }
            }
        },
    });

    return generator(ast, { compact: false }).code;
}


function WriteOutputWithIncrement(baseName, code) {
    try {
        // set output directory
        const outDir = path.join(__dirname, '..', 'out');
        console.log('Output directory:', outDir);

        // Create the output directory if it doesn't exist
        if (!fs.existsSync(outDir))
            fs.mkdirSync(outDir);


        let countIndex = 0;
        let outputFileName = path.join(outDir, `${baseName}_${countIndex}.js`);

        // Increment the countIndex if file already exists
        while (fs.existsSync(outputFileName)) {
            countIndex++;
            outputFileName = path.join(outDir, `${baseName}_${countIndex}.js`);
        }

        // Write the code to the output file
        fs.writeFileSync(outputFileName, code);
        return outputFileName;
    }
    catch (error) {
        console.log("ERROR: ", error);
        process.exit(-1);
    }

}


function ProcessFile(inputFile) {
    try {
        if (!fs.existsSync(inputFile)) {
            console.error(`Error: Input file '${inputFile}' not found.`);
            return;
        }

        const code = fs.readFileSync(inputFile, "utf-8");
        const deobfuscatedCode = DeobfuscateCode(code);

        const outputFileName = WriteOutputWithIncrement("output", deobfuscatedCode);
        console.log(`Deobfuscation complete! Output written to '${outputFileName}'.`);

    }
    catch (err) {
        console.error("An error occurred:", err.message);
    }

}

if (require.main === module) {
    const inputFile = process.argv[2];
    if (!inputFile) {
        console.error("Usage: node deobfuscator.js <input_file>");
        process.exit(1);
    }

    ProcessFile(inputFile);

}


