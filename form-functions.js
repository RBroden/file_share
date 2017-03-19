// rob's branch
const renderer = require('./renderer.js')
const $ = require('jquery')

// onload process
renderer.onload()

/*
 * Use select element #inputType to change view of input
*/
// assign select element #inputType to variable
let selectInputType = document.getElementById("inputType");
// assign input element #inputText to variable
let inputTextArea = document.getElementById("inputTextArea");
let inputText = document.getElementById("inputText");
// assign input element #inputUrl to variable
let inputUrlArea = document.getElementById("inputUrlArea");
// assign input element #inputDocument to variable
let inputDocumentArea = document.getElementById("inputDocumentArea");
// checkbox for developing commonWords
let inputDevelopCommonWords = document.getElementById("useFormForCommonWords");
// array of results from analyzing documents
let analyzedDocuments = [];
let commonWords = [];
let developCommonWords = false;
// load common words
$.ajax({
  url: './onload/commonWords.json'
}).done((response)=>{
  // will take a bit
  //console.log(response);
  commonWords = JSON.parse(response);
  console.log("on load common words");
  console.log(commonWords);
});
// HTML node types, for processURL
let nodeTypes = [];


// event listener for select #inputType onchange
selectInputType.addEventListener("change", function(){

  // display value for hiding elements
  let hideStyle = "none";
  let showStyle = "block";

  // change #inputText display to hideStyle
  inputTextArea.style.display = hideStyle;
  // change #inputUrl display to hideStyle
  inputUrlArea.style.display = hideStyle;
  // change #inputDocument display to hideStyle
  inputDocumentArea.style.display = hideStyle;
  // hide inputUrl's iframe
  $('#processUrl_iframe').hide();

  switch(selectInputType.value){
    case 'text':
      inputTextArea.style.display = showStyle;
      break;

    case 'url':
      inputUrlArea.style.display = showStyle;
      $('#processUrl_iframe').show();
      break;

    case 'document':
      inputDocumentArea.style.display = showStyle;
      break;
  }
});

// listens for change event on checkbox for useFormForCommonWords
inputDevelopCommonWords.addEventListener("change", function(){
  let developCommonWordsButtons = document.getElementById("developCommonWordsButtons");
  // use form for developing commonWords
  if(inputDevelopCommonWords.checked){
    developCommonWordsButtons.style.display = "block";
    developCommonWords = true;
  }
  else{
    developCommonWordsButtons.style.display = "none";
    developCommonWords = false;
  }
});

// form submission
function onSubmit(){

  switch(selectInputType.value){
    case 'text':
      processText();
      break;

    case 'url':
      processUrl();
      break;

    case 'document':
      //console.log("analyze document");
      break;
  }

  //console.log(analyzedDocuments);
  if(developCommonWords){
    commonWords = findCommonWords();
  }

  //console.log(commonWords);

  // keeps form from reloading page
  return false;
  // end onSubmit
}

