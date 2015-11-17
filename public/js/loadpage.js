//Used to generate HTML based on user settings

var viewToLoad = "";
var userSettingsJson = "";
var sectionWidth = "";
var curSectionLeft = 30;
var addCardTop = 40;
var date = new Date();
var dayHours = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];
var safeSectionNames = [];
var indSectionClass = "section";
var sectionClass = "";
var timeLablesTableStyle = "";
var cardContainerTableStyle = 'class="weekViewContainerTable"';
var sectionId = "";
var timeLablesTable = "";
var cardContainerTable = "";
var date = new Date();
var currentHour = "";
var currentMin = "";
var cardRowSpan = 1;
var newCardDuration = 30;
var currentCardDuration = 30;
var currentviewTitle = "";
var weekDays = [];
var msToSubtract = 86400000;
var targetTimeLables = "";
var targetCardContainer = "";
var cardsInTable = [];
var widthCounter = 1;
var cardRowSpans = [];
var boardWidth = 0;
var boardHeight = 0;
var firstDayOfWeek = new Date();
var startOfWeek = new Date();
var staticDate = new Date();
var newCardUser = "";
var uniqUsers = [];

function getUserSettings(settingsUserName) {
	$.getJSON("getuserconfig/" + settingsUserName, function(settingsJson) {
		userSettingsJson = settingsJson;
		settingsTeamName = settingsJson.teamname;
		if (sessionStorage.getItem('viewToLoad') === null ){
			viewToLoad = settingsJson.defaultView;;
			sessionStorage.setItem('viewToLoad', viewToLoad);
		}
		else {
			viewToLoad = sessionStorage.getItem('viewToLoad');
		}
		loadView();
	}).fail(function(jqXHR) {
    	console.log("No existing user config... Pushing defaults")
		$.ajax({
			type: "GET",
			async: false,
			data: 'teamname='+settingsUserName+'&sections=["To Do","In Progress","Pending","Done"]&cardtitles=["Admin","Chore"]&cardcolors=["ffffcc","ffccff"]&defaultview=Day',
	    	url: "/updatetusersettings/" + settingsUserName,
	        success: function(msg){
	           	console.log(msg);
	           	getNextAvailableId();

				newCardColor = 'ffffcc'
				newCardId = "card" + newCardIdNum;
				newCardTimespent = "0";
				newCardContents = "Double-click to edit";
				newCardTitle = 'Admin'
				cardRowSpan = 3;
					        
				//Write card data to DB
				updateSavedCardDetails (newCardTitle, newCardColor, newCardContents, newCardId, 'sectionToDo', newCardTimespent, 30);
				//spawn card
				setTimeout(function(){
  					location.reload();
				}, 500);
	        },
			cache: false,
			async: false
	    });
    });
}

function spawnSections(sectionNames) {
	sectionTitleHTML = "";
	sectionIDs = "";
	sectionHTML = "";

	//For each section found, create the sections on the board
	$.each(sectionNames, function( index, sectionToAdd ) {
		newCardSection = sectionToAdd;
		sectionClass = indSectionClass;
		sectionId = sectionIDPrefix + safeSectionNames[index]
		//console.log("sectionToAdd: " + sectionId)
		sectionTitleHTML = sectionTitleHTML + '<div class="title" id="title' + safeSectionNames[index] + '" style="left:' + curSectionLeft + 'px;width:' + parseInt(sectionWidth + 2) + 'px;">' + sectionToAdd + '</div>';

		if (index == 0){
			if (viewToLoad === "Day") {
				sectionTitleHTML = '<div id="title' + safeSectionNames[index] + '" class="firstTitle title" style="left:6px;width:' + parseInt(sectionWidth + 30) + 'px;">' +
	  								'<a href="javascript:void(0)" class="addcard" onclick="$(\'#dlg\').dialog(\'open\')">' + 
	  									'<img src="/images/black_gear_icon.png" style="width:16px;float:left;">' +
	  								'</a>' +
									sectionToAdd +
							   '</div>';
			}
			else {
				sectionTitleHTML = '<div id="title' + safeSectionNames[index] + '" class="firstTitle title" style="left:6px;width:' + parseInt(sectionWidth + 30) + 'px;">' + 
	  								sectionToAdd + '</div>';
			}
			
			addNewCardSection = sectionIDPrefix + safeSectionNames[index];
			sectionIDs = "#" + sectionIDPrefix + safeSectionNames[index] + ", ";
		}
		else if (index == 1){
			if (viewToLoad === "Day"){
				sectionClass = indSectionClass + " todaysection";
				sectionId = safeSectionNames[index];
				//console.log("sectionId: " + sectionId)
				targetCardContainer = "#" + sectionId;
				targetTimeLables = "#" + sectionId;
			}
			else {
				sectionIDs = sectionIDs + "#" + sectionIDPrefix + safeSectionNames[index] + ", ";
			}
		}
		else if (index == parseInt(sectionNames.length-1)){
			sectionClass = indSectionClass + " lastsection";
			sectionIDs = sectionIDs + "#" + sectionIDPrefix + safeSectionNames[index];
		}
		else {
			sectionIDs = sectionIDs + "#" + sectionIDPrefix + safeSectionNames[index] + ", ";
		}
		if (viewToLoad === "Week" || viewToLoad === "TeamWeek") {
			if (staticDate.format('D-Mjy') == safeSectionNames[index] ){
				sectionClass = "todayInWeek";
			}
		}

		sectionHTML = sectionHTML + '<div id="' + sectionId + '" class="' + sectionClass + '" style="left:' + curSectionLeft + 'px;width:' + parseInt(sectionWidth + 2) + 'px;"></div>';
		curSectionLeft = parseInt(curSectionLeft + sectionWidth + 2);
		$('#addSection').trigger("click");
	});
}

function updateBoard() {
	$(sectionTitleHTML).appendTo($("#board"));
	$(sectionHTML).appendTo($("#board"));
	console.log(viewToLoad)

	if (viewToLoad === "Week" || viewToLoad === "TeamWeek"){
		drawTimeLables("#board");
		$.each(safeSectionNames, function(index, weeklySections) {
			drawScheduleTable("#" + safeSectionNames[index]);
		});
		
	}
	else if (viewToLoad === "Day"){
		drawTimeLables(targetTimeLables);
		drawScheduleTable(targetCardContainer);
		
	}
	$('#rightArrow').click(function (event) {
		changeView("right")
	});
	$('#leftArrow').click(function (event) {
		changeView("left")
	});
}

