var express = require('express');
var router = express.Router();
var http = require("http");
var iconv = require('iconv-lite');
var fs = require('fs'); 
var path=require("path"); 
var formidable = require("formidable");//图片上传第三方包
var util = require('util');
 

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
						result("./public/logonew.jpg",blogid);
	        });
	    });

	});

	function result(img,blogid){
			//各类设置  
		var opt={  
		   // "url":"http://120.26.67.221:8081/LabHomeAdmin/commonajax/fileupload.do?blogid="+blogid+"&pictype=ordinaryImage",//url  
		    "url":"http://localhost:3003/upload",
		    "file":"./public/fly_order_btn.png",//文件位置  
		    "param":"filedata",//文件上传字段名  
		    "boundary":"----WebKitFormBoundary"+getBoundary()  
		}  
		  
		postRequest(opt);  
	}
});


router.post("/upload",function(req,res,next){
	console.log("upload start")
	
  var form = new formidable.IncomingForm();   //创建上传表单
    form.encoding = 'utf-8';        //设置编辑
    form.uploadDir = 'tmp';    //设置上传目录
    form.keepExtensions = true;  //保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024;   //文件大小

  form.parse(req, function(err, fields, files) {
console.log(files.filedata);
    if (err) {
      res.locals.error = err;
      res.render('index', { title: TITLE });
      return;       
    }  
     
    var extName = '';  //后缀名
    switch (files.filedata.type) {
      case 'image/pjpeg':
        extName = 'jpg';
        break;
      case 'image/jpeg':
        extName = 'jpg';
        break;       
      case 'image/png':
        extName = 'png';
        break;
      case 'image/x-png':
        extName = 'png';
        break;       
    }

    if(extName.length == 0){
        res.locals.error = '只支持png和jpg格式图片';
        res.render('index', { title: TITLE });
        return;                
    }

    var avatarName = Math.random() + '.' + extName;
    var newPath = form.uploadDir + avatarName;

    console.log(newPath);
    fs.renameSync(files.filedata.path, newPath);  //重命名
  });

  res.locals.success = '上传成功';
  res.render('index', { title: "qw" });      
})


//post值payload  
var getfield=function(field, value) {  
    return 'Content-Disposition: form-data; name="'+field+'" '+value+' ';  
}  
  
//文件payload  
var getfieldHead=function (field, filename) {  
    var fileFieldHead='Content-Disposition: form-data; name="'+field+'"; filename="'+filename+'"\r\n'+'Content-Type: '+getMime(filename)+'\r\n\r\n';  
    return fileFieldHead;  
}  
//获取Mime  
var getMime=function (filename) {  
    var mimes = {  
        '.png': 'image/png',  
        '.gif': 'image/gif',  
        '.jpg': 'image/jpeg',  
        '.jpeg': 'image/jpeg',  
        '.js': 'appliction/json',  
        '.torrent': 'application/octet-stream'  
    };  
    var ext = path.extname(filename);  
    var mime = mimes[ext];  
    mime=!!mime?mime:'application/octet-stream';  
    return mime;  
}  
//获取边界检查随机串  
var getBoundary=function() {  
    var max = 9007199254740992;  
    var dec = Math.random() * max;  
    var hex = dec.toString(36);  
    var boundary = hex;  
    return boundary;  
}  
//获取boundary  
var getBoundaryBorder=function (boundary) {  
    return '--'+boundary+'\r\n';  
}  
//字段格式化  
function fieldPayload(opts) {  
    var payload=[];  
    for(var id in opts.field){  
        payload.push(getfield(id,opts.field[id]));  
    }  
    console.log("payload",payload);
    payload.push("");  
    return payload.join(getBoundaryBorder(opts.boundary));  
}  
  
//post数据  
function postRequest (opts) {  
    filereadstream(opts,function (buffer) {  
        var options=require('url').parse(opts.url);  
        var Header={};  
        var h=getBoundaryBorder(opts.boundary);  
        var e=fieldPayload(opts);  
        var a=getfieldHead(opts.param,opts.file);  
        var d="\r\n"+h;  
        Header["Content-Length"]=Buffer.byteLength(h+e+a+d)+buffer.length;  
        Header["Content-Type"]='multipart/form-data; boundary='+opts.boundary;  
        options.headers=Header;  
        options.method='POST';  
        console.log(a);
        var req=http.request(options,function(res){  
            var data='';  
            res.on('data', function (chunk) {  
                data+=chunk;  
            });  
            res.on('end', function () {  
                console.log(res.statusCode)  
                console.log(data);  
            });  
        });  
        req.write(h+e+a);/*log.diy(h+e+a+buffer+d);  */
        req.write(buffer);  
        req.end(d);  
    });  
      
}  
//读取文件  
function filereadstream(opts, fn) {  
    var readstream = fs.createReadStream(opts.file,{flags:'r',encoding:null});  
    var chunks=[];  
    var length = 0;  
    readstream.on('data', function(chunk) {  
        length += chunk.length;  
        chunks.push(chunk);  
    });  

        console.log(opts);
    readstream.on('end', function() {  
        var buffer = new Buffer(length);  
        for(var i = 0, pos = 0, size = chunks.length; i < size; i++) {  
            chunks[i].copy(buffer, pos);  
            pos += chunks[i].length;  
        }  
        fn(buffer);  
    });  
}  
  


module.exports = router;
