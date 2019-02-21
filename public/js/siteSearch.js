var searchList = [];

$(function(){
	var localUrl = "/siteImg/getimg";
	var requestObj = {}; 
	$("#imgSubmit").click(function(){
		$(".editor-resultImg").html("");
		$('.tab').remove();
		var val=$(".editor-searchImg input").val();
		searchList = []
		getImg(val, $(".editor-resultImg"));
		searchList.push(val+'/')
	});
	$("body").on("click",".tab", function(e){
		if(!$(this).html().includes('div')) {
			getImg($(e.target)[0].innerHTML, $(this));
		}
	})
	//查看更多
	$("#search-lookmore").click(function(){
		var val=$(".editor-searchImg input").val();
		$.ajax({
			type:"post",
			url:localUrl,
			dataType:"json",
			data:{
				name:val,
				first:$(".editor-resultImg span").length
			}
		}).done(function(data){
			var html="";
			for(var i=0;i<data.status.length;i++){
				html+="<span style='background-image:url("+data.status[i]+")' data-img='"+data.status[i]+"'></span>";
			}

			if(data.status.length<34){
				$(".lookmore").hide();
				html+="<div class='imgTips'>已加载全部</div>";
			}
			$(".editor-resultImg").append(html);
		});
	});

	//调整图片尺寸
	$('#size').change(function(e) {
		$("#style").append(`
		.editor-resultImg span img{
			max-width:${e.target.value}px;
			max-height:${e.target.value}px;
		}`);
	})
});

function getImg(val, dom) {
	searchList.push(val);
	var localUrl ="/siteImg/getimg";
	$(".tips").html('');
	$.ajax({
		type:"post",
		url:localUrl,
		dataType:"json",
		data:{
			url:val
		}
	}).done(function(data){
		if (data.error) {
			$(".tips").html("网络错误");
			return;
		}
		var newdata = data.resultHtml;
		var html="<div style='overflow:hidden'>";
		for(var i=0;i<newdata.length;i++){
			const img = new Image();
			img.src = newdata[i];
			const imgId = `imgId${parseInt(Math.random()*100000)}`
			img.onload = (e) => {
				if(e.path[0].width < 151 || e.path[0].height < 151) {
					$(`#${imgId}`).remove()
				}
			}
			html+=`<span id="${imgId}">
				<img src="${newdata[i]}">
			</span>`;
		}
		html+='</div>'
		// url 继续请求
		// if(data.length<34&&data.length>0){
		// 	html+="<div class='imgTips'>已加载全部</div>";
		// 	$(".lookmore").hide();
		// }else if(data.length<=0){
		// 	html="暂无搜索到图片";
		// }else{
		// 	$(".lookmore").show();
		// }
		dom.html(html);
		data.url = data.url.filter(e => !searchList.includes(e))
		urlHandel(data.url, dom);
	});
}

function urlHandel(urlList, dom) {
	let html = '';
	urlList.forEach(e => {
		html += `<div class="tab">${e}</div>`;
	})
	dom.append(html)
}
