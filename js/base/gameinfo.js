let screenHeight = window.innerHeight;
let screenWidth  = window.innerWidth;
const _URL = {
    home: "images/gameover/return.png",// 返回主页
    reset: "images/gameover/play_again.png",// 重新开始
    share: "images/gameover/share.png",// 分享
    logo: "images/gameover/score.png",// 标题
    chain: "images/gameover/chain.png",// 链子
    homesize: {width:screenWidth*0.2,height:screenHeight/6.5},
    resetsize: {width:screenWidth*0.4,height:screenHeight/6.5},
    sharesize: {width:screenWidth*0.2,height:screenHeight/6.5},
    logosize: {width:screenWidth/1.5,height:screenHeight/8},
    chainsize: {width:screenWidth/1.5,height:screenHeight/3.5},
};

export default class gameinfo{
	constructor(ctx){
		this.ctx = ctx;
		this.home = this.createBtn(_URL.home);// 返回主页
		this.reset = this.createBtn(_URL.reset);// 重新开始
        this.share = this.createBtn(_URL.share);// 分享
        this.logo = this.createBtn(_URL.logo);// logo
        this.icon = this.createBtn(_URL.chain);// 链条
	}

	// 修改分数
	render(score){	
		this.ctx.font = "30px Microsoft YaHei";
		this.ctx.fillStyle = "#fff";
  		this.ctx.fillText("得分："+score,  screenWidth / 2 - 50,  100);
	}

    createBtn(src){
        let img = new Image();
        img.src = src;
        return img;
    }

	// 游戏结束
	gameOver(){
        this.ctx.drawImage(this.icon,screenWidth/2-_URL.chainsize.width/2,0,_URL.chainsize.width,_URL.chainsize.height);
        this.ctx.drawImage(this.logo,screenWidth/2-_URL.logosize.width/2,screenHeight/10,_URL.logosize.width,_URL.logosize.height);
        this.ctx.drawImage(this.home,screenWidth*0.05,screenHeight*0.8,_URL.homesize.width,_URL.homesize.height);
        this.ctx.drawImage(this.reset,screenWidth*0.3,screenHeight*0.8,_URL.resetsize.width,_URL.resetsize.height);
        this.ctx.drawImage(this.share,screenWidth*0.75,screenHeight*0.8,_URL.sharesize.width,_URL.sharesize.height);

        // 重新游戏
        this.btnArea = {
            startX: screenWidth*0.3,
            startY: screenHeight*0.8,
            endX  : screenWidth*0.3 + _URL.resetsize.width,
            endY  : screenHeight*0.8 + _URL.resetsize.height
        };
        // 主页
        this.homeArea = {
            startX: screenWidth*0.05,
            startY: screenHeight*0.8,
            endX  : screenWidth*0.05 + _URL.homesize.width,
            endY  : screenHeight*0.8 + _URL.homesize.height
        };
        // 分享
        this.shareArea = {
            startX: screenWidth*0.75,
            startY: screenHeight*0.8,
            endX  : screenWidth*0.75 + _URL.sharesize.width,
            endY  : screenHeight*0.8 + _URL.sharesize.height
        };
	}
}