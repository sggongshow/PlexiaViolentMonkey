// ==UserScript==
// @name        Plexia MSP Auto Patient Selector
// @namespace   GongPlexia
// @description Modifications for billing code
// @include     *app.plexia.ca/emrshoulihan/
// @require     https://code.jquery.com/jquery-3.6.0.js
// @grant       GM_addStyle
// @version 	  23.10.16.1
// ==/UserScript==

//changelog: Completed functional
//23.10.16.0 Complited ability to search for patients.

var GlobalPHNArray = []

window.addEventListener('load', function() {


  setTimeout(function(){ main(); }, 250);



}, false);


async function main(){
  console.log("Started Main for Auto Patient Selector")
  const PlexiaMainFrame = document.querySelector('iframe[id = "PlexiaMainFrame"]')
  const PlexiaMainFrameContent = PlexiaMainFrame.contentWindow;
  var iframeSidebar = PlexiaMainFrameContent.document.querySelector('iframe[id = "sideframe"]')
  var iframeSidebarContent //placeholder

  //Check if on the correct page of Plexia and get the Iframs for the Sidebar
  var sidebarArray = await CheckSidebarIframe(PlexiaMainFrameContent)

  iframeSidebar = sidebarArray[0]
  iframeSidebarContent = sidebarArray[1]
  //Get the iframes of the topbar and main section
  const iframeTopbar = PlexiaMainFrameContent.document.querySelector('iframe[id = "topFrame"]')
  const iframeTopbarContent = iframeTopbar.contentWindow;
  const iframeMain = PlexiaMainFrameContent.document.querySelector('iframe[id = "mainFrame"]')
  const iframeMainContent = iframeMain.contentWindow;

  // This is to check if script box is missing at regular intervals and then recreat them as needed
  createTextBox()
  var checkIntervalId = setInterval(checkIfScriptBoxMissing, 5000);
  //Initially creates the script box



}//end main() function

async function runPHNAutoFill(iframeSidebar, scriptTextbox){
  //console.log("running autofill script")
  //Get the PHN data to Array
  var PHNData = scriptTextbox.value
  var PHNArray = PHNData.split('\t')
  GlobalPHNArray = PHNArray

  refreshScriptTextBox(scriptTextbox)

  //Remove duplicate PHNs from the Array
  /*
  console.log(GlobalPHNArray)
  GlobalPHNArray = Array.from(new Set(GlobalPHNArray));
  console.log(GlobalPHNArray)
*/

  //console.log(GlobalPHNArray)
  var CurrentPHN = PHNArray[0]
  var iframeSidebarContent = iframeSidebar.contentWindow;

  var searchBar = iframeSidebarContent.document.querySelector('input[id ="PatientSearch1_txtSearch"]')
  var searchBarGo = iframeSidebarContent.document.querySelector('input[id ="divGo"]')

  if(GlobalPHNArray.length>0){
    //filter away any \t \n that may have stuck through
    GlobalPHNArray[0] = GlobalPHNArray[0].replace(/[\t\n]/g, "");
    searchBar.value = GlobalPHNArray[0]
    GlobalPHNArray.shift()
    //console.log(GlobalPHNArray)
    searchBarGo.click()
    await delay(2000)
    clickBillingTab()
  }


  //createTextBox(iframeSidebar, PHNArray)



}

function clickBillingTab(){
  const PlexiaMainFrame = document.querySelector('iframe[id = "PlexiaMainFrame"]')
  const PlexiaMainFrameContent = PlexiaMainFrame.contentWindow;
  const iframeMenu = PlexiaMainFrameContent.document.querySelector('iframe[id = "menuframe"]')
  const iframeMenuContent = iframeMenu.contentWindow;

  var billingButton = iframeMenuContent.document.querySelector('div[id ="btnBilling"]')
  //console.log(billingButton)
  billingButton.click()

}

//When you click any button the body resets but script does not. so the boxes dissappear
//Instead of remaking manually, check every few seconds instead.
function checkIfScriptBoxMissing() {
  //console.log("checking if missing")
  const PlexiaMainFrame = document.querySelector('iframe[id = "PlexiaMainFrame"]')
  const PlexiaMainFrameContent = PlexiaMainFrame.contentWindow;
  var iframeSidebar = PlexiaMainFrameContent.document.querySelector('iframe[id = "sideframe"]')
  var iframeSidebarContent = iframeSidebar.contentWindow;

  var element = iframeSidebarContent.document.querySelector('[name = "ScriptBoxPHNList"]');
  if (element) {
    // Element found, do something with it
    setTimeout(checkIfScriptBoxMissing, 5000)
    //clearInterval(checkIntervalId); // Stop checking
  } else {
    // Element not found, keep checking
    createTextBox()
    setTimeout(checkIfScriptBoxMissing, 5000); // Check again after 1 second

  }
}

