//控制背景切换动画
var num = 35;
var active=0;	//当前播放序号 避免重播
var T=12000;	//循环周期

function changeBg()
{

	var bg = document.getElementById("web_bg");	
	while(true)
	{
		if(active!=(active=Math.floor(Math.random()*num)))
			break;
	}
	
	bg.src = "img\\bg\\"+active+".png";
}
function changeBg0()
{
	var bg = document.getElementById("web_bg_0");
	while(true)
	{
		if(active!=(active=Math.floor(Math.random()*num)))
			break;
	}
	
	bg.src = "img\\bg\\"+active+".png";
}


for(i = 0;i<23333;i++)	//循环播放
{
	window.setTimeout(changeBg0,3000+i*T);
	window.setTimeout(changeBg,6000+i*T);
}

