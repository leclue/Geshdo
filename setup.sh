#!/bin/bash

echo -e "\n[1/18] Checking if Geshdo API is alive"
if [[ $(curl -I -s http://localhost:3000/ | grep HTTP | cut -d" " -f2) != 200 ]]; then
	echo -e "\nGeshdo API does not seem to be running:"
	curl -I 'http://localhost:3000/'
else
	echo -e "\nGeshdo API seems to be running:"
	curl -I -s 'http://localhost:3000/' | grep HTTP
	echo -e "\n ------ "

	echo -e "\n[2/18] Return last card ID used"
	curl 'http://localhost:3000/getlastid'
	echo -e "\n ------ "

	echo -e "\n[3/18] Set all required fields for specific card (3 cards)"
	curl 'http://localhost:3000/updatecarddetails/card1?type=ccffff&title=Admin&content=suchContent&section=sectionToDo&active=YES&timespent=0&user=demo&duration=30'
	echo -e "\n"
	curl 'http://localhost:3000/updatecarddetails/card2?type=ffffcc&title=Email&content=Card2Content&section=sectionDone&active=YES&timespent=0&user=demo&duration=45'
	echo -e "\n"
	curl 'http://localhost:3000/updatecarddetails/card3?type=ffffcc&title=Email&content=Card3Content&section=sectionDone&active=YES&timespent=0&user=otheruser&duration=30'
	echo -e "\n ------ "

	echo -e "\n[4/18] Set all required fields for specific user"
	curl -g 'http://localhost:3000/updatetusersettings/demo?teamname=demo&sections=[%22To%20Do%22,%22Pending%22,%22Done%22]&cardtitles=[%22Admin%22,%22Email%22,%22Chores%22,%22Calls%22]&cardcolors=[%22ffffcc%22,%22ffccff%22,%22ffcc99%22,%22ccffff%22]&defaultview=Day'
	echo -e "\n ------ "

	echo -e "\n[5/18] Get all settings for specific user"
	curl 'http://localhost:3000/getuserconfig/demo'
	echo -e "\n ------ "

	#No longer needed.
	#echo -e "\n[6/19] Get defaultview for specific user"
	#curl 'http://localhost:3000/getdefaultview/demo'
	#echo -e "\n ------ "

	echo -e "\n[6/18] Get required details for all active cards for specific user"
	curl 'http://localhost:3000/getallactivecards/demo'
	echo -e "\n ------ "

	echo -e "\n[7/18] Get time spent for specific card"
	curl 'http://localhost:3000/gettimespent/card1'
	echo -e "\n ------ "

	echo -e "\n[8/18] Get card metadata"
	curl 'http://localhost:3000/getcardmetadata/card1'
	echo -e "\n ------ "

	echo -e "\n[9/18] Get the scheduledDuration for a specific card"
	curl 'http://localhost:3000/getduration/card1'
	echo -e "\n ------ "

	echo -e "\n[10/18] Update content field for specific card"
	curl 'http://localhost:3000/setcardcontent/card2?content=Thisismycard'
	echo -e "\n ------ "

	echo -e "\n[11/18] Update section field for specific card"
	curl 'http://localhost:3000/updatecardsection/card2?section=sectionPending'
	echo -e "\n ------ "

	echo -e "\n[12/18] Update card to set inactive"
	curl 'http://localhost:3000/updatecardstatus/card2'
	echo -e "\n ------ "

	echo -e "\n[13/18] Set time spent for specific card"
	curl 'http://localhost:3000/settimespent/card1?timespent=22'
	echo -e "\n ------ "

	echo -e "\n[14/18] Set card metadata"
	curl -g 'http://localhost:3000/setcardmetadata/card1?time=22&date=11/01/2015&repeat=None&moredata=MoarData&duration=30'
	echo -e "\n ------ "

	echo -e "\n[15/18] Set card start or end time event"
	curl 'http://localhost:3000/setcardtimeevent/card1?timevalue=1446301093.432&timetype=start'
	echo -e "\n ------ "

	echo -e "\n[16/18] Update title details associated with all cards"
	curl 'http://localhost:3000/updatetitlecards?newtitle=Project&oldtitle=Admin&username=demo'
	echo -e "\n ------ "

	echo -e "\n[17/18] Update section details associated with all cards"
	curl 'http://localhost:3000/updatesectioncards?newsection=sectionAlmostDone&oldsection=sectionDone&username=demo'
	echo -e "\n ------ "

	echo -e "\n[18/18] Return all details for all active cards for team"
	curl 'http://localhost:3000/getallactiveteamcards/demo'
	echo -e "\n ------ "
	echo -e "\nDone "
fi