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
		this.currentTime = GLOBAL.Level[Level].time;

		/* 血条背景 */
		this.bloodbg = new Image();
		this.bloodbg.src = "images/bar/yellow_bg.png";
		this.bloodbg2 = new Image();
		this.bloodbg2.src = "images/bar/bar_bg.png";
		this.bloodbg3 = new Image();
		this.bloodbg3.src = "images/bar/bar.png";
	}
	// 更新贴图
	update(src){
		this.img.src = src;
	}

	// 更新主角
	render(){
		// 阴影
        this.ctx.shadowColor = "#121500";
        this.ctx.shadowOffsetX = 3;
        this.ctx.shadowOffsetY = 3;
        this.ctx.shadowBlur= 3;
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
		// 还原样式
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        this.ctx.shadowBlur= 0;
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

	// 血条渲染
	renderLifebar(){
		this.blood = this.blood - this.Enemy;// 递减生命值
		// 时间条背景
		this.ctx.drawImage(this.bloodbg,screenWidth/2-95,30,190,30);
		// 底色背景
		this.ctx.drawImage(this.bloodbg2,screenWidth/2-90,35,180,20);
		// 时间条
		this.ctx.drawImage(this.bloodbg3,screenWidth/2-90,35,180*(this.blood/this.hp_max),20);
	}
}