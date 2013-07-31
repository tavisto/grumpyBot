var mongoose = require('mongoose'),
    schema = mongoose.Schema;

var dingWords = new schema({word: {type:String,index:{unique:true}}});

module.exports = mongoose.model('DingWords',dingWords);    
