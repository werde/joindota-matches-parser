joindota-matches-parser
=======================

Usage:
joindota.getJDMatches(
  URL, 
  function(eventsArray){
		callback(eventsArray);
  }
)

match Object: 
	team1: string
	team2: string
  winner:
    -1 if match not finished
    0 if team1 won
    1 if team2 won 
    2 if tie
  score: 
    'none' if no winner yet
    or '0:1', '1:2' etc.
timeleft: timestamp at CET ; time is 12:00 if match is finished
date: parsed date from JD
time: string, concated from date + timeleft
