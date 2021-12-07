// prettier-ignore
dest={'':'000','M':'001','D':'010','MD':'011','A':'100','AM':'101','AD':'110','AMD':'111'};
// prettier-ignore
jump={'':'000','JGT':'001','JEQ':'010','JGE':'011','JLT':'100','JNE':'101','JLE':'110','JMP':'111'};
// prettier-ignore
comp={'0':'0101010','1':'0111111','-1':'0111010','D':'0001100','A':'0110000','M':'1110000','!D':'0001101','!A':'0110001','!M':'1110001','-D':'0001111','-A':'0110011','-M':'1110011','D+1':'0011111','A+1':'0110111','M+1':'1110111','D-1':'0001110','A-1':'0110010','M-1':'1110010','D+A':'0000010','D+M':'1000010','D-A':'0010011','D-M':'1010011','A-D':'0000111','M-D':'1000111','D&A':'00000000','D&M':'1000000','D|A':'0010101','D|M':'1010101'};
// prettier-ignore
symbols={'SP':0,'LCL':1,'ARG':2,'THIS':3,'THAT':4,'SCREEN':16384,'KBD':24576,'R0':0,'R1':1,'R1':1,'R2':2,'R3':3,'R4':4,'R5':5,'R6':6,'R7':7,'R8':8,'R9':9,'R10':10,'R11':11,'R12':12,'R13':13,'R14':14,'R15':15};
const fs = require("fs");
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Relative file path:", (file) => {
  fs.writeFile(`${file}.hack`, "", { encoding: "utf-8" }, () => {});
  fs.readFile(`${file}.asm`, { encoding: "utf-8" }, (_err, data) => {
    const lines = data.split("\n");
    const clean = [];
    const asm = [];
    lines.forEach((line) => {
      const cleanLine = line.replace(/\/\/.*/g, "").replace(/\s/g, "");
      if (cleanLine) clean.push(cleanLine);
    });
    let lineNo = 0;
    clean.forEach(async (line) => {
      if (line[0] == "(") {
        const instruction = line.slice(1).substring(0, line.length - 2);
        symbols[instruction] = lineNo;
        lineNo--;
      }
      lineNo++;
    });
    let iterator = 0;
    clean.forEach(async (line) => {
      if (line[0] == "@") {
        const instruction = line.slice(1);
        if (symbols[instruction] != undefined) {
          const binary = ((symbols[instruction] + 32768) >>> 0).toString(2);
          asm.push("0" + binary.slice(1));
        } else if (!isNaN(instruction)) {
          const binary = ((parseInt(instruction) + 32768) >>> 0).toString(2);
          asm.push("0" + binary.slice(1));
        } else {
          const binary = ((iterator + 16 + 32768) >>> 0).toString(2);
          asm.push("0" + binary.slice(1));
          symbols[instruction] = iterator + 16;
          iterator++;
        }
      } else if (line[0] != "(") {
        let ops = [];
        const separated = line.split(/=|;/g);
        if (line.includes("=") && line.includes(";")) {
          ops = comp[separated[1]] + dest[separated[0]] + jump[separated[2]];
        } else if (line.includes("=")) {
          ops = comp[separated[1]] + dest[separated[0]] + "000";
        } else if (line.includes(";")) {
          ops = comp[separated[0]] + "000" + jump[separated[1]];
        }
        asm.push("111" + ops);
      }
    });
    fs.writeFileSync(`${file}.hack`, asm.join("\n"), { encoding: "utf-8" });
    console.log("I compiled your code mate");
    rl.close();
  });
});
