var interval;
chrome.runtime.onStartup.addListener(function(){
	startTimer();
})
chrome.runtime.onInstalled.addListener(function(){
	startTimer();
})

function startTimer(){
	
	console.log(localStorage['targetDate']);
	interval = setInterval(function(){
		
		//var i = ""+ Math.floor(Math.random(10)*10) + "";
		var targetDateLS = localStorage['targetDate'];
		if(targetDateLS){

			var trgtDate = new Date(targetDateLS);
			var currDate = new Date();
			var hr = trgtDate.getHours() - currDate.getHours();
			var min = trgtDate.getMinutes() - currDate.getMinutes();
			if(min < 0){
				min = 60 + min;
				hr = hr-1;
			}
			console.log("a");
			var i = hr + "." + min;
	  		chrome.browserAction.setBadgeText({text: i});
	  	}
	}, 1000);	
}