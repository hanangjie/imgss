var express = require('express');
var router = express.Router();
var http = require("http");
var iconv = require('iconv-lite');


router.post('/getImg', function(req, res, next) {
  // const url = 'http://idol.takeshobo.co.jp';
  const url = req.body.url;
  console.log(url)
  const host = url.split(":")[0];
  var urlReq = createRequest(url, host, '', res)
  urlReq.end();
})


module.exports = router;

function getUrl(htmlString, url, host) {
  let arr = [];
  arr = arr.concat(htmlString.match(/href="[a-z\:\/\.\_\-0-9]+"/g))
  .filter((e) => {
    return !/.css/g.test(e) && !/.ico/g.test(e);
  })
  .filter((e) => {
    let result = true;
    if(e.includes('http') && (!e.includes(url) || e.split(":")[1] === `${url.split(":")[1]}"` || e.split(":")[1] === `${url.split(":")[1]}/"`)) {
      result = false;
    }
    return result;
  })
	.map(e => {
    let r = e.replace('href="', '').slice(0,-1);
    if (!r.includes('http')) {
      r = `${url}/${r}`;
    }
		return r;
	})
  return arr;
}


function filteHtml(htmlString) {
  let arr = [];
	arr = arr.concat(htmlString.match(/src="[a-z\:\/\.\_\-0-9]+"/g))
	.filter(e => !/.js/g.test(e))
	.map(e => {
		return e.replace('src="', '').slice(0,-1)
	})
  return arr;
}

function createRequest(url, host, resultHtml, res) {
  return http.request(url,{encode:'utf-8'}, function(response) {
    response.on("data", function(chunk) {
      resultHtml+=iconv.decode(chunk, "utf-8");
    });
    response.on('end',function(){
      resultHtml = resultHtml.split('<body')[1]
      res.send({
        resultHtml: filteHtml(resultHtml),
        url: getUrl(resultHtml, url, host)
      });
      console.log('end')
    })
  }).on("error", function(e) {
      console.log("error="+e.message);
  });
}