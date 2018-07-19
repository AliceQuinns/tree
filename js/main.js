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

export default class main{
	constructor(){
		// 控制帧循环
		this._loop = null;
		this.ranking = false;//排行榜控制
        this.gameStart = false;// 游戏运行状态控制
        this.helpStatus = false;// 帮助界面
		Level = 0;// 关卡控制
        this._gametimectr=null;// 游戏时间计时器对象
		this.touchCuttrees=null;//事件回调队列
		WxModular.share();// 开启分享功能
        this.anklist = false; // 开启好友排行榜
		this.init();
	}

	init(){
        // 清空上一个计时器和帧循环
		window.clearInterval(this._gametimectr);
        cancelAnimationFrame(this._loop);
		databus.reset();// 重置状态
		canvas.removeEventListener('touchstart',this.touchCuttrees);// 移除事件
		wx.triggerGC();// 调起js内存回收

        this.Aggressivity = GLOBAL.Level[Level].Aggressivity;// 当前攻击力
        this.hp = GLOBAL.Level[Level].hp;// 当前总血量
        this.Gametime = GLOBAL.Level[Level].time*1000;// 当前游戏时间

		this.back = new Back(ctx,bg);// 实例化背景对象
		this.npc = new Npc(ctx,npctexture,Level);// 实例化主角
		this.gameinfo = new Gameinfo(ctx);// 实例化分数与游戏结束控制
		this.alert = new Alert(ctx);// 实例化弹框对象
		if(!this.gameStart){
            this.IndexUI = new Index(ctx);// 实例化indexUI
		}

		// 实例化木头
		for (let i = 1; i < 15; i++) {
			let _img = this.randomTree();// 随机产生木头类型
			let _tree =  databus.pool.getItemByClass('tree',Tree,ctx,_img.img,_img.p);// 对象池请求
			databus.pushTree(_tree);
		}

		// 游戏开始绑定控制事件
		if(this.gameStart){
            this.touch();// 游戏控制
		}

        // 播放背景音乐
        audioObj.playMusic(Tools.getRandomInt(0,2)?"bg1":"bg2");

		// update
		this._loop =  window.requestAnimationFrame(
	      this.loop.bind(this),
	      canvas
	    );
	}

	// 控制游戏时间
	ctrGameTime(){
		if(this._gametimectr){
			window.clearInterval(this._gametimectr);//清除上一关计时器
		}
		let _ = window.setInterval(()=>{
			if(databus.gameOver){
                window.clearInterval(this._gametimectr);//清除上一关计时器
				return;
			}
            this.npc.currentTime<=0?this.npc.currentTime=0:this.npc.currentTime-=10;
			if(this.npc.currentTime<=0){
				window.clearInterval(_);//清空定时器
				if(!databus.gameOver||this.npc.blood>0.017){
                    Level+=1;//进入下一关
                    databus.gameOver = true;// 暂停游戏
                    databus.clearance = true;// 通关成功
					// 渲染通关弹窗
				}
			}
		},10);
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

		databus.score++;
		this.npc.blood = (this.npc.blood + this.Aggressivity>=this.hp)?this.hp:this.npc.blood+this.Aggressivity;// 减慢敌人速度
		// 回收木头
		databus.shiftTree();
        // 产生新木头
		let _img = this.randomTree();
		let _tree =  databus.pool.getItemByClass('tree',Tree,ctx,_img.img,_img.p);
		databus.pushTree(_tree);
        this.collisionDetection();// 碰撞检测
	}

