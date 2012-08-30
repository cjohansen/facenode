var fs = require("fs");

console.log("Before reading file");

fs.readFile("file.txt", "utf-8", function (err, data) {
    console.log("File", data);
});

console.log("Matematiske beregninger", 2+4);
console.log("After reading file");