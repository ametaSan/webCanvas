//本项目主要代码
//用于控制画布与画布绘制逻辑
//普通画布-基于一张图片对象

//声明DOM对象
var c;
var ctx;
var c_info;
var WITDH = 800;
var HEIGHT = 600;

var input;
var input_tag = true;	//可导入图片
var imgOutput;
var activeImgSrc = "img//guide.png";	//当前画布src用于画布操作
var activeImgData;	//当前画布图片data 用于导出
var sPointOut = {}, ePointOut = {};	//导出时非透明通道的范围的临时变量
var sPoint = {}, ePoint = {};	//实时记录图片的始端和末端
var editUrl;	//编辑url

//裁剪
var clip;
var clip_tag = false;	//不处于裁剪
var clipOff;

//缩放
var scaleInput = 1.0;	//缩放控制

//旋转
var rotateCount = 0;

//导出图片匹配后的对象
var match_tag = false;	//代表当前图片匹配状态


function load()
{
	c = document.getElementById("myCanvas");
	ctx = c.getContext("2d");
	c_info = document.getElementById("c_info");
	input = document.getElementById("imgInput");
	imgOutput = document.getElementById("imgOutput");
	clip = document.getElementById('clip');
	clipOff = document.getElementById('clipOff');
	//editUrl = document.getElementById('');
	
	//init();
	//console.log(editUrl);
	//activeImgSrc = editUrl;
	//importImg2Canvas();
	
	//导入默认图片
	importImg2Canvas();
	
}

//显示画布坐标事件
function cnvs_getCoordinates(e)
{
	c_rect = c.getBoundingClientRect();
	l = c_rect.left;
	t = c_rect.top;
	//像素值取整
	x = Math.round(e.clientX - l);
	y = Math.round(e.clientY - t);
	//计算结果作为内容插入label
	c_info.innerHTML="size:("+c.width+","+c.height+") (x,y):("+x+","+y+")";
}
function cnvs_clearCoordinates()
{
	var c_info = document.getElementById("c_info");
	c_info.innerHTML="";
}

//绘制默认背景网格
function drawGrid()
{
	step = 6;
	ctx.fillStyle="#CCCCCC";
    for(var i = 0;i<c.width;i+=step)
	{
		for(var j = 0;j<c.height;j+=step)
		for(var j = 0;j<c.height;j+=step)
		{
			if((i/step+j/step)%2==0)
				ctx.fillRect(i,j,step,step);
		}
	}
}

//检查文件是否为图片
function CheckFile(input)
{
	var strRegex = "(.jpg|.JPG|.png|.PNG|.bmp|.BMP)$"; //用于验证图片扩展名的正则表达式
	var re = new RegExp(strRegex);
	
	if(!input_tag)
	{
		window.alert("Please select your image again after accomplishing other behaviors.");
		input.value = null;
		return false;
	}
	
	if(!input.value)
	{
		alert("No images choosen. Operation has been canceled.");
		return (false);
	}
	else if (re.test(input.value))
	{	
		var fr = new FileReader();
	    var file = input.files[0];
	    fr.readAsDataURL(file);
		fr.onloadend = function(frEvent)
		{
	        activeImgSrc = frEvent.target.result;
			importImg2Canvas();
	    }
		
		return (true);
	}
	else
	{
		alert("Please choose images of format jpg/png/bmp.");
		//不修改input显示的值了，并没有什么影响
		//修改input的值由DOM说了算的
		//我们所能做的就是导出图片时的条件
		return (false);
	}
}

//导入图片
function importImg2Canvas()
{
	console.log("canvas onload.");
	var img = new Image();
	//img.crossOrigin = "Anonymous";
	img.src = activeImgSrc;
	img.onload = function()	//要等待图片加载完 否则绘制失败
	{
		c.width = img.width;
		c.height = img.height;
		ctx.drawImage(img,0,0);
		sPoint.x = 0;
		sPoint.y = 0;
		ePoint.x = c.width;
		ePoint.y = c.height;
		sPointOut.x = sPoint.x;
		sPointOut.y = sPoint.y
		ePointOut.x = ePoint.x;
		ePointOut.y = ePoint.y;
	}
}