function prepareWeekLoad() {
	$("#board").height("3104px");
	var scrollToNext = '<div id="scrollToNext" class="scrollTo" style="height: 2604px; padding-top: 500px; right:0px; display:none">' +
										'<a href="javascript:void(0)" >' +
										'<div style="margin-right:10px" class="rightArrow"/>' + 
										'</a>'
									'</div>';
	var scrollToLast = '<div id="scrollToLast" class="scrollTo" style="height: 2604px; padding-top: 500px; left:0px; display:none">' +
										'<a href="javascript:void(0)" >' + 
										'<div style="margin-left:10px" class="leftArrow"/>' +
										'</a>' +
									'</div>';
	$(scrollToLast).add($(scrollToNext)).appendTo($('#board'))
	$('.scrollTo').fadeIn(1000)
	msToSubtract = 86400000;
	//Check if today is the start of the week
	for (i = 0; i < 7; i++){
		startOfWeek.setTime(date.getTime() - msToSubtract)
		//if (date.format('W') > startOfWeek.format('W')) {
		if (date.format('W') != startOfWeek.format('W')) {
			startOfWeek.setTime(startOfWeek.getTime() + 86400000);
			firstDayOfWeek.setTime(startOfWeek.getTime())
			break;
		}
		else {
			msToSubtract = msToSubtract + 86400000;
		}
	}
	
	//populate weekdays array with details of the current week
	for (i = 0; i < 7; i++){
		weekDays[i] = startOfWeek.format('D - M j y');
		console.log(weekDays[i])
		startOfWeek.setTime(startOfWeek.getTime() + 86400000);
	}

	curSectionLeft = 60;
	safeSectionNames = []
	sectionNames = []
	sectionIDPrefix = "";
	targetTimeLables = "";
	targetCardContainer = "";
	sectionWidth = ((parseInt($(window ).width() - 140)) / 7);
		indSectionClass = "section weeklySections";
	timeLablesTableStyle = 'class="timeLablesTable" style="top:30px;left:30px;position:absolute;width:1px;font-size:10px"';
	cardContainerTableStyle = 'class="weekViewContainerTable" style="width:97%;margin-left:9px;"';
	//currentViewTitle = settingsUserName + "\'s Geshdo board - Week view (Week " + date.format('W') + ")";
	currentViewTitle = '<a href="javascript:void(0)" > <div class="leftArrow" id="leftArrow"/> </a>' +
						'<div class="currentViewTitle" >' + settingsUserName + '\'s Geshdo board - Week view (Week ' + date.format('W') + ') ' +
	//					'<a href="javascript:void(0)" >' + 
	  //							'<div class="rightArrow" id="rightArrow"/>' +
	  	//					'</a></div>';
	  					'</div>';
	if (viewToLoad === "TeamWeek"){
		currentViewTitle = '<div class="currentViewTitle">' + settingsTeamName + '\'s Geshdo board - Week view (Week ' + date.format('W') + ') ' +
						'<a href="javascript:void(0)" >' + 
	  							'<div class="rightArrow" id="rightArrow"/>' +
	  						'</a></div>';
	}
	$("#viewTitle").html(currentViewTitle);
	sectionIDPrefix = "";
	$.each(weekDays, function(index, weekday) {
		//safeSectionNames.push(weekday.trim().replace(/ /g, ""));
		safeSectionNames[index] = weekday.trim().replace(/ /g, "");
		weekDays[index] = weekDays[index].replace(/..$/g, "");
	});

	$('#scrollToNext, #scrollToLast').click(function (event) {
		//viewToLoad = "Week"
		//console.log($(event.target).attr("class"))
		var timeLablesTableStyleLeft = "";
		var initElementPos = ""
		var elementsMoveBy = ""
		if ($(event.target).attr("class") === "rightArrow") {
			date.setTime(parseInt(date.getTime() + (86400000 * 7)))
			timeLablesTableStyleLeft = "2113px"
			initElementPos = "+=2083"
			elementsMoveBy = "-=2083"
		}
		else {
			date.setTime(parseInt(date.getTime() - (86400000 * 7)))
			timeLablesTableStyleLeft = "-2113px"
			initElementPos = "-=2083"
			elementsMoveBy = "+=2083"
		}
		console.log("Setting Current Date as: " + date.format('D M j y'))
		$('#scrollToNext, #scrollToLast').remove()
		$.when( prepareWeekLoad() ).done(function() {
			$.when( spawnSections(weekDays) ).done(function() {
				sectionTitleHTML = sectionTitleHTML.replace(/class="/g, "class=\"hidden ");
				sectionHTML = sectionHTML.replace(/class="/g, "class=\"hidden ");
				sectionHTML = sectionHTML.replace(/class="hidden/g, "class=\"hidden ");
				$('.timeLablesTable').attr("class", "timeLablesTable hidden")
				$.when( updateBoard() ).done(function() {
					$('.hidden').css("left", initElementPos).css("display", "block")
					$($('#board').children().not("#scrollToNext, #scrollToLast")).animate({ 
						left: [ elementsMoveBy, "linear"]
					}, 2000);
					$('#board').animate({
			   			backgroundPositionX: elementsMoveBy,
					}, 2000);
				
					$($('#board').children()).promise().done(function() {
						$($('#board').children()).filter(function(){ 
							var position = $(this).position();
							if (position.left < 0){
								$(this).remove();
							}
							else if (position.left > 2088){
								$(this).remove();
							}
						})
					})

					$($('#board').children()).promise().done(function() {
						$($('#board').children()).removeClass("hidden")
						loadCurrentCards("weekViewContainerTable");
					});
				});
			});
		});
	})
}

