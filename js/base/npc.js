let screenHeight = window.innerHeight;
let screenWidth  = window.innerWidth;

export default class npc{
	constructor(ctx,src,Level){
		this.ctx = ctx;
		this.img = new Image();
		this.img.src = src;
		this.posi = true; //默认右边
		this.WormType = false;// 控制虫子切换

		/* 当前血量 */
		this.blood = GLOBAL.Level[Level].hp;
		/* 总血量 */
		this.hp_max = GLOBAL.Level[Level].hp;
		/* 敌人速度 */
		this.Enemy = GLOBAL.Level[Level].Enemy;
		/* 总时间 */
		this.time = GLOBAL.Level[Level].time*1000;
		/* 当前时间 */
		this.currentTime = GLOBAL.Level[Level].time*1000;

		this.Worm1 = new Image();// 虫子对象1
        this.Worm1.src = "images/Worm1.png";
        this.Worm2 = new Image();// 虫子对象2
        this.Worm2.src = "images/Worm2.png";
	}
	// 更新贴图
	update(src){
		this.img.src = src;
	}

	// 更新主角
	render(){
		let that = this;
		that.treePosition();// 计算主角坐标
		if (that.posi) {
			// 右
			that.ctx.drawImage(that.img,that.x,that.y,100,100);
		}else{
			// 左
            // 下面画的图片是水平翻转的
			that.ctx.translate(300, 0);
		    that.ctx.scale(-1, 1);
			that.ctx.drawImage(that.img,that.x,that.y,100,100);
		    // 恢复正常
		    that.ctx.translate(300, 0);
		    that.ctx.scale(-1, 1);
		}
			
	}
	treePosition(){
		if (this.posi) {
			// 右
			this.x = screenWidth/2+40
		}else{
			// 左
			this.x = screenWidth/2-25
		}
		this.y = screenHeight-160		
	}

	// 时间条和敌人位置渲染
	renderLifebar(){
		this.blood = this.blood - this.Enemy;// 递减生命值
		// 绘制时间条
		this.ctx.fillStyle = "#222";
		this.ctx.fillRect(screenWidth/2-95,30,190,30);
		this.ctx.fillStyle = "red";
		this.ctx.fillRect(screenWidth/2-90,35,180*(this.currentTime/this.time),20);
		// 绘制敌人
		this.ctx.drawImage(this.WormType?this.Worm1:this.Worm2,screenWidth/2-50,(screenHeight-120)*(this.blood/this.hp_max),100,90);
	}
}