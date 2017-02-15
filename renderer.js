// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.



// file system module
const fs = require('fs')


// read directory /share. returns array of files named files
/*
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
*/

exports.test = function(message){
  console.log("test"+message);
};

exports.saveAnalyzedDocument = function(document){
  var timeInMs = String(Date.now());
  fs.writeFile(
    "./analyzedDocuments/"+timeInMs+".json",
    JSON.stringify(document),
    function(err) {
      if(err) {
          return console.log(err);
      }

      console.log("The file was saved!");
  });
};

exports.generateCommonWords = function(commonWords){
  fs.writeFile(
    "./onload/commonWords.json",
    JSON.stringify(commonWords),
    function(err) {
      if(err) {
          return console.log(err);
      }

      console.log("The common words were saved!");
  });
};

exports.generateWikiNav = function(){
  console.log("generateWikiNav");
  fs.readdir("./analyzedDocuments",(err,files)=>{
    // assign element #fileList to variable
    let navElem = document.getElementById("wikiNav");
    let wikiTags = [];

    // clear wikiNav innerHTML for new listens
    navElem.innerHTML = "";

    // iterate through files array
    for(let file of files){
      // check if file is json
      if(file.substring(file.length - 5) == '.json'){
        // load document
        let document = require("./analyzedDocuments/"+file);
        // check if document has tags
        if(document.hasOwnProperty('tags')){
          // iterate through document tags
          for(let tag of document.tags){
            // update wiki tag list
            updateWikiTags(tag);
          }
        }
      }
      // end file iteration
    }

    // sort wiki tags by count
    wikiTags.sort((a,b)=>{
      return parseInt(b.count) - parseInt(a.count);
    });
    // review wiki tags in console
    console.log(wikiTags);
    // update wiki nav element
    for(let wikiTag of wikiTags){
      // update navigation
      // using backticks for multiple line string
      // better for html and allows template literals
      navElem.innerHTML += `
        <li><a>${wikiTag.value}</a></li>
        `;
    }

    // function for updating wiki tag list
    function updateWikiTags(tag){
      for(let i = 0; i < wikiTags.length; ++i){
        if(wikiTags[i].value == tag){
          ++wikiTags[i].count;
          return;
        }
      }
      wikiTags.push(
        {
          value: tag,
          count: 1
        }
      );
    }

    // end fs.readdir
  });
};