//导出图片*还很不完善
function convertCanvasToImage()
{
	if(!input.value)
	{
		window.alert("There is no images available. Please import new images.");
	}
	else
	{
		var cf = window.confirm("Are you sure to export present edition?");
		if(cf)
		{
			// activeImgData = ctx.getImageData(0, 0, c.width, c.height);
			// console.log(activeImgData)
			// ctx.clearRect(0, 0, c.width, c.height);    //清空画布
			// ctx.putImageData(activeImgData, Math.min(ePoint.x,sPoint.x), Math.min(ePoint.y,sPoint.y));

			imgOutput.href = c.toDataURL("image/png");
			imgOutput.download = input.value;
			imgOutput.click();
			//ctx.clearRect(0, 0, c.width, c.height);    //清空画布
			//drawGrid();
			//importImg2Canvas()
			if(match_tag == false)
			{
				//ctx.putImageData(activeImgData, Math.min(ePoint.x,sPoint.x), Math.min(ePoint.y,sPoint.y));
			}
			else
			{
				//ctx.putImageData(activeImgData, 0, 0);
			}
		}
	}
}

//清空与重置
function resetAll()
{
	//重置变量
	input.value = null;
	input_tag = true;
	clip_tag = false;
	activeImgSrc = null;
	//activeImgData = null;
	match_tag = false;
	scaleInput = 1.0;
	rotateCount = 0;
	
	//重置画布
	ctx.clearRect(0, 0, c.width, c.height);
	c.width = WITDH;
	c.height = HEIGHT;
	//sPointOut = null, ePointOut = null;
	sPoint.x = 0;
	sPoint.y = 0;
	ePoint.x = 0;
	ePoint.y = 0;
	//sPoint.drag可以让它自己控制，不会出现问题
	
	
	drawGrid();
	
	//移除裁剪中的监听事件
	document.removeEventListener('contextmenu', contextmenu, false);
	c.removeEventListener('mousedown', mousedown,false);
	c.removeEventListener('mousemove', mousemove,false);
	c.removeEventListener('mouseup', mouseup,false);
	clipOff.removeEventListener('click', click,false);
}

//画布匹配
function matchCanvas()
{
	match_tag = true;
	activeImgData = ctx.getImageData(sPoint.x, sPoint.y, ePoint.x - sPoint.x, ePoint.y - sPoint.y);
	
	//重置canvas的大小为新图的大小
	c.width = Math.abs(ePointOut.x - sPointOut.x);    
	c.height = Math.abs(ePointOut.y - sPointOut.y);
	console.log(sPointOut.x,sPointOut.y,ePointOut.x,ePointOut.y);
	//需要重新绘制刚才的内容
	ctx.putImageData(activeImgData, 0, 0);	//后面两个参数是put的起始位置!
	activeImgSrc = c.toDataURL();
	sPoint.x = 0;
	sPoint.y = 0;
	ePoint.x = c.width;
	ePoint.y = c.height;
	//为什么匹配完的时候，第一次进行其他操作，图片的尺寸就变成零了？
	//可以通过添加提示操作顺序修改这个问题。
}

