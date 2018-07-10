window.WxModular = {
    // 分享与转发功能
    share: ()=>{
        wx.request({
            url: 'https://shop.yunfanshidai.com/xcxht/slyxhz/api/share_info.php?gameid=8',
            header: {
                'content-type': 'application/json' // 默认值
            },
            success: function (res) {
                // 主动转发
                window.shareBTN=()=>{
                    wx.shareAppMessage({
                        title: res.data.info,
                        imageUrl: canvas.toTempFilePathSync({
                            x: 0,
                            y: 0,
                            width: canvas.width,
                            height: canvas.width/5*4,
                            destWidth: canvas.width,
                            destHeight: canvas.width/5*4,
                        })
                    })
                };
                // 被动转发
                wx.showShareMenu({ withShareTicket: true });
                wx.onShareAppMessage(function () {
                    return {
                        title: res.data.info,
                        imageUrl: res.data.image
                    }
                });
            }
        })
    },
    // 更多游戏
    MoreGames: ()=>{
        wx.request({
            url: "https://shop.yunfanshidai.com/xcxht/slyxhz/api/get_extend.php?gameid=8",
            header: {
                'content-type': 'application/json' // 默认值
            },
            success: (res)=>{
                if(!!res.data.pic){
                    wx.previewImage({
                        urls: [
                            res.data.pic
                        ]
                    })
                }else{
                    console.log("分享图请求失败",res);
                }
            }
        });
    },
    // 游戏圈
    gameClub: ()=>{

    },
    // 截屏
    Screenshot: (type)=>{
        // 5:4  canvas.height/2-(canvas.width/5*4)/2
        if(type === 1 ){
            return canvas.toTempFilePathSync({
                x: 0,
                y: 0,
                width: canvas.width,
                height: canvas.width/5*4,
                destWidth: canvas.width,
                destHeight: canvas.width/5*4,
            });
        }else if(type === 2){
            // 全屏
            return canvas.toTempFilePathSync({
                x: 0,
                y: 0,
                width: canvas.width,
                height: canvas.height,
                destWidth: canvas.width,
                destHeight: canvas.height,
            });
        }
    },
    // 排行榜
    Ranking: (types, data)=>{
        wx.postMessage({ type: types, data: data });
    }
};