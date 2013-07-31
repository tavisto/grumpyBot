var sys = require('sys'),
    irc = require('irc'),
    _ = require('underscore'),
    request = require('request'),
    creds = require('./credentials'),
    mongoose = require('mongoose'),
    dingWords = require('./models/ding'),
    dingWordsListen = [],
    client = new irc.Client('irc.freenode.net',creds.botName,{userName:'foaas',realName:'FOAAS',channels:['##hrwarningbell']});
    //client = new irc.Client('irc.freenode.net',creds.botName,{userName:'foaas',realName:'FOAAS',channels:['##baz_test']}),

    errors = require('./errors');


var dingWordsRegexpString = ''; 

//Mongoose set up
mongoose.connect('mongodb://localhost/grumpydb');


dingWordList = dingWords.find(function(err,docs){
   _.each(docs,function(word) {
       dingWordsListen.push(word.word);
  });
});


client.addListener('join', function(channel, nick, message) { client.say('nickserv','identify '+creds.botPass);});

client.addListener('error', function(message) {
    console.error('ERROR: %s: %s', message.command, message.args.join(' '));
});


client.addListener('message##hrwarningbell',function(to,mess,message) {
	var from = '__grumpyBot',
	    mesg = '';

	 

	if(mess.match(/^grumpy/i)) {
		console.log("Message for me");
			
		if(mess.match(/fuck off/i)) {
			mesg = "/off/"+message.nick+"/__grumpyBot";	
		} else if (mess.match(/fuck you/i)) {
			mesg = "/you/"+message.nick+"/__grumpyBot";	
		} else if (mess.match(/ding/i)) {
			console.log("Adding new ding word");
			newDing = new dingWords();
			newDing.word = mess.substring(12);

			newDing.save(function(err) {
				if(err) {
                    var r = Math.floor(Math.random()*6)
					client.say(message.args[0],errors[r]);
				} else {
                    client.say(message.args[0],message.nick+" "+newDing.word+" added");
                    dingWordsListen.push(newDing.word);
                }
				
			});
		} else if (mess.match(/help/i)) {
					client.say(message.args[0],"No.");
        }

		if(mesg!=='') {				
			//request('http://foaas.com'+mesg,function(error,reponse,body) {console.log(body);client.say(message.args[0],body);});
			client.say(message.args[0],"http://foaas.com"+mesg);
			
		} 
	} else if(mess.match(new RegExp(dingWordsListen.join('|'),'i'))) {
		client.say(message.args[0],'**DING!!!!!**');
	}	
});

