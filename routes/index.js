var express = require('express');
var router = express.Router();
var http = require("http");
var iconv = require('iconv-lite');
var fs = require('fs'); 
 

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/img', function(req, res, next) {

    var name=req.body.name;
    var first=req.body.first;
 	if(name){
 		name=encodeURI(name);
 	}
 	console.log(name);
	var option = {
	    hostname: "cn.bing.com",
	    path: "/images/async?q="+name
	};            
	if(first){
		option.path+="&first="+first;
	}                                                                                                                                     
	 
	var resultHtml="";
	var imgList=[];
	
	var urlReq = http.request(option, function(res) {
				    	res.on("data", function(chunk) {
					        resultHtml+=iconv.decode(chunk, "utf-8");
					        
						});
					}).on("error", function(e) {
						console.log(e.message);
					});
	urlReq.end();
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
		res.header("X-Powered-By",' 3.2.1')
		res.header("Content-Type", "application/json;charset=utf-8");
		setTimeout(function(){
			resultHtml=resultHtml.split("imgurl");
			for(var i=1;i<resultHtml.length;i++){
				imgList[i-1]=resultHtml[i].substring(resultHtml[i].indexOf(":&quot;")+7,resultHtml[i].indexOf("&quot;,"));
			}
			res.send({
					status:imgList
			});
		},3000);
	
});
module.exports = router;
