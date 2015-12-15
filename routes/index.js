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

router.get('/img', function(req, res, next) {
	var url=req.query.url;
	var blogid=req.query.blogid;
	res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
		res.header("X-Powered-By",' 3.2.1')
		res.header("Content-Type", "application/json;charset=utf-8");
	
	http.get(url, function(res){
	    var imgData = "";

	    res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开


	    res.on("data", function(chunk){
	        imgData+=chunk;
	    });

	    res.on("end", function(){
	        fs.writeFile("./public/logonew.jpg", imgData, "binary", function(err){
	            if(err){
	                console.log("down fail");
	            }
						result("./public/logonew.jpg");
	        });
	    });

	});

	function result(img){
			var fileName="logonew.jpg";
			var datas = fs.readFileSync(img);

			var boundary ="---------------------------leon";

			var formStr = '--' + boundary 
			+ '\r\n\r\n'
			+ 'Content-Disposition: form-data; name="blogid"'
			+ '\r\n\r\n'
			//+ '测试啊'
			+ blogid
			+ '\r\n'
			+ '--' + boundary
			+ '\r\n'
			+ 'Content-Disposition: form-data; name="pictype"'
			+ '\r\n\r\n'
			+ 'ordinaryImage'
			+ '\r\n'
			+ '--' + boundary 
			+ '\r\n'
			+ 'Content-Disposition: form-data; name="file"; filename="' + encodeURIComponent(fileName) + '"'
			+ '\r\n'
			+ 'Content-Type: application/octet-stream'
			+ '\r\n\r\n';

			var formEnd = '\r\n--' + boundary + '--\r\n';
			console.log(formStr);
			var options = {
				host :"120.26.67.221",
				port : 8081,
				method :"POST",
				path :"/LabHomeAdmin/commonajax/fileupload.do",
				headers : {
				"Content-Type":"multipart/form-data; boundary="+ boundary,
				"Content-Length": formStr.length + datas.length + formEnd.length
				}
			};
			options = {
				host :"localhost",
				port : 3003,
				method :"POST",
				path :"/upload",
				headers : {
				"Content-Type":"multipart/form-data; boundary="+ boundary,
				"Content-Length": formStr.length + datas.length + formEnd.length
				}
			};

			var req = http.request(options, function(res) {
				res.on("data", function(data) {
					console.log("返回数据"+ data);
				});
			});

			req.write(formStr);
			req.write(datas);
			req.write(formEnd);
			req.end();
		}
});


router.post("/upload",function(req,res,next){
	var url=req.body.blogid;
	var blogid=req.body.pictype;
	console.log(url,blogid);
	res.send({
		"status":"ok"
	})
})

module.exports = router;