//图片裁剪
function clipImg()
{
	input_tag = false;
	
	if(!input.value)
	{
		window.alert("Edit failed. Please import new images.");
		input_tag = true;
		return false;
	}
	
	console.log("start clipping");
	alert("Do not alter the image while clipping. It may lead the operation false.");
	//自定义函数
	function _9Squares()
	{
		var stepx = c.width/3;
		var stepy = c.height/3;
		
		ctx.setLineDash([5,5]); 
		ctx.lineWidth = 1; 
		ctx.strokeStyle = '#000000'; 
		
		ctx.beginPath(); 
		ctx.moveTo(0, stepy); 
		ctx.lineTo(c.width, stepy); 
		ctx.stroke();
		
		ctx.beginPath(); 
		ctx.moveTo(0, stepy*2); 
		ctx.lineTo(c.width, stepy*2); 
		ctx.stroke();
		
		ctx.beginPath(); 
		ctx.moveTo(stepx, 0); 
		ctx.lineTo(stepx, c.height); 
		ctx.stroke();
		
		ctx.beginPath(); 
		ctx.moveTo(stepx*2, 0); 
		ctx.lineTo(stepx*2, c.height); 
		ctx.stroke();
	}
	function drawCover()
	{
		ctx.save();
		ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
		ctx.fillRect(0, 0, c.width, c.height);
		ctx.restore();
    }
	function drawImage()
	{
		img = new Image();
		img.src = activeImgSrc;
		ctx.drawImage(img, 0, 0);
	}
	
	function restore()
	{
		sPoint = {};
		ePoint = {};
		drawImage();
    }
	
	//绘制参考线
	_9Squares();
	//绘制阴影
	drawCover();
	//裁剪时屏蔽右键事件
	function contextmenu(e)
	{
		e.preventDefault();
		e.stopPropagation();
	}
	document.addEventListener('contextmenu', contextmenu);
	
	
	
	function mousedown(e)
	{
		if(e.button === 0)	//按下左键
		{
			sPoint.x = e.offsetX;
			sPoint.y = e.offsetY;
			sPoint.drag = true;
		}
	}
	c.addEventListener('mousedown', mousedown);
	
	function mousemove(e)
	{
		if(e.button === 0 && sPoint.drag)
		{
			ePoint = { x: e.offsetX, y: e.offsetY };
			ctx.save();    //clip要通过restore回复
			ctx.clearRect(0, 0, c.width, c.height);    //画布全清
			drawImage();    //绘制底图
			drawCover();    //绘制阴影
			ctx.beginPath();    //开始路径
			ctx.rect(sPoint.x, sPoint.y, ePoint.x - sPoint.x, ePoint.y - sPoint.y);    //设置路径为选取框
			ctx.clip();    //截取路径内为新的作用区域
			drawImage();    //在选取框内绘制底图
			ctx.restore();    //恢复clip截取的作用范围
		}
	}
    c.addEventListener('mousemove', mousemove);
	
	
	function mouseup(e)
	{
		if(e.button === 0)
		{
			sPoint.drag = false;
			ePoint.x = e.offsetX;
			ePoint.y = e.offsetY;
		}
		else if(e.button === 2)	//右键取消本次操作
		{
			ctx.clearRect(0, 0, c.width, c.height);
			drawGrid();
			restore();
			
			clip_tag = false;
			window.alert("Operation canceled. Please draw new cutting area.");
		}
		
		clip_tag = true;	//接下来进入裁剪操作
	}
	c.addEventListener('mouseup', mouseup);

	console.log("clip out.");
}

function clipImgOff()
{
	function click(e)
	{
		if(sPoint.x !== undefined && ePoint.x !== undefined)
		{
			if(clip_tag)
			{
				activeImgData = ctx.getImageData(sPoint.x, sPoint.y, ePoint.x - sPoint.x, ePoint.y - sPoint.y);
				console.log(activeImgData.data);
				ctx.clearRect(0, 0, c.width, c.height);    //清空画布
				drawGrid();
				ctx.putImageData(activeImgData, Math.min(ePoint.x,sPoint.x), Math.min(ePoint.y,sPoint.y));
				activeImgSrc = c.toDataURL();
				
				//更新导出范围.做到暂时性保存
				ePointOut.x = ePoint.x;
				ePointOut.y = ePoint.y;
				sPointOut.x = sPoint.x;
				sPointOut.y = sPoint.y;
				
				clip_tag = false;
			}
			else
			{
				//window.alert("请选定新的裁剪区域~");
			}
		}
		else
		{
			//window.alert('没有选择区域');
		}
	}
    clipOff.addEventListener('click', click);	//完成裁剪
	click();
}
	
