// ==UserScript==
// @name        Plexia Download Table From Billing Center
// @namespace   GongPlexia
// @description Download Table from Billing Center
// @include     *app.plexia.ca/emrshoulihan/
// @require     https://code.jquery.com/jquery-3.6.0.js
// @grant       GM_addStyle
// @version 	  23.10.18.1
// ==/UserScript==

//changelog: 23.10.17.1: first creation date
//23.10.18.1: catch in case aspenNetForm is not ready yet under checkIfRightPage()

var GlobalPlexiaMainFrame
var GlobalPlexiaMainFrameContent
var GlobalIframeMain
var GlobalIframeMainContent

window.addEventListener('load', function() {

  setTimeout(function(){ main(); }, 250);

}, false);

async function main(){
  console.log("main running")



  GlobalPlexiaMainFrame = document.querySelector('iframe[id = "PlexiaMainFrame"]')
  GlobalPlexiaMainFrameContent = GlobalPlexiaMainFrame.contentWindow;
  GlobalIframeMain = GlobalPlexiaMainFrameContent.document.querySelector('iframe[id = "mainFrame"]')
  GlobalIframeMainContent //placeholder


  checkIfRightPage()


}

async function checkIfRightPage(){
  //console.log("check right page - Download Table Script")
  if (GlobalIframeMain == null){
    setTimeout(checkIfRightPage, 1000)
    GlobalIframeMain = GlobalPlexiaMainFrameContent.document.querySelector('iframe[id = "mainFrame"]')
    return
  }

  GlobalIframeMainContent = GlobalIframeMain.contentWindow;
  await delay(50)
  var aspenNetForm = GlobalIframeMainContent.document.querySelector('form[id = "aspnetForm"]')

  while (aspenNetForm == null){
    aspenNetForm = GlobalIframeMainContent.document.querySelector('form[id = "aspnetForm"]')
    await delay(100)
  }

  var aspenNetAction = aspenNetForm.action

  var element = aspenNetAction.includes("viewBillingForSub")
  if (element ==true) {
    // Element found, run the sript
    await delay(100)
    mainScript()
    //clearInterval(checkIntervalId); // Stop checking
  } else {
    // Element not found,  wrong page, don't run
    setTimeout(checkIfRightPage, 1000) // Check again after 1 second

  }


}

//get data from the table. and convert to excel compatible
async function mainScript(){
    var table = GlobalIframeMainContent.document.querySelector('table[id*="ContentPlaceHolder1_dataGridBilling"]'); // Change this to your table ID
    //var CSVtable = tableToCSV(table)


    var aspenNetForm = GlobalIframeMainContent.document.querySelector('form[id = "aspnetForm"]')


    var downloadButton = GlobalIframeMainContent.document.createElement('button');
    downloadButton.textContent = 'Download Table'
    downloadButton.style.backgroundColor = 'orange'
    downloadButton.type = "button"
    downloadButton.name = "DownloadTableButton"
    //aspenNetForm.appendChild(downloadButton)
    aspenNetForm.insertBefore(downloadButton, aspenNetForm.firstChild)

    downloadButton.addEventListener('click', () => {
      var csvData = tableToCSV(table);
      //csvData = removeWeirdSymbols(csvData)
      downloadCSV(csvData);
    });



}

function tableToCSV(table) {
    console.log("table conversion func")
    let csv = []

    // Iterate over rows and cells in the table
    for (let row of table.rows) {
        let rowArray = []
        for (let cell of row.cells) {
            rowArray.push(cell.innerText);
        }
        csv.push(rowArray.join(','));
    }

    return csv.join('\n');
}

function removeWeirdSymbols(csvString) {
  // Define a regular expression pattern to match non-alphanumeric or non-standard ASCII characters
  const regexPattern = /[^a-zA-Z0-9\s,.!?-]/g;

  // Use the replace method to remove the matched characters
  const cleanCsvString = csvString.replace(regexPattern, '');


  return cleanCsvString;
}

function downloadCSV(data) {
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), data], { type: `text/csv;charset=${"UTF-8"};` });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "BillingData.csv";
    GlobalIframeMainContent.document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
}


/*
async function mainScript(){
  console.log("main SCRIPT running")
  console.log(GlobalIframeMainContent)
  console.log(GlobalIframeMain)
  // Load the xlsx library
  const script = GlobalIframeMainContent.document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.16.9/xlsx.full.min.js'; // You can change this URL to a different version or source
    script.async = true;
    script.onload = () => {
        // Now that the library is loaded, you can use it here
    };
  GlobalIframeMainContent.document.body.appendChild(script);


  var table = GlobalIframeMainContent.document.querySelector('table[id*="ContentPlaceHolder1_dataGridBilling"]'); // Change this to your table ID
  console.log(table)
  const wb = xlsx.utils.table_to_book(table);
  xlsx.writeFile(wb, 'table.xlsx');

}
*/



function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}




//https://app.plexia.ca/emrshoulihan/home/adminmspbilling/viewBillingForSub.aspx?load=notyetsubmitted&datacentre=T5287&btnid=btnNotYetSubmittedT5287&datacentreid=divT5287
