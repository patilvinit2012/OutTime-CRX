  //chrome.browserAction.setBadgeText({text: "8h"});
  //chrome.tabs.executeScript(null, {file: "content.js"});
    
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
    const LOGINMSG = {SUCCESS: 'SUCCESS',ERROR: 'ERROR'}
    init();

    $('#inputTime').bind('keyup',function(event){
      if(event.keyCode === 13){
        calculate();
      }
    })

    $('#changeViewBtn').bind('click',changeView);
    
    var inTimeObjStr = localStorage.getItem(OUTTIME);
    var inTimeObj = JSON.parse(inTimeObjStr);
    if((inTimeObj) && (inTimeObj[INTIME])) $('#inputTime').val(inTimeObj[INTIME]);
    

    var entryTimekeyupEvent = $.Event( "keyup", { keyCode: 13 } );
    entryTimeEventTrigger();

    $('#refreshBtn').bind('click',() => entryTimeEventTrigger());

    $('#btnLogin').on('click',loginViewToggle);
    $('#getAttendanceData').on('click',getAttendanceData);
    $('#loginMastek').on('click',login);

    window.onfocus = function(){
      entryTimeEventTrigger();  
    };

    function entryTimeEventTrigger(){
      $('#inputTime').trigger(entryTimekeyupEvent);
    }
    function calculate(){
      var inputDate = getInpTime();
      var currDate = new Date();
      var timeElObj = msToTime(currDate - inputDate);
      $('.timeElapsed').text(getFTimeText(timeElObj.hrs,timeElObj.mins));

      var estOutDate = new Date();
      estOutDate.setHours(inputDate.getHours() + (parseInt(localStorage[BUCKETTIME].split(':')[0]) || DEFAULTBUCKHOUR));
      var hours = estOutDate.getHours();

      var minsInt = parseInt(localStorage[BUCKETTIME].split(':')[1]);
      if(minsInt == null){
        minsInt = DEFAULTBUCKMINS;
      }
      var setMins = inputDate.getMinutes() + minsInt;
      estOutDate.setMinutes(setMins);
      var minutes = estOutDate.getMinutes();

      minutes = minutes >= 10 ? minutes : "0" + minutes;
      var am_pm = hours >= 12 ? 'pm' : 'am';
      $('.outputTime').text(`${estOutDate.getHours()}:${minutes} ${am_pm}`);

      var reTimeObj = msToTime(estOutDate - currDate);
      $('.timeRemaining').text(getFTimeText(reTimeObj.hrs,reTimeObj.mins));
      //chrome.browserAction.setBadgeText({text: (reTimeObj.hrs) ? reTimeObj.hrs + 'h+' : reTimeObj.mins + 'm'});
      chrome.browserAction.setBadgeText({text: reTimeObj.hrs+"." +reTimeObj.mins});
      
    }

    function getFTimeText(hrs,mins){
      var text =``,hrsTxt = ``,minsTxt = ``, seperator = ``;

      if(hrs){
        hrsTxt = `${hrs} ${singOrPlu('Hour',Number.parseInt(hrs))}`;
      }
      if(mins){
        minsTxt = `${mins} ${singOrPlu('Minute',Number.parseInt(mins))}`;
      }
      if((hrsTxt) && (minsTxt)){
      	seperator = ',';
      }
	  text = `${hrsTxt}${seperator}  ${minsTxt}`;

      if(!text){
        showHideAlarm(true);
      }
      return text;
    }

    function singOrPlu(text,intVal){
      if(intVal > 1){
        return text+'s';
      }
      return text;
    }

    function showHideAlarm(show){
      var html = ``;
      $('#alarmClock').html(html);
      if(show){
        html = `<div class="contain-clock">
                <div class="face-1"><div class="hour"></div><div class="minute"></div><div class="second"></div><div class="center"></div></div>
                <div class="face-2"><div class="line"></div><div class="line line-2"></div><div class="line line-3"></div><div class="line line-4"></div><div class="line line-5"></div><div class="line line-6"></div></div>
                <div class="arm"></div><div class="arm arm-2"></div><div class="bell"></div><div class="bell bell-2"></div><div class="hammer"></div><div class="handle"></div>
              </div>`;
        $('#alarmClock').html(html);
      }
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
        $('.views').hide();
        if(view == LISTVIEW){
          $('#listView').show();
        }else if(view == ABSTRACTVIEW){
          $('#abstractView').show();
        }
      }

      if(getUserName()){
        decorateTimeData();
      }
      setUserCred();
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

    var changeBktTmTimer;
    $('.changeBkTimeIcon').on({
      click: function(e){
        $('#dynamBktTimeOptions').hide();
        $('.optionBubble').show();
        $('#dynamBktTimeOptions').fadeIn("100");
        changeBktTmTimer = setTimeout(function() {
          $('.optionBubble').hide();
        }, 5000);
      },
    });

    $('.optionBubble').on({
      mouseover: function(){
        clearTimeout(changeBktTmTimer);
      },
      mouseout: function(e){
        changeBktTmTimer = setTimeout(function() {
          $('.optionBubble').hide();
        }, 3000);
      },
      click: function(e){
        var currEleTime = $(e.target).data('time');
        $('.optionBubble').hide();
        localStorage["BUCKETTIME"] = currEleTime;
        $('.bucketTime').text(currEleTime);
        entryTimeEventTrigger();
      }
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
      $('.views').hide();
      if(viewOption == LISTVIEW){
        localStorage.setItem(VIEWOPTION,ABSTRACTVIEW);
        $('#abstractView').show();
      }else if (viewOption == ABSTRACTVIEW) {
        localStorage.setItem(VIEWOPTION,LISTVIEW);
        $('#listView').show();
      }
    }

    var VERSION_NUMBER = '1.0.0';
    var ENVIRONMENT = 'L';
    var WebAPIURL = "https://ess.masteknet.com/MastAppApi/api/";

    function loginViewToggle(){
      $('.views').hide();
      $('#userAccountView').show();
    }

    function login(){
      ajaxLoader(true);
      exec$Json();
      var apiUrl = WebAPIURL +  "auth/GetUser";
      var token = "";
      var un = $('#mastId').val();
      var pw = $('#mastPass').val();
      var remCredBool = $('#remCred:checked').length;
      saveCred(un,pw,remCredBool);
      
      var input = new Object();
      input.UserAuth = new Array();
      input.UserAuth[0] = new Object({ UserName: un, Password: pw, Token: token,VersionNumber: VERSION_NUMBER,Envrionment: ENVIRONMENT,PhaseData:1});
      $.support.cors = true;

      $.ajax({
          url: apiUrl,
          type: 'POST',
          data: JSON.stringify($.toJSON(input)),
          contentType: "application/json;charset=utf-8",
          success: function (data) {
              if (data.status == 1) {
                  input.UserAuth[0].Token = data.statusmessage.split(":S:")[0];
                  input.UserAuth[0].UserName = data.statusmessage.split(":S:")[1];
                  localStorage.userData = encodeX(JSON.stringify(input));
                  decorateTimeData();
                  loginMsg(LOGINMSG.SUCCESS);
              }
              else if (data.status == -1){  
                  alert(data.statusmessage);
              }else {
                loginMsg(LOGINMSG.ERROR,'Login again');
              }
              ajaxLoader(false);
          },
          error: function (xhr, textStatus, err) {
            ajaxLoader(false);
            checkInternet();
          }
      })
    }

    function loginMsg(flag,msg){
      if(LOGINMSG.SUCCESS == flag){
        $('#loginSuccessMsg').show().fadeOut(2000);
        if(msg) $('#loginSuccessMsg .msgBody').text(msg);
      }
      if(LOGINMSG.ERROR == flag){
        $('#loginErrorMsg').show().fadeOut(2000);
        if(msg) $('#loginErrorMsg .msgBody').text(msg);
      }
    }

    function saveCred(un,pw,remCredBool){
      const userCred = {un:un,pw:pw};
      let userObj = "";
      if(remCredBool){
        userObj = JSON.stringify(userCred);
      }
      userObj = encodeX(userObj);
      localStorage.setItem('USERCRED',userObj);
    }

    function decorateTimeData(){
      var name = getUserName();
      if(name){
        var greatingText = `Hi, ${name}`;
      }else{
        greatingText = '';
      }
      $('#userMsg').text(greatingText);
      var data = localStorage.getItem('AttendanceData');
      if(data){      
        data = JSON.parse(data);
        setRefTime(data);
        setBktTimeOptions(data);
      }
    }

    function getUserName(){
      var ud = localStorage.userData;
      if(ud){
        ud = decodeX(ud);
        var userData = JSON.parse(ud);
      }
      if(userData){
        var name = userData.UserAuth[0].UserName.replace(/[0-9]/g, '');
        name = name.charAt(0).toUpperCase() + name.slice(1);
        userData.name = name;
        return name;
      }
    }
    function ajaxLoader(show){
      if(show){
        $('#loader').show();
      }else{
        $('#loader').hide();
      }
    }
    function getAttendanceData(){
      ajaxLoader(true);
      exec$Json();
      var userData = JSON.parse(decodeX(localStorage.userData) || '{}');
      var URL = WebAPIURL +  "Attendance/getAttendance";
            $.support.cors = true;
            userData.InOffice = new Array();
            var RFlag = 'L';
            var inOffc = -1;
            if ($("#chkInOffc").is(":checked") == true && RFlag == 'R')
              inOffc = 1;
            else if(RFlag == 'R')
              inOffc = 0;

            userData.InOffice[0] = new Object({ In: inOffc });

            $.ajax({
                url: URL,
                type: 'POST',
                data: JSON.stringify($.toJSON(userData)),
                contentType: "application/json;charset=utf-8",
                success: function (data) {
                    if (data.status == 1) {
                      var arr = data.obj.lstTS;
                      var todaysObj = arr.filter(day => new Date().getDate() == day.date.substr(0,2));
                      $('#inputTime').val(todaysObj[0].intime);
                      setTimeStamp(data);
                      setRefTime(data);
                      resetRemainingTime(data);
                      entryTimeEventTrigger();
                      setBktTimeOptions(data);
                      localStorage.setItem('AttendanceData',JSON.stringify(data));
                    }
                    else {
                      console.log('data.status != 1');
                      localStorage.userData = '';
                      if(confirm('Login again on this device?')){
                        login();
                      }
                    }
                    ajaxLoader(false);
                },
                error: function (xhr, textStatus, err) {
                  ajaxLoader(false);
                  console.log('getAttendanceData error');
                  checkInternet();
              }
            });
    }
    function setBktTimeOptions(data){
      var bucketTime = data.obj.lstReq[0]._TodayTommTotDur.replace(/[^\d\:]/g,'')
      styleBktTimeOptions(bucketTime);
    }

    function styleBktTimeOptions(bucketTime){
      var template = `<button data-time="${bucketTime}" title="Today's Time to complete." class="btn btn-xs border-black">${bucketTime}</button>`;
      $('#dynamBktTimeOptions').html(template);
    }

    function resetRemainingTime(data){
      if(new Date().getDay() == 1) {//Monday
        if(localStorage["BUCKETTIME"] != DEFAULTBUCKTIME){
          if(confirm('Its Monday, Do you want to reset bucket Time time to ' + DEFAULTBUCKTIME + ' hours?')){
            localStorage["BUCKETTIME"] = DEFAULTBUCKTIME;
            $('.bucketTime').text(DEFAULTBUCKTIME);
          }
        }
      }
      if(new Date().getDay() == 5) {//Friday
      	var bucketTime = data.obj.lstReq[0]._TodayTommTotDur.replace(/[^\d\:]/g,'')
        $('.bucketTime').text(bucketTime);
        localStorage.setItem(BUCKETTIME,bucketTime);
  	  }
    }

    function setUserCred(){
      var userObj = localStorage.getItem('USERCRED');
      debugger;
      userObj = decodeX(userObj);
      if(userObj){
        userObj = JSON.parse(userObj);
        $('#mastId').val(userObj.un);
        $('#mastPass').val(userObj.pw);
        $('#remCred').prop('checked',true);
      } else{
        $('#remCred').prop('checked',false);
      }
    }

    /*! jQuery JSON plugin 2.4.0 | code.google.com/p/jquery-json */
  function exec$Json() {
    var hasOwn = Object.prototype.hasOwnProperty;
    $.toJSON = typeof JSON === 'object' && JSON.stringify ? JSON.stringify : function(o) {
        if (o === null) {
            return 'null';
        }
        var pairs, k, name, val, type = $.type(o);
        if (type === 'undefined') {
            return undefined;
        }
        if (type === 'number' || type === 'boolean') {
            return String(o);
        }
        if (type === 'string') {
            return $.quoteString(o);
        }
        if (typeof o.toJSON === 'function') {
            return $.toJSON(o.toJSON());
        }
        if (type === 'date') {
            var month = o.getUTCMonth() + 1,
                day = o.getUTCDate(),
                year = o.getUTCFullYear(),
                hours = o.getUTCHours(),
                minutes = o.getUTCMinutes(),
                seconds = o.getUTCSeconds(),
                milli = o.getUTCMilliseconds();
            if (month < 10) {
                month = '0' + month;
            }
            if (day < 10) {
                day = '0' + day;
            }
            if (hours < 10) {
                hours = '0' + hours;
            }
            if (minutes < 10) {
                minutes = '0' + minutes;
            }
            if (seconds < 10) {
                seconds = '0' + seconds;
            }
            if (milli < 100) {
                milli = '0' + milli;
            }
            if (milli < 10) {
                milli = '0' + milli;
            }
            return '"' + year + '-' + month + '-' + day + 'T' +
                hours + ':' + minutes + ':' + seconds + '.' + milli + 'Z"';
        }
        pairs = [];
        if ($.isArray(o)) {
            for (k = 0; k < o.length; k++) {
                pairs.push($.toJSON(o[k]) || 'null');
            }
            return '[' + pairs.join(',') + ']';
        }
        if (typeof o === 'object') {
            for (k in o) {
                if (hasOwn.call(o, k)) {
                    type = typeof k;
                    if (type === 'number') {
                        name = '"' + k + '"';
                    } else if (type === 'string') {
                        name = $.quoteString(k);
                    } else {
                        continue;
                    }
                    type = typeof o[k];
                    if (type !== 'function' && type !== 'undefined') {
                        val = $.toJSON(o[k]);
                        pairs.push(name + ':' + val);
                    }
                }
            }
            return '{' + pairs.join(',') + '}';
        }
    };
  }
  
  function encodeX(inp){
    var rn = Number.parseInt(Math.random()*5+1);
    for (var i = 0; i < rn; i++) {
      inp = btoa(inp);
    }
    return rn + inp;
  }

  function decodeX(es){
    if(es){
      var rn = es[0];
      es = es.substr(1);
      for (var i = 0; i < Number.parseInt(rn); i++) {
        es = atob(es);
      }  
    }
    return es;
  }

  function hello(x){
    alert('x:' +x);
  }

  function setTimeStamp(data){
    data.timeStamp = new Date().getTime();
  }
  
  function getDayName(data){    
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date(data.timeStamp).getDay()] || '';
  }

  function setRefTime(data){
    $('#refTime').text(data.obj.lstReq[0]._CurrTime + ', ' + getDayName(data));
    $('#refTime').attr('title', new Date(data.timeStamp));
  }
 /* document.addEventListener('DOMContentLoaded', function () {
    chrome.alarms.create("myAlarm", {when:Date.now() , periodInMinutes: 0.1} );
  });*/
//})