async function createTextBox(iframeSidebar){
  console.log("remaking box/button")
  const PlexiaMainFrame = document.querySelector('iframe[id = "PlexiaMainFrame"]')
  const PlexiaMainFrameContent = PlexiaMainFrame.contentWindow;
  var iframeSidebar = PlexiaMainFrameContent.document.querySelector('iframe[id = "sideframe"]')
  var iframeSidebarContent = iframeSidebar.contentWindow;
  //create user input box for script use in side bar
  //--First need to get the form to append topFrame
  var sidebarForm = iframeSidebarContent.document.querySelector('form[id = "Form1"]')
  //--Then create the textbox and append to sidebar
  var scriptTextbox = iframeSidebarContent.document.createElement('textarea')
  scriptTextbox.rows = 8
  scriptTextbox.cols = 12
  scriptTextbox.placeholder = "Enter PHN Numbers Here";
  scriptTextbox.style.border = '2px solid orange'
  scriptTextbox.name = "ScriptBoxPHNList"
  sidebarForm.appendChild(scriptTextbox);
  //--Then create the textbox submit button and append to sidebar

  var runScriptButton = iframeSidebarContent.document.createElement('button');
  runScriptButton.textContent = 'Search Next Patient';
  runScriptButton.style.backgroundColor = 'orange'
  runScriptButton.type = "button"
  runScriptButton.name = "ScriptButton"
  sidebarForm.appendChild(runScriptButton)


  //now wait until button is clicked. Passing the iframes so don't need to search them all over again
  await refreshScriptTextBox(scriptTextbox)

  runScriptButton.addEventListener("click", function () {
    runPHNAutoFill(iframeSidebar, scriptTextbox)
  });

}

function refreshScriptTextBox(scriptTextbox){
  console.log("refreshbox")
  console.log(GlobalPHNArray)

  if (GlobalPHNArray.length==0){
    //TEMPORARY TESTING DATA
    //criptTextbox.value = "9827515456\t9845234234\t9718956831"
    scriptTextbox.value = null
  } else{
    //Display what is in the Array (mostly for when the box disappears and needs to re-appear)
    var ArrayValConvert = ""
    for (var i = 0; i < GlobalPHNArray.length; i++) {
      //filter any \t and \n from copy pasting
      GlobalPHNArray[i] = GlobalPHNArray[i].replace(/[\t\n]/g, "");
      ArrayValConvert += GlobalPHNArray[i] +"\t"
    }

    //CleanUp the Array to remove duplicates and
    //GlobalPHNArray = Array.from(new Set(GlobalPHNArray));  //works but only for duplicates, not for null/empty
    // Step 1: Use the filter method to remove empty slots (undefined and null)
    GlobalPHNArray = GlobalPHNArray.filter(function (element) {
      return element !== undefined && element !== null && element !== "";;
    });

    // Step 2: Use the filter method again to remove duplicates
    GlobalPHNArray = GlobalPHNArray.filter(function (element, index, self) {
      return self.indexOf(element) === index;
    });

    console.log(GlobalPHNArray)
    console.log(ArrayValConvert)
    var lastIndex = ArrayValConvert.lastIndexOf("\t");
    ArrayValConvert = ArrayValConvert.slice(0, lastIndex)
    //console.log(ArrayValConvert)
    scriptTextbox.value = ArrayValConvert

  }
}

async function CheckSidebarIframe(iframeContent){
  console.log("checkSidebar")
  //waitfor right page to show
  var iframeSidebar = iframeContent.document.querySelector('iframe[id = "sideframe"]')
  var iframeFound = false;
  while (iframeFound == false){
    iframeSidebar = iframeContent.document.querySelector('iframe[id = "sideframe"]');
    if (iframeSidebar == null){
      await delay(1000)
    } else {
      iframeFound = true
      iframeSidebarContent = iframeSidebar.contentWindow;
      await checkIframeForSearch(iframeSidebarContent)
      return [iframeSidebar, iframeSidebarContent]
    }

  }

}


async function checkIframeForSearch(iframeContent){
  console.log("checkSearchbar")
  var searchBar = iframeContent.document.querySelector('input[id ="PatientSearch1_txtSearch"]')
  while (searchBar == null){
    await delay(1000)
    searchBar = iframeContent.document.querySelector('input[id ="PatientSearch1_txtSearch"]')
  }
  return
}


function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}















