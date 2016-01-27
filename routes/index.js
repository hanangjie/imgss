var express = require('express');
var router = express.Router();
var http = require("http");
var iconv = require('iconv-lite');
var fs = require('fs'); 
var path=require("path"); 
var formidable = require("formidable");//图片上传第三方包
var random=0;
 

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
    random=parseInt(Math.random()*100000);
	var url=req.query.url;
	var blogid=req.query.blogid;
     var type=url.split(".")[url.split(".").length-1];
	res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
		res.header("X-Powered-By",' 3.2.1')
		res.header("Content-Type", "application/json;charset=utf-8");
	       console.log("imgget start");
     
            http.get(url, function(res){
                    var imgData = "";

                    res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开


                    res.on("data", function(chunk){
                        imgData+=chunk;
                    });

                    res.on("end", function(){
                       
                        fs.writeFile("./tmp/logonew"+random+"."+type, imgData, "binary", function(err){
                            if(err){
                                console.log("down fail");
                            }
                            console.log("imgget success");
                            result("./tmp/logonew"+random+"."+type,blogid);
                            
                        });
                    });
            }).on('error', function(e) {
                console.log("下载失败: " + e.message);
            });



	function result(img,blogid){
			//各类设置  
		var opt={  
		    "url":"http://192.168.108.1:8080/LabHomeAdmin/commonajax/fileupload.do?blogid="+blogid+"&pictype=ordinaryImage",//url  
		    //"url":"http://120.26.67.221:8083/LabHomeUpload/upload/useravatars",
            //"url":"http://localhost:3003/upload",
		    "file":img,//文件位置  
		    "param":"filedata",//文件上传字段名  
		    "boundary":"----WebKitFormBoundary"+getBoundary()  
		}  
		  
		//postRequest(opt);  
		
		//测试用例
		var files = [
		 {urlKey: "filedata", urlValue: img}
		];
		var options = { 
		 host: "120.26.67.221",
		 port: "8081" ,
		 method: "POST", 
		 path: "/LabHomeAdmin/commonajax/fileupload.do?blogid="+blogid+"&pictype=ordinaryImage"
		};
		 
		var req = http.request(options, function(res){
             console.log("RES:" + res);
             console.log('STATUS: ' + res.statusCode);
             console.log('HEADERS: ' + JSON.stringify(res.headers));
             //res.setEncoding("utf8");
             res.on("data", function(chunk){
                console.log("BODY:" + chunk);
                 sendback(chunk,img);
             })
		});
		 
		req.on('error', function(e){
		 console.log('problem with request:' + e.message);
		 console.log(e);
		});
		postFile(files, req);
		console.log("done");
	}
    function sendback(data,img){
        res.send(data);
        fs.unlinkSync(img)
    }
});

//接受base64图片
router.post("/getBase",function(req,res,next){
    var avatarName="";
    var form = new formidable.IncomingForm();   //创建上传表单
    form.encoding = 'utf-8';        //设置编辑
    form.uploadDir = 'tmp/';    //设置上传目录
    form.keepExtensions = true;  //保留后缀
    form.maxFieldsSize = 2000000000000 * 1024 * 1024;   //文件大小

    form.parse(req, function(err, fields, files) {
        var nowTime=Date.now();
        var data=decodeBase64Image(fields.filedata).data;
        var type=decodeBase64Image(fields.filedata).type;

        switch (type) {
            case 'image/webp':
                type = 'jpg';
                break;
            case 'image/jpeg':
                type = 'jpg';
                break;
            case 'image/png':
                type = 'png';
                break;
            case 'image/x-png':
                type = 'png';
                break;
        }
        avatarName = "tmp/uploadH"+nowTime+"Z"+parseInt(Math.random()*1000000) + 'W.' + type;
        fs.writeFile("public/"+avatarName, decodeBase64Image(fields.filedata).data, function(err, fields, files){
            if (err) throw err;
            console.log('It\'s saved!');
            res.send('{data:"'+avatarName+'"}');
        });
    });
    function decodeBase64Image(dataString)
    {
        var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        var response = {};

        if (matches.length !== 3)
        {
            return new Error('Invalid input string');
        }

        response.type = matches[1];
        response.data = new Buffer(matches[2], 'base64');
        console.log(response);
        return response;
    }


});

