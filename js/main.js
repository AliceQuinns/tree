import Databus from './base/databus.js'
import Back from './base/bg.js'
import Tree from './base/tree.js'
import Npc from './base/npc.js'
import Gameinfo from './base/gameinfo.js'
import Audio from './base/audio.js'
import Tool from './base/tool.js'
import Index from './base/index.js'
import Alert from './base/alert.js'

let screenHeight = window.innerHeight;
let screenWidth  = window.innerWidth;

let Level = 0;// 当前关卡

// 树贴图
let treeLeft = "images/treeLeft.png";
let treeCen = "images/tree.png";
let treeRight = "images/treeRight.png";

// npc贴图
let npcImg = 'images/npc.png';
let npcMove = 'images/npcMove.png';
let npcDie = 'images/npcDie.png';
let npctexture = 'images/npc.png';

// 背景贴图
let bg = 'images/bg.png';

// 离屏canvas
let openDataContext = wx.getOpenDataContext();
let sharedCanvas = openDataContext.canvas;
let ratio = wx.getSystemInfoSync().pixelRatio;
sharedCanvas.width = screenWidth*ratio;
sharedCanvas.height = screenHeight*ratio;

// 上屏canvas
let ctx = canvas.getContext('2d');
let audioObj = new Audio();// 创建音频实例
let databus = new Databus();// 游戏状态
let Tools = new Tool();// 创建工具类
canvas.width = screenWidth * ratio;
canvas.height = screenHeight * ratio;
ctx.scale(ratio,ratio);

// 流量主广告位
let bannerAd = wx.createBannerAd({
    adUnitId: 'adunit-1e8b0bcef4124c21',
    style: {
        left: 0,
        top: 0,
		width: screenWidth,
    }
});
// 视频广告
let videoAd = wx.createRewardedVideoAd({
    adUnitId: 'adunit-80a6cd1bb9bcab59'
})


export default class main{
	constructor(){
		this.stop = true;// 渲染函数开关
		// 动画队列
		this.animatedQueue = {
			target: null,// 动画主体
			data: null,// 动画数据
		}; 
		// 事件禁用开关
		this.eventswich = true;
		this._loop = null;// 关卡时间控制
        this.gameStart = false;// 游戏运行状态控制
        this.helpStatus = false;// 帮助界面
		Level = 0;// 关卡控制
        this._gametimectr=null;// 游戏时间计时器对象
		this.touchCuttrees=null;//事件回调队列
		WxModular.share();// 开启分享功能
		this.anklist = false; // 开启好友排行榜
		// 播放背景音乐
		audioObj.playMusic(Tools.getRandomInt(0,2)?"bg1":"bg2",false,true);
		// 看视频复活逻辑
		videoAd.onClose(res => {
			if (res && res.isEnded || res === undefined) {
				this.eventswich = false;// 禁用所有事件
				//this.CountdownTime = false;//关闭倒计时
				bannerAd.hide();// 关闭banner广告
				this.Passanimation(400,()=>{
					//ctx.clearRect(0, 0, canvas.width, canvas.height);// 清空canvas
					this.stop = false;// 停止渲染
					window.setTimeout(()=>{
						ctx.clearRect(0, 0, canvas.width, canvas.height);// 清空canvas
						this.gameStart = true;
						this.eventswich = true;// 开启所有事件
            			this.init();// 重新开始
						this.ctrGameTime();// 开启游戏时间控制		
					},500);
				},true);
			}
			else {
				console.log("播放中途退出，不下发游戏奖励");
				bannerAd.show();// 开启banner广告	
			}
		})
		this.init();
	}

	init(){
        // 清空上一个计时器和帧循环
		window.clearInterval(this._gametimectr);
        cancelAnimationFrame(this._loop);
		databus.reset();// 重置状态
		canvas.removeEventListener('touchstart',this.touchCuttrees);// 移除事件
		wx.triggerGC();// 调起js内存回收
		wx.postMessage({type:5});// 清空排行榜
		wx.postMessage({type: 4,close:true});//关闭比分面板
		this.stop = true;
        this.Aggressivity = GLOBAL.Level[Level].Aggressivity;// 当前攻击力
        this.hp = GLOBAL.Level[Level].hp;// 当前总血量
		this.Gametime = GLOBAL.Level[Level].time;// 当前游戏时间
		//console.log("当前关卡",Level);
		this.CountdownTime = true;//复活倒计时开关
		this.CountdownCtr = 500;// 倒计时时间

		this.back = new Back(ctx,bg);// 实例化背景对象
		this.npc = new Npc(ctx,npctexture,Level);// 实例化主角
		this.gameinfo = new Gameinfo(ctx);// 实例化分数与游戏结束控制
		this.alert = new Alert(ctx);// 实例化弹框对象

		// 实例化木头
		for (let i = 1; i < 15; i++) {
			let _img = this.randomTree();// 随机产生木头类型
			let _tree =  databus.pool.getItemByClass('tree',Tree,ctx,_img.img,_img.p);// 对象池请求
			databus.pushTree(_tree);
		}

		if(!this.gameStart){
            this.IndexUI = new Index(ctx);// 初始化游戏首页
		}else{
			this.touch();// 游戏控制
		}

		// update
		this._loop =  window.requestAnimationFrame(
	      this.loop.bind(this),
	      canvas
	    );
	}