// process textarea input
function processText(){
  let analyzedDocument = {
    words: [],
    wordCount: 0,
    tags: []
  };
  // assign value of input #inputText to variable
  let input = inputText.value;
  let text = input.toLowerCase();
  // split text into sentences by .,!, and ?
  let sentences = text.split(/[\.,!\?]+/);
  // iterate sentences to create results
  for(let sentence of sentences){
    // split sentence into words
    let sentenceWords = sentence.split(' ');
    // itereate over words
    for(let word of sentenceWords){
      // update analyzedDocument words array
      // NEEDS SANITIZATION
      if(checkWord(word)){
        updateWords(word);
      }
      // end of iterate words
    }
    // end of iterate sentences
  }

  // sort words descending by count
  analyzedDocument.words.sort((a,b)=>{
    return parseInt(b.count) - parseInt(a.count);
  });

  // Populate tags array
  if(commonWords.length > 0){
    let tagCount = 0;
    loop1:
    for(let i=0; i < analyzedDocument.words.length; ++i){
      //let tagAdd = false;
      if(analyzedDocument.tags.length == 5){
        break loop1;
      }
      loop2:
      for(let j=0; j< commonWords.length; ++j){
        if(analyzedDocument.words[i].value ==
          commonWords[j].value){
          //console.log("fount");
          //tagAdd = true;
          //break loop2;
          continue loop1;
        }
      }
      //if(!tagAdd){
        analyzedDocument.tags[tagCount] =
        analyzedDocument.words[i].value;
        ++tagCount;
      //}
    //iterate over words and search if !exists in commonWords
    //if it does not exist in commonWords add to tags
    }
  }

  //console.log(analyzedDocument);
  if(!developCommonWords){
    renderer.saveAnalyzedDocument(
      {
        "tags" : analyzedDocument.tags,
        "content" : input
      }
    );
  }

  // push analyzedDocument to analyzedDocuments
  analyzedDocuments.push(analyzedDocument);

  // search for word in array words
  function updateWords(word){
    analyzedDocument.wordCount++;
    for(let i = 0; i < analyzedDocument.words.length; i++){
      if(analyzedDocument.words[i].value == word){
        analyzedDocument.words[i].count++;
        return true;
      }
    }
    analyzedDocument.words.push(createWordObject(word));
  }
  // edit word
  // end of processText
}

function processUrl(){
  // $ == jquery, this is equal to
  // document.getElementById('inputUrl').value
  let url = $('#inputUrl').val();
  $.ajax({
    url: url
  }).done((response)=>{
    // will take a bit
    //console.log(response);
    let htmlString = response;
    let scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    let iframeRegex = /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi;
    let linkRegex = /<link([\w\W]+?)[\/]?>/gi;
    let imgRegex = /<img([\w\W]+?)[\/]?>/gi;
    let htmlClean = htmlString.replace(scriptRegex,"");
    htmlClean = htmlClean.replace(iframeRegex,"");
    htmlClean = htmlClean.replace(linkRegex,"");
    htmlClean = htmlClean.replace(imgRegex,"");
    renderer.saveURLDocument(htmlClean);

    let html = $.parseHTML(response);
    /*
    let page_content = $(response)
                        .clone()
                        .find("script,noscript,iframe")
                        .remove()
                        .end
                        .html();
    console.log(page_content);
    let $iframe = $('#processUrl_iframe');
    $iframe.ready(()=>{
      $iframe.contents().find("body").append("Test");
    });
    */
    // put url in iframe
    // possibly recreate document using stylesheets
    // in iframe rather than actually displaying the site in iframes
    // possibly save html to a file and then attempt to get stylesheets
    // from previous site. Once that is done. Add that temp page
    // to iframe and compute its styles
    //$('#processUrl_iframe').attr("src",url);
    // using the actual site, triggers all the scripts too
    // saving the file and then just using css will get the styles
    // however it won't render dom style changing scripts
    // an issue with displaying the site in an iframe is the site
    // can prevent this. recreating the page gets around that
    // we could also render scripts this way


    // show first element
    //console.log(html[0]);
    // go through each element node in html

    $.each( html, (i, el)=>{

      //processURL_node(el);

      // end of iterating through elements
    });

    //console.log(nodeTypes);

  });
  // end of processUrl
}

function tryThis(){
  //console.log("TRY this");
  let $iframe = $('#processUrl_iframe');

  //$iframe.contents().find("body").append("Test");
  /*
  $.each( $iframe.contents(), (i, el)=>{

    processURL_node(el);

    // end of iterating through elements
  });
  */
  //console.log($iframe.contents().find('body').contents());
  let iframeContents = $iframe.contents().find('body').contents();
  //console.log(iframeContents);
  for(let element of iframeContents){
    //console.log(element);
    processURL_node(element);
  }
  console.log(nodeTypes);
  renderer.saveAnalyzedURLDocument(nodeTypes);
  renderer.deleteURLDocument($iframe.attr('src'));
  // reset nodeTypes
  nodeTypes = [];

  /*
  $('#processUrl_iframe').contents().find('body').contents().each(()=>{
    console.log(this.nodeType);
    if(this.nodeType == 3){
      //processURL_node(this);
    }
  });
  */
  //processURL_node($iframe.contents().find('html'));
  /*
  $iframe.contents().contentWindow.each(()=>{
    console.log(this);
    //processURL_node(el);
  });
  */
}

