var express = require('express');
var geshdo = express();
var elasticsearch = require('elasticsearch');

geshdo.use(express.static('public'));

var allactivecards = [];

//Initialize the elasticsearch client, which is used as the datastore
var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});
client.ping({
  requestTimeout: Infinity,
  hello: "elasticsearch!"
}, function (error) {
	if (error) {
    	console.trace('elasticsearch cluster is down!');
	}
	else {
		console.log('elasticsearch cluster is up and running!');
    	//Check if required index and types exist
		client.indices.exists({
			index: 'geshdo'
		}, function (error, exists) {
			if (exists === true) {
				console.log("Geshdo Index exists")
			} 
			else {
				console.log("Geshdo Index does not exist, creating index, types and mappings...")
				client.indices.create({
					index: 'geshdo'
				}, function (error, response) {
					if (!error) {
						console.log("Geshdo Index Created")
						client.indices.putMapping({
							updateAllTypes: false,
							index: 'geshdo',
							type: 'stickies',
							body: {
								"properties": {
							    	"id": { "type": "string" },
							    	"type": { "type": "string" },
							    	"title": { "type": "string" },
							    	"content": { "type": "string" },
							    	"section": { "type": "string" },
							    	"active": { "type": "boolean" },
							    	"timespent": { "type": "integer" },
							    	"user": { "type": "string" },
							    	"duration": { "type": "integer" },
							    	"repeat": { "type": "string" },
							    	"time": { "type": "string" },
							    	"date": { "type": "string" },
							    	"moredata": { "type": "string" }
							  	}
							}
						}, function (error, response) {
							if (!error){
								console.log(response)
								client.indices.putMapping({
									updateAllTypes: false,
									index: 'geshdo',
									type: 'users',
									body: {
										"properties": {
										    "teamname": { "type": "string" },
										    "sections": { "type": "string" },
										    "cardTitles": { "type": "string" },
										    "cardColors": { "type": "string" },
										    "defaultView": { "type": "string" }
									  	}
									}
								}, function (error, response) {
									if (!error){
										console.log(response)
										client.indices.putMapping({
											updateAllTypes: false,
											index: 'geshdo',
											type: 'stickietimes',
											body: {
												"properties": {
													"id": { "type": "string" },
    												"timevalue": { "type": "date" },
    												"timetype": { "type": "string" }
											  	}
											}
										}, function (error, response) {
											if (!error){
												console.log(response)
											}
											else{
												console.log(error)
											}
										})
									}
									else{
										console.log(error)
									}
								})
							}
							else{
								console.log(error)
							}
						})
					}
					else {
						console.log(error)
					}
				});
			}
		});

  	}
});

geshdo.get('/', function (req, res) {
	res.sendFile(__dirname + '/public/index.html');
});

//Initialize server
var server = geshdo.listen(3000, function () {
        var host = server.address().address;
        var port = server.address().port;

        console.log('Geshdo listening at http://%s:%s', host, port);
});

//Get required details for all active cards for a user
geshdo.get('/getallactivecards/:username', function(req, res) {
	var output = [];
	client.search({
		index: 'geshdo',
  		type: 'stickies',
  		size: '3000',
  		body: {
  			_source: ["id", "type", "title", "content", "section", "timespent", "duration", "repeat", "date"],
    		query: {
    			bool: {
    				must: [
    					{ match: {'user': req.params.username }},
    					{ match: {'active': true}}
    				]
      			}
    		}
  		}
	}).then(function (jsondata) {
		for (var i = 0; i < jsondata.hits.hits.length ; i++) {
    		output.push(jsondata.hits.hits[i]._source)
		}
		res.json(output);
	}, function (err) {
		res.send(err.message);
	});
});

//Get time spent for specific card
geshdo.get('/gettimespent/:cardid', function(req, res) {
	var output = [];
	client.search({
		index: 'geshdo',
  		type: 'stickies',
  		body: {
  			_source: ["timespent"],
    		query: {
    			bool: {
    				must: [
    					{ match: {'id': req.params.cardid }}
    				]
      			}
    		}
  		}
	}).then(function (jsondata) {
		for (var i = 0; i < jsondata.hits.hits.length ; i++) {
    		output.push(jsondata.hits.hits[i]._source)
		}
		res.json(output);
	}, function (err) {
		res.send(err.message);
	});
});

//Get card metadata
geshdo.get('/getcardmetadata/:cardid', function(req, res) {
	var output = [];
	client.search({
		index: 'geshdo',
  		type: 'stickies',
  		body: {
  			_source: ["time", "date", "repeat", "duration", "moredata"],
    		query: {
    			bool: {
    				must: [
    					{ match: {'id': req.params.cardid }}
    				]
      			}
    		}
  		}
	}).then(function (jsondata) {
		for (var i = 0; i < jsondata.hits.hits.length ; i++) {
    		output.push(jsondata.hits.hits[i]._source)
		}
		res.json(output);
	}, function (err) {
		res.send(err.message);
	});
});

