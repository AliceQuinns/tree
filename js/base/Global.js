const GLOBAL = {
    Level: [
        {time: 5,hp: 6000,Aggressivity: 160,Enemy:16},// 游戏时间, 总血量,  攻击力,  敌人速度
        {time: 10,hp: 6000,Aggressivity: 160,Enemy:16},
        {time: 25,hp: 5000,Aggressivity: 160,Enemy:18},
        {time: 20,hp: 4500,Aggressivity: 170,Enemy:19},
        {time: 25,hp: 4000,Aggressivity: 170,Enemy:20},
        {time: 30,hp: 3500,Aggressivity: 180,Enemy:21},
        {time: 35,hp: 3000,Aggressivity: 180,Enemy:22},
        {time: 40,hp: 2500,Aggressivity: 185,Enemy:23},
        {time: 45,hp: 2000,Aggressivity: 190,Enemy:24},
    ]
};

function getBase64(url,callback){
    let Img = wx.createImage(),dataURL='';
    Img.src=url;
    Img.onload=function(){ //要先确保图片完整获取到，这是个异步事件
        let canvas = wx.createCanvas(), //创建canvas元素
            width=Img.width, //确保canvas的尺寸和图片一样
            height=Img.height;
        canvas.width=width;
        canvas.height=height;
        canvas.getContext("2d").drawImage(Img,0,0,width,height); //将图片绘制到canvas中
        let ext = url.substring(url.lastIndexOf(".")+1).toLowerCase();
        dataURL=canvas.toDataURL(`image/${ext}`); //转换图片为dataURL
        callback?callback(dataURL):null; //调用回调函数
    };
}

window.GLOBAL = GLOBAL;
window.getBase64 = getBase64;