//缩放图片
function scaleImg()
{
	img = new Image();
	img.src = activeImgSrc;
	console.log("imgSize:"+img.width,img.height);
	ctx.clearRect(0, 0, c.width, c.height);
	drawGrid();
	
	scaleInput = prompt("Please type down the scalar(%):",80)/100;
	ctx.translate(img.width/2 - img.width/2 * scaleInput, img.height/2 - img.height/2 * scaleInput);
	ctx.scale(scaleInput, scaleInput);
	ctx.drawImage(img, 0, 0);
	ctx.scale(1/scaleInput, 1/scaleInput);	//还原状态
	ctx.translate(-(img.width/2-img.width/2*scaleInput), -(img.height/2-img.height/2*scaleInput));	//还原状态
	
	//图片始末变量更新
	sPoint.x = c.width/2 - c.width/2 * scaleInput;
	sPoint.y = c.height/2 - c.height/2 * scaleInput;
	ePoint.x = c.width/2 + c.width/2 * scaleInput;
	ePoint.y = c.height/2 + c.height/2 * scaleInput;
	sPointOut.x = sPoint.x;
	sPointOut.y = sPoint.y
	ePointOut.x = ePoint.x;
	ePointOut.y = ePoint.y;
}

//旋转图片
function rotateImg()
{	
	img = new Image();
	img.src = activeImgSrc;
	rotateCount = (rotateCount+1)%4;

	if(rotateCount%2 == 0)
	{
		c.width = img.width;
		c.height = img.height;
		ctx.clearRect(0, 0, c.width, c.height);
		drawGrid();
		
		ctx.translate(c.width/2 , c.height/2);
		ctx.rotate(-Math.PI / 2*rotateCount);
		ctx.drawImage(img, - c.width/2, - c.height/2);
		ctx.rotate(Math.PI / 2*rotateCount);
		ctx.translate(-c.width/2 , -c.height/2);
	}
	else
	{
		c.width = img.height;
		c.height = img.width;
		ctx.clearRect(0, 0, c.width, c.height);
		drawGrid();
		
		ctx.translate(c.width/2 , c.height/2);
		ctx.rotate(-Math.PI / 2*rotateCount);
		ctx.drawImage(img, - c.height/2, - c.width/2);
		ctx.rotate(Math.PI / 2*rotateCount);
		ctx.translate(-c.width/2 , -c.height/2);
	}
	
	
	//坐标重定位
	sPoint.x = 0
	sPoint.y = 0
	ePoint.x = c.width;
	ePoint.y = c.height;

	//图片始末变量更新
	sPointOut.x = sPoint.x;
	sPointOut.y = sPoint.y
	ePointOut.x = ePoint.x;
	ePointOut.y = ePoint.y;
	
}

//滤镜的实现
//黑白效果
function blackOrWhite()
{
	// 开始滤镜处理
	activeImgData = ctx.getImageData(0, 0, c.width, c.height);
	for (var i = 0; i < activeImgData.data.length / 4; i++)	//RGBA
	{
		var red = activeImgData.data[i * 4],
			green = activeImgData.data[i * 4 + 1],
			blue = activeImgData.data[i * 4 + 2];
		var gray = 0.3 * red + 0.59 * green + 0.11 * blue; // 计算gray

		activeImgData.data[i * 4] = gray;
		activeImgData.data[i * 4 + 1] = gray;
		activeImgData.data[i * 4 + 2] = gray;
	}
	ctx.putImageData(activeImgData, 0, 0); // 重写图像数据

}

//反转效果
function convertColor()
{
	activeImgData = ctx.getImageData(0, 0, c.width, c.height);
	for (var i = 0; i < activeImgData.data.length / 4; i++)
	{
		var red = activeImgData.data[i * 4],
		green = activeImgData.data[i * 4 + 1],
		blue = activeImgData.data[i * 4 + 2];

		activeImgData.data[i * 4] = 255 - activeImgData.data[i * 4];
		activeImgData.data[i * 4 + 1] = 255 - activeImgData.data[i * 4 + 1];
		activeImgData.data[i * 4 + 2] = 255 - activeImgData.data[i * 4 + 2];
	}
	ctx.putImageData(activeImgData, 0, 0); // 重写图像数据
}

