let screenHeight = window.innerHeight;
let screenWidth  = window.innerWidth;

export default class alert{
    constructor(ctx){
        this.ctx = ctx;
        this.clearanceUI = {
            // 背景
            bg: {obj:this.createImage("images/alert/success.png"),size:{w:screenWidth*0.9,h:screenHeight*0.5}},
            // 等级
            Grade: {
                Grade1: {obj:this.createImage("images/alert/start1.png"),size:{w:screenWidth*0.7,h:screenHeight*0.2}},
                Grade2: {obj:this.createImage("images/alert/start2.png"),size:{w:screenWidth*0.7,h:screenHeight*0.2}},
                Grade3: {obj:this.createImage("images/alert/start3.png"),size:{w:screenWidth*0.7,h:screenHeight*0.2}},
            },
            // 主页
            home: {obj:this.createImage("images/alert/homepage.png"),size:{w:screenWidth*0.3,h:screenHeight*0.1}},
            // 下一关
            next: {obj:this.createImage("images/alert/next.png"),size:{w:screenWidth*0.3,h:screenHeight*0.1}},
            // 邀请好友
            share: {obj:this.createImage("images/alert/share.png"),size:{w:screenWidth*0.4,h:screenHeight*0.1}},
            // 本次得分
            score: {obj:this.createImage("images/alert/Score.png"),size:{w:screenWidth*0.2,h:screenHeight*0.03}},
            // 最佳记录
            Maxscore: {obj:this.createImage("images/alert/bestRecord.png"),size:{w:screenWidth*0.2,h:screenHeight*0.03}}
        };
        // 帮助界面
        this.help= this.createImage("images/Expression/help.png");
        this.matrix();// 按钮矩阵
    }
    createImage(src){
        let img = new Image();
        img.src = src;
        return img;
    }
    render(type,Level,score,Grade){
        if(type === "clearance"){
            let _;
            // 等级判断
            if(Grade>=70){
                _ = 3;
            }else if(Grade>=50){
                _ = 2;
            }else if(Grade>=30){
                _ = 1;
            }else{
                _ = 1;
            }
            // 背景
            this.ctx.drawImage(
                this.clearanceUI.bg.obj,
                screenWidth/2-this.clearanceUI.bg.size.w/2,
                screenHeight/2-this.clearanceUI.bg.size.h/2,
                this.clearanceUI.bg.size.w,
                this.clearanceUI.bg.size.h
            );
            // 等级
            this.ctx.drawImage(
                this.clearanceUI.Grade[`Grade${_}`].obj,
                screenWidth/2- this.clearanceUI.Grade[`Grade${_}`].size.w/2,
                screenHeight*.15,
                this.clearanceUI.Grade[`Grade${_}`].size.w,
                this.clearanceUI.Grade[`Grade${_}`].size.h
            );
            // 主页按钮
            this.ctx.drawImage(
                this.clearanceUI.home.obj,
                screenWidth/2-this.clearanceUI.bg.size.w/2+ 30,
                screenHeight/2+this.clearanceUI.bg.size.h/2-this.clearanceUI.home.size.h-20,
                this.clearanceUI.home.size.w,
                this.clearanceUI.home.size.h
            );
            // 下一关按钮
            this.ctx.drawImage(
                this.clearanceUI.next.obj,
                screenWidth/2+this.clearanceUI.bg.size.w/2-this.clearanceUI.home.size.w-30,
                screenHeight/2+this.clearanceUI.bg.size.h/2-this.clearanceUI.home.size.h-20,
                this.clearanceUI.next.size.w,
                this.clearanceUI.next.size.h
            );
             // 邀请好友
             this.ctx.drawImage(
                this.clearanceUI.share.obj,
                screenWidth/2-this.clearanceUI.share.size.w/2,
                screenHeight/2+this.clearanceUI.bg.size.h/2+20,
                this.clearanceUI.share.size.w,
                this.clearanceUI.share.size.h
            );
            this.ctx.font = "20px Microsoft YaHei";
            this.ctx.fillStyle = "#b59f87";
            this.ctx.textBaseline="middle";
            this.ctx.textAlign = "center";
            // 本次得分
            this.ctx.drawImage(
                this.clearanceUI.score.obj,
                screenWidth/2-this.clearanceUI.bg.size.w/2+ 50,
                screenHeight/2.2,
                this.clearanceUI.score.size.w,
                this.clearanceUI.score.size.h
            )
            // 当前分数
            this.ctx.fillText(score,screenWidth/2+this.clearanceUI.bg.size.w/2- 50,screenHeight/2.2+8);
            // 最佳记录
            this.ctx.drawImage(
                this.clearanceUI.Maxscore.obj,
                screenWidth/2-this.clearanceUI.bg.size.w/2+ 50,
                screenHeight/1.9,
                this.clearanceUI.score.size.w,
                this.clearanceUI.score.size.h
            )
            // 最佳分数
            this.ctx.fillText(score,screenWidth/2+this.clearanceUI.bg.size.w/2- 50,screenHeight/1.9+8);
            
            // 还原文本样式
            this.ctx.textAlign="start";
            this.ctx.textBaseline="alphabetic";
        }else if(type === "help"){
            this.ctx.drawImage(
                this.help,
                0,
                0,
                screenWidth,
                screenHeight
            );
        }else if(type === "info"){
            
        }
    }
    matrix(){
         // 主页按钮
         this.homeBtn = {
            startX: screenWidth/2-this.clearanceUI.bg.size.w/2+ 30,
            startY: screenHeight/2+this.clearanceUI.bg.size.h/2-this.clearanceUI.home.size.h-20,
            endX  : screenWidth/2-this.clearanceUI.bg.size.w/2+ 30 +  this.clearanceUI.home.size.w,
            endY  : screenHeight/2+this.clearanceUI.bg.size.h/2-this.clearanceUI.home.size.h-20 + this.clearanceUI.home.size.h
        };
        // 下一关按钮
        this.nextBtn = {
            startX: screenWidth/2+this.clearanceUI.bg.size.w/2-this.clearanceUI.home.size.w-30,
            startY: screenHeight/2+this.clearanceUI.bg.size.h/2-this.clearanceUI.home.size.h-20,
            endX  : screenWidth/2+this.clearanceUI.bg.size.w/2-this.clearanceUI.home.size.w-30 +  this.clearanceUI.next.size.w,
            endY  : screenHeight/2+this.clearanceUI.bg.size.h/2-this.clearanceUI.home.size.h-20 + this.clearanceUI.next.size.h
        };
        // 邀请好友
        this.shareBtn = {
            startX: screenWidth/2-this.clearanceUI.share.size.w/2,
            startY: screenHeight/2+this.clearanceUI.bg.size.h/2+20,
            endX  : screenWidth/2-this.clearanceUI.share.size.w/2+this.clearanceUI.share.size.w,
            endY  : screenHeight/2+this.clearanceUI.bg.size.h/2+20+this.clearanceUI.share.size.h
        };
    }
}