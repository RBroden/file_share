// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.



// file system module
const fs = require('fs')


// read directory /share. returns array of files named files
fs.readdir("./share",(err,files)=>{
  console.log(files)
  // assign element #fileList to variable
  var list = document.getElementById("fileList");

  // iterate through files array
  for(let file of files){
    // output file name to element #fileList
    list.innerHTML += "<li>"+file+"</li>";
  }

  // end fs.readdir
});

exports.test = function(message){
  console.log("test"+message);
};