	/*随机产生木头*/
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
			WxModular.Ranking(1,databus.score);// 开启得分面板
		}
	}

	// index界面事件处理器
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
		});
		// 分享
		this.__ClickRange({x:x,y:y},_share,()=>{
            window.shareBTN();
		});
		// 排行榜
		this.__ClickRange({x:x,y:y},_rankList,()=>{
			this.anklist = true;
			WxModular.Ranking(2);
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
            ctx.clearRect(0, 0, canvas.width, canvas.height);// 清空canvas
            Level = 0;//还原到第一关
            this.gameStart = false;
            this.init();// 重新开始
			this.ranking = false;
            //cancelAnimationFrame(this.ctx2_Render_id);//停止ranking层的绘制
        });

        // 返回
        this.__ClickRange({x:x,y:y},homeArea,()=>{
            ctx.clearRect(0, 0, canvas.width, canvas.height);// 清空canvas
            Level = 0;//还原到第一关
            this.gameStart = false;
            this.init();// 重新开始
			this.ranking = false;
        });

        // 分享
        this.__ClickRange({x:x,y:y},shareArea,()=>{
            window.shareBTN();
        });
	}

	// 进入下一关按钮回调
    clearanceHandler(e){
        e.preventDefault();

        let x = e.touches[0].clientX;
        let y = e.touches[0].clientY;

        let area = this.alert.btnMatrix;// 获得按钮范围
        if (x >= area.startX
            && x <= area.endX
            && y >= area.startY
            && y <= area.endY ){
            ctx.clearRect(0, 0, canvas.width, canvas.height);// 清空canvas
            this.gameStart = true;
            this.init();// 重新开始
            this.ctrGameTime(this.Gametime);// 开启游戏时间控制
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

	loop() {
		let that = this;
		ctx.clearRect(0, 0, canvas.width, canvas.height);// 每帧清空
		this.back.render();// 渲染背景
		this.npc.render();// 渲染主角

		//  渲染位于渲染队列中的全部对象
		for(let k in databus.trees){
			databus.trees[k].renderTree(k);
		}

		// 开始游戏控制
		if(this.gameStart&&!databus.clearance&&!this.helpStatus&&!databus.gameOver){
            this.npc.renderLifebar();// 生命值
            // 渲染关卡文本
            ctx.font = "20px Microsoft YaHei";
            ctx.fillStyle = "#fff";
            ctx.fillText("第"+(Level+1)+"关",  10,  50);
        }
		/*游戏结束 如果游戏结束时通关了则渲染通关弹窗*/
		if(databus.clearance&&!databus.gameOver){
			// 通关
            this.alert.render("clearance",Level,databus.score);// 绘制通关界面
            canvas.removeEventListener('touchstart',this.touchCuttrees);
            this.touchCuttrees = that.clearanceHandler.bind(this);//事件处理函数
            canvas.addEventListener('touchstart', this.touchCuttrees);
            return
		}else if (!databus.clearance&&(databus.gameOver||this.npc.blood<0.017)) {
			// 游戏结束
		  	databus.gameOver = true;
		  	this.gameinfo.gameOver(databus.score);// 游戏结束 绘制结束UI
			ctx.drawImage(sharedCanvas,0,0,screenWidth,screenHeight);// 渲染排行榜
		  	// 重新绑定事件
		  	canvas.removeEventListener('touchstart',this.touchCuttrees);
		  	this.touchCuttrees = that.touchEventHandler.bind(this);//事件处理函数
      	  	canvas.addEventListener('touchstart', this.touchCuttrees);
	    }else{
			if(this.gameStart){
                this.gameinfo.render(databus.score);// 修改分数
			}
		}

        if(!this.gameStart){
            this.IndexUI.render();// 渲染indexui
            // 好友排行榜开启
            if(that.anklist){
                ctx.drawImage(sharedCanvas,0,0,screenWidth,screenHeight);// 渲染排行榜
            }
            canvas.removeEventListener('touchstart',this.touchCuttrees);
            this.touchCuttrees = that.touchEventStartGame.bind(this);//事件处理函数
            canvas.addEventListener('touchstart', this.touchCuttrees);
        }

        if(this.helpStatus){
            this.alert.render("help");// 绘制游戏帮助界面
            // 重新绑定事件
            canvas.removeEventListener('touchstart',this.touchCuttrees);
            this.touchCuttrees = ()=>{
                this.helpStatus = false;// 关闭游戏帮助界面
                this.touch();// 开启事件绑定
                this.ctrGameTime(this.Gametime);// 开启游戏时间控制
            };//事件处理函数
            canvas.addEventListener('touchstart', this.touchCuttrees);
        }
		// 每帧执行
	 	window.requestAnimationFrame(
	      this.loop.bind(this),
	      canvas
	    )
	}
}