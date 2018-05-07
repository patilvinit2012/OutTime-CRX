/*var script = document.createElement('script');
script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js';
script.type ="text/javascript";
document.body.appendChild(script);

function getDayOfWeek(date) {
  var dayOfWeek = new Date(date).getDay();    
  return isNaN(dayOfWeek) ? null : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
}

var todaysBox;
var weekIndex;

var inTimeId = 'ctl00_cphPage_lblInTime';
$('.bold-black-header').each(function(){
	if($(this).text() == new Date().getDate())
	{
		todaysBox = $(this).closest('.data');
		weekIndex =  todaysBox.attr('id').slice(-1);
		inTimeId = inTimeId + getDayOfWeek(new Date()) + weekIndex;
	}
})
var inTime = $('#'+inTimeId).text();
copyToClipboard(inTime);

localStorage.setItem('mastekInTime',inTime);



function copyToClipboard(text){
    var dummy = document.createElement("input");
    document.body.appendChild(dummy);
    dummy.setAttribute('value', text);
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}*/
