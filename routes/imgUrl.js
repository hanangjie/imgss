var express = require('express');
var router = express.Router();
var http = require("http");
var iconv = require('iconv-lite');
var fs = require('fs');
var path=require("path");
var debug = require('debug')('imgss:url');


router.post('/img', function(req, res, next) {

    var name=req.body.name;
    var first=req.body.first;
    if(name){
        name=encodeURI(name);
    }
    var option = [{
        hostname: "cn.bing.com",
        path: "/images/async?q="+name+"&first="+(first||0)
    },{
        hostname: "pic.sogou.com",
        path: "/pics?query="+name+"&mood=0&picformat=0&mode=1&di=0&reqType=ajax&tn=0&reqFrom=result&start="+(first||0)
    }];
    var optioni=2;
    var resultHtml="";
    var imgList=[];
    var urlReq = http.request(option[optioni], function(res) {
            res.on("data", function(chunk) {
                resultHtml+=iconv.decode(chunk, "utf-8");

                console.log(resultHtml);
            });
            res.on('end',function(){
                sendList();
            })
        }).on("error", function(e) {
            console.log("e="+e.message);
        });
        urlReq.end();
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    function sendList(){
        if(optioni==1){
            var data=JSON.parse(resultHtml).items;
            console.log(data.length)
            for(var i=1;i<data.length;i++){
                imgList[i-1]=data[i].pic_url;
            }
        }else{
            resultHtml=resultHtml.split("imgurl");
            for(var i=1;i<resultHtml.length;i++){
                imgList[i-1]=resultHtml[i].substring(resultHtml[i].indexOf(":&quot;")+7,resultHtml[i].indexOf("&quot;,"));
            }
        }

        res.send({
            status:imgList
        });
    }

});

module.exports = router;