// ==UserScript==
// @name        Plexia MSP Billing Auto Filler
// @namespace   GongPlexia
// @description Modifications for billing code
// @include     *mspbilling/Dialog.aspx?*pagetitle=Add/Modify*
// @require     https://code.jquery.com/jquery-3.6.0.js
// @grant       GM_addStyle
// @version 	  23.10.17.2
// ==/UserScript==

//changelog: Completed functional
//23.10.17.0 removed the temp testing data
//23.10.17.2 stopped referral doctor autofill if array empty

window.addEventListener('load', function() {

   setTimeout(function(){ main(); }, 250);

}, false);


function main(){
  console.log("helloworld")
  createTextBox()
  var checkIntervalId = setInterval(checkIfScriptBoxMissing, 5000);

}

function checkIfScriptBoxMissing() {
  //console.log("checking if missing")
  const iframe = document.querySelector('iframe[id = "ctl00_innerIframe"]')
  const iframeContent = iframe.contentWindow;

  var element = iframeContent.document.querySelector('[name = "scriptTextBox_name"]');
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


async function createTextBox(){
  const iframe = document.querySelector('iframe[id = "ctl00_innerIframe"]')
  const iframeContent = iframe.contentWindow;

  var aspnetForm = iframeContent.document.querySelector('form[name="aspnetForm"]')
  var scriptTextbox = iframeContent.document.createElement('textarea')
  scriptTextbox.rows = 10
  scriptTextbox.cols = 60
  scriptTextbox.placeholder = "Enter Script Data Here";
  scriptTextbox.style.border = '2px solid orange'
  scriptTextbox.name = "scriptTextBox_name"
  aspnetForm.insertBefore(scriptTextbox, aspnetForm.firstChild)

  //scriptTextbox.value ="10/10/2023\n4010\n618\n37250\nI\n22:00\n23:00\n01210"


  var runScriptButton = iframeContent.document.createElement('button');
  runScriptButton.textContent = 'Run Script';
  runScriptButton.style.backgroundColor = 'orange'
  runScriptButton.type = "button"
  runScriptButton.name = "scriptTextBox_name"
  aspnetForm.insertBefore(runScriptButton, scriptTextbox.nextSibling);

  window.resizeTo(window.innerHeight, 900);

  runScriptButton.addEventListener("click", runScriptFunction);


}


// Define your custom function
async function runScriptFunction() {
    const iframe = document.querySelector('iframe[id = "ctl00_innerIframe"]')
    const iframeContent = iframe.contentWindow;
    var aspnetForm = iframeContent.document.querySelector('form[name="aspnetForm"]')

    var rawdata = iframeContent.document.querySelector('textarea[name="scriptTextBox_name"]').value
    rawdata = rawdata.replace(/ /g, "")
    var rawdataArray = rawdata.split("\n")
    //console.log(rawdata)


    //variables of all boxes that may need to be modified
    var serviceDateBox = iframeContent.document.querySelector('input[id*="ContentPlaceHolder1_txtServiceDate"]')
    var feeCodeBox = iframeContent.document.querySelector('input[id*="ContentPlaceHolder1_txtBilledFeeItem"]')
    var icdBox = iframeContent.document.querySelector('input[id*="ContentPlaceHolder1_txtICD"]')
    var refbyBox = iframeContent.document.querySelector('input[id*="ContentPlaceHolder1_txtRefPrac1No"]')
    var serviceLocation = iframeContent.document.querySelector('[id*="ContentPlaceHolder1_ddlSrvLocation"]')
    var serviceTimeTick = iframeContent.document.querySelector('input[id*="ContentPlaceHolder1_chkIncludeServiceTime"]')
    var timeStart = iframeContent.document.querySelector('input[id*="ContentPlaceHolder1_txtSrvTimeStart"]')
    var timeEnd = iframeContent.document.querySelector('input[id*="ContentPlaceHolder1_txtSrvTimeFinish"]')



    //simulate enter key pressed event
    var eventChange = new Event('change');
    serviceTimeTick.checked = true
    timeStart.value = rawdataArray[5]
    timeStart.dispatchEvent(eventChange)
    timeEnd.value = rawdataArray[6]
    timeEnd.dispatchEvent(eventChange)
    serviceDateBox.value = rawdataArray[0]
    serviceDateBox.dispatchEvent(eventChange)
    feeCodeBox.value = rawdataArray[1]
    feeCodeBox.dispatchEvent(eventChange)
    await delay(100)
    icdBox.value = rawdataArray[2]
    icdBox.dispatchEvent(eventChange)
    await delay(500)

    //do not overwrite ref if no ref to enter. it will then use default in EMR if available.
    if (rawdataArray[3].length>2){
      refbyBox.value = rawdataArray[3]
      refbyBox.dispatchEvent(eventChange)
      await delay(100)
    }

    serviceLocation.value = rawdataArray[4]

    //check need for surcharge
    var surchargeCode = rawdataArray[7].toString()
    console.log(surchargeCode)
    console.log(surchargeCode.length)
    if (surchargeCode.length>2) {
      surchargeNeeded(surchargeCode)
    }

}

async function surchargeNeeded(surchargeCode){
  console.log("surcharge function" + surchargeCode)
  const iframe = document.querySelector('iframe[id = "ctl00_innerIframe"]')
  const iframeContent = iframe.contentWindow;
  var eventChange = new Event('change');

  var addSurchargebutton = iframeContent.document.querySelector('input[id*="ContentPlaceHolder1_btnAddSurcharges"]')
  addSurchargebutton.click()
  await delay(1000)

  var surchargeDropBox = iframeContent.document.querySelector('select[id*="ContentPlaceHolder1_lstSurcharges"]')
  var surchargeBox = iframeContent.document.querySelector('input[id*="ContentPlaceHolder1_txtSFeeCode"]')
  var surchargeAddButton = iframeContent.document.querySelector('input[id*="ContentPlaceHolder1_btnAddSurcharge"]')
  console.log(surchargeDropBox)
  console.log(surchargeBox)

  for (var i = 0; i < surchargeDropBox.options.length; i++) {
    if (surchargeDropBox.options[i].value.includes(surchargeCode)) {
      console.log(surchargeDropBox.value)
      surchargeDropBox.selectedIndex = i;
      console.log(surchargeDropBox.value)
      break;
    }
  }
  surchargeBox.value = surchargeCode
  await delay(100)
  surchargeAddButton.click()
}


function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}