function blackAndWhite()
{
	// 开始滤镜处理
	var sst = prompt("Please type down the threshold(%):",16)/100*255;
	activeImgData = ctx.getImageData(0, 0, c.width, c.height);
	for (var i = 0; i < activeImgData.data.length / 4; i++)	//RGBA
	{
		var red = activeImgData.data[i * 4],
			green = activeImgData.data[i * 4 + 1],
			blue = activeImgData.data[i * 4 + 2];
		var gray = 0.3 * red + 0.59 * green + 0.11 * blue; // 计算gray
		if(gray > sst)
			gray = 255;
		else
			gray = 0;

		activeImgData.data[i * 4] = gray;
		activeImgData.data[i * 4 + 1] = gray;
		activeImgData.data[i * 4 + 2] = gray;
	}
	ctx.putImageData(activeImgData, 0, 0); // 重写图像数据
}

function fastBlur()//很慢 很可能哪里bug了 而且边缘没有处理好
{
	var tmpImageData = ctx.getImageData( 0 , 0 , c.width , c.height );
	var tmpPixelData = tmpImageData.data;

	var imageData = ctx.getImageData( 0 , 0 , c.width , c.height );
	var pixelData = imageData.data;

	var blurR = prompt("Please type down the pixels level for Fast Blur:",3);
	//var blurR =3;//模糊的半径
	//参考多少个像素点（这个区域是正方形的面积）
	var totalnum = (2*blurR + 1)*(2*blurR + 1);
	var weight = 1 / totalnum; 
	//采用二维循环编辑
	for( var i = 0 ; i < c.height; i ++ )
	{
		for( var j = 0 ; j < c.width; j ++ )
		{
			var totalr = 0 , totalg = 0 , totalb = 0;//来计算周围所有的RGB的总和
			//一个像素点周围有8个像素点。
			//二维循环编辑:基于中心点在x,y方向的位移的变化值，循环走了9次，
			//下面这个就是点周围的点循环+自身（i,j）
			for( var dx = -blurR ; dx <= blurR ; dx ++ )
			{
				for( var dy = -blurR ; dy <= blurR ; dy ++ )
				{
					var x = i + dx;
					var y = j + dy;
					//周围像素点位移
					var p = x*c.width + y;
					//所对应的像素点
					if(p >= 0 && p <= c.height*c.width*4-1)
					{
						totalr += tmpPixelData[p*4+0] * weight;
						totalg += tmpPixelData[p*4+1] * weight;
						totalb += tmpPixelData[p*4+2] * weight;
					}
				}
			}
			//遍历第i行第j列的时候对应canvas的位移
			var p = i*c.width + j;
			//把周围的像素的平均值赋值(i,j)
			pixelData[p*4+0] = totalr;
			pixelData[p*4+1] = totalg;
			pixelData[p*4+2] = totalb;
		}
	}
	ctx.putImageData( imageData , 0 , 0 , 0 , 0 , c.width , c.height );
	activeImgData = ctx.getImageData( 0 , 0 , c.width , c.height );
}
function GaussianBlur() //非自己编写，有需要学习的地方。为什么这么快?*
{
	
	var imgData = ctx.getImageData( 0 , 0 , c.width , c.height );

	var pixes = imgData.data;
	var width = imgData.width;
	var height = imgData.height;
	var gaussMatrix = [],
	gaussSum = 0,
	x, y,
	r, g, b, a,
	i, j, k, len;

	var radius = prompt("Please type down the pixels level for Gaussian Blur:", 3);
	var radius = 1;
	var sigma = 5;

	a = 1 / (Math.sqrt(2 * Math.PI) * sigma);
	b = -1 / (2 * sigma * sigma);
	//生成高斯矩阵
	for (i = 0, x = -radius; x <= radius; x++, i++)
	{
		g = a * Math.exp(b * x * x);
		gaussMatrix[i] = g;
		gaussSum += g;
	}

	//归一化, 保证高斯矩阵的值在[0,1]之间
	for (i = 0, len = gaussMatrix.length; i < len; i++)
	{
		gaussMatrix[i] /= gaussSum;
	}
	//x 方向一维高斯运算
	for (y = 0; y < height; y++)
	{
		for (x = 0; x < width; x++)
		{
			r = g = b = a = 0;
			gaussSum = 0;
			for (j = -radius; j <= radius; j++)
			{
				k = x + j;
				if (k >= 0 && k < width) 
				{//确保 k 没超出 x 的范围
					//r,g,b,a 四个一组
					i = (y * width + k) * 4;
					r += pixes[i] * gaussMatrix[j + radius];
					g += pixes[i + 1] * gaussMatrix[j + radius];
					b += pixes[i + 2] * gaussMatrix[j + radius];
					// a += pixes[i + 3] * gaussMatrix[j];
					gaussSum += gaussMatrix[j + radius];
				}
			}
			i = (y * width + x) * 4;
			// 除以 gaussSum 是为了消除处于边缘的像素, 高斯运算不足的问题
			// console.log(gaussSum)
			pixes[i] = r / gaussSum;
			pixes[i + 1] = g / gaussSum;
			pixes[i + 2] = b / gaussSum;
			// pixes[i + 3] = a ;
		}
	}
	//y 方向一维高斯运算
	for (x = 0; x < width; x++)
	{
		for (y = 0; y < height; y++)
		{
			r = g = b = a = 0;
			gaussSum = 0;
			for (j = -radius; j <= radius; j++)
			{
				k = y + j;
				if (k >= 0 && k < height)
				{//确保 k 没超出 y 的范围
					i = (k * width + x) * 4;
					r += pixes[i] * gaussMatrix[j + radius];
					g += pixes[i + 1] * gaussMatrix[j + radius];
					b += pixes[i + 2] * gaussMatrix[j + radius];
					// a += pixes[i + 3] * gaussMatrix[j];
					gaussSum += gaussMatrix[j + radius];
				}
			}
			i = (y * width + x) * 4;
			pixes[i] = r / gaussSum;
			pixes[i + 1] = g / gaussSum;
			pixes[i + 2] = b / gaussSum;
		}
	}
	ctx.putImageData( imgData , 0 , 0 , 0 , 0 , c.width , c.height );
	activeImgData = ctx.getImageData( 0 , 0 , c.width , c.height );
}