function loadView() {
	//Set board dimensions according to window size
	boardWidth = parseInt($(window ).width() - 50);
	boardHeight = parseInt($(window ).height() - 60)
	$("#board").width(boardWidth);
	$("#board").height(boardHeight);
	currentHour = date.format('H');
	currentMin = date.format('i');

	//Check if today is the start of the week
	for (i = 0; i < 7; i++){
		startOfWeek.setTime(date.getTime() - msToSubtract)
		//if (date.format('W') > startOfWeek.format('W')) {
		if (date.format('W') != startOfWeek.format('W')) {
			startOfWeek.setTime(startOfWeek.getTime() + 86400000);
			firstDayOfWeek.setTime(startOfWeek.getTime())
			break;
		}
		else {
			msToSubtract = msToSubtract + 86400000;
		}
	}
	
	//populate weekdays array with details of the current week
	for (i = 0; i < 7; i++){
		weekDays[i] = startOfWeek.format('D - M j y');
		//console.log(weekDays[i])
		startOfWeek.setTime(startOfWeek.getTime() + 86400000);
	}

	if (viewToLoad === "TeamWeek") {
	  	$.when( prepareWeekLoad() ).done(function() {
	  		currentViewTitle = '<a href="javascript:void(0)" > <div class="leftArrow" id="leftArrow"/> </a>'+
	  							'<div class="currentViewTitle"> ' + settingsTeamName + '\'s Geshdo board - Week view (Week ' + date.format('W') + ') ' +
								'<a href="javascript:void(0)" >' + 
	  								'<div class="rightArrow" id="rightArrow"/>' +
	  							'</a></div>';
	  		$("#viewTitle").html(currentViewTitle);

  			$.when( spawnSections(weekDays) ).done(function() {
				$.when( updateBoard() ).done(function() {
					loadCurrentCards("weekViewContainerTable");
				});
			});
		});
	}
	else if (viewToLoad === "Week") {
		$.when( prepareWeekLoad() ).done(function() {
  			$.when( spawnSections(weekDays) ).done(function() {
				$.when( updateBoard() ).done(function() {
					loadCurrentCards("weekViewContainerTable");
				});
			});
		}); 
	}
	else if (viewToLoad === "Day") {
		timeLablesTableStyle = 'style="left:0;position:absolute;margin-left:7px;width:1px;font-size:10px"';
		cardContainerTableStyle = 'class="dayViewContainerTable" style="width:95%;margin-left:38px;" ';
		sectionIDPrefix = "section"
		currentViewTitle = '<a href="javascript:void(0)" > <div class="leftArrow" id="leftArrow"/> </a>' +
						'<div class="currentViewTitle">' + settingsUserName + '\'s Geshdo board - Kanban view ' +
						'<a href="javascript:void(0)" >' + 
	  							'<div class="rightArrow" id="rightArrow"/>' +
	  						'</a></div>';
		$("#viewTitle").html(currentViewTitle);

		sectionWidth = (parseInt($(window ).width() - 90) / (JSON.parse(userSettingsJson.sections).length));
		settingsDefaultView = userSettingsJson.defaultView;
		settingsTeamName = userSettingsJson.teamname;
		cardTypes = JSON.parse(userSettingsJson.cardTitles);
		cardColors = JSON.parse(userSettingsJson.cardColors);
		currentSections = JSON.parse(userSettingsJson.sections);
		$.each(currentSections, function(index, section) {
			if (index == 1){
				safeSectionNames.push(date.format('D-Mjy'));
				currentSections[index] = date.format('D - M j')
			}
			else {
				safeSectionNames.push(section.trim().replace(/ /g, ""));
			}
		});

		$.when( spawnSections(currentSections) ).done(function() {
			$.when( updateBoard() ).done(function() {
				loadCurrentCards("dayViewContainerTable");
			});
		});

		//For each Card Type found, create the AddCard buttons on the board
		$.each( JSON.parse(userSettingsJson.cardColors), function( index, cardColor ) {
			newCardTitle = cardTypes[index];
			newCardColor = cardColor;
			addCardButtonsHTML = addCardButtonsHTML + '<a href="#" id="' + cardColor + '" class="' + newCardTitle + '"><div class="addCardContainer" style="top:' + addCardTop + 'px;"><div style="background-color:#' + cardColor + ';" class="plus-sign"></div></div></a>';
			addCardTop = parseInt(addCardTop + 5);
			if (index == parseInt(JSON.parse(userSettingsJson.cardColors).length-1)){
				cardColorIDs = cardColorIDs + "#" + cardColor;
			}
			else {
				cardColorIDs = cardColorIDs + "#" + cardColor + ", ";
			}
			//Also add cardType into settings container
			$('#addCardType').trigger("click");	
		});

		$(addCardButtonsHTML).appendTo($("#board"));

		//Add event listeners for when new cards are added
		$(cardColorIDs).click(function (event) {
			//Call getNextAvailableId to set the newCardIdNum variable
			getNextAvailableId();

			newCardColor = event.originalEvent.currentTarget.id;
			newCardId = "card" + newCardIdNum;
			newCardTimespent = "0";
			newCardContents = "Double-click to edit";
			newCardTitle = $(event.currentTarget).attr('class')
			cardRowSpan = 3;
					        
			spawnCard (newCardIdNum, newCardColor, newCardId, addNewCardSection, newCardTimespent, newCardContents, newCardTitle, 30);
			//Write card data to DB
			updateSavedCardDetails (newCardTitle, newCardColor, newCardContents, newCardId, addNewCardSection, newCardTimespent, 30);
		});

		// bind the dragover event on the board sections
		$('.inprogress-dropable, ' + sectionIDs).bind('dragover', function(event) {
			event.preventDefault();
		});

		// bind the drop event on the board sections
		$('.inprogress-dropable, ' + sectionIDs).bind('drop', function(event) {

			var currentCardId = event.originalEvent.dataTransfer.getData("text/plain");
			event.target.appendChild(document.getElementById(currentCardId));
		    // Turn off the default behaviour - without this, FF will try and go to a URL with the id's name
			event.preventDefault();

		    var currentCardSection = document.getElementById(currentCardId).parentNode.id;

		    updatecardsection (currentCardId, currentCardSection);
			if ($("#" + currentCardId).parent().parent().parent().attr("class") === "dayViewContainerTable") {
				$.getJSON("getduration/" + currentCardId, function(response) {
					currentCardDuration = response[0].duration;
					var rowSpan = Math.ceil(currentCardDuration / 15)
					var newHeight = 32 * rowSpan;
					alterCardStyle ("scheduledCard", rowSpan, $("#" + currentCardId), currentCardSection, newHeight);
				});
			}
			// if the card is moved out of the today view, change the styles back
			else if ($('#' + currentCardId).attr("class") === "scheduledCard") {
				alterCardStyle ("normalCard", "1", $("#" + currentCardId), $("#" + currentCardId).attr("dragsource"), "auto");
			}
		});

		//Load Settings page up with current form data
		$('#userSettings').form('load',{
			name:settingsUserName,
			defaultView:settingsDefaultView,
			teamname:settingsTeamName
		}); 
	}
	else if (viewToLoad === "TeamOverview"){
		currentViewTitle = '<a href="http://0.0.0.0:5601/app/kibana#/dashboard/TeamView?_g=(refreshInterval:(display:Off,pause:!f,value:0),time:(from:now-15m,mode:quick,to:now))&_a=(filters:!(),options:(darkTheme:!t),panels:!((col:1,id:Number-of-Active-vs-Completed-Tasks-Per-User,row:1,size_x:12,size_y:4,type:visualization)),query:(query_string:(analyze_wildcard:!t,query:\'*\')),title:TeamView)" > <img src="/images/kibana.png" style="float: left; width:144px; padding-left:10px"></img> </a>' +
							'<div class="currentViewTitle">' + settingsTeamName + '\'s Geshdo board - Overview ' +
						'<a href="javascript:void(0)" >' + 
	  							'<div class="rightArrow" id="rightArrow"/>' +
	  						'</a></div>';
		$("#viewTitle").html(currentViewTitle);
		sectionTitleHTML = ""
		sectionHTML = ""
		updateBoard()
		console.log()
		//Get all active cards for team
		$.ajax({
		   	type: "GET",
		   	url: "getallactiveteamcards/" + settingsTeamName,
		   	dataType: 'json',
		   	success: function(msg){
		   		
		   		var userSummaryContiner = ""
		   		var itemsInSectionCount = 0
		   		var itemsInSection = ""
		   		var itemUpcoming = ""
		   		var itemsScheduledCount = 0
		   		var itemsScheduled = ""
		   		var itemsTodayCount = 0
		   		var itemsToday = ""
		   		var itemsThisweekCount = 0
		   		var itemsThisweek = 0
		   		var itemsThisMonthCount = 0
		   		var itemsThisMonth = 0
		   		var itemUpcomingCounter = 0
		   		var permItemsInSection = 0
		   		safeSectionNames = []
		   		var userStatus = ""
		   		var todayContainer = '<div style="right: 0px;position: absolute;width:459px;font-family: \'GoodDogRegular\';" class="title" id="title' + date.format('D-Mjy') + '" >' + date.format('D - M j') + '</div>'+
		   								'<div id="'+date.format('D-Mjy')+'" class="section todaysection" style="float: right;position: relative;width:459px;font-family: \'GoodDogRegular\';">'+
										'</div>';
				
				$("#board").css('overflow-y','auto')
				$.each( msg, function(index, value) {
					if ($.inArray(value.user, uniqUsers) === -1) {
						console.log(value.user)
		    			uniqUsers.push(value.user);
					}
				});
				$(todayContainer).appendTo('#board');

				timeLablesTableStyle = 'style="left:0;position:absolute;margin-left:7px;width:1px;font-size:10px; font-family: \'GoodDogRegular\';"';
				cardContainerTableStyle = 'class="dayViewContainerTable" style="width:95%;margin-left:38px;" ';
				drawTimeLables("#" + date.format('D-Mjy'));
				drawScheduleTable("#" + date.format('D-Mjy'));
				safeSectionNames.push(date.format('D-Mjy'));

				loadCurrentCards("dayViewContainerTable");

				$.each( uniqUsers, function( index, msgUsername ){
					var msgSections = [];
					var todaysItems = [];
					var containerLeft = Math.floor(Math.random() * (19 - 3 + 1)) + 3;

					userSummaryContiner = '<div id="' + msgUsername + 'Container" style=" background: url(\'/images/userSummaryContainer.png\') no-repeat 190px -28px; '+
											//'width: 380px; height: 255px; margin-left: ' + containerLeft + 'px; background-position-y: 0px; background-position-x: 103px; " >' +
											'width: 470px; height: 255px; float:left; margin-left: ' + containerLeft + 'px; " >' +
												'<div class="usernameHolder">' +
										  			msgUsername +
										  		'</div>';
										  	//'</div>';
					itemsInSection =   	  '<img src="/images/circle-top.png" style="position: relative; top: -54px; left: -100px"></img>' +
											'<div style="position: relative; top: -54px;left: 85px; font-family: \'GoodDogRegular\'; font-size:16px; width: 99px; text-align: center; margin-top: -4px; border-left: 2px solid black; border-right: 2px solid black;" >'; 
					itemsScheduled = 	  '<img style="top: -20px; left: 65px;position: relative;" src="/images/circle-top-wide.png"></img>' +
											'<div style="top: -20px; font-family: \'GoodDogRegular\'; font-size:16px; width: 181px; text-align: center; margin-top: -4px; border-left: 2px solid black; border-right: 2px solid black;left: 168px;position: relative;" >';
					itemUpcoming =    	  '<img src="/images/circle-top.png" style="left: 174px; position: relative; top: -188px;"></img>' +
											'<div style="font-family: \'GoodDogRegular\'; font-size:16px; width: 99px; text-align: center; margin-top: -4px; border-left: 2px solid black; border-right: 2px solid black;' +
											' position: relative; top: -188px; left: 359px;" >' +
											'Upcoming Item(s): ';

					$.each( msg, function(index, item) {
						if (item.user == msgUsername){
							//console.log("Considering: " + item.id + " In section " + item.section.substring(0, item.section.length-8) + " for today (" + date.format('D-Mjy') + ")")
							if ($.inArray(item.section, msgSections) === -1) {
								msgSections.push(item.section)
							}
							var teamOverviewDate = new Date(item.date)
							if (teamOverviewDate.getTime() > date.getTime()){
								if (teamOverviewDate.format('W') - date.format('W') < 1){
									itemsThisweekCount++
									console.log("Week : " + item.id)
								}
								if (teamOverviewDate.format('W') - date.format('W') <= 4){
									itemsThisMonthCount++
									console.log("month : " + item.id)
								}
							}
							if (item.repeat == "Daily"){
								itemsTodayCount++
								todaysItems.push(item.title + " at " + item.section.substring(item.section.length-4,item.section.length-2) + ":" + item.section.substring(item.section.length-2))
								console.log("today : " + item.id)
							}
							if (item.repeat == "Weekly"){
								itemsThisweekCount++
								console.log("Week : " + item.id)
							}
							if (item.repeat == "Monthly"){
								itemsThisMonthCount++
								console.log("month : " + item.id)
							}
							if (item.repeat == "Fortnightly"){
								itemsThisMonthCount++
								console.log("month : " + item.id)
							}
							if (item.section.substring(0, item.section.length-8) == date.format('D-Mjy')){
								if (item.repeat != "Daily"){
									itemsTodayCount++
									todaysItems.push(item.title + " at " + item.section.substring(item.section.length-4,item.section.length-2) + ":" + item.section.substring(item.section.length-2))
									console.log("today : " + item.id)
								}
							}
						}

					})
					//console.log("itemsThisMonthCount: " + itemsThisMonthCount + " itemsThisweekCount: " + itemsThisweekCount + " itemsTodayCount: " + itemsTodayCount)
					itemsScheduled = itemsScheduled + itemsTodayCount + ' Item(s) scheduled for today</br>'
					itemsScheduled = itemsScheduled + parseInt(itemsThisweekCount + itemsTodayCount) + ' Item(s) scheduled for this Week</br>'
					itemsScheduled = itemsScheduled + parseInt(itemsThisMonthCount + itemsThisweekCount + itemsTodayCount) + ' Item(s) scheduled for this Month</br></div>'+
																					'<img style="top: -20px;left: 168px;position: relative;" src="/images/circle-bottom-wide.png"></img>'


					$.each( todaysItems, function(index, todayItem) {
						//console.log(todayItem)
						if (todayItem.substring(todayItem.length-5, todayItem.length-3) >= date.format('H')){
							//console.log(todayItem.substring(todayItem.length-5, todayItem.length-3) + todayItem.substring(todayItem.length-2) + " >= " + date.format('Hi'))
							if (todayItem.substring(todayItem.length-5, todayItem.length-3) + todayItem.substring(todayItem.length-2) >= date.format('Hi')) {
								itemUpcoming = itemUpcoming + todayItem + "<br>"
								itemUpcomingCounter++
							}
						}
						if (itemUpcomingCounter == 3){ 
							return false;
						}
					})
					if (itemUpcomingCounter == 0){
						itemUpcoming = itemUpcoming + "Nothing scheduled<br>"
					}
					

					$.each( msgSections, function(index, msgSection) {
						$.each( msg, function(index, item) {
							if (item.user == msgUsername){
								if (item.section.substring(0, 7) === "section"){
									if (item.section == msgSection){
										itemsInSectionCount++
									}
								}
							}
						})
						if (itemsInSectionCount > 0) {
							itemsInSection = itemsInSection + itemsInSectionCount + " Items in " + msgSection.substring(7) + '</br>';
							permItemsInSection++

						}
						itemsInSectionCount = 0
					})
					if (permItemsInSection == 0){
						//console.log("permItemsInSection = 0")
						itemsInSection = itemsInSection + "No Items on the board</br>";
					}
					
					itemsInSection = itemsInSection + '</div><img src="/images/circle-bottom.png" style="position: relative; top: -54px;left: 85px; "></img>';
					itemUpcoming = itemUpcoming + '</div><img style=" position: relative; top: -188px; left: 359px;" src="/images/circle-bottom.png"></img>'
					userSummaryContiner = userSummaryContiner + itemsInSection + itemsScheduled + itemUpcoming + '</div>'

					userSummaryResult = $(userSummaryContiner).appendTo('#board');					
				})
			}
			
		})
	}
	else {
		console.log ("Invalid view");
	}
}

