var sys = require('sys'),
    irc = require('irc'),
    request = require('request'),
    client = new irc.Client('irc.freenode.net','__grumpyBot',{userName:'foaas',realName:'FOAAS',channels:['##hrwarningbell']});


client.addListener('error', function(message) {
    console.error('ERROR: %s: %s', message.command, message.args.join(' '));
});


client.addListener('message##hrwarningbell',function(to,mess,message) {
	var from = '__grumpyBot',
	    mesg = '';

	if(mess.match(/cock|cunt|bollox|boobs|tits|sex|that\'s what she said/i)) {
		client.say(message.args[0],'**DING!!!!!**');
	} 

	if(mess.match(/^grumpy/i)) {
		
		if(mess.match(/fuck off/i)) {
			mesg = "/off/"+message.nick+"/__grumpyBot";	
		} else if (mess.match(/fuck you/i)) {
			mesg = "/you/"+message.nick+"/__grumpyBot";	
		}

		if(mesg!=='') {				
			//request('http://foaas.com'+mesg,function(error,reponse,body) {console.log(body);client.say(message.args[0],body);});
			client.say(message.args[0],"http://foaas.com"+mesg);
			
		} 
	}	
});

