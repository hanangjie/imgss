$(function(){
	var localUrl ="/imgUrl/img";
	$("#imgSubmit").click(function(){
		var val=$(".editor-searchImg input").val();
		$.ajax({
			type:"post",
			url:localUrl,
			dataType:"json",
			data:{
				name:val
			}
		}).done(function(data){
			var html="";
			for(var i=0;i<data.status.length;i++){
				html+="<span style='background-image:url("+data.status[i]+")' data-img='"+data.status[i]+"'></span>";
				//html+="<span data-img='"+data.status[i]+"'><img src="+data.status[i]+"' style='width:100%;'></span>";
			}
			if(data.status.length<34&&data.status.length>0){

				html+="<div class='imgTips'>已加载全部</div>";
				$(".lookmore").hide();
			}else if(data.status.length<=0){
				html="暂无搜索到图片";
			}else{
				$(".lookmore").show();
			}
			$(".editor-resultImg").html(html);
		});
	});

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
});