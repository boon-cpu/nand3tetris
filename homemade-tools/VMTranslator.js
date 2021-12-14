const fs = require("fs");
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const commands = {
  push: {
    general: `@[THETHETHE]
D=M
@SP
A=M
M=D
@SP
M=M+1
`,
    constant: `@[THETHETHE]
D=A
@SP
A=M
M=D
@SP
M=M+1
`,
    segmentsa: `@[NAME]
D=A
@[SEGMENT]
A=M
D=D+A
A=D
D=M
@SP
A=M
M=D
@SP
M=M+1
`,
  },
  pop: {
    general: `@SP
M=M-1
A=M
D=M
@[THETHETHE]
M=D
`,
    segmentsa: `@[NAME]
D=A
@[SEGMENT]
A=M
D=D+A
@[SEGMENT]
M=D
@SP
M=M-1
A=M
D=M
@[SEGMENT]
A=M
M=D
@[NAME]
D=A
@[SEGMENT]
A=M
D=A-D
@[SEGMENT]
M=D
`,
  },
};

const logics = {
  add: `@SP
AM=M-1
D=M
A=A-1
M=M+D
`,
  sub: `@SP
AM=M-1
D=M
A=A-1
M=M-D
`,
  neg: `@SP
A=M-1
M=-M
`,
  not: `@SP
A=M-1
M=!M
`,
  or: `@SP
AM=M-1
D=M
A=A-1
M=M|D
`,
  and: `@SP
AM=M-1
D=M
A=A-1
M=M&D
`,
  eq: `@SP
AM=M-1
D=M
A=A-1
D=M-D
M=-1
@JUMP[iter]
D;JEQ
@SP
A=M-1
M=0
(JUMP[iter])
`,
  gt: `@SP
AM=M-1
D=M
A=A-1
D=M-D
M=-1
@JUMP[iter]
D;JGT
@SP
A=M-1
M=0
(JUMP[iter])
`,
  lt: `@SP
AM=M-1
D=M
A=A-1
D=M-D
M=-1
@JUMP[iter]
D;JLT
@SP
A=M-1
M=0
(JUMP[iter])
`,
};

const segmentCodes = {
  local: "LCL",
  argument: "ARG",
};

const logicOps = ["add", "sub", "neg", "eq", "gt", "lt", "and", "or", "not"];
const memoryOps = ["push", "pop"];
let iter = 0;

let translated = [];
rl.question("Relative file path:", (file) => {
  const fileName = file.split("/");
  fs.readFile(
    `${__dirname + file}.vm`,
    { encoding: "utf-8" },
    async (err, data) => {
      if (err) console.log(err);
      const lines = data.replace(/\/\/.*/g, "").split("\n");
      lines.forEach((line, index) => {
        const clean = line.trim();
        if (!clean) return;
        translated.push("// " + clean);
        const instructs = clean.split(" ");
        const [operation, segment, addr] = instructs;
        if (logicOps.includes(operation)) {
          if (operation == "gt" || operation == "lt" || operation == "eq")
            iter++;
          translated.push(logics[operation].replace(/\[iter\]/g, iter));
        } else if (memoryOps.includes(operation)) {
          if (segment == "pointer") {
            translated.push(
              commands[operation].general.replace(
                "[THETHETHE]",
                addr == "1" ? "THAT" : "THIS"
              )
            );
          } else if (segment == "static") {
            translated.push(
              commands[operation].general.replace(
                "[THETHETHE]",
                fileName[fileName.length - 1] + "." + addr
              )
            );
          } else if (segment == "temp") {
            translated.push(
              commands[operation].general.replace("[THETHETHE]", 5 + addr * 1)
            );
          } else if (segment == "constant") {
            translated.push(
              commands[operation].constant.replace("[THETHETHE]", addr)
            );
          } else {
            translated.push(
              commands[operation].segmentsa
                .replace(/\[NAME\]/g, addr)
                .replace(
                  /\[SEGMENT\]/g,
                  segmentCodes[segment] || segment.toUpperCase()
                )
            );
          }
        } else
          throw new SyntaxError(
            `Syntax Error on line ${
              index + 1
            }, "${operation}" not a valid operation.`
          );
      });
      await fs.writeFileSync(__dirname + file + ".asm", translated.join("\n"));
      console.log("You've absolutely been VMTranslated!");
      rl.close();
    }
  );
});