router.post("/upload",function(req,res,next){
	res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
        res.header("X-Powered-By",' 3.2.1')
        res.header("Content-Type", "application/json;charset=utf-8");
  var form = new formidable.IncomingForm();   //创建上传表单
    form.encoding = 'utf-8';        //设置编辑
    form.uploadDir = 'tmp/';    //设置上传目录
    form.keepExtensions = true;  //保留后缀
    form.maxFieldsSize = 2000000000000 * 1024 * 1024;   //文件大小
        console.log("upload start");
         form.parse(req, function(err, fields, files) {
            console.log("files.filedata",files.filedata);
            if (err) {
              res.locals.error = err;
              res.render('index', { title: 1 });
              return;       
            }  
             
            var extName = '';  //后缀名
             console.log(files.filedata.type);
            switch (files.filedata.type) {
              case 'image/webp':
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
                 res.render('index', { title: 1 });
                return;                
            }

            var avatarName = Math.random() + '.' + extName;
            var newPath = form.uploadDir + avatarName;

            console.log("newPath",newPath);
            fs.renameSync(files.filedata.path, newPath);  //重命名
             res.send({
            status:"success"
          });  
          });
            
});


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
    return '\r\n----'+boundary+'--';
}
//字段格式化
function fieldPayload(opts) {
    var payload=[];
    for(var id in opts.field){
        payload.push(getfield(id,opts.field[id]));
    }
    payload.push("");

    return payload.join(getBoundaryBorder(opts.boundary));
}

//post数据
function postRequest (opts) {
    filereadstream(opts,function (buffer) {
        console.log("post start")
        var options=require('url').parse(opts.url);
        var Header={};
        var h=getBoundaryBorder(opts.boundary);
        var e=fieldPayload(opts);
        var a=getfieldHead(opts.param,opts.file);
        //var d="\r\n"+h;
        Header["Content-Length"]=Buffer.byteLength(h+e+a)+buffer.length;
        Header["Content-Type"]='multipart/form-data; boundary='+opts.boundary;
        options.headers=Header;
        options.method='POST';
        console.log("options",options);
        var req=http.request(options,function(res){
            console.log('STATUS: ' + res.statusCode);
              console.log('HEADERS: ' + JSON.stringify(res.headers));
              res.setEncoding('utf8');
            var data='';
            res.on('data', function (chunk) {
                data+=chunk;
            });
            res.on('end', function () {
                console.log(res.statusCode)
                console.log(data);
            });
        }).on('error', function(e) {
              console.log("上传失败: " + e.message);
            });
        req.write(h+e+a);/*log.diy(h+e+a+buffer+d);  */
        req.write(buffer);
        //req.end();
		req.flush();
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
  
 //------------------------------测试方法-----------------------------//
	
	function postFile(fileKeyValue, req) {
		  var boundaryKey = Math.random().toString(16);
		  var enddata = '\r\n----' + boundaryKey + '--';
		 
		  var files = new Array();
		  for (var i = 0; i < fileKeyValue.length; i++) {
		   var content = "\r\n----" + boundaryKey + "\r\n" + "Content-Type: application/octet-stream\r\n" + "Content-Disposition: form-data; name=\"" + fileKeyValue[i].urlKey + "\"; filename=\"" + path.basename(fileKeyValue[i].urlValue) + "\"\r\n" + "Content-Transfer-Encoding: binary\r\n\r\n";
		   var contentBinary = new Buffer(content, 'utf-8');//当编码为ascii时，中文会乱码。
		   	files.push({contentBinary: contentBinary, filePath: fileKeyValue[i].urlValue});
		  }
		  var contentLength = 0;
		  for (var i = 0; i < files.length; i++) {
		   var stat = fs.statSync(files[i].filePath);
		   contentLength += files[i].contentBinary.length;
		   contentLength += stat.size;
		  }
		 
		  req.setHeader('Content-Type', 'multipart/form-data;boundary=--' + boundaryKey);
		  req.setHeader('Content-Length', contentLength + Buffer.byteLength(enddata));
		 console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%"+contentLength + Buffer.byteLength(enddata));
		  // 将参数发出
		  var fileindex = 0;
		  var doOneFile = function(){
		   req.write(files[fileindex].contentBinary);
		   var fileStream = fs.createReadStream(files[fileindex].filePath, {bufferSize : 4 * 1024});
		   fileStream.pipe(req, {end: false});
		   fileStream.on('end', function() {
		     fileindex++;
		     if(fileindex == files.length){
		      req.end(enddata);
		     } else {
		      doOneFile();
		     }
		   });
		  };
		  if(fileindex == files.length){
		    req.end(enddata);
		  } else {
		    doOneFile();
		  }      
		}
		 
 
module.exports = router;
