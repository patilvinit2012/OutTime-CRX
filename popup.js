/*function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, (tabs) => {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, (tabs) => {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

//Change the background color of the current page.@param {string} color The new background color.
function changeBackgroundColor(color) {
  var script = 'document.body.style.backgroundColor="' + color + '";';
  // See https://developer.chrome.com/extensions/tabs#method-executeScript.
  // chrome.tabs.executeScript allows us to programmatically inject JavaScript
  // into a page. Since we omit the optional first argument "tabId", the script
  // is inserted into the active tab of the current window, which serves as the
  // default.
  chrome.tabs.executeScript({
    code: script
  });
}


 // Gets the saved background color for url.
 
 // @param {string} url URL whose background color is to be retrieved.
 // @param {function(string)} callback called with the saved background color for
 //     the given url on success, or a falsy value if no color is retrieved.
 
function getSavedBackgroundColor(url, callback) {
  // See https://developer.chrome.com/apps/storage#type-StorageArea. We check
  // for chrome.runtime.lastError to ensure correctness even when the API call
  // fails.
  chrome.storage.sync.get(url, (items) => {
    callback(chrome.runtime.lastError ? null : items[url]);
  });
}


 // Sets the given background color for url.
 // @param {string} url URL for which background color is to be saved.
 // @param {string} color The background color to be saved.
 
function saveBackgroundColor(url, color) {
  var items = {};
  items[url] = color;
  // See https://developer.chrome.com/apps/storage#type-StorageArea. We omit the
  // optional callback since we don't need to perform any action once the
  // background color is saved.
  chrome.storage.sync.set(items);
}

// This extension loads the saved background color for the current tab if one
// exists. The user can select a new background color from the dropdown for the
// current page, and it will be saved as part of the extension's isolated
// storage. The chrome.storage API is used for this purpose. This is different
// from the window.localStorage API, which is synchronous and stores data bound
// to a document's origin. Also, using chrome.storage.sync instead of
// chrome.storage.local allows the extension data to be synced across multiple
// user devices.
document.addEventListener('DOMContentLoaded', () => {
  
  getCurrentTabUrl((url) => {
    var dropdown = document.getElementById('dropdown');

    // Load the saved background color for this page and modify the dropdown
    // value, if needed.
    getSavedBackgroundColor(url, (savedColor) => {
      if (savedColor) {
        changeBackgroundColor(savedColor);
        dropdown.value = savedColor;
      }
    });

    // Ensure the background color is changed and saved when the dropdown
    // selection changes.
    dropdown.addEventListener('change', () => {
      changeBackgroundColor(dropdown.value);
      saveBackgroundColor(url, dropdown.value);
    });
  });
});
*/




//document.addEventListener('DOMContentLoaded', () => {
    const OUTTIME = 'OUTTIME';
    const INTIME = 'INTIME';
    const BUCKETTIME = 'BUCKETTIME';
    const DEFAULTTIME = '8:30';
    const DEFAULTBUCKHOUR =  8;
    const DEFAULTBUCKMINS = 45;
    const DEFAULTBUCKTIME = DEFAULTBUCKHOUR + ':' + DEFAULTBUCKMINS;


    init();

    $('#inputTime').bind('keyup',function(event){
      if(event.keyCode === 13){
        calculate();
      }
    })
    
    var inTimeObjStr = localStorage.getItem(OUTTIME);
    var inTimeObj = JSON.parse(inTimeObjStr);
    if((inTimeObj) && (inTimeObj[INTIME])) $('#inputTime').val(inTimeObj[INTIME]);
    

    var entryTimekeyupEvent = $.Event( "keyup", { keyCode: 13 } );
    $('#inputTime').trigger(entryTimekeyupEvent);

    $('#refreshBtn').bind('click',() => $('#inputTime').trigger(entryTimekeyupEvent));

    window.onfocus = function(){
      $('#inputTime').trigger(entryTimekeyupEvent);  
    };

    function calculate(){
      var inputDate = getInpTime();
      var currDate = new Date();
      var timeElObj = msToTime(currDate - inputDate);
      $('#timeElapsed').text(`${timeElObj.hrs} Hours , ${timeElObj.mins} Minutes`);

      var estOutDate = new Date();
      estOutDate.setHours(inputDate.getHours() + (parseInt(localStorage[BUCKETTIME].split(':')[0]) || DEFAULTBUCKHOUR));
      var hours = estOutDate.getHours();
      estOutDate.setMinutes(inputDate.getMinutes() + (parseInt(localStorage[BUCKETTIME].split(':')[1]) || DEFAULTBUCKMINS));
      var minutes = estOutDate.getMinutes();
      var am_pm = hours >= 12 ? 'pm' : 'am';
      $('#outputTime').text(`${estOutDate.getHours()}:${minutes} ${am_pm}`);


      var reTimeObj = msToTime(estOutDate - currDate);
      $('#timeRemaining').text(`${reTimeObj.hrs} Hours , ${reTimeObj.mins} Minutes`);

      
    }

    function getInpTime(){
      var inpStr = $('#inputTime').val();
      localStorage.setItem(OUTTIME,JSON.stringify({INTIME:inpStr}));
      var inDate = new Date();
      inDate.setHours(inpStr.split(':')[0]);
      inDate.setMinutes(inpStr.split(':')[1]);
      inDate.setSeconds(0);
      return inDate;
    }

    function msToTime(s) {
      var ms = s % 1000;
      s = (s - ms) / 1000;
      var secs = s % 60;
      s = (s - secs) / 60;
      var mins = s % 60;
      var hrs = (s - mins) / 60;
      return {hrs:hrs,mins:mins};
    }

    function init(){
      var inpTimeObj = $('#inputTime');
      if(!inpTimeObj.val()) inpTimeObj.val(DEFAULTTIME);

      $('#bucketTime').text(localStorage.getItem(BUCKETTIME) || DEFAULTBUCKTIME);
      localStorage[BUCKETTIME] = $('#bucketTime').text();
    }

    $('#bucketTime').on({
      click: function(){
        var parentObj = $('#bucketTimeCtnr');
        var bucketTimeVal = $('#bucketTime').text();
        $('#bucketTime').hide();
        parentObj.append(`<input type="text" id="bucketTimeInp" class="" style="width:10%" placeholder="Eg: 8:45">`);
        $('#bucketTimeInp').val(bucketTimeVal);
        $('#bucketTimeInp').on('keyup',event => onBuckeTimeInp(event));
      },
    })

    function onBuckeTimeInp(event,currObj){
      if(event.keyCode == 13){
          var timeStr = $('#bucketTimeInp').val();
        localStorage.setItem(BUCKETTIME,timeStr);
        $('#bucketTimeInp').remove();
        $('#bucketTime').show().text(timeStr);
        calculate();
          }else if(event.keyCode == 27){
            $('#bucketTime').show();
            $('#bucketTimeInp').remove();
          }
    }

    function editBucketTime(currObj){
          var parentObj = currObj.parent();
          var text = currObj.text();
          currObj.parent().children().hide();
          var editTemplate = `<input type="text" id="dynEditNote" class="form-control" value="${text}" autofocus="autofocus">`;
          parentObj.append(editTemplate);
          $('#dynEditNote').on('keyup',event => saveDynNote(event,$('#dynEditNote')));
        }
//})