	// 控制游戏时间
	ctrGameTime(time){
		window.clearInterval(this._gametimectr);//清除上一关计时器
		let _ = window.setInterval(()=>{
			// 如果游戏通关或者失败
			if(databus.gameOver){
				window.clearInterval(this._gametimectr);
				return;
			}
			if(this.Gametime<=0){
				window.clearInterval(_);//清空定时器
				if(!databus.gameOver||this.npc.blood>0.017){
                    Level+=1;//进入下一关
                    databus.clearance = true;// 通关成功
					window.clearInterval(this._gametimectr);
				}
			}else{
				this.Gametime-=1;
			}
		},1000);
		this._gametimectr = _;
	}

	run(){			
		/*计算当前点击位置*/
		this.collisionDetection();// 碰撞检测
		if(databus.gameOver){
			return
		}
		let tap = this.touchX>=screenWidth/2;// 判断鼠标落点

		// 切换主角位置
		if (!(this.npc.posi == tap)) {
			this.npc.posi = !this.npc.posi;
			return
		}

		databus.score++;// 增加分数
		wx.postMessage({type:4,data:{score: databus.score}});// 比分
		this.npc.blood = (this.npc.blood + this.Aggressivity>=this.hp)?this.hp:this.npc.blood+this.Aggressivity;// 减慢敌人速度
		// 回收木头
		databus.shiftTree();
        // 产生新木头
		let _img = this.randomTree();
		let _tree =  databus.pool.getItemByClass('tree',Tree,ctx,_img.img,_img.p);
		databus.pushTree(_tree);
        this.collisionDetection();// 碰撞检测
	}

	// 随机产生木头
	randomTree(){
		/*判断上一个木头*/
		let _a,_b,_random=true;
		let random = Math.random();// 随机数
		let last = true;
		if (databus.trees.length>0) {
			last = databus.trees[databus.trees.length-1].posiDr
		}
		if (last == "center") {
			if (random<=0.3334) {
				_a = treeRight;
				_b = true
			}else if(random>0.3334&&random<=0.6667){
				_a = treeLeft;
				_b = false
			}else{
				_a = treeCen;
				_b = "center"
			}			
			
		}else{
			_a = treeCen;
			_b = "center"
		}
		return {
			img:_a,
			p:_b
		}
	}

	/*碰撞检测*/
	collisionDetection(){
		let isCollision = (this.npc.posi==databus.trees[0].posiDr);
		isCollision&&(databus.gameOver = true)&&(this.npc.update(npcDie));
		if(databus.gameOver){
			Tools.getshock(2);// 震动
			wx.postMessage({type:4,close: true});// 关闭比分面板
			wx.postMessage({
				type:1,
				data:{score:databus.score},
				style:{top: 400}
			});
			bannerAd.show();//关闭广告 
		}
	}

	// 首页界面事件处理器
	touchEventStartGame(e) {
        e.preventDefault();

        let x = e.touches[0].clientX;
        let y = e.touches[0].clientY;

        // 获取按钮矩阵
        let _play = this.IndexUI.playRange;
        let _share = this.IndexUI.shareRange;
        let _rankList = this.IndexUI.rankListRange;
        let _game = this.IndexUI.gameRange;

        // 开始游戏
		this.__ClickRange({x:x,y:y},_play,()=>{
            this.gameStart = true;// 开始游戏 并关闭index弹窗
            this.helpStatus = true;// 开启游戏帮助界面
            this.anklist = false;
			wx.postMessage({type:4,effect: true});// 初始化比分面板
			wx.postMessage({type:5});// 清空排行榜
		});
		// 分享
		this.__ClickRange({x:x,y:y},_share,()=>{
            window.shareBTN();
		});
		// 排行榜
		this.__ClickRange({x:x,y:y},_rankList,()=>{
			this.anklist = true;
			wx.postMessage({type: 2});
		});
		// 更多游戏
		this.__ClickRange({x:x,y:y},_game,()=>{
            WxModular.MoreGames();
		});
	}

