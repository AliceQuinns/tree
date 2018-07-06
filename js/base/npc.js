let screenHeight = window.innerHeight;
let screenWidth  = window.innerWidth;

export default class npc{
	constructor(ctx,src){
		this.ctx = ctx;
		this.img = new Image();
		this.img.src = src;
		this.posi = true; //默认右边

		/*定义血条*/
		this.blood = 6000
	}
	// 更新贴图
	update(src){
		this.img.src = src
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

	// 生命条
	renderLifebar(){
		this.blood = this.blood - 16;
		this.ctx.fillStyle = "#222";
		this.ctx.fillRect(screenWidth/2-95,30,190,30);
		this.ctx.fillStyle = "red";
		this.ctx.fillRect(screenWidth/2-90,35,180*(this.blood/6000),20);
	}
}