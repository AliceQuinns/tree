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
            img: {obj:this.createImage("images/Expression/1.jpg"),size:{w:screenWidth*0.6,h:screenHeight*0.35}},
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
    render(type){
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
            // 按钮
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
            // 表情包
            this.ctx.drawImage(
                this.clearanceUI.img.obj,
                screenWidth/2-this.clearanceUI.img.size.w/2,
                screenHeight/2-this.clearanceUI.img.size.h/2,
                this.clearanceUI.img.size.w,
                this.clearanceUI.img.size.h
            );
            // 按钮矩阵
            this.btnMatrix = {
                startX: screenWidth/2-this.clearanceUI.btn.size.w/2,
                startY: screenHeight/1.2,
                endX  : screenWidth/2-this.clearanceUI.btn.size.w/2 +  this.clearanceUI.btn.size.w,
                endY  : screenHeight/1.2 + this.clearanceUI.btn.size.h
            };
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