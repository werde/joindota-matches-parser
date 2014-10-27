/*
//	team1: string
//	team2: string
//	winner:
//		-1 if match not finished
//		0 if team1 won
//		1 if team2 won 
//		2 if tie
//	score: 
//		'none' if no winner yet
//		 or '0:1', '1:2' etc.
//	timeleft: timestamp at CET ; time is 12:00 if match is finished
//	date: parsed date from JD
//	time: string, concated from date + timeleft
//  d = new Date();
//  console.log((+new Date() - Date.UTC(2014,01,6,9,43))/3600000);
//																		*/

var http = require('http');
var config = require("../config/config.js")

exports.getJDMatches = function(joindotaUrl, callback) {
	var events = [];
	var dota_event = {};
	console.log("joindotaUrl  " + joindotaUrl);
	http.get(joindotaUrl, function(res){
		var chunks = "";

		res.setEncoding("utf8");

		res.on('data', function(chunk){
			chunks += chunk;
		});

		res.on('end', function(ch){
			var matchTable = "";
			var items = [];
			if (!chunks.match(/<div class="pad">[^]*<div class="item last">/i)) return null;
			matchTable = chunks.match(/<div class="pad">[^]*<div class="item last">/i)[0];

			items = matchTable.match(/<div class="sub" style="width: 100px;">[^]*?<\/a>/gi);

			for (i in items) {
				var dota_event = makeMatchObj(items[i])
				if (dota_event != null) {
					events.push(dota_event);
				}
			}
			//console.log(events[0]);
			callback(events);
		})

	}).on('error', function(err){
		console.log("Joindota  get matches error: " + err.message);
	})
}

function makeMatchObj(inputString) {
	var ret = {};

	//extracting team1 name
	if (!inputString.match(/\/>([^]*?)<\/div>/gi))	return null;	
	ret.team1 = inputString.match(/\/>([^]*?)<\/div>/gi)[0];
	if (!ret.team1)	return null;	

	ret.team1 = ret.team1.slice(3, ret.team1.length - 6);
	ret.team1 = handleTeamName(ret.team1);
	if (ret.team1 == '0') {
		return null;
	}

	//extracting team2 name
	ret.team2 = inputString.match(/\/>([^]*?)<\/div>/gi)[1];
	if (!ret.team2)	return null;	

	ret.team2 = ret.team2.slice(3, ret.team2.length - 6);
	ret.team2 = handleTeamName(ret.team2);
	if (ret.team2 == '0') {
		return null;
	}

	//extracting date, time and score
	ret.date = inputString.match(/<div class="sub" style="width: 100px;">[^]*?<\/div>/)[0];
	ret.date = ret.date.slice(39, ret.date.length - 6);
	
	if (inputString.match(/\d\d:\d\d/)) {
		ret.timeleft = inputString.match(/\d\d:\d\d/)[0];
		ret.score = 'none';
		ret.winner = -1;
	} else if(inputString.match(/\d<\/span>:<span[^]*?\d/)) {
		ret.score = inputString.match(/\d<\/span>:<span[^]*?\d/)[0];
		ret.score = ret.score.match(/\d/)[0] + ":" + ret.score.match(/\d$/)[0];

		if (ret.score.match(/\d/)[0] > ret.score.match(/\d$/)[0]) {
			ret.winner = 0;
		} else if (ret.score.match(/\d/)[0] < ret.score.match(/\d$/)[0]) {
			ret.winner = 1;
		} else {
			ret.winner = 2;
		}
		ret.timeleft = "12:00"
	} else if(inputString.match(/\d:\d \(def\)/)) {
		ret.score = inputString.match(/\d:\d \(def\)/)[0];
		ret.score = ret.score.slice(0, ret.score.length - 6);

		if (ret.score.match(/\d/)[0] > ret.score.match(/\d$/)[0]) {
			ret.winner = 0;
		} else if (ret.score.match(/\d/)[0] < ret.score.match(/\d$/)[0]) {
			ret.winner = 1;
		} else {
			ret.winner = 2;
		}

		ret.timeleft = "12:00"
	} else if(inputString.match(/LIVE<\/span>/)) { //Must do something with live matches
		return null;
		//console.log("ret.winner = 1;" + inputString);
	} else {
		return null;
	};
	
	ret.time = dateToTimestamp(ret.date, ret.timeleft);
	ret.timeleft = '' + ret.timeleft  + ' ' + ret.date;

	if (Math.abs(ret.time - new Date()) > config["DAYS_MATCHES_SAVED"]) {
		return null;
	}
	//console.log(ret);
	return ret;
}