function gosike()//如何处理尺寸溢出的问题？
{
	//var size = prompt("Please type down the pixels level for Mosaic:",10); 一样的错
	var size = 15;
	
	var tmpImageData = ctx.getImageData( 0 , 0 , c.width , c.height );
	var tmpPixelData = tmpImageData.data;

	activeImgData = ctx.getImageData( 0 , 0 , c.width , c.height );
	var pixelData = activeImgData.data;
	
	var totalnum = size*size;
	for( var i = 0 ; i < c.height ; i += size )
		for( var j = 0 ; j < c.width ; j += size )
		{
			//这块是计算每一块全部的像素值--平均值
			var totalr = 0 , totalg = 0 , totalb = 0;
			for( var dx = 0 ; dx < size ; dx ++ )
				for( var dy = 0 ; dy < size ; dy ++ ){
					var x = i + dx;
					var y = j + dy;
					var p = x*c.width + y;
					totalr += tmpPixelData[p*4+0];
					totalg += tmpPixelData[p*4+1];
					totalb += tmpPixelData[p*4+2];
				}
			var p = i*c.width+j;
			var resr = totalr / totalnum;
			var resg = totalg / totalnum;
			var resb = totalb / totalnum;
			//这个block像素的值=它的平均值
			for( var dx = 0 ; dx < size ; dx ++ )
				for( var dy = 0 ; dy < size ; dy ++ ){
					var x = i + dx;
					var y = j + dy;
					var p = x*c.width + y;
					pixelData[p*4+0] = resr;
					pixelData[p*4+1] = resg;
					pixelData[p*4+2] = resb;
				}
	}
	ctx.putImageData( activeImgData , 0 , 0 , 0 , 0 , c.width, c.height );
	//activeImgData = ctx.getImageData( 0 , 0 , c.width , c.height );
}

//大概是继续上次的编辑？
// function ReadCookie(cookieName)
// 	{
// 		var theCookie = "" + document.cookie;
// 		var ind = theCookie.indexOf(cookieName);
// 		if(ind==-1 || cookieName=="") return "";
// 		var ind1 = theCookie.indexOf(';',ind);
// 		if(ind1==-1) ind1 = theCookie.length;
// 		/*读取Cookie值*/
// 		return unescape(theCookie.substring(ind+cookieName.length+1,ind1));
// 	}
// function init() {
// 		editUrl = ReadCookie("p_src");
// 	}

