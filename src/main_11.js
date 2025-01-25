const fs = require("fs");
const path = require('path');
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generator = require("@babel/generator").default;
const t = require("@babel/types");






function DeobfuscateCode(code) {
    const ast = parser.parse(code, {
        sourceType: "script",
    });

    traverse(ast, {
        // When a variable is assigned to an empty function (e.g. FunctionEmpty)
        AssignmentExpression(path) {
            const { left, right } = path.node;
            // Check if the right side is an empty function call
            if (
                t.isCallExpression(right) &&
                t.isIdentifier(right.callee) &&
                right.callee.name === "FunctionEmpty" &&
                right.arguments.length > 0
            ) {
                // Replace the assignment with the arguments inside the function call
                const [firstArg, ...restArgs] = right.arguments;
                if (t.isAssignmentExpression(firstArg)) {
                    // Deconstruct assignments and place them directly in the code
                    restArgs.unshift(firstArg); // Push assignments to the front of the arguments list
                }

                // Remove the FunctionEmpty assignment, now replaced with direct assignments
                path.replaceWithMultiple(restArgs); // This will insert the assignment directly into the code
            }
        },

        // When we have a call to an empty function
        CallExpression(path) {
            const { callee, arguments: args } = path.node;

            // Check if the callee is FunctionEmpty
            if (t.isIdentifier(callee) && callee.name === "FunctionEmpty") {
                // Replace the function call with the assignments directly
                path.replaceWithMultiple(args);
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

        fs.writin
        // Write the code to the output file        fs.writeFileSync(outputFileName, "//\tCreated by BudgetArms \n");
        fs.writeFileSync(outputFileName, "//\tCreated by BudgetArms \n");
        fs.appendFileSync(outputFileName, `//\tGenerated from File: ${ path.basename(__filename) } \n\n\n`);
        fs.appendFileSync(outputFileName, code);
        
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


