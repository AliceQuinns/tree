let screenWidth = wx.getSystemInfoSync().windowWidth;
let screenHeight = wx.getSystemInfoSync().windowHeight;
let OBJsize = {
    // 主背景
    bg: {
        w: screenWidth*0.8,
        h: screenHeight*0.5,
        x: (screenWidth/2)-(screenWidth*0.8)/2,
        y: (screenHeight/2)-(screenHeight*0.5)/2
    },
    // 子背景
    bg1: {
        w: screenWidth*0.7,
        h: screenHeight*0.2,
        x: (screenWidth/2)-(screenWidth*0.7)/2,
        y: (screenHeight/2)-(screenHeight*0.2)/2+15
    },
    btn: {
        w: screenWidth*0.8*0.5,
        h: screenHeight*0.5*0.18,
        x: (screenWidth/2)-(screenWidth*0.8*0.5/2),
        y: (screenHeight/2)-(screenHeight*0.2)/2+25+screenHeight*0.2,
    },
    // 头像
    item1: {
        w: (screenWidth*0.7)/4,
        h: (screenWidth*0.7)/4
    },
    item2: {

    }
};

(new (class Ranking{
    constructor(){
        this.status = 0;// 渲染控制
        this.userdatas = null;// 好友数据
        this.score = 0;// 当前分数
        this.MAXscore = 0;// 最高分
        this.sharedCanvas = wx.getSharedCanvas();
        this._canvas = this.sharedCanvas.getContext('2d');
        this.init();
    }
    init(){
        // 初始化渲染对象
        this.renderOBJ = {
            bg: this.createIMG("tips/bg.png"),// 背景
            bg1: this.createIMG("tips/bg1.png"),// 子背景
            btn: this.createIMG("tips/rank.png"),
            item: this.createIMG("tips/header_bg.png")
        };
        this.Message();//初始化事件监听
    }
    // 创建图片节点
    createIMG(src){
        let target = wx.createImage();
        target.src = src;
        return target;
    }

    // 获取好友信息
    GETfriden = ()=>{
        let self = this;
        wx.getFriendCloudStorage({
            keyList:['score'],
            success: data => {
                console.log("获取到好友数据为",data);
                self.userdatas = data.data;// 保存好友数据
                // 渲染
                self.render();
            },
            fail: err => {
                console.error("获取好友列表失败",err);
            }
        })
    };

    // 消息
    Message(){
        let _ = this;
        wx.onMessage(res => {
            // 检查输入
            if(!res||!res.type){console.log("请传入正确的参数");return;}
            console.log("监听到传入数据为    ",res);
            // 得分面板
            if(res.type === 1){
                _.status = 1;// 切换渲染模式
                _.score = res.score;// 更新分数
                // 获取用户字段
                wx.getUserCloudStorage({
                    keyList: ['score'],
                    success: data => {
                        // 如果当前用户是新用户或当前分数大于历史分数 则修改分数
                        if(data.KVDataList.length<=0||(Number(data.KVDataList[0].value)<=Number(res.score))){
                            _.MAXscore = res.score;// 当前分数为最高分数
                            wx.setUserCloudStorage({
                                KVDataList: [{ key: 'score', value: String(res.score) }],
                                success: data => {
                                    this.GETfriden();// 获取好友列表
                                },
                                fail: (err)=>{
                                    console.log(err,"修改分数失败");
                                }
                            })
                        }else{
                            // 非新用户 且当前分数未超过历史分数 用当前分数
                            _.MAXscore = data.KVDataList[0].value;
                            this.GETfriden();
                        }
                    },
                    fail: err => {
                        // 无法获取到用户分数则跳过分数判断
                        this.GETfriden();
                    }
                });
            }else if(res.type === 2){
                // 完整排行榜
                this.GETfriden();
            }else if(res.type === 3){
                // 群排行榜
            }else if(res.type === 4){
                // 关闭显示
                _.status = 4;
            }
        });
    }

    // 渲染函数
    render(){
        let self = this;
        let _size = OBJsize;// 对象尺寸
        let _ = ()=>{
            console.log("渲染离屏canvas  一次");
            this._canvas.clearRect(0, 0, screenWidth, screenHeight);
            if(self.status === 1){
                // 背景
                this._canvas.drawImage(this.renderOBJ.bg, _size.bg.x, _size.bg.y, _size.bg.w, _size.bg.h);
                // 子背景
                this._canvas.drawImage(this.renderOBJ.bg1, _size.bg1.x, _size.bg1.y, _size.bg1.w,_size.bg1.h);
                // 按钮
                this._canvas.drawImage(this.renderOBJ.btn, _size.btn.x, _size.btn.y, _size.btn.w, _size.btn.h);
                // 分数
                this._canvas.font = "bold 60px Microsoft YaHei";
                this._canvas.textAlign="center";
                this._canvas.textBaseline="middle";
                // 阴影字体
                this._canvas.fillStyle  = "#573300";
                this._canvas.fillText(`${self.score}`, screenWidth/2,  (screenHeight/2)-(_size.bg.h)/2+_size.bg.h*0.15);
                // 实际字体
                this._canvas.fillStyle  = "#fdf1d3";
                this._canvas.fillText(`${self.score}`, screenWidth/2,  (screenHeight/2)-(_size.bg.h)/2+_size.bg.h*0.14);
                // 最高分
                this._canvas.font = "900 18px Microsoft YaHei";
                this._canvas.fillStyle  = "#573300";
                this._canvas.fillText(`最佳记录: ${self.MAXscore}`, screenWidth/2,  (screenHeight/2)-(_size.bg.h)/2+_size.bg.h*0.28);
                // 头像渲染
                this.itemRender(1,3);

            }else if(self.status === 2){

            }else if(self.status === 3){

            }
            //requestAnimationFrame(_.bind(this));
        };
        //requestAnimationFrame(_.bind(this));
        _();
    }

    // 玩家渲染
    itemRender(type,size){
        let self = this;
        // 得分渲染
        if(type===1){
            for(let i=0;i<size;i++){
                if(!self.userdatas)return;
                if(self.userdatas[i]){
                    let img = wx.createImage();
                    img.src =  this.userdatas[i].avatarUrl;
                    img.onload = ()=>{
                        // 头像
                        self._canvas.drawImage(
                            img,
                            OBJsize.bg1.x+((i+1)*OBJsize.item1.w/4)+i*OBJsize.item1.w,
                            screenHeight/2-OBJsize.item1.h/2+15,
                            OBJsize.item1.w,
                            OBJsize.item1.h);
                    };
                    // 名称
                    let text = this.userdatas[i].nickname;
                    if(text.length>=6)text = text.slice(0,5);
                    this._canvas.font = "900 18px Microsoft YaHei";
                    this._canvas.textAlign="center";
                    this._canvas.textBaseline="middle";
                    this._canvas.fillStyle  = "#fdf1d3";
                    this._canvas.fillText(
                        `${text}`,
                        OBJsize.bg1.x+((i+1)*OBJsize.item1.w/4)+i*OBJsize.item1.w+OBJsize.item1.w/2,
                        (screenHeight/2-OBJsize.item1.h/2+OBJsize.item1.h*0.5)+OBJsize.item1.h);
                    // 排名
                    this._canvas.fillText(
                        `${i+1}`,
                        OBJsize.bg1.x+((i+1)*OBJsize.item1.w/4)+i*OBJsize.item1.w+OBJsize.item1.w/2,
                        (screenHeight/2-OBJsize.item1.h/2-OBJsize.item1.h*0.05));
                }else{
                    return
                }
            }
        }else{
            // 完整渲染
        }
    }
}));