function L_sketchize()
{
	//Laplace
	const Laplace = [[0, -1, 0], [-1, 4, -1], [0, -1, 0]];

	var tmpImageData = ctx.getImageData( 0 , 0 , c.width , c.height );
	var tmpPixelData = tmpImageData.data;

	var imageData = ctx.getImageData( 0 , 0 , c.width , c.height );
	var pixelData = imageData.data;

	//Laplace太浅了
	var enhance = prompt("Please type down the enhance:","2");
	//var enhance = 2	
	//采用二维循环编辑
	for( var i = 1 ; i < c.height - 1 ; i ++ )
	{
		for( var j = 1 ; j < c.width - 1 ; j ++ )
		{
			var Laplace_r = 0, Laplace_g = 0, Laplace_b = 0;

			for( var dx = -1 ; dx <= 1 ; dx ++ )
			{
				for( var dy = -1 ; dy <= 1 ; dy ++ )
				{
					var x = i + dx;
					var y = j + dy;
					//周围像素点位移
					var p = x*c.width + y;
					//所对应的像素点
					var offset = 1
					Laplace_r += tmpPixelData[p*4+0] * Laplace[dx+offset][dy+offset];
					Laplace_g += tmpPixelData[p*4+1] * Laplace[dx+offset][dy+offset];
					Laplace_b += tmpPixelData[p*4+2] * Laplace[dx+offset][dy+offset];
				}
			}
			//遍历第i行第j列的时候对应canvas的位移
			var p = i*c.width + j;
			//把周围的像素的平均值赋值(i,j)
			pixelData[p*4+0] = Laplace_r*enhance;
			pixelData[p*4+1] = Laplace_g*enhance;
			pixelData[p*4+2] = Laplace_b*enhance;
		}
	}
	ctx.putImageData( imageData , 0 , 0 , 0 , 0 , c.width , c.height );
	activeImgData = ctx.getImageData( 0 , 0 , c.width , c.height );

	convertColor();
}
function L_sketchize2()//反转Laplace
{
	//Laplace
	const Laplace = [[0, 1, 0], [1, -4, 1], [0, 1, 0]];

	var tmpImageData = ctx.getImageData( 0 , 0 , c.width , c.height );
	var tmpPixelData = tmpImageData.data;

	var imageData = ctx.getImageData( 0 , 0 , c.width , c.height );
	var pixelData = imageData.data;

	//Laplace太浅了
	var enhance = prompt("Please type down the enhance:","2");
	//var enhance = 2	
	//采用二维循环编辑
	for( var i = 1 ; i < c.height - 1 ; i ++ )
	{
		for( var j = 1 ; j < c.width - 1 ; j ++ )
		{
			var Laplace_r = 0, Laplace_g = 0, Laplace_b = 0;

			for( var dx = -1 ; dx <= 1 ; dx ++ )
			{
				for( var dy = -1 ; dy <= 1 ; dy ++ )
				{
					var x = i + dx;
					var y = j + dy;
					//周围像素点位移
					var p = x*c.width + y;
					//所对应的像素点
					var offset = 1
					Laplace_r += tmpPixelData[p*4+0] * Laplace[dx+offset][dy+offset];
					Laplace_g += tmpPixelData[p*4+1] * Laplace[dx+offset][dy+offset];
					Laplace_b += tmpPixelData[p*4+2] * Laplace[dx+offset][dy+offset];
				}
			}
			//遍历第i行第j列的时候对应canvas的位移
			var p = i*c.width + j;
			//把周围的像素的平均值赋值(i,j)
			pixelData[p*4+0] = Laplace_r*enhance;
			pixelData[p*4+1] = Laplace_g*enhance;
			pixelData[p*4+2] = Laplace_b*enhance;
		}
	}
	ctx.putImageData( imageData , 0 , 0 , 0 , 0 , c.width , c.height );
	activeImgData = ctx.getImageData( 0 , 0 , c.width , c.height );

	//convertColor();
}