function changeView (direction) {
	if (direction === "right") {
		if (viewToLoad == "Day") {
			//We're currently in the kanban view, and we need to go to the week view
			viewToLoad = "Week";
			
			var elementsToRemove = sectionIDs + ', ' + cardColorIDs + ', title';
			weeklySectionWidth = ((parseInt($(window ).width() - 80)) / 7)
			var positionOfCurrentDay = weekDays.indexOf(date.format('D - M j y'))
			positionOfCurrentDay = parseInt(positionOfCurrentDay * weeklySectionWidth + 24);
			console.log ("weeklySectionWidth: " + weeklySectionWidth + ", positionOfCurrentDay: " + positionOfCurrentDay + " indexof: " + weekDays.indexOf(date.format('D-Mjy')))
			console.log(weekDays)

			sessionStorage.setItem('viewToLoad', viewToLoad);
			$(safeSectionNames).each(function(index, value) {
				if (index != 1){
					elementsToRemove = elementsToRemove + ', #title' + value
				}
			});
			
			$(elementsToRemove).slideUp(2000)

  			$('#' + safeSectionNames[1] + ', #title' + safeSectionNames[1]).animate({
				    width: weeklySectionWidth,
				    left: positionOfCurrentDay
				  }, 2000);
  			$('#board').animate({
				    backgroundPositionX: positionOfCurrentDay-500,
				    backgroundPositionY: parseInt(- $(window ).height() - 60)
				  }, 2000);



  			$(elementsToRemove + ', #' + safeSectionNames[1]).promise().done(function() {
    			$(elementsToRemove).remove()
    			$('#' + safeSectionNames[1]).attr("id", safeSectionNames[1] + "tbr")
    			$('#title' + safeSectionNames[1]).attr("id", "title" + safeSectionNames[1] + "tbr")
    			elementsToRemove = '#' + safeSectionNames[1] + 'tbr, #title' + safeSectionNames[1] + 'tbr'
    			//console.log("elementsToRemove: " + elementsToRemove)
  			}, function () {
  				$(elementsToRemove).fadeOut(1000)
  				$(elementsToRemove).promise().done(function() {
  					$(elementsToRemove).remove()
  					$('.title').fadeIn(1000)
  					//$('#' + date.format('D-Mjy')).fadeIn(1000)
  					//console.log("elementsToRemove: " + elementsToRemove)
  				});
					//console.log("loading Week view now...")
					//loadView();
					//location.reload();	
					$.when( prepareWeekLoad() ).done(function() {
						$.when( spawnSections(weekDays) ).done(function() {

							sectionTitleHTML = sectionTitleHTML.replace(/class="/g, "class=\"hidden ");
							sectionHTML = sectionHTML.replace(/class="/g, "class=\"hidden ");
							sectionHTML = sectionHTML.replace(/class="hidden/g, "class=\"hidden ");
							$.when( updateBoard() ).done(function() {
								$('.todayInWeek').css("display", "none")
								$('.todayInWeek').attr("class", "todayInWeek")
								$('.title').css("display", "none")
								$('#title' + date.format('D-Mjy')).css("display", "block")
								$('.title').attr("class", "title")


								var elementsToAdd = '.hidden';
								//$(safeSectionNames).each(function(index, value) {
								//	if (value != date.format('D-Mjy')){
								//		elementsToAdd = elementsToAdd + ', #title' + value
								//	}
								//});
								$(elementsToAdd ).slideDown( 2000 )
								$('#board').animate({
				    				backgroundPositionY: parseInt($(window ).height() - 60)
				  				}, 2000);

								//$(elementsToRemove).promise().done(function() {
								$('#' + date.format('D-Mjy')).fadeIn(2000)

								$('#' + date.format('D-Mjy')).promise().done(function() {

									loadCurrentCards("weekViewContainerTable");
									//console.log("done with fade-in")
								});
								//$('#' + date.format('D-Mjy')).fadeIn(1000)
							});
						});
					});
				
  			});
		} 
		else if (viewToLoad == "Week"){
			$("#board").height("1020px")
			$("#board").width("1870px")
			//We're currently in the week view, and we need to go to the zoomed week browser view
			viewToLoad = "WeeksOfYear";
			currentViewTitle = '<a href="javascript:void(0)" > <div class="leftArrow" id="leftArrow"/> </a>' +
						'<div class="currentViewTitle">' + settingsUserName + '\'s Geshdo board - Weeks of the year (Week ' + date.format('W') + ') ' +
						'</div>';
			$("#viewTitle").html(currentViewTitle);

			sectionTitleHTML = ""
			sectionHTML = ""
			updateBoard()
			var newWeekObject = '<div class="nextWeek" style="position:absolute;' +
								' width: 548px;' + 
								' height: 1004px;' + 
							    ' margin-left: 36px;' +
    							' margin-right: 36px;' +
								' background-image:url(\'/images/weekthumb_large.png\');' +
								' background-size:cover;' +
								' background-position-y: 7px;' +
								' background-repeat:no-repeat;' +
								' display:none">' +
								'<div class="curWeekLable" style="' +
									//' width: 26.5%;' + //parseInt($("#board").width() + 60) + 'px; ' + 
									//' height: 30%;' + //parseInt($("#board").height() * 3.3333333) + 'px; ' +
									' background:rgba(0,0,0,.6);' + 
									' color:#fff; ' +
									' font-weight:bold; ' +
									' line-height:1004px; ' + 
									' text-align: center; ' + 
									' display:none"><a href="javascript:void(0)" >'
									//'</div>';
								//'</div>';
			var rightWeekArrow = '<div id="rightWeekArrow" style="height: ' + parseInt($("#board").height() * 0.5) + 'px; padding-top: ' + parseInt($("#board").height() / 2) + 'px;">' +
										'<a href="javascript:void(0)" >' +
										'<div style="margin-right:10px" class="rightArrow"/>' + 
										'</a>'
									'</div>';
			var leftWeekArrow = '<div id="leftWeekArrow" style="height: ' + parseInt($("#board").height() * 0.5) + 'px; padding-top: ' + parseInt($("#board").height() / 2) + 'px;">' +
										'<a href="javascript:void(0)" >' + 
										'<div style="margin-left:10px" class="leftArrow"/>' +
										'</a>' +
									'</div>';
								//2401 + (4177+292) 
								//1041
								//2394
								//2082

			var curWeekNo = date.format('W')
			var nextWeekDate = new Date();
			var prevWeekDate = new Date();
			var titleIndex = 0;
			var weekNumInit = parseInt(curWeekNo)
			prevWeekDate.setTime(firstDayOfWeek.getTime() - (86400000 * 7));
			nextWeekLabel = 'Week ' + prevWeekDate.format('W (M j o - ')
			prevWeekDate.setTime(prevWeekDate.getTime() + (86400000 * 6))
			nextWeekLabel = nextWeekLabel + prevWeekDate.format('M j o)');
			var prevWeekObject = newWeekObject + nextWeekLabel + '</a></div></div>';

			nextWeekDate.setTime(firstDayOfWeek.getTime() + (86400000 * 7));
			var nextWeekLabel = 'Week ' + nextWeekDate.format('W (M j o - ')
			nextWeekDate.setTime(nextWeekDate.getTime() + (86400000 * 6))
			nextWeekLabel = nextWeekLabel + nextWeekDate.format('M j o)');
			var nextWeekObject = newWeekObject + nextWeekLabel + '</a></div></div>';
			//$(newWeekObject).css("left",parseInt($("#board").width() / 2 + 380)).appendTo('#board')

			$("#scrollToNext, #scrollToLast").remove()
			//$(prevWeekObject).css("left","80px").prependTo('#board')
			//$(nextWeekObject).css("left","653px").css("zoom", "300%").css("display", "block").appendTo('#board')
			$(nextWeekObject).css("left","520px").css("zoom", "300%").css("display", "block").appendTo('#board')

			$(prevWeekObject).css("left","-670px").css("zoom", "300%").css("display", "block").prependTo('#board')

			//$($('#board').children().not(".nextWeek, .curWeekLable")).animate({ 
			//	zoom: ['30%', "linear"],
				//left: [ '+=2428', "easeInSine"]
			//	left: [ '+=2205', "easeInSine"]
				//left: [ '+=' + parseInt($("#board").width() *1.15) , "swing"]
			//}, 1000);
			$($('#board').children().not(".nextWeek, .curWeekLable")).css('-moz-transform: scale(0.3)')
			$('#board').animate({ 
				backgroundSize: "30%"
			}, 1000);

			$(".nextWeek").animate({
				zoom: '100%',
				left: '+=700'
				//left: '+=300'
			//	display: 'toggle'
			}, 1200);

			//$($('#board').children()).promise().done(function() {
			//	//$('.curWeekLable').css("font-size","80px")

			
			//	$('.nextWeek').fadeIn(0)
			$('.curWeekLable').fadeIn(1000)
			//});

			//var allCurrentWeeks = $($('#board').children())
			$(rightWeekArrow).appendTo('#board')
			$(leftWeekArrow).appendTo('#board')
			weekNumInit = parseInt(curWeekNo)
			changeWeekListen()



			$('#rightWeekArrow').click(function (event) {
				prevWeekDate.setTime(nextWeekDate.getTime() - (86400000 * 7));
				nextWeekDate.setTime(nextWeekDate.getTime() + 86400000);
				nextWeekLabel = 'Week ' + nextWeekDate.format('W (M j o - ')
				nextWeekDate.setTime(nextWeekDate.getTime() + (86400000 * 6))
				nextWeekLabel = nextWeekLabel + nextWeekDate.format('M j o)');
				var nextWeekObject = newWeekObject + nextWeekLabel + '</a></div></div>';

				//prevWeekDate.setTime(nextWeekDate.getTime());
				//nextWeekLabel = 'Week ' + prevWeekDate.format('W (M j o - ')
				//prevWeekDate.setTime(prevWeekDate.getTime() + (86400000 * 6))
				//nextWeekLabel = nextWeekLabel + prevWeekDate.format('M j o)');
				//var prevWeekObject = newWeekObject + nextWeekLabel + '</div></div>';

				$(nextWeekObject).css("left",parseInt($("#board").width() - 65)).appendTo('#board')

				//var shiftBy = 666;
				var shiftBy = 585;
				$('.nextWeek').fadeIn(100)
				$('.curWeekLable').fadeIn(100)
				//if (nextWeekDate.getTime() >= parseInt(firstDayOfWeek.getTime() + (86400000 * 27))){
				//	console.log(nextWeekDate.getTime())
				//	console.log(firstDayOfWeek.getTime())
				//	shiftBy = 666;
				//}

				$('.nextWeek, .curWeekLable').animate({ 
					left: '-=' + shiftBy
				}, 1000)
				$($('#board').children()).not($('.nextWeek, .curWeekLable, #rightWeekArrow, #leftWeekArrow')).animate({ 
					left: '-=' + parseInt($("#board").width() * 1.15 - 180) 
				}, 1000)
				$($('#board').children()).promise().done(function() {
					$($('#board').children()).filter(function(){ 
						var position = $(this).position();
						if (position.left < 0){
							$(this).remove();
						}
					})
				})
				changeWeekListen()
			})
			
			$('#leftWeekArrow').click(function (event) {
				nextWeekDate.setTime(prevWeekDate.getTime() + (86400000 * 7));
				prevWeekDate.setTime(prevWeekDate.getTime() - (86400000 * 13));
				nextWeekLabel = 'Week ' + prevWeekDate.format('W (M j o - ')
				prevWeekDate.setTime(prevWeekDate.getTime() + (86400000 * 6))
				nextWeekLabel = nextWeekLabel + prevWeekDate.format('M j o)');
				var prevWeekObject = newWeekObject + nextWeekLabel + '</a></div></div>';

				//$(prevWeekObject).css("left","-636px").appendTo('#board')
				$(prevWeekObject).css("left","-560px").appendTo('#board')
				//$(prevWeekObject).prependTo('#board')


				var shiftBy = 590;
				$('.nextWeek').fadeIn(100)
				$('.curWeekLable').fadeIn(100)
				/*if (prevWeekDate.getTime() <= parseInt(firstDayOfWeek.getTime() - (86400000 * 13))){
					//console.log(nextWeekDate.getTime())
					//console.log(firstDayOfWeek.getTime())
					//console.log("reducingShift")
					shiftBy = 666;
				}*/

				$('.nextWeek, .curWeekLable').animate({ 
					left: '+=' + shiftBy
				}, 1000)
				$($('#board').children()).not($('.nextWeek, .curWeekLable, #rightWeekArrow, #leftWeekArrow')).animate({ 
					left: '+=' + parseInt($("#board").width() * 1.15 - 175) 
				}, 1000)
				$($('#board').children()).promise().done(function() {
					$($('#board').children().not($('#rightWeekArrow'))).filter(function(){ 
						var position = $(this).position();
						//console.log($(this).css("zoom"))
						//console.log(position.left)
						//console.log($(this))
						if ($(this).css("zoom") == 0.3){
							if (position.left > 6150){
								$(this).remove();
								//console.log("will be removed")
							}
						}
						else { 
							if (position.left > 1760){
								//console.log("will be removed")
								$(this).remove();
							}
						}
					})
					changeWeekListen()
				})
			})
		}
		else if (viewToLoad == "TeamWeek") {
			//We are currently in the Team View, and need to go to the User's defaultView
			viewToLoad = "Week"
			changeView ("left")
		}
		else if (viewToLoad == "TeamOverview") {
			//We are currently in the Team Overview View, and need to go to the Team's defaultView
			viewToLoad = "TeamWeek"
			sessionStorage.setItem('viewToLoad', viewToLoad);
			location.reload();
		}
	}
	else {
		if (viewToLoad == "Week"){
			//We're currently in the week view, and we need to go to the kanban view
			viewToLoad = "Day";
			sessionStorage.setItem('viewToLoad', viewToLoad);
			location.reload();
		}
		else if (viewToLoad == "TeamWeek"){
			//We're currently in the week view for the Team, and we need to go to the Team Overview view
			viewToLoad = "TeamOverview";
			sessionStorage.setItem('viewToLoad', viewToLoad);
			location.reload();
		}
		else if (viewToLoad == "Day") {
			//We're currently in the kanban view, and we need to go to the team view
			viewToLoad = "TeamWeek";
			sessionStorage.setItem('viewToLoad', viewToLoad);
			location.reload();
			//currentViewTitle = '<div> ' + settingsTeamName + '\'s Geshdo board - Kanban view ' + 
			//				'<a href="javascript:void(0)" >' + 
	  		//					'<div class="rightArrow" id="rightArrow"/>' +
	  		//				'</a></div>';
	  		//$("#viewTitle").html(currentViewTitle);
		}
		else if (viewToLoad == "WeeksOfYear"){
			//We're currently in the week browser view, and we need to go to the week view
			viewToLoad = "Week";
			sessionStorage.setItem('viewToLoad', viewToLoad);
			location.reload();
		}
	}
}

