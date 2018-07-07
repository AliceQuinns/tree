import Databus from './base/databus.js'
import Back from './base/bg.js'
import Tree from './base/tree.js'
import Npc from './base/npc.js'
import Gameinfo from './base/gameinfo.js'
import Audio from './base/audio.js'
import Tool from './base/tool.js'
import Index from './base/index.js'

let ctx = canvas.getContext('2d');
let audioObj = new Audio();// 创建音频实例
let databus = new Databus();
let Tools = new Tool();// 创建工具类

let screenHeight = window.innerHeight;
let screenWidth  = window.innerWidth;

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

export default class main{
	constructor(){
        this.gameStart = false;// 游戏运行状态控制
		this.init();
	}

	init(){
		databus.reset();// 重置状态
		canvas.removeEventListener('touchstart',this.touchHandler);// 移除事件
		wx.triggerGC();// 调起js内存回收
		/*降低帧率*/
		//wx.setPreferredFramesPerSecond(20)
		this.back = new Back(ctx,bg);// 实例化背景对象
		this.npc = new Npc(ctx,npctexture);// 实例化主角
		this.gameinfo = new Gameinfo(ctx);// 实例化分数与游戏结束控制
		this.IndexUI = new Index(ctx);// 实例化indexUI

		// 实例化木头
		for (let i = 1; i < 15; i++) {
			let _img = this.randomTree();// 随机产生木头类型
			let _tree =  databus.pool.getItemByClass('tree',Tree,ctx,_img.img,_img.p);// 对象池请求
			databus.pushTree(_tree);
		}
		// 再来一局情况
		if(this.gameStart){
            this.touch();// 绑定点击事件
		}
		// update
		window.requestAnimationFrame(
	      this.loop.bind(this),
	      canvas
	    );
		// 播放背景音乐
        audioObj.playMusic(Tools.getRandomInt(0,2)?"bg1":"bg2");
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
		this.npc.blood = (this.npc.blood + 160>=6000)?6000:this.npc.blood+160;// 添加生命值
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

        // 判断
		this.__ClickRange({x:x,y:y},_play,()=>{
			this.gameStart = true;// 开始游戏
            this.touch()// 开启事件绑定
		});
		this.__ClickRange({x:x,y:y},_share,()=>{});
		this.__ClickRange({x:x,y:y},_rankList,()=>{});
		this.__ClickRange({x:x,y:y},_game,()=>{});
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

  	//游戏结束后的触摸事件处理逻辑
	touchEventHandler(e) {
	     e.preventDefault();

	    let x = e.touches[0].clientX;
	    let y = e.touches[0].clientY;

	    let area = this.gameinfo.btnArea;// 获得按钮范围
	    if (x >= area.startX
        && x <= area.endX
        && y >= area.startY
        && y <= area.endY ){
		   	ctx.clearRect(0, 0, canvas.width, canvas.height);// 清空canvas
		    this.init();// 重新开始
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
		// 100ms恢复贴图
		setTimeout(()=>{
			that.npc.update(npcImg)
		},100);
		that.touchX = e.touches[0].clientX;// 获取点击位置的X坐标
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
		if(this.gameStart){
            this.npc.renderLifebar();// 生命值
		}
		/*游戏结束*/
		if (databus.gameOver||this.npc.blood<0.017) {	
		  databus.gameOver = true;
		  this.gameinfo.gameOver(databus.score);// 游戏结束 绘制结束UI
		  // 重新绑定事件
		  canvas.removeEventListener('touchstart',this.touchCuttrees);
		  this.touchCuttrees = that.touchEventHandler.bind(this);//事件处理函数
      	  canvas.addEventListener('touchstart', this.touchCuttrees);
	      return
	    }else{
			if(this.gameStart){
                this.gameinfo.render(databus.score);// 修改分数
			}
		}

        if(!this.gameStart){
            this.IndexUI.render();// 渲染indexui
            canvas.removeEventListener('touchstart',this.touchCuttrees);
            this.touchCuttrees = that.touchEventStartGame.bind(this);//事件处理函数
            canvas.addEventListener('touchstart', this.touchCuttrees);
        }

		// 每帧执行
	 	window.requestAnimationFrame(
	      this.loop.bind(this),
	      canvas
	    )
	}

}