//Get the scheduledDuration for a specific card
geshdo.get('/getduration/:cardid', function(req, res) {
	var output = [];
	client.search({
		index: 'geshdo',
  		type: 'stickies',
  		body: {
  			_source: ["duration"],
    		query: {
    			bool: {
    				must: [
    					{ match: {'id': req.params.cardid }}
    				]
      			}
    		}
  		}
	}).then(function (jsondata) {
		for (var i = 0; i < jsondata.hits.hits.length ; i++) {
    		output.push(jsondata.hits.hits[i]._source)
		}
		res.json(output);
	}, function (err) {
		res.send(err.message);
	});
});

//Get last card ID used
geshdo.get('/getlastid', function(req, res) {
	client.count({
  		index: 'geshdo',
  		type: 'stickies'
	}, function (error, response) {
  		if (error){
  			res.send(error);
  		}
  		else {
  			res.json(response.count);
  		}
	});
});

//Set content field for specific card
geshdo.get('/setcardcontent/:cardid', function(req, res) {
	client.update({
		index: 'geshdo',
  		type: 'stickies',
  		refresh: true,
  		id: req.params.cardid.substring(4),
		body: {
			doc: {
				content: req.query.content
			}
		}
	}, function (error, response) {
		if (error){
  			res.send(error);
  		}
  		else {
  			res.json(response);
  		}
	});
});

//Set section field for specific card
geshdo.get('/updatecardsection/:cardid', function(req, res) {
	client.update({
		index: 'geshdo',
  		type: 'stickies',
  		refresh: true,
  		id: req.params.cardid.substring(4),
		body: {
			doc: {
				section: req.query.section
			}
		}
	}, function (error, response) {
		if (error){
  			res.send(error);
  		}
  		else {
  			res.json(response);
  		}
	});
});

//Set card to set inactive
geshdo.get('/updatecardstatus/:cardid', function(req, res) {
	client.update({
		index: 'geshdo',
  		type: 'stickies',
  		refresh: true,
  		id: req.params.cardid.substring(4),
		body: {
			doc: {
				active: false
			}
		}
	}, function (error, response) {
		if (error){
  			res.send(error);
  		}
  		else {
  			res.json(response);
  		}
	});
});

//Set time spent for specific card
geshdo.get('/settimespent/:cardid', function(req, res) {
	client.update({
		index: 'geshdo',
  		type: 'stickies',
  		refresh: true,
  		id: req.params.cardid.substring(4),
		body: {
			doc: {
				timespent: req.query.timespent
			}
		}
	}, function (error, response) {
		if (error){
  			res.send(error);
  		}
  		else {
  			res.json(response);
  		}
	});
});

//Set card metadata
geshdo.get('/setcardmetadata/:cardid', function(req, res) {
	client.update({
		index: 'geshdo',
  		type: 'stickies',
  		refresh: true,
  		id: req.params.cardid.substring(4),
		body: {
			doc: {
				time: req.query.time,
				date: req.query.date,
				repeat: req.query.repeat,
				moredata: req.query.moredata,
				duration: req.query.duration
			}
		}
	}, function (error, response) {
		if (error){
  			res.send(error);
  		}
  		else {
  			res.json(response);
  		}
	});
});

//Set card start or end time event
geshdo.get('/setcardtimeevent/:cardid', function(req, res) {
	client.index({
		index: 'geshdo',
  		type: 'stickietimes',
  		refresh: true,
		body: {
			id: req.params.cardid,
			timevalue: req.query.timevalue,
			timetype: req.query.timetype
		}
	}, function (error, response) {
		if (error){
  			res.send(error);
  		}
  		else {
  			res.json(response);
  		}
	});
});

//Set title details associated with all cards
geshdo.get('/updatetitlecards', function(req, res) {
	var operations = '';
	var comma = ",";
	client.search({
		index: 'geshdo',
  		type: 'stickies',
  		size: '3000',
  		body: {
  			_source: ["id"],
    		query: {
    			bool: {
    				must: [
    				    { match: {'user': req.query.username }},
    					{ match: {'title': req.query.oldtitle }}
    				]
      			}
    		}
  		}
	}, function (err, jsondata) {
		if (!err){
			if (jsondata.hits.hits.length == 0){
				res.json(jsondata.hits)
			}
			else {
				for (var i = 0; i < jsondata.hits.hits.length ; i++) {
					if (i == parseInt(jsondata.hits.hits.length - 1)){
						comma = "";
					}
					operations = operations + '{ update: { _index: "geshdo", _type: "stickies", _id: ' + jsondata.hits.hits[i]._id + ' } },\n'+
						'{ doc: { title: "' + req.query.newtitle + '" } }' + comma + '\n';
				}
				client.bulk({
					body: [ operations ]
				}, function (error, response) {
					if (!error){
						res.json(response)
					}
					else {
						res.send(error);
					}
				});
			}
		}
		else {
			res.send(err);
		}
	});
});

