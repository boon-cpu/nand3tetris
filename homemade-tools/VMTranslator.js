const fs = require("fs");
const file = "/../07/MemoryAccess/StaticTest/StaticTest";
const fileName = file.split("/");

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
};

const segmentCodes = {
  local: "LCL",
  argument: "ARG",
};

const logicOps = ["add", "sub", "neg", "eq", "gt", "lt", "and", "or", "not"];
const memoryOps = ["push", "pop"];
const segmentsGeneral = ["pointer", "static", "temp"];

let translated = [];

fs.readFile(
  __dirname + file + ".vm",
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
        translated.push(logics[operation]);
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
  }
);