	// 点击范围检测
	__ClickRange(event,target,callback) {
		if(event.x >= target.startX
		&& event.x <= target.endX
		&& event.y >= target.startY
		&& event.y <= target.endY ){
            callback();
		}
	}

  	//游戏结束后的触摸事件处理逻辑  重新开始按钮
	touchEventHandler(e) {
	    e.preventDefault();

	    let x = e.touches[0].clientX;
	    let y = e.touches[0].clientY;

        // 获取按钮矩阵
        let homeArea = this.gameinfo.homeArea;
        let shareArea = this.gameinfo.shareArea;
        let btnArea = this.gameinfo.btnArea;

        // 重新游戏
        this.__ClickRange({x:x,y:y},btnArea,()=>{
			this.eventswich = false;// 禁用所有事件
			bannerAd.hide();// 关闭广告
			this.Passanimation(80,()=>{
				Level = 0;//还原到第一关
				this.eventswich = true;// 开启事件
				this.gameStart = false;// 切换游戏为未开始状态
				ctx.clearRect(0, 0, canvas.width, canvas.height);// 清空canvas
				wx.postMessage({type:5});
				this.stop = false;// 停止渲染
				window.setTimeout(()=>{
					this.init();
				},500);
			})
        });

        // 返回
        this.__ClickRange({x:x,y:y},homeArea,()=>{
			this.eventswich = false;// 禁用所有事件
			bannerAd.hide();// 关闭广告			
			this.Passanimation(80,()=>{
				Level = 0;//还原到第一关
				this.eventswich = true;// 开启事件
				this.gameStart = false;// 切换游戏为未开始状态
				ctx.clearRect(0, 0, canvas.width, canvas.height);// 清空canvas
				this.stop = false;// 停止渲染
				window.setTimeout(()=>{
					this.init();
				},500);
			})
        });

        // 分享
        this.__ClickRange({x:x,y:y},shareArea,()=>{
            window.shareBTN();
        });
	}

	// 通关界面事件
    clearanceHandler(e){
        e.preventDefault();

        let x = e.touches[0].clientX;
        let y = e.touches[0].clientY;

		// 下一关
        let next = this.alert.nextBtn;
        if (x >= next.startX
            && x <= next.endX
            && y >= next.startY
            && y <= next.endY ){
            ctx.clearRect(0, 0, canvas.width, canvas.height);// 清空canvas
            this.gameStart = true;
            this.init();// 重新开始
			this.ctrGameTime();// 开启游戏时间控制
			bannerAd.hide();// 关闭广告		
			wx.postMessage({type:4,effect: true});// 初始化比分面板
			wx.postMessage({type:5});// 清空排行榜	
		}
		// 邀请好友
		let share = this.alert.shareBtn;
        if (x >= share.startX
            && x <= share.endX
            && y >= share.startY
            && y <= share.endY ){
            window.shareBTN();
		}
		// 返回主页
		let home = this.alert.homeBtn;
        if (x >= home.startX
            && x <= home.endX
            && y >= home.startY
            && y <= home.endY ){
			this.gameStart = false;// 切换游戏为未开始状态
			ctx.clearRect(0, 0, canvas.width, canvas.height);// 清空canvas
			bannerAd.hide();// 关闭广告	
			this.init();
			wx.postMessage({type:5});// 清空排行榜	
		}

	}

	// 砍树
	touchCuttree(e){
		e.preventDefault();//停止事件冒泡
		let that = this;
		// 如果游戏结束不执行动作
		if (databus.gameOver) {
			return
		}
		that.npc.update(npcMove);// 更新砍树动作贴图
		Tools.getshock(1);//震动
		// 100ms恢复贴图
		setTimeout(()=>{
			that.npc.update(npcImg)
		},100);
		that.touchX = e.touches[0].clientX;// 获取点击位置的X坐标
        this.npc.WormType = !this.npc.WormType;//切换虫子贴图
		that.run();
	}

	// 点击事件监听
	touch(){
		let that = this;
        canvas.removeEventListener('touchstart',this.touchCuttrees);
		this.touchCuttrees = that.touchCuttree.bind(this); // 更改this指向
		canvas.addEventListener('touchstart', this.touchCuttrees);
	}

