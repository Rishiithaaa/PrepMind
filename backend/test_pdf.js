const pdf = require("pdf-parse");
console.log("Type of pdf:", typeof pdf);
console.log("PDF keys:", Object.keys(pdf));
if (typeof pdf === 'function') {
    console.log("PDF is a function");
} else {
    console.log("PDF is NOT a function");
}
