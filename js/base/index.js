let screenHeight = window.innerHeight;
let screenWidth  = window.innerWidth;

const _URL = {
    logo: "images/currency/logo.png",
    play: "images/currency/play.png",
    share: "images/currency/share.png",
    rankList: "images/currency/rank_list.png",
    game: "images/currency/game.png",
    close: "images/currency/close_btn.png",
    btnsize: {width:70,height:90},// 按钮尺寸
    logosize: {width:250,height:120},
    playsize: {width:200,height:80},
    closesize: {width:30,height:30}
};

export default class index{
    constructor(ctx){
        this.ctx = ctx;
        this.logo = this.createBtn(_URL.logo);
        this.play = this.createBtn(_URL.play);
        this.share = this.createBtn(_URL.share);
        this.rankList = this.createBtn(_URL.rankList);
        this.game = this.createBtn(_URL.game);
        this.close = this.createBtn(_URL.close);
    }
    createBtn(src){
        let img = new Image();
        img.src = src;
        return img;
    }
    // 好友排行榜UI
    renderclose(){
        this.ctx.drawImage(this.close,screenWidth*.85,screenHeight*.18,_URL.closesize.width,_URL.closesize.height); 
        this.closeRange = {
            startX: screenWidth*.85,
            startY: screenHeight*.18,
            endX  : screenWidth*.85+_URL.closesize.width,
            endY  : screenHeight*.18+_URL.closesize.height
        }       
    }
    render(){
        this.ctx.drawImage(this.logo,screenWidth/2-_URL.logosize.width/2,screenHeight/10,_URL.logosize.width,_URL.logosize.height);
        this.ctx.drawImage(this.play,screenWidth/2-_URL.playsize.width/2,screenHeight/1.6,_URL.playsize.width,_URL.playsize.height);
        this.ctx.drawImage(this.rankList,_URL.btnsize.width/2,screenHeight/1.25,_URL.btnsize.width,_URL.btnsize.height);
        this.ctx.drawImage(this.share,screenWidth/2-_URL.btnsize.width/2,screenHeight/1.25,_URL.btnsize.width,_URL.btnsize.height);
        this.ctx.drawImage(this.game,screenWidth-_URL.btnsize.width*1.5,screenHeight/1.25,_URL.btnsize.width,_URL.btnsize.height);
        // 坐标矩阵
        this.playRange = {
            startX: (screenWidth/2-_URL.playsize.width/2),
            startY: screenHeight/1.6,
            endX  : (screenWidth/2-_URL.playsize.width/2) + _URL.playsize.width,
            endY  : screenHeight/1.5 + _URL.playsize.height
        };
        // 排行榜
        this.rankListRange = {
            startX: _URL.btnsize.width/2,
            startY: screenHeight/1.25,
            endX  : _URL.btnsize.width/2  + _URL.btnsize.width,
            endY  : screenHeight/1.25 + _URL.btnsize.height
        };
        // 分享
        this.shareRange = {
            startX: screenWidth/2-_URL.btnsize.width/2,
            startY: screenHeight/1.25,
            endX  : screenWidth/2-_URL.btnsize.width/2 + _URL.btnsize.width,
            endY  : screenHeight/1.25 + _URL.btnsize.height
        };
        // 更多游戏
        this.gameRange = {
            startX: screenWidth-_URL.btnsize.width*1.5,
            startY: screenHeight/1.25,
            endX  : screenWidth-_URL.btnsize.width*1.5 + _URL.btnsize.width,
            endY  : screenHeight/1.25 + _URL.btnsize.height
        };
    }
}