function changeWeekListen(){
	$('.curWeekLable').click(function (event) {
		viewToLoad = "Week"
		//console.log(event.clientX)
		var newWeekNum = $(this).text().substring(5, 7)
		var op = "add"
		if (firstDayOfWeek.format('W') > newWeekNum){
			var weekDiff = parseInt(firstDayOfWeek.format('W') - newWeekNum)
			op = "subtract"
		}
		else {
			var weekDiff = parseInt(newWeekNum - firstDayOfWeek.format('W'))
			op = "add"
		}
		var newStartDate = new Date();
		var dayDiff = 0;
		for (i=0; i<weekDiff; i++){
			dayDiff = parseInt(dayDiff + (86400000 * 7))
		}
		if (op === "add") {
			date.setTime(date.getTime() + dayDiff)
		}
		else {
			date.setTime(date.getTime() - dayDiff)
		}

		$($(this).parent()).animate({ 
			zoom: '300%',
			width: '100%',
			left: [ 0, "swing"]
		}, 2000);
		$('#board').animate({ 
			backgroundSize: "100%"
		}, 2000);
		var elementsToRemove = $($('#board').children()).not($(this)).not($(this).parent())
		var currentOverlay = $($(this).parent())
		$(elementsToRemove).fadeOut('2500')
		$($('#board').children()).promise().done(function() {
			$(elementsToRemove).remove();
			$(currentOverlay).fadeOut('1000').remove()
			$(elementsToRemove).add($(currentOverlay)).promise().done(function() {
				$.when( prepareWeekLoad() ).done(function() {
					$.when( spawnSections(weekDays) ).done(function() {
						$.when( updateBoard() ).done(function() {
							loadCurrentCards("weekViewContainerTable");
						})
					})
				})
			})
		})	
	})
}