// begining of parseURL function library
// eventually make this its own file
function processURL_node(el){
  //console.log(el.nodeName);
  // search nodeTypes (global) array for nodeName
  // if it doesn't exist, add to array of nodeTypes
  /* OLD
  if( nodeTypes.indexOf(el.nodeName) == -1){
    nodeTypes.push(el.nodeName);
  }
  */
  // NEW
  if(processURL_indexOfNode(el) != -1){
    //console.log("update "+el.nodeName);
    processURL_updateNode(el);
  }
  else{
    //console.log("add "+el.nodeName);
    //console.log(el.attributes);
    //console.log(el.attributes[0]);
    processURL_addNode(el);
  }
  /*
  switch(el.nodeName){
    case '#text':
      //processURL_text(el);
      break;
  }
  */

  // show trimmed textContent
  /*
  THIS BLOCK WILL GET PARAGRAPHS FROM textContent
  BUT WILL NOT GATHER ALL INFORMATION ABOUT NODES
  let content = $.trim(el.textContent);
  if(content != ""){
    console.log(el.nodeName+" textContent");
    //console.log(content));
    let paragraphs =
      content
        .split("\n")
        .filter(filterEmptyString);

    // sort paragraphs by length descending
    // the idea being that paragraphs w/ most content
    // will also be the most relevant
    paragraphs.sort((a,b)=>{
      return b.length - a.length;
    });

    console.log(paragraphs);
  }
  */

  // recursively process nodes
  if(el.childNodes.length > 0){
    //console.log(el.nodeName+" children");
    //console.log(el.childNodes);
    for(let child of el.childNodes){
      processURL_node(child);
    }
  }
  // end processURL_node
}

function processURL_text(el){
  //console.log(el.textContent);
}

function processURL_addNode(el){
  //console.log(Object.keys(el));

  // will display html inside element
  // we have to analyze the content
  // to determine whether this has html content
  // is block elements or inline elements
  // if it is inline elements
  // save the content
  //console.log($(el).html());

  // if a new nodeType, push to nodeTypes array
  nodeTypes.push({
    nodeName : el.nodeName,
    nodeType : el.nodeType,
    occurences : []
  });
  // update node with the current occurence
  processURL_updateNode(el);
}

function processURL_updateNode(el){
  // get index of nodeType from nodeTypes array
  let indexOfNode = processURL_indexOfNode(el);
  //console.log("Update "+el.nodeName+" at index "+indexOfNode);
  // push node occurence to appropriate nodeType
  nodeTypes[indexOfNode].occurences.push({
    // use IIFE to return array of attributes
    attributes: (()=>{
      if(!el.attributes){
        return null;
      }
      let attributes = {};
      for(let i = 0; i < el.attributes.length; ++i){
        let attr = el.attributes[i];
        attributes[attr.name] = attr.value;
      }
      return attributes;
    })(),
    childElementCount : el.childElementCount,
    display: (()=>{
      if(el.nodeType == 1){
        let style = window.getComputedStyle(el, null);
        return style.getPropertyValue("display");
      }
      else{
        return null;
      }
    })(),
    innerHTML: (()=>{

      // guard
      if(el.nodeType != 1){
        return null;
      }

      if(el.childNodes.length > 0){
        //console.log(el.nodeName+" children");
        //console.log(el.childNodes);
        for(let child of el.childNodes){

          if(child.nodeType == 1){
            let childStyle = window.getComputedStyle(child, null);
            // there are a million block like elements
            // block, list-item, etc. so we just look for inline
            if(childStyle.getPropertyValue("display") != "inline"){
              return null;
            }
          }

        }
      }

      // if it has children, iteration proves it has no block children
      // so at this point, this element has no children or no block children
      return $(el).html();

    })(),
    text: (()=>{

      // guard
      if(el.nodeType != 1){
        return null;
      }

      if(el.childNodes.length > 0){
        //console.log(el.nodeName+" children");
        //console.log(el.childNodes);
        for(let child of el.childNodes){

          if(child.nodeType == 1){
            let childStyle = window.getComputedStyle(child, null);
            // there are a million block like elements
            // block, list-item, etc. so we just look for inline
            if(childStyle.getPropertyValue("display") != "inline"){
              return null;
            }
          }

        }
      }

      // if it has children, iteration proves it has no block children
      // so at this point, this element has no children or no block children
      return el.textContent;

    })()
  });
}

