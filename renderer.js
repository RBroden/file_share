// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const fs = require('fs')

fs.readdir("./share",(err,files)=>{
  console.log(files)
  var list = document.getElementById("fileList");
  for(let file of files){
    list.innerHTML += "<li>"+file+"</li>";
  }
});
