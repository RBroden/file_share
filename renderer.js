// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


// operating system module
const os = require('os')
// file system module
const fs = require('fs')
// directory/path module
const path = require('path')
// declare file for tags
const tagsFile = "./onload/tags.json";

/*
  Begin tests for searching file system
*/
// get home directory
let homeDir = os.homedir()
console.log(homeDir)

// read home directory. returns array of files named files
fs.readdir(homeDir,(err,contents)=>{
  // contents is an array of directories/files from home directory
  console.log(contents)
  // end fs.readdir
});
/*
  End tests for searching file system
*/

exports.test = function(message){
  console.log("test"+message);
};

exports.onload = function(){
  fs.readFile(tagsFile, (err, data)=>{
    let tags = JSON.parse(data);
    let navElem = document.getElementById("wikiNav");
    for(let tag of tags){
      // update navigation
      // using backticks for multiple line string
      // better for html and allows template literals
      navElem.innerHTML += `
        <li>
          <span onclick="loadContent('${tag.value}')">
            ${tag.value}
          </span>
        </li>
        `;
    }
  });
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
    let limit = 10;
    let count = 0;

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
        <li>
          <span onclick="loadContent('${wikiTag.value}')">
            ${wikiTag.value}
          </span>
        </li>
        `;
    }

    fs.writeFile(
      tagsFile,
      JSON.stringify(wikiTags),
      function(err) {
        if(err) {
            console.log(err);
        }

        console.log("The wiki tags were saved!");
    });

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

exports.generateWikiContent = function(){
  console.log('generateContent');

  // get tags - use readFileSync for synchronous readFile
  // this is to prevent callbacks and nothing can be done
  // until this is done
  fs.readFile(tagsFile, (err, data)=>{
    let tags = JSON.parse(data);
    fs.readdir("./analyzedDocuments",(err,files)=>{
      for(let tag of tags){

        let tagFile = {
          name: tag.value,
          content: []
        };

        for(let file of files){

          // check if file is json
          if(file.substring(file.length - 5) == '.json'){
            // load document
            let document = require("./analyzedDocuments/"+file);

            if(document.hasOwnProperty('content')){
              let sentences = document.content.split(/[\.!\?]+/);
              for(let sentence of sentences){
                if(sentence.toLowerCase().indexOf(tag.value)!=-1){
                  tagFile.content.push(sentence);
                }
              }
            }


            // end if json condition
          }
          // end file iteration
        }

        //console.log(tagFile);

        // write tag content file
        fs.writeFile(
          './onload/previews/'+tag.value+'.json',
          JSON.stringify(tagFile),
          function(err) {
            if(err) {
                console.log(err);
            }

            console.log("The "+tag.value+" tag file was saved!");
        });

        // end of tag iteration
      }

      // end of read analyzedDocuments directory
    });
    // end of read tagsFile
  });

};
