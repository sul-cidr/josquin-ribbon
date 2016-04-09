// This script converts the JSON piano roll format
// into a more compact CSV representation.
//
// File sizes:
//   Jos2721-La_Bernardina.json 53 KB
//   Jos2721-La_Bernardina.csv  8 KB
//
// Command to create the CSV file:
//   node jsonNotesToCSV.js Jos2721-La_Bernardina.json > Jos2721-La_Bernardina.csv
//
// By Curran Kelleher (curran.kelleher@gmail.com)
// April 2016

var fs = require("fs");

var inFileName = process.argv[2];
var jsonStr = fs.readFileSync(inFileName, "utf8");

var prollData = JSON.parse(jsonStr);

var data = [];
prollData.partdata.forEach(function (part){
  var voice = prollData.partnames[part.partindex];
  part.notedata.forEach(function (note){
    data.push({
      pitch: note.pitch.b7,
      time: note.starttime[0],
      duration: note.duration[0],
      voice: voice
    });
  });
});

console.log(toCSV(data));

function toCSV(data){
  var columns = Object.keys(data[0]);
  return [columns.join(",")].concat(data.map(function(d){
    return columns.map(function(column){
      return d[column];
    }).join(",");
  })).join("\n");
}
