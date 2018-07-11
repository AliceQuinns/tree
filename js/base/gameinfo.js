let screenHeight = window.innerHeight;
let screenWidth  = window.innerWidth;

export default class gameinfo{
	constructor(ctx){
		this.ctx = ctx;
	}

	// 修改分数
	render(score){	
		this.ctx.font = "30px Microsoft YaHei";
		this.ctx.fillStyle = "#fff";
  		this.ctx.fillText("得分："+score,  screenWidth / 2 - 50,  100);
	}

	// 游戏结束
	gameOver(score){
        this.ctx.fillStyle = "#883a3a";
        this.ctx.fillRect(screenWidth / 2 - 150,screenHeight / 2 - 100,300,160);
        this.ctx.font = "24px Microsoft YaHei";
        this.ctx.fillStyle = "#fefefe";
        this.ctx.fillText(
            '游戏结束',
            screenWidth / 2 - 50,
            screenHeight / 2 - 100 + 40
        );
        this.ctx.fillText(
            '得分: ' + score,
            screenWidth / 2 - 50,
            screenHeight / 2 - 100 + 80
        );

        this.ctx.fillRect(screenWidth / 2 - 100,screenHeight / 2,200,50);

        this.ctx.fillStyle = "#883a3a";
        this.ctx.fillText(
            '返回主页',
            screenWidth / 2 - 50,
            screenHeight / 2 - 100 + 130
        );

        // 排行榜
        this.ctx.drawImage(sharedCanvas,0,0);

        // 重新游戏
        this.btnArea = {
            startX: screenWidth / 2 - 150,
            startY: screenHeight / 2 - 100,
            endX  : screenWidth / 2  + 150,
            endY  : screenHeight / 2 - 100 + 160
        };
	}
}