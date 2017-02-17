// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


// operating system module
const os = require('os')
// file system module
const fs = require('fs')
// directory/path module
const path = require('path')
// jquery
const $ = require('jquery')
// declare file for tags
const tagsFile = "./onload/tags.json";

/*
  Begin tests for searching file system
  This will be part of the module that will
  go through a client/server system and analyze documents
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

/*
  Begin Timed Background Processes
  Below is a background process for monitoring OS
  Seperate background processes can be made for
  updating files
*/
var backgroundTimer = setInterval(()=>{
  /*
    Get date/time
    Use this to activate scheduled processes
  */
  let now = new Date();
  /*
    Get system information
    Use this to determine whether or not to stop
    a process
  */
  // get system free memory
  let freeMemory = os.freemem();
  // get system total memory
  let totalMemory = os.totalmem();
  let freeMemoryPercent = freeMemory/totalMemory;
  $('#compFreeMemory').html(`
      <div>
        <span>Free Memory: ${freeMemory} / ${totalMemory}<span> |
        <span>Today: ${(now.getMonth()+1)}/${now.getDate()}/${now.getFullYear()} </span>
        <span>${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}</span>
      </div>
      <div style="display:inline-block;width:300px;height:20px;background:#333;">
        <span style="display:inline-block;width:${300*freeMemoryPercent}px;height:20px;text-align:right;color:#fff;background:#090;">
          ${(freeMemoryPercent*100).toFixed(2)}%
        </span>
      </div>
    `);

},50);
// End Timed Background Processes

// Begin Watching analyzedDocuments Directory
/*
  Certain events will be used to update files for app
  Adding a file triggers a rename and change event
  However, for adding documents through the apps
  we should update the files for the app during that process
*/
fs.watch('./analyzedDocuments', (eventType, filename) => {
  console.log(`analyzedDocuments event: ${eventType} for ${filename}`);
});
// End Watching analyzedDocuments Directory

// test message does nothing
exports.test = function(message){
  console.log("test"+message);
};

/*
  This function is used when the app starts
*/
exports.onload = function(){
  // read tags file
  fs.readFile(tagsFile, (err, data)=>{
    // parse JSON from tags file
    let tags = JSON.parse(data);
    let navElem = document.getElementById("wikiNav");
    let count = 0;
    // iterate through tags
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
      // only show 15 tags
      if(++count > 15) break;
    }
  });
};

// writes input to a file in analyzedDocuments directory
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

// writes common words to a file
// currently triggered by user
// should be background process
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

// writes tags to a wiki nav file
// currently triggered by user
// should be background process
exports.generateWikiNav = function(){
  console.log("generateWikiNav");
  fs.readdir("./analyzedDocuments",(err,files)=>{
    // assign element #fileList to variable
    let navElem = document.getElementById("wikiNav");
    // array of wiki tags
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
            // count occurences of tag in document
            let occurences = (()=>{
              // document has content
              if(document.hasOwnProperty('content')){
                // create regular expression to find tag in string
                let tagSearch = new RegExp(tag, 'g');
                return (
                  // use tagSearch regular expression
                  // to find tag in document content
                  // return length of array of matches
                  // will return 0 if none because of OR
                  document.content
                    .toLowerCase()
                    .match(tagSearch) || []
                ).length;
              }
              // document has no content
              return 0;
            })();
            // update wiki tag list
            updateWikiTags(tag, occurences);
          }
        }
      }
      // end file iteration
    }

    // sort wiki tags by occurences
    wikiTags.sort((a,b)=>{
      return parseInt(b.total) - parseInt(a.total);
    });

    // sort wiki tags by count
    wikiTags.sort((a,b)=>{
      return parseInt(b.tagCount) - parseInt(a.tagCount);
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
    function updateWikiTags(tag, occurences){
      // search for tag
      // if found, update tag
      for(let i = 0; i < wikiTags.length; ++i){
        if(wikiTags[i].value == tag){
          ++wikiTags[i].tagCount;
          wikiTags[i].total += occurences;
          return;
        }
      }
      // if not found, add tag
      wikiTags.push(
        {
          value: tag,
          tagCount: 1,
          total: occurences
        }
      );
    }

    // end fs.readdir
  });
};

// writes relevant content to files by tag name
// currently triggered by user
// should be background process
exports.generateWikiContent = function(){
  console.log('generateContent');

  // get tags - use readFileSync for synchronous readFile
  // this is to prevent callbacks and nothing can be done
  // until this is done
  fs.readFile(tagsFile, (err, data)=>{
    let tags = JSON.parse(data);
    fs.readdir("./analyzedDocuments",(err,files)=>{
      // for each tag in tags file
      for(let tag of tags){

        // this is the object
        // that will be used for tag JSON file
        let tagFile = {
          name: tag.value,
          content: []
        };

        // iterate through files in analyzedDocuments
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
