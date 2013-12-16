var sys = require('sys'),
    irc = require('irc'),
    _ = require('underscore'),
    request = require('request'),
    creds = require('./credentials'),
    mongoose = require('mongoose'),
    dingWords = require('./models/ding'),
    dingWordsListen = [],
    client = new irc.Client('irc.freenode.net',creds.botName,{userName:'foaas',realName:'FOAAS',channels:['##hrwarningbell']});
    tokenizer = require('./tokenizer');
    errors = require('./errors');


var dingWordsRegexpString = ''; 

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

client.addListener('pm',function(nick,text,message) {
    client.say('##hrwarningbell',nick+" is tellin' me secret shiz!");
});
client.addListener('message##hrwarningbell',function(to,mess,message) {
	var from = '__grumpyBot',
	    mesg = '';

	if(mess.match(/^grumpy/i)) {
        var tokenArray = tokenizer(mess);

		if(tokenArray[1]=='fuck' && tokenArray[2]=='off') {
			mesg = "/off/"+message.nick+"/__grumpyBot";	
		} else if(tokenArray[1]=='fuck' && tokenArray[2]=='you') {
			mesg = "/you/"+message.nick+"/__grumpyBot";	
		} else if (tokenArray[1]=='ding') {
            
			newDing = new dingWords();
            tokenArray.shift();
            tokenArray.shift();
			newDing.word = tokenArray.join(" ");
            if(newDing.word.length==0) {
                return;
            }
            if(newDing.word.match(/\^|\\w|\\d|\\s|\\b|\\0|\\n|\\f|\\r|\\t|\\v|\\x|\\u|\*|\.\?/i)) {
                errorMessage(message.args[0]);
            } else {
                newDing.save(function(err) {
                    if(err) {
                        errorMessage(message.args[0]);
                    } else {
                        client.say(message.args[0],message.nick+" "+newDing.word+" added");
                        dingWordsListen.push(newDing.word);
                    }
                    
                });
            }
		} else if (mess.match(/help/i)) {
					client.say(message.args[0],"No.");
        } else if (mess.match(/list/i)) {
            client.say(message.args[0],dingWordsListen.join(','));
        } else if (tokenArray[1]=='xkcd') {
            if (typeof tokenArray[2]!=='undefined') {
                if(tokenArray[2]%1===0) {
                    //Get that XKCD
                    request('http://xkcd.com/'+tokenArray[2]+'/info.0.json',function(error,reponse,body) {
                           // client.say(message.args[0],body);
                           var xkcd = JSON.parse(body);
                           client.say(message.args[0],xkcd.safe_title);
                           client.say(message.args[0],xkcd.img);
                           client.say(message.args[0],'<'+xkcd.alt+'>');
                    });
                }
            } else {
                 request('http://xkcd.com/info.0.json',function(error,reponse,body) {
                       // client.say(message.args[0],body);
                       var xkcd = JSON.parse(body);
                       client.say(message.args[0],xkcd.safe_title);
                       client.say(message.args[0],xkcd.img);
                       client.say(message.args[0],'<'+xkcd.alt+'>');
                });
            }
        }

		if(mesg!=='') {				
			//request('http://foaas.com'+mesg,function(error,reponse,body) {console.log(body);client.say(message.args[0],body);});
			client.say(message.args[0],"http://foaas.com"+mesg);
			
		} 
	} else if(mess.match(new RegExp(dingWordsListen.join('|'),'i'))) {
		client.say(message.args[0],'**DING!!!!!**');
	} else if(mess.match(/Is it time for beer yet\?/i)) {
        var d = new Date();
        if(d.getDay()==5) {
            if(d.getUTCHours()-6>15) {
                client.say(message.args[0],"Why aren't you drinking?.");
            } else {
                var timeLeft=15-(d.getUTCHours()-6);
                var timeUnit = 'hours';
                if(timeLeft==1) {
                    timeLeft=60-d.getUTCMinutes();
                    timeUnit = 'minutes';
                }
                client.say(message.args[0],"No. You still have "+timeLeft+" "+timeUnit+" to wait.");
            }
        } else {
            client.say(message.args[0],"No.");
        }
    }
});

function errorMessage(channel) {
    var r = Math.floor(Math.random()*6)
    client.say(channel,errors[r]);
}