function updatecardsection (currentCardId, currentCardSection) {
	$.ajax({
		type: "GET",
		url: "/updatecardsection/" + currentCardId,
		data: "&section=" + currentCardSection,
		success: function(msg){
			console.log(msg);
        },
        cache: false
	}); 
}

function adjustForMultipleCards (tableToScan) {

	//console.log($('.' + tableToScan))
	$('.' + tableToScan).find("textarea").each(function(index, value) {
	//$('#board').find("textarea").each(function(index, value) {
		//console.log("tableToScan Index: " + index)
		
		//if ($('[id="' + $(this).parent().parent().parent().attr("id") + '"]').length < 2){
			//$('[id="' + $(this).parent().parent().parent().attr("id") + '"]').each(function(index, value) {
				//console.log($(this).parent().parent().parent())
				//console.log($(this).parent().parent().parent().parent().parent().parent().parent().index())
				//cardsInTable.push($(this))
				cardsInTable.push($(this))
		//	}
			//})
		//}
		//else {
		//	cardsInTable.push($(this))
		//}
	});

	//$().find("textarea").each(function(index, value) {
	//console.log($($(cardsInTable[1]).context).attr("class"))
	//console.log(cardsInTable)
	
	var tableWidth = parseInt($('.' + tableToScan).innerWidth())
	var continueIteration = true;
	var numOverlapping = 1;
	var containsCard = "";
	var curColSpan = "";
	//For every "textArea" object found in the tables
	$(cardsInTable).each(function(index, value) {
		//console.log("cardsInTable Index: " + index)
		if (numOverlapping == 1) {
			if (viewToLoad === "Day" || viewToLoad === "TeamOverview"){
				var newLeft = 37;
			}
			else {
				var newLeft = 7;
			}
			//If this object is not the last object in the array
			if (cardsInTable[index + 1]) {
				//Loop through all other objects found
				for (i=1; i <= cardsInTable.length ; i++) {
					//Get the index of this card as well as the next
					var currentCardIndex = $(cardsInTable[index+i-1]).parent().parent().parent().parent().parent().index();
					//           console.log($(cardsInTable[index+i-1]).parent().parent().parent().parent().parent())
					var currentCardRowspan = $(cardsInTable[index+i-1]).parent().parent().parent().parent().attr("rowspan");
					var nextCardIndex = $(cardsInTable[index+i]).parent().parent().parent().parent().parent().index();
					//do not compare across days
					var currentSectionIndex = $(cardsInTable[index+i-1]).parent().parent().parent().parent().parent().parent().parent().index()
					var nextSectionIndex = $(cardsInTable[index+i]).parent().parent().parent().parent().parent().parent().parent().index()
					//console.log("currentCardIndex: " + currentCardIndex + ", currentCardRowspan: " + currentCardRowspan + ", nextCardIndex: " + nextCardIndex)
					if (parseInt(currentSectionIndex) != nextSectionIndex){
						console.log("Done with current day")
						break;
					}
					if (parseInt(currentCardIndex) > nextCardIndex)
					{
						//console.log("currentCardIndex(" + parseInt(currentCardIndex) + ") is > nextCardIndex(" + nextCardIndex + ")")
					//	console.log("NOT Increasing numOverlapping")
						break;
					}

					if (parseInt(currentCardIndex) + parseInt(currentCardRowspan) > nextCardIndex && nextCardIndex != -1 ) {
				//		console.log("increasing numOverlapping from " + numOverlapping + " to " + parseInt(numOverlapping + 1) + " for card " + $(cardsInTable[index]).parent().parent().parent().attr("id"))
						//console.log("currentCardIndex + currentCardRowspan (" + parseInt(parseInt(currentCardIndex) + parseInt(currentCardRowspan)) + ") is > nextCardIndex(" + nextCardIndex + "), and nextCardIndex(" + nextCardIndex + ") is not -1")
						//console.log($(cardsInTable[i-1]).parent().parent().parent().parent().parent().parent().index())
						//console.log("Increasing numOverlapping")
						numOverlapping++
					}
					else {
						break;
					}
				}
			}

			if (numOverlapping > 1) {
				var newWidth = parseInt(tableWidth / numOverlapping - 2)
				for (i=0; i < numOverlapping ; i++) {
	//				console.log($(cardsInTable[index + i]).parent().parent().parent())
					var newHeight = $(cardsInTable[index + i]).parent().parent().parent().css("height")
					alterCardStyle("scheduledCard", $(cardsInTable[index + i]).parent().parent().parent().parent().attr("rowspan"), 
						$(cardsInTable[index + i]).parent().parent().parent(), 
						$(cardsInTable[index + i]).parent().parent().parent().parent().attr("id"), 
						newHeight.substring(0, newHeight.length-2), 
						newWidth)
					$(cardsInTable[index + i]).parent().parent().parent().css("left", newLeft)
					newLeft = newLeft + parseInt($(cardsInTable[index + i]).parent().parent().parent().outerWidth() + 3)
				}
			}
		}
		else {
	//		console.log("decreasing numOverlapping from " + numOverlapping + " to " + parseInt(numOverlapping - 1))
			numOverlapping--;
		}
	});
}