function dateToTimestamp(date, time) {
	if (!time) {
		return 0;
	}
	var ldate = new Date();
	var date_array = date.split('.');
	var time_array = time.split(':');

	ldate.setYear( 2000 + parseInt(date_array[2]));
	ldate.setMonth( -1 + parseInt(date_array[1]));
	ldate.setDate(0 + parseInt(date_array[0]));
	ldate.setHours(0 + parseInt(time_array[0]));
	ldate.setMinutes(0 + parseInt(time_array[1]));
	ldate.setSeconds(0);
	ldate.setMilliseconds(0);
	//console.log(ldate);
	return (+ldate);
}

function handleTeamName(name) {
	if (!name) return '0';
	var name_found = '';
	var dis = {
		'Alliance' : 'Alliance',
		'The Alliance' : 'Alliance',

		'Cloud 9 HyperX' : 'Cloud 9',
		'Cloud 9' : 'Cloud 9',

		'DK' : 'DK eSports',
		'DK eSports' : 'DK eSports',

		'Empire' : 'Team Empire',
		'Team Empire' : 'Team Empire',

		'EG' : 'Evil Geniuses',
		'Evil Geniuses' : 'Evil Geniuses',

		'Fnatic' : 'Fnatic.eu',
		'Fnatic.' : 'Fnatic.eu',
		'Fnatic.eu' : 'Fnatic.eu',

		'iG' : 'Invictus Gaming',
		'iG.' : 'Invictus Gaming',
		'Invictus Gaming' : 'Invictus Gaming',

		'Liquid' : 'Team Liquid',
		'Team Liquid' : 'Team Liquid',

		'LGD.Int' : 'LGD.Int',
		'LGD.int' : 'LGD.Int',
		'LGD.International' : 'LGD.Int',

		'LGD' : 'LGD.China',
		'LGD.cn' : 'LGD.China',
		'LGD.China' : 'LGD.China',

		'NaVi' : 'Natus Vincere',
		'Na\'Vi' : 'Natus Vincere',
		'Na`Vi' : 'Natus Vincere',
		'Natus Vincere' : 'Natus Vincere',

		"NewBee" : 'Newbee',
		"Newbee" : 'Newbee',

		'mouz' : 'Mousesports',
		'Mouz' : 'Mousesports',
		'Mousesports' : 'Mousesports',

		'RoX.KIS' : 'rox.KIS',
		'rox.KIS' : 'rox.KIS',
		
		'PR' : 'Power Rangers',
		'PR2' : 'Power Rangers',
		'Power Rangers' : 'Power Rangers',

		'The Retry' : 'The Retry',

		'Titan' : 'Titan',

		'VG' : 'ViCi Gaming',
		'VG.cn' : 'ViCi Gaming',
		'Vici Gaming' : 'ViCi Gaming',
		'ViCi Gaming' : 'ViCi Gaming',

		'VP' : 'Virtus pro',
		'Virtus.Pro' : 'Virtus pro',
		'Virtus Pro' : 'Virtus pro',
		'Virtus pro' : 'Virtus pro',

		'TBD' : '0' //TBD == To Be Decided
	};
	name_found = dis[name];
	if (name_found) {
		return name_found;
	} else {
		//console.log(name);
		return name;
		return '0';
	};
};

//http://www.joindota.com/en/matches