//Set section details associated with all cards
geshdo.get('/updatesectioncards', function(req, res) {
	var operations = '';
	var comma = ",";
	client.search({
		index: 'geshdo',
  		type: 'stickies',
  		size: '3000',
  		body: {
  			_source: ["id"],
    		query: {
    			bool: {
    				must: [
    					{ match: {'user': req.query.username }},
    					{ match: {'section': req.query.oldsection }}
    				]
      			}
    		}
  		}
	}, function (err, jsondata) {
		if (!err){
			if (jsondata.hits.hits.length == 0){
				res.json(jsondata.hits)
			}
			else {
				for (var i = 0; i < jsondata.hits.hits.length ; i++) {
					if (i == parseInt(jsondata.hits.hits.length - 1)){
						comma = "";
					}
					operations = operations + '{ update: { _index: "geshdo", _type: "stickies", _id: ' + jsondata.hits.hits[i]._id + ' } },\n'+
						'{ doc: { section: "' + req.query.newsection + '" } }' + comma + '\n';
				}
				client.bulk({
					body: [ operations ]
				}, function (error, response) {
					if (!error){
						res.json(response)
					}
					else {
						res.send(error);
					}
				});
			}
		}
		else {
			res.send(err);
		}
	});
});

//Set user settings
geshdo.get('/updatetusersettings/:username', function(req, res) {
	client.index({
		index: 'geshdo',
  		type: 'users',
  		refresh: true,
  		id: req.params.username,
		body: {
			teamname: req.query.teamname,
			sections: req.query.sections,
			cardTitles: req.query.cardtitles,
			cardColors: req.query.cardcolors,
			defaultView: req.query.defaultview
		}
	}, function (error, response) {
		if (error){
  			res.send(error);
  		}
  		else {
  			res.json(response);
  		}
	});
});

//Set all settings for specified user
geshdo.get('/getuserconfig/:username', function(req, res) {
	var output = [];
	client.get({
		index: 'geshdo',
  		type: 'users',
  		id: req.params.username,
		_source: ["teamname", "sections", "cardTitles", "cardColors", "defaultView"]
	}).then(function (jsondata) {
		if (jsondata.found){
			res.json(jsondata._source);
		}
		else {
			res.json('[]');
		}
	}, function (err) {
		res.send(err.message);
	});
});

//Set all required fields for specific card
geshdo.get('/updatecarddetails/:cardid', function(req, res) {
	var timeNow = new Date();
	var isActive = true
	if (req.query.active == "NO") {
		isActive = false
	}
	client.index({
		index: 'geshdo',
  		type: 'stickies',
  		refresh: true,
  		id: req.params.cardid.substring(4),
		body: {
			id: req.params.cardid,
			type: req.query.type,
			title: req.query.title,
			content: req.query.content,
			section: req.query.section,
			active: isActive,
			timespent: req.query.timespent,
			user: req.query.user,
			duration: req.query.duration,
			repeat: "None",
			time: "",
			moredata: "",
			date: "",
		}
	}, function (error, response) {
		if (error){
  			res.send(error);
  		}
  		else {
  			res.json(response);
  		}
	});
});

//Set all details for all active cards for team
geshdo.get('/getallactiveteamcards/:teamname', function(req, res) {
	var users = "";
	var output = [];
	client.search({
		index: 'geshdo',
  		type: 'users',
  		body: {
  			query: {
    			bool: {
    				must: [
    					{ match: {'teamname': req.params.teamname }}
    				]
      			}
    		}
  		}
	}).then(function (jsondata) {
		for (var i = 0; i < jsondata.hits.hits.length ; i++) {
    		users = users + " " + jsondata.hits.hits[i]._id
		}
		console.log(users)
		client.search({
			index: 'geshdo',
			type: 'stickies',
			scroll: '30s',
			body: {
				_source: ["user", "id", "type", "title", "content", "section", "timespent", "duration", "repeat", "date"],
				query: {
					bool: {
						must: [{
							multi_match: {
								query: users,
								fields: "user"
							}},
							{ match: {'active': true}}
						]
					}
				}
			}
		}, function getMoreUntilDone(error, response) {
			// collect the title from each response
			response.hits.hits.forEach(function (hit) {
		  		output.push(hit._source);
			});

			if (response.hits.total !== output.length) {
		    	// now we can call scroll over and over
		    	client.scroll({
		      		scrollId: response._scroll_id,
		      		scroll: '30s'
		    	}, getMoreUntilDone);
		  	} else {
		  		res.json(output);
		  	}
		});
	}, function (err) {
			res.send(err.message);
	});
});