function processURL_indexOfNode(el){
  for(let i=0; i < nodeTypes.length; ++i){
    if(el.nodeName == nodeTypes[i].nodeName){
      return i;
    }
  }
  return -1;
}

// end of parseURL function library


function findCommonWords(){
  let words = [];
  let wordCount = 0;
  let limit = 50;
  for(let document of analyzedDocuments){
    wordCount += document.wordCount;
    for(let wordObject of document.words){
      //sanitize
      if(checkWord(wordObject.value)){
        updateCommonWords(wordObject);
      }

    }
  }

  words.sort((a,b)=>{
    return parseInt(b.count) - parseInt(a.count);
  });

  //console.log('words');
  //console.log(words);

  let mappedWords = words.map((word)=>{
    word.frequency = word.count / wordCount;
    return word;
  });

  let x = 0;

  for(let mappedWord of mappedWords){
    x += mappedWord.frequency;
  }
  //console.log(x);

  let x_avg = x / mappedWords.length;
  let highest = mappedWords[0].frequency;
  let highestSampleAvg = (()=>{
    let sampleAmt = 10;
    let x = 0;
    for(let i = 0; i < sampleAmt; i++){
      x += mappedWords[i].frequency;
    }
    return x / sampleAmt;
  })();
  let threshold = highestSampleAvg * .1;

  console.log(x_avg);
  console.log(threshold);

  for(let i = mappedWords.length - 1; i >= 0; --i){
    // average is too forgiving
    //if(mappedWords[i].frequency < x_avg) mappedWords.splice(i,1);
    // try 60% of most frequent word
    if(mappedWords[i].frequency < threshold) mappedWords.splice(i,1);
  }

  console.log(mappedWords);

  return mappedWords;

  // redundant to function in processText except the array
  // possibly create higher scope function with word and array argument
  function updateCommonWords(wordObject){
    for(let i = 0; i < words.length; i++){
      if(words[i].value == wordObject.value){
        words[i].count++;
        return true;
      }
    }
    // the parse(stringify()) creates a deep clone
    words.push(JSON.parse(JSON.stringify(wordObject)));
  }
}

function clearCommonWords(){
  commonWords = [];
  console.log("Clear commonWords");
  console.log(commonWords);
}

function generateCommonWords(){
  renderer.generateCommonWords(commonWords);
}

function clearConsole(){
  console.clear();
}

function createWikiNav(){
  renderer.generateWikiNav();
}

function createWikiContent(){
  renderer.generateWikiContent();
}

function loadContent(content){
  $.ajax({
    url: './onload/previews/'+content+'.json'
  }).done((response)=>{
    let file = JSON.parse(response);
    //console.log(file.content);
    $('#wikiContent').html('');
    for(let article of file.content){
      $('#wikiContent').append(
        '<p>'+article+'</p>'
      );
    }
  });
}

function createWordObject(word){
  return {value: word, count: 1};
}

function checkWord(word){
  if(word.trim() != "" && typeof word == 'string'){
    return true;
  }
  return false;
}

function filterEmptyString(string){
  return $.trim(string) != "";
}
