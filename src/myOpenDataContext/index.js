// let sharedCanvas = wx.getSharedCanvas();
// let _canvas = sharedCanvas.getContext('2d');
//
// let _ = data =>{
//     console.log(data,sharedCanvas);
// };
//
// wx.getFriendCloudStorage({
//     success: data => {
//         _(data.data);
//     }
// });
//
// // 创建图片节点
// let _createIMG = src => {
//     return wx.createImage(src);
// };
//
// let render = ()=>{
//
// };
//
// requestAnimationFrame(render.bind(this));

(new (class Ranking{
    constructor(){
        this.status = 1;// 渲染控制
        this.sharedCanvas = wx.getSharedCanvas();
        this._canvas = sharedCanvas.getContext('2d');
        this.render();
    }
    render(){
        console.log("开启排行榜成功");
        // 渲染对象
        this.renderOBJ = {
            bg: this.createIMG()// 背景
        };
        this.update();
    }
    // 创建图片节点
    createIMG(src){
        return wx.createImage(src);
    }
    Message(){
        wx.onMessage(res => {
            console.log(res);
            if(res === 1){
                // 得分面板
            }else if(res === 2){
                // 完整排行榜
            }else if(res === 3){
                // 群排行榜
            }
        });
    }
    update(){
        let _ = ()=>{

            requestAnimationFrame(_);
        };
        requestAnimationFrame(_);
    }
}));