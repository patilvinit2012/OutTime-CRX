  //chrome.browserAction.setBadgeText({text: "8h"});
  chrome.tabs.executeScript(null, {file: "content.js"});


    const OUTTIME = 'OUTTIME';
    const INTIME = 'INTIME';
    const BUCKETTIME = 'BUCKETTIME';
    const DEFAULTTIME = '8:30';
    const DEFAULTBUCKHOUR =  8;
    const DEFAULTBUCKMINS = 45;
    const DEFAULTBUCKTIME = DEFAULTBUCKHOUR + ':' + DEFAULTBUCKMINS;
    const LISTVIEW = 'LISTVIEW';
    const ABSTRACTVIEW = 'ABSTRACTVIEW';
    const DEFAULTVIEW = LISTVIEW;
    const VIEWOPTION  = 'VIEWOPTION';
    init();

    $('#inputTime').bind('keyup',function(event){
      if(event.keyCode === 13){
        calculate();
      }
    })

    $('#viewBtn').bind('click',changeView);
    
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
      $('.timeElapsed').text(getFTimeText(timeElObj.hrs,timeElObj.mins));

      var estOutDate = new Date();
      estOutDate.setHours(inputDate.getHours() + (parseInt(localStorage[BUCKETTIME].split(':')[0]) || DEFAULTBUCKHOUR));
      var hours = estOutDate.getHours();
      estOutDate.setMinutes(inputDate.getMinutes() + (parseInt(localStorage[BUCKETTIME].split(':')[1]) || DEFAULTBUCKMINS));
      var minutes = estOutDate.getMinutes();
      minutes = minutes > 10 ? minutes : "0" + minutes;
      var am_pm = hours >= 12 ? 'pm' : 'am';
      $('.outputTime').text(`${estOutDate.getHours()}:${minutes} ${am_pm}`);


      var reTimeObj = msToTime(estOutDate - currDate);
      $('.timeRemaining').text(getFTimeText(reTimeObj.hrs,reTimeObj.mins));
      chrome.browserAction.setBadgeText({text: reTimeObj.hrs + 'h+'});
    }

    function getFTimeText(hrs,mins){
      var text ='';
      hrs = Number.parseInt(hrs);
      mins = Number.parseInt(mins);
      if(hrs){
        text += `${hrs} ${singOrPlu('Hour',hrs)}, `;    
      }
      if(mins){
        text += `${mins} ${singOrPlu('Minute',mins)}`;  
      }
      return text;
    }

    function singOrPlu(text,intVal){
      if(intVal > 1){
        return text+'s';
      }
      return text;
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

      $('.bucketTime').text(localStorage.getItem(BUCKETTIME) || DEFAULTBUCKTIME);
      localStorage[BUCKETTIME] = $('.bucketTime').text();

      var view = localStorage.getItem(VIEWOPTION);
      if(!view) {
        localStorage.setItem(VIEWOPTION,DEFAULTVIEW);
      }else{
        $('#listView, #abstractView').hide();
        if(view == LISTVIEW){
          $('#listView').show();
        }else if(view == ABSTRACTVIEW){
          $('#abstractView').show();
        }
      }
    }

    $('.bucketTime').on({
      click: function(){
        var parentObj = $('.bucketTimeCtnr');
        var bucketTimeVal = $('.bucketTime').text();
        $('.bucketTime').hide();
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
        $('.bucketTime').show().text(timeStr);
        calculate();
          }else if(event.keyCode == 27){
            $('.bucketTime').show();
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


    function changeView(){  
      var viewOption = localStorage.getItem(VIEWOPTION);
      $('#listView, #abstractView').hide();
      if(viewOption == LISTVIEW){
        localStorage.setItem(VIEWOPTION,ABSTRACTVIEW);
        $('#abstractView').show();
      }else if (viewOption == ABSTRACTVIEW) {
        localStorage.setItem(VIEWOPTION,LISTVIEW);
        $('#listView').show();
      }
    }
//})