	// 倒计时界面
	CountdownHandler(e){
		e.preventDefault();

        let x = e.touches[0].clientX;
        let y = e.touches[0].clientY;

		// 复活
        let next = {
			startX: screenWidth/2-60,
            startY: screenHeight/2-60,
            endX  : screenWidth/2+60,
            endY  : screenHeight/2+60
		};
        if (x >= next.startX
            && x <= next.endX
            && y >= next.startY
            && y <= next.endY ){
			this.CountdownTime = false;//关闭倒计时
			videoAd.show();// 开启视频广告
			bannerAd.hide();// 关闭banner广告	
		}
		// 邀请好友
		let share = {
			startX: screenWidth / 2 - 75,
            startY: screenHeight*.8 - 25,
            endX  : screenWidth / 2 - 75 + 150,
            endY  : screenHeight*.8 - 25 + 50
		};
        if (x >= share.startX
            && x <= share.endX
            && y >= share.startY
            && y <= share.endY ){
			window.shareBTN();
		}
		// 跳过
		let home = {
			startX: screenWidth/2 - 50,
            startY: screenHeight * .7 - 50,
            endX  : screenWidth/2+50,
            endY  : screenHeight * .7 + 50
		};
        if (x >= home.startX
            && x <= home.endX
            && y >= home.startY
            && y <= home.endY ){
			this.CountdownTime = false;//关闭倒计时
		}
	}

	// 过场动画
	Passanimation(time,callback,video){
		let times = time;//剩余时间
		let radius= Math.sqrt(Math.pow(screenWidth/2,2)+Math.pow(screenHeight/2,2));
		// let text= ctx.globalCompositeOperation;// 叠加模式
		this.animatedQueue.target = ()=>{
			times -= 1;
			if(times<=0){
				// ctx.globalCompositeOperation = text ;// 还原叠加模式
				this.animatedQueue.target = null;// 清空动画队列
				callback();
				return;
			}
			// ctx.globalCompositeOperation = "destination-out";
			ctx.beginPath();
			ctx.arc(screenWidth/2,screenHeight/2,radius-radius*times/time,0,2*Math.PI,false);
			ctx.fillStyle="#000000";
			ctx.fill();
			ctx.closePath();
			if(!!video){
				// 复活
				ctx.font = "25px Microsoft YaHei";
				ctx.fillStyle = "#ffffff";
				let _ = ctx.textAlign,__ = ctx.textBaseline;
				ctx.textAlign = 'center';
				ctx.textBaseline = "middle";
				ctx.fillText("正在复活中",  screenWidth / 2,  screenHeight/2);
				ctx.textAlign = _;
				ctx.textBaseline = __;
			}
			// ctx.globalCompositeOperation = text; 
		}
	}

	// 事件控制
	clickCtr(callback){
		if(!this.eventswich){
			canvas.removeEventListener('touchstart',this.touchCuttrees);
			return;
		};
		canvas.removeEventListener('touchstart',this.touchCuttrees);
        this.touchCuttrees = callback.bind(this);//事件处理函数
        canvas.addEventListener('touchstart', this.touchCuttrees);
	}

