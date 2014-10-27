joindota-matches-parser<br/>
=======================<br/>
<br/>
Usage:<br/>
```javascript
joindota.getJDMatches(
  URL, 
  function(eventsArray){
  	callback(eventsArray);
  }
)
```
<br/>
match Object: <br/>
*	team1: string<br/>
*	team2: string<br/>
*  winner:<br/>
**    -1 if match not finished<br/>
**    0 if team1 won<br/>
**    1 if team2 won <br/>
**    2 if tie<br/>
*  score: <br/>
**    'none' if no winner yet<br/>
**    or '0:1', '1:2' etc.<br/>
*timeleft: timestamp at CET ; time is 12:00 if match is finished<br/>
*date: parsed date from JD<br/>
*time: string, concated from date + timeleft<br/>
