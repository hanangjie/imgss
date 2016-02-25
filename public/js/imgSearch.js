$(function(){
	var localUrl="http://112.124.9.65:3003/img";
	 localUrl="http://localhost:3003/imgUrl/img";
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

	//选中
	$(document).on("click",".editor-resultImg span",function(){
		var $this=$(this);
		var src=$(this).attr("data-img");
		if($(this).hasClass("on")){
			$(this).removeClass("on");
		}else{
			if($this.data("down")){
				//下载过
			}else{
				$.ajax({
					type:"get",
					url:localUrl,
					data:{
						url:src,
						blogid:blogid
					}
				}).done(function(e){
					if(e.status==1000){
						$(".editor-imgList").prepend('<span class="img" ><img src="'+ e.original+'"></span>');
						$this.attr("data-img",e.original).data("down",true);
					}
				});
			}
			$(this).addClass("on");

		}

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