	loop() {
		// 强制停止帧循环
		if(!this.stop){
			return;
		}

		// 刷新canvas
		let that = this;
		ctx.clearRect(0, 0, canvas.width, canvas.height);// 每帧清空
		this.back.render();// 渲染背景
		this.npc.render();// 渲染主角

		//  渲染队列
		for(let k in databus.trees){
			databus.trees[k].renderTree(k);
		}

		// 生命条
		if(this.gameStart&&!databus.clearance&&!this.helpStatus&&!databus.gameOver){
            this.npc.renderLifebar();
            // 渲染关卡文本
			ctx.font = "20px Microsoft YaHei";
			ctx.fillStyle = "#fff";
        	let _ = ctx.textAlign;
        	ctx.textAlign = 'center';
        	ctx.fillText("第"+(Level+1)+"关",  screenWidth / 2,  screenHeight * .3);
        	ctx.textAlign = _;
		}
		
		// 通关弹窗 
		if(databus.clearance&&!databus.gameOver){
            this.alert.render("clearance",Level,databus.score,this.npc.blood/this.hp*100);// 绘制通关界面
			window.setTimeout(()=>{
				this.clickCtr(that.clearanceHandler);
			},1000)
			bannerAd.show();//关闭广告
            this.stop = false;// 停止渲染
		}

		// 游戏结束
		else if (!databus.clearance&&(databus.gameOver||this.npc.blood<0.017)) {
			// 开启复活倒计时
			if(this.CountdownTime){
				this.CountdownCtr-=1;
				if(this.CountdownCtr<=0){
					//console.log("停止倒计时");
					this.CountdownTime = false;
				}else{
					// 遮罩层
					ctx.beginPath();
					ctx.fillStyle = "rgba(0,0,0,0.6)";
					ctx.fillRect(0,0,screenWidth,screenHeight);
					// 灰色的圆
					ctx.beginPath();
					ctx.arc(screenWidth/2, screenHeight/2, 80, 0, Math.PI*2);
					ctx.closePath();
					ctx.fillStyle = '#cecece';
					ctx.fill();
					// 进度环
					ctx.beginPath();
					ctx.moveTo(screenWidth/2, screenHeight/2);
					ctx.arc(screenWidth/2, screenHeight/2, 80,  Math.PI*1.5, Math.PI*(1.5+2*this.CountdownCtr/500));
					ctx.closePath();
					ctx.fillStyle = '#FF9600';
					ctx.fill();
					// 填充圆
					ctx.beginPath();
					ctx.arc(screenWidth/2, screenHeight/2, 60, 0, Math.PI*2);
					ctx.closePath();
					ctx.fillStyle = '#fff';
					ctx.fill();
					// 点击区域
					ctx.font = "25px Microsoft YaHei";
					ctx.fillStyle = "#FF9600";
        			let _ = ctx.textAlign,__ = ctx.textBaseline;
					ctx.textAlign = 'center';
					ctx.textBaseline = "middle";
					ctx.fillText("复活",  screenWidth / 2,  screenHeight/2);
					ctx.font = "20px Microsoft YaHei";
					ctx.fillStyle = "#ffffff";
        			ctx.fillText("立即跳过",  screenWidth / 2,  screenHeight*.7);
        			ctx.fillText("邀请好友",  screenWidth / 2,  screenHeight*.8);
					ctx.textAlign = _;
					ctx.textBaseline = __;
					// 按钮边框
					Tools.RoundRect(screenWidth / 2 - 75,  screenHeight*.8 - 25, 150,50,50,ctx,"#FF9600",true,3);
					// 事件监听
					this.clickCtr(that.CountdownHandler); 
				}
			}else{
				if(!databus.gameOver){
					//wx.postMessage({type:4,close: true});// 关闭比分面板
					wx.postMessage({
						type:1,
						data:{score:databus.score},
						style:{top: 400}
					});
					bannerAd.show();//关闭广告 
				}
				databus.gameOver = true;
				this.gameinfo.gameOver(databus.score);
				this.clickCtr(that.touchEventHandler); 
				ctx.drawImage(sharedCanvas,0,0,screenWidth,screenHeight); 
			}
		}
		else{
			if(this.gameStart){
				this.gameinfo.render(databus.score);// 修改分数
				ctx.drawImage(sharedCanvas,0,0,screenWidth,screenHeight);// 渲染比分面板
			}
		}

		// 游戏首页
        if(!this.gameStart){
			this.IndexUI.render();// 渲染indexui
			// 群排行
			if(window.GROUPSHARE){
				ctx.drawImage(sharedCanvas,0,0,screenWidth,screenHeight);// 渲染排行榜
				this.IndexUI.renderclose();// 关闭按钮
					this.clickCtr((e)=>{
						e.preventDefault();
						let x = e.touches[0].clientX;
						let y = e.touches[0].clientY;
						this.__ClickRange({x:x,y:y},this.IndexUI.closeRange,()=>{
							window.GROUPSHARE = false;
						});
					});
			}else{
				// 好友排行榜
				if(that.anklist){
					ctx.drawImage(sharedCanvas,0,0,screenWidth,screenHeight);// 渲染排行榜
					this.IndexUI.renderclose();// 关闭按钮
					this.clickCtr((e)=>{
						e.preventDefault();
						let x = e.touches[0].clientX;
						let y = e.touches[0].clientY;
						this.__ClickRange({x:x,y:y},this.IndexUI.closeRange,()=>{
							this.anklist = false;
						});
					});
				}else{
					this.clickCtr(that.touchEventStartGame);
				}
			}
        }

		// 帮助界面
        if(this.helpStatus){
			this.alert.render("help");
			this.clickCtr(()=>{
				this.helpStatus = false;// 关闭游戏帮助界面
                this.touch();// 开启事件绑定
				this.ctrGameTime();// 开启游戏时间控制
			});
		}
		
		// 动画队列
		if(!!this.animatedQueue.target)this.animatedQueue.target();

		window.requestAnimationFrame(
			this.loop.bind(this),
			canvas
		)
	}
}