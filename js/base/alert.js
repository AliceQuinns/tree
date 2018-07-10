let screenHeight = window.innerHeight;
let screenWidth  = window.innerWidth;

export default class alert{
    constructor(ctx){
        this.ctx = ctx;
        // 通关界面全部ui元素
        this.clearanceUI = {
            title: {obj:this.createImage("images/alert/Congratulations.png"),size:{w:250,h:80}},
            btn: {obj:this.createImage("images/alert/next.png"),size:{w:200,h:80}},
            bg: {obj:this.createImage("images/alert/bg.png"),size:{w:screenWidth*0.8,h:screenHeight*0.5}},
            share: {obj:this.createImage("images/alert/share.png"),size:{w:160,h:60}},
            //img: {obj:this.createImage("images/Expression/1.jpg"),size:{w:screenWidth*0.6,h:screenHeight*0.35}},
            light: {obj:this.createImage("images/alert/decorate.png"),size:{w:400,h:400}}
        };
        // 帮助界面
        this.help= this.createImage("images/Expression/help.png");
    }
    createImage(src){
        let img = new Image();
        img.src = src;
        return img;
    }
    render(type,Level,score){
        if(type === "clearance"){
            // 灯光
            this.ctx.drawImage(
                this.clearanceUI.light.obj,
                screenWidth/2-this.clearanceUI.light.size.w/2,
                0,
                this.clearanceUI.light.size.w,
                this.clearanceUI.light.size.h
            );
            // 标题
            this.ctx.drawImage(
                this.clearanceUI.title.obj,
                screenWidth/2-this.clearanceUI.title.size.w/2,
                screenHeight/10,
                this.clearanceUI.title.size.w,
                this.clearanceUI.title.size.h
            );
            // 下一关按钮
            this.ctx.drawImage(
                this.clearanceUI.btn.obj,
                screenWidth/2-this.clearanceUI.btn.size.w/2,
                screenHeight/1.2,
                this.clearanceUI.btn.size.w,
                this.clearanceUI.btn.size.h
            );
            // 背景
            this.ctx.drawImage(
                this.clearanceUI.bg.obj,
                screenWidth/2-this.clearanceUI.bg.size.w/2,
                screenHeight/2-this.clearanceUI.bg.size.h/2,
                this.clearanceUI.bg.size.w,
                this.clearanceUI.bg.size.h
            );
            // 分享按钮
            this.ctx.drawImage(
                this.clearanceUI.share.obj,
                screenWidth/2-this.clearanceUI.share.size.w/2,
                screenHeight/1.7,
                this.clearanceUI.share.size.w,
                this.clearanceUI.share.size.h
            );
            // 表情包
            // this.ctx.drawImage(
            //     this.clearanceUI.img.obj,
            //     screenWidth/2-this.clearanceUI.img.size.w/2,
            //     screenHeight/2-this.clearanceUI.img.size.h/2,
            //     this.clearanceUI.img.size.w,
            //     this.clearanceUI.img.size.h
            // );
            // 绘制文字
            this.ctx.font = "28px Microsoft YaHei";
            this.ctx.fillStyle = "#fefefe";
            this.ctx.textAlign="center";
            this.ctx.textBaseline="middle";
            this.ctx.shadowColor = "#121500";
            this.ctx.shadowOffsetX = 2;
            this.ctx.shadowOffsetY = 2;
            this.ctx.shadowBlur= 2;
            this.ctx.fillText(
                `得分: ${score}`,
                screenWidth / 2,
                screenHeight / 3
            );
            this.ctx.font = "24px Microsoft YaHei";
            this.ctx.fillText(
                `下一关: 第${Level+1}关`,
                screenWidth / 2,
                screenHeight / 2.4
            );
            this.ctx.fillText(
                `目标: 在${GLOBAL.Level[Level].time}s内通过不断`,
                screenWidth / 2,
                screenHeight / 2.1
            );
            this.ctx.fillText(
                '砍伐树木阻止虫子逃跑',
                screenWidth / 2,
                screenHeight / 1.9
            );
            // 按钮矩阵
            this.btnMatrix = {
                startX: screenWidth/2-this.clearanceUI.btn.size.w/2,
                startY: screenHeight/1.2,
                endX  : screenWidth/2-this.clearanceUI.btn.size.w/2 +  this.clearanceUI.btn.size.w,
                endY  : screenHeight/1.2 + this.clearanceUI.btn.size.h
            };
            // 还原文本样式
            this.ctx.textAlign="start";
            this.ctx.textBaseline="alphabetic";
            this.ctx.shadowColor = "#121500";
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
            this.ctx.shadowBlur= 0;
        }else if(type === "help"){
            this.ctx.drawImage(
                this.help,
                0,
                0,
                screenWidth,
                screenHeight
            );
        }
    }
}