function alterCardStyle(newCardClass, newRowSpan, currentCardObj, sectionId, newHeight, newWidth) {
	console.log("alterCardStyle called for card in section " + sectionId + ", setting new height to: " + newHeight)
	if (!newWidth) {
		newWidth = "";
	}
	console.log($(currentCardObj).children().children('.cardContents'))

	$(currentCardObj).attr("class", newCardClass);
	$(currentCardObj).css("height", newHeight);
	$(currentCardObj).css("width", newWidth);
	//reset the easyUI Panel object's size
	//console.log($(currentCardObj).children().children('.cardContents').panel())
	$(currentCardObj).children().children('.cardContents').panel('resize',{
		width:$(currentCardObj).innerWidth()-3,
		height:newHeight
	})
	if (newHeight < 33) {
		$(currentCardObj).promise().done(function() {
			$(currentCardObj).children().children('.cardContents').panel({
				headerCls: "cardTitleHidden"
			})
			$(currentCardObj).children().children('.cardContents').panel('footer').hide()
			$(currentCardObj).children().children('.cardContents').panel('body').css("height", newHeight + "px")
		})
	}
	else {
		if ($(currentCardObj).innerHeight() < 33){
			$(currentCardObj).promise().done(function() {
				$(currentCardObj).children().children('.cardContents').panel('header').removeClass("cardTitleHidden")
				$(currentCardObj).children().children('.cardContents').panel('footer').show()
				$(currentCardObj).children().children('.cardContents').panel('body').css("height", newHeight)
			})	
		}
	}
	$("#" + sectionId).attr("rowspan", newRowSpan);
}

function loadCurrentCards(tableToScan) {
	//Query DB to get all info on all active cards
	var getCardsUrl = "getallactivecards/" + settingsUserName
	if (viewToLoad === "TeamWeek" || viewToLoad === "TeamOverview"){
		getCardsUrl = "getallactiveteamcards/" + settingsTeamName
	}
	$.ajax({
	   	type: "GET",
	   	url: getCardsUrl,
	   	dataType: 'json',
	   	success: function(msg){
	   		var shouldSpawn = false
	   		var uniqUsers = [];

			if (viewToLoad === "TeamWeek" || viewToLoad === "TeamOverview"){
				$.each( msg, function(index, value) {
    				if ($.inArray(value.user, uniqUsers) === -1) {
    					console.log(value.user)
        				uniqUsers.push(value.user);
    				}
				});
			}
			//check if there are any cards that are supposed to spawn in another card
			$.each( msg, function(index, value) {
    			if (value.section.substring(0, 12) == "cardContents"){
    				//move this card so that its last in the array
    				msg.push(value)
    				msg.splice(index,1)
    			}
			});
			
			//console.log(msg)

		   	$.each( msg, function( index, value ){
		   		console.log("Considering card " + value.id + " for section " + value.section)
				newCardIdNum = value.id.substring(4);	
				newCardId = value.id;
				newCardSection = value.section;
				newCardContents = value.content;
				newCardTitle = value.title;
				newCardColor = value.type;
				newCardDuration = value.duration;
				newCardRepeat = value.repeat;
				newCardDate = value.date;
				if (value.timespent === "") { 
					newCardTimespent = 0;
				}
				else {
					newCardTimespent = value.timespent;
				}
				if (viewToLoad === "TeamWeek" || viewToLoad === "TeamOverview"){
					var usernameIndex = uniqUsers.indexOf(value.user)
					newCardTitle = value.user;
					if (usernameIndex > cardColourPallette.length){
						usernameIndex = Math.floor(Math.random() * (cardColourPallette.length));
					}
					newCardColor = cardColourPallette[usernameIndex].substring(1);
					//console.log(cardColourPallette[uniqUsers.indexOf(value.user)])
				}

				//Mon-Oct2615Hour1000
				//Thu-Oct815Hour1300
				//Add active cards to the board
				//determine if this card's section is currently in view
				console.log(safeSectionNames)
				console.log(newCardSection.substring(0, parseInt(newCardSection.length - 8)))
				if (newCardSection.substring(0, 12) == "cardContents") {
					shouldSpawn = true
				}
				if (safeSectionNames.indexOf(newCardSection.substring(7, parseInt(newCardSection.length))) != -1) {
					shouldSpawn = true
					//Card is not scheduled, it should be spawned in the kanbanview only
				//	console.log("ShouldSpawn True for " + newCardId + " because " + newCardSection.substring(7, parseInt(newCardSection.length)))
				}
				else if (safeSectionNames.indexOf(newCardSection.substring(0, parseInt(newCardSection.length - 8))) != -1){
					shouldSpawn = true
					//Card is scheduled, and the scheduled datetime is currently in view
			//		console.log("ShouldSpawn True for " + newCardId + " because " + newCardSection.substring(0, parseInt(newCardSection.length - 8)))
				}
				if (newCardRepeat === "Daily" || newCardRepeat === "Weekly" || newCardRepeat === "Fortnightly" || newCardRepeat === "Monthly"){
					shouldSpawn = true
					//Card is scheduled, and is set to repeat, may or may not be in view
			//		console.log("ShouldSpawn True for " + newCardId + " because card is repeated " + newCardRepeat)
				}

				if (shouldSpawn){
				//Check if card is supposed to be repeated
					//if (viewToLoad === "Week") {
							
							//repeat is not null, and not set to None
							if (newCardRepeat === "Daily"){
								var dailyDates = new Date()
							//	console.log("Card " + newCardId + " is repeated " + newCardRepeat)
								//Mon-Oct2615Hour1000
								//Thu-Oct815Hour1300
								if (viewToLoad === "Week" || viewToLoad === "TeamWeek") {
									dailyDates.setTime(firstDayOfWeek.getTime())
									for (i = 0; i < 7; i++){
										newCardSection = dailyDates.format('D-Mjy') + "Hour" + newCardSection.substring(newCardSection.length - 4);
										spawnCard (newCardIdNum, newCardColor, newCardId, newCardSection, newCardTimespent, newCardContents, newCardTitle, newCardDuration, newCardRepeat);
										//newCardSection = newCardSection + dailyDates.format('D-Mjy') + "Hour" + newCardSectionTime.substring(newCardSectionTime.length - 4);
										dailyDates.setTime(dailyDates.getTime() + 86400000);
									}
								}
								if (viewToLoad === "Day" || viewToLoad === "TeamOverview") {
									newCardSection = dailyDates.format('D-Mjy') + "Hour" + newCardSection.substring(newCardSection.length - 4);
									spawnCard (newCardIdNum, newCardColor, newCardId, newCardSection, newCardTimespent, newCardContents, newCardTitle, newCardDuration, newCardRepeat);
								}
							}
							else if (newCardRepeat === "Weekly"){
								$(safeSectionNames).each(function(index, value) {
									if (value.substring(0, 3) == newCardSection.substring(0, 3)){
										newCardSection = safeSectionNames[index] + "Hour" + newCardSection.substring(newCardSection.length - 4)
									}
								})
								spawnCard (newCardIdNum, newCardColor, newCardId, newCardSection, newCardTimespent, newCardContents, newCardTitle, newCardDuration, newCardRepeat);
							}
							else if (newCardRepeat === "Fortnightly"){
								var dailyDates = new Date(newCardDate)
								if (parseInt((date.format('W') - dailyDates.format('W')) % 2) == 0){
									$(safeSectionNames).each(function(index, value) {
										if (value.substring(0, 3) == dailyDates.format('D')){
											newCardSection = safeSectionNames[index] + "Hour" + newCardSection.substring(newCardSection.length - 4)
											spawnCard (newCardIdNum, newCardColor, newCardId, newCardSection, newCardTimespent, newCardContents, newCardTitle, newCardDuration, newCardRepeat);
										}
									})
								}
							}
							else if (newCardRepeat === "Monthly"){
								var dailyDates = new Date(newCardDate)
								var monthlyDates = new Date()
								if (viewToLoad === "Day") {
									monthlyDates.setTime(date.getTime())
								}
								else {
									monthlyDates.setTime(firstDayOfWeek.getTime())
								}
								$(safeSectionNames).each(function(index, value) {
									//if the sections Day is listed on the board
									if (value.substring(0, 3) == dailyDates.format('D')){
										//and the current section is a multitude of 28 days 
									//	console.log("possible match: " + value)
									//	console.log("parseInt(" + monthlyDates.getDate() + " - " + dailyDates.getDate() + "% 28) = " + parseInt(monthlyDates.getDate() - dailyDates.getDate() % 28))
										//if 
										//if (parseInt(monthlyDates.getDate() - dailyDates.getDate() % 28) == 0){
										if (parseInt((date.format('W') - dailyDates.format('W')) % 4) == 0){
											newCardSection = safeSectionNames[index] + "Hour" + newCardSection.substring(newCardSection.length - 4)
											spawnCard (newCardIdNum, newCardColor, newCardId, newCardSection, newCardTimespent, newCardContents, newCardTitle, newCardDuration, newCardRepeat);
											//only spawn card if the months are not the same
											//if (value.substring(4, 7) != dailyDates.format('M')) {
											//	newCardSection = value + "Hour" + newCardSection.substring(newCardSection.length - 4)
											//	console.log("spawn card cause months are not the same")
											//	spawnCard (newCardIdNum, newCardColor, newCardId, newCardSection, newCardTimespent, newCardContents, newCardTitle, newCardDuration, newCardRepeat);
											//}
											//or the dates match exactly
											//else if (value == dailyDates.format('D-Mjy')){
											//	console.log("spawn card cause dates match exactly")
											//	spawnCard (newCardIdNum, newCardColor, newCardId, newCardSection, newCardTimespent, newCardContents, newCardTitle, newCardDuration, newCardRepeat);
											//}
										}
										//if the year is not the same
										//else{
											//only spawn card if day difference > 27
										//	if (parseInt(date.getDate() - dailyDates.getDate()) > 27 ) {
										//		newCardSection = value + "Hour" + newCardSection.substring(newCardSection.length - 4)
										//		console.log("spawn card cause day difference")
										//		spawnCard (newCardIdNum, newCardColor, newCardId, newCardSection, newCardTimespent, newCardContents, newCardTitle, newCardDuration, newCardRepeat);
										//	}
										//}
									}
									if (viewToLoad === "Week" || viewToLoad === "TeamWeek") {
											monthlyDates.setTime(monthlyDates.getTime() + 86400000)
										}
								})
								//if (date.format('M') == newCardSection.substring(0, 7){
								//if (viewToLoad === "Week") {

								//}
								//if (viewToLoad === "Day") {
								
								//}
							}
							else {
							//	console.log("Card is not set to repeat")
								spawnCard (newCardIdNum, newCardColor, newCardId, newCardSection, newCardTimespent, newCardContents, newCardTitle, newCardDuration);
							}
					//}
					//else {
					//	spawnCard (newCardIdNum, newCardColor, newCardId, newCardSection, newCardTimespent, newCardContents, newCardTitle, newCardDuration);	
					//}
				shouldSpawn = false;
				}			
				//}
			});
			cardsInTable.length = 0;
			cardRowSpans.length = 0;
			adjustForMultipleCards(tableToScan);
		},
		cache: false
	});
}

//Generate table containing hour and minute lables and write to specified ID
function drawTimeLables (targetTimeLables) {
	timeLablesTable = '<div ' + timeLablesTableStyle + '>';
	var rowHourStyle = "";

	for (i=0; i< 24; i++) {
		if (currentHour == parseInt(dayHours[i]) && viewToLoad === "Day" || currentHour == parseInt(dayHours[i]) && viewToLoad === "TeamOverview") {
			rowHourStyle = 'background-color:#A4D7F4;font-weight:bold;';
		}
		else {
			rowHourStyle = '';
		}
		timeLablesTable = timeLablesTable +
							'<div  style="width:30px;">' +
								'<div class="scheduleTableRow" style="float:left;line-height:127px;height:127px;padding-right:3px;' + rowHourStyle + '" >' + dayHours[i] + '</div>' +
								'<div class="scheduleTableRow" style="height:31px;line-height:31px;border-color: transparent">:00</div>' +
			  					'<div class="scheduleTableRow" style="height:31px;line-height:31px;" >:15</div>' +
			  					'<div class="scheduleTableRow" style="height:31px;line-height:31px;border-color: transparent" >:30</div>' +
			  					'<div class="scheduleTableRow" style="height:31px;line-height:31px;" >:45</div>' +
			  				'</div>';
	}
	timeLablesTable = timeLablesTable + '</div>';
	$(targetTimeLables).append(timeLablesTable);
}

//Generate table with unique TR id's and write to specified ID
function drawScheduleTable (targetCardContainer) {
	//console.log("drawScheduleTable called for " + targetCardContainer)
	cardContainerTable = '<div ' + cardContainerTableStyle + '>';
	var rowClass = " ";

	for (i=0; i< 24; i++) {
		if (currentHour <= parseInt(dayHours[i]) && viewToLoad === "Day" || currentHour <= parseInt(dayHours[i]) && viewToLoad === "TeamOverview") {
			rowClass = 'class="inprogress-dropable"';
		}
		else {
			rowClass = " ";
		}

		cardContainerTable = cardContainerTable +
							'<div class="scheduleTableRow" style="border-color: transparent">' +
								'<div id="' + targetCardContainer.substring(1) + 'Hour' + dayHours[i] + '00" ' + rowClass + ' style="height:31px;" ></div>' +
				//				'<td id="' + targetCardContainer.substring(1) + 'Hour' + dayHours[i] + '00" ' + rowClass + ' style="height:30px;" ></td>' +
							'</div>' +
			  				'<div class="scheduleTableRow">' +
			  					'<div id="' + targetCardContainer.substring(1) + 'Hour' + dayHours[i] + '15" ' + rowClass + ' style="height:31px" ></div>' +
			  				'</div>' +
			  				'<div class="scheduleTableRow" style="border-color: transparent">' +
								'<div id="' + targetCardContainer.substring(1) + 'Hour' + dayHours[i] + '30" ' + rowClass + ' style="height:31px;" ></div>' +
				//				'<td id="' + targetCardContainer.substring(1) + 'Hour' + dayHours[i] + '30" ' + rowClass + ' style="height:30px;" ></td>' +
							'</div>' +
			  				'<div class="scheduleTableRow">' +
			  					'<div id="' + targetCardContainer.substring(1) + 'Hour' + dayHours[i] + '45" ' + rowClass + ' style="height:31px" ></div>' +
			  				'</div>';
	}

	cardContainerTable = cardContainerTable + '</div>';
	$(targetCardContainer).append(cardContainerTable);
	//console.log($(targetCardContainer))
	//console.log(cardContainerTable)

	if (viewToLoad == "Day" || viewToLoad == "TeamOverview") {
		$(targetCardContainer).animate({
    		scrollTop: $(targetCardContainer + 'Hour' + currentHour + '00').offset().top-100
		}, 2000);
	}
}