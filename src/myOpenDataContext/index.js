
// // 得分面板
// wx.postMessage({
//     type: 1,
//     data:{
//         score: 18
//     },
//     style: {
//         top: 150// px为单位 如果不传入该参数则默认居中
//     }
// });
// // 好友排行榜
// wx.postMessage({
//     type: 2,
//     style: {
//         top: 150// px为单位 如果不传入该参数则默认居中
//     }
// });
// // 群排行榜
// wx.postMessage({
//     type: 3,
//     data: {
//         shareTicket: "" // 通过wx.onShow(callback)可获取shareTicket字段
//     },
//     style: {
//         top: 150// px为单位 如果不传入该参数则默认居中
//     }
// });
// // 比分
// wx.postMessage({
//     type: 4,
//     data: {
//         score: 18,// 当前得分
//     },
//     style: {
//         top: 150,// px为单位 如果不传入垂直坐标则默认为 150
//         left: 150// px为单位 如果不传水平坐标则默认居中
//     }
// });



// 主屏sharedCanvas
let sharedCanvas = wx.getSharedCanvas();
let context = sharedCanvas.getContext("2d");
// 普通离屏canvas 好友排行榜 群排行榜
let itemCanvas = wx.createCanvas();
let ctx = itemCanvas.getContext('2d');
// 普通离屏canvas 比分
let MatchCanvas = wx.createCanvas();
let Match = MatchCanvas.getContext('2d');

// 设备实际尺寸和缩放
const screenWidth = wx.getSystemInfoSync().screenWidth;
const screenHeight = wx.getSystemInfoSync().screenHeight;
const ratio = wx.getSystemInfoSync().pixelRatio;

// 全局变量
let myScore = 0;// 最高分数
let myInfo = {};// 玩家信息
let myRank = null;// 玩家名次
let _renderStatus = 0;//渲染状态
let _score =0;//当前分数
// 比分面板
let _match_content = {
    userData: [],//好友数据
    status: false,
    top: 150,
    left: 150,
    score: 0
};

init();

// 初始化
function init() {
  // canvas适配
  context.restore();
  context.scale(ratio, ratio);
  context.clearRect(0, 0, screenWidth * ratio, screenHeight * ratio);
  let scales = screenWidth / 750;
  context.scale(scales, scales);
  // 定时更新好友数据
  getTimeFriend();
  // 数据事件
  event();
  // 触摸滑动
  touch();
  console.log("排行榜开启成功")
}

function getTimeFriend(){
    window.setInterval(()=>{
        getFriendsRanking("score",(data)=>{
            console.log("获取到好友数据",data,"当前玩家排名",myRank);
            _match_content.userData = data;
        })
    },60000);// 每分钟更新一次排行榜
}

// 分数对比
function scorecompare(){
    if(!_match_content.score)return false;
    _match_content.userData.map((item,index)=>{
        console.log(item);
    })
}

// 渲染函数
function render(type,data) {
    _renderStatus = type;// 切换渲染状态
    context.restore();// 状态还原
    if(type === 4 || _match_content.status){
        // 比分面板
        let _ = scorecompare(); // 即将超越的玩家
    }
    if(type === 1){
        context.clearRect(0, 0, screenWidth*ratio, screenHeight*ratio);
        /* 得分面板 */
        let _size = OBJsize;// 坐标矩阵
        getMyScore(()=>{
            // 背景
            let bg = wx.createImage();
            bg.src = "tips/bg.png";
            bg.onload = function(){
                context.drawImage(bg, _size.bg.x, _size.bg.y, _size.bg.w, _size.bg.h);
                // 子背景
                let bg1 = wx.createImage();
                bg1.src = "tips/bg1.png";
                bg1.onload =function(){
                    context.drawImage(bg1, _size.bg1.x, _size.bg1.y, _size.bg1.w,_size.bg1.h);
                    // 分数
                    context.font = "bold 160px Microsoft YaHei";
                    context.textAlign="center";
                    context.textBaseline="middle";
                    // 阴影字体
                    context.fillStyle  = "#573300";
                    context.fillText(`${_score}`, 750 / 2, _size.bg.y+120);
                    // 实际字体
                    context.fillStyle  = "#fdf1d3";
                    context.fillText(`${_score}`, 750 / 2, _size.bg.y+110);
                    // 最高分
                    context.font = "900 40px Microsoft YaHei";
                    context.fillStyle  = "#573300";
                    context.fillText(`最佳记录: ${myScore}`, 750 / 2,  Math.round(_size.bg.y+225));
                    // 头像渲染
                    itemRender(3);
                };
            };
        });
    }
    else if(type === 2){
        context.clearRect(0, 0, screenWidth*ratio, screenHeight*ratio);
        RoundRect(80,OBJsize.frends.top,750 - 80 * 2,100,30,context,OBJsize.frends.titleColor);
        // 好友排行榜
        context.fillStyle = '#ffffff';
        context.font = '35px Arial';
        context.textAlign = 'center';
        context.fillText('好友排行', 750 / 2, OBJsize.frends.top+40);
        getFriendsRanking("render");// 绘制好友排行榜
    }
    else if(type === 3){
        context.clearRect(0, 0, screenWidth*ratio, screenHeight*ratio);
        RoundRect(80,OBJsize.frends.top,750 - 80 * 2,100,30,context,OBJsize.frends.titleColor);
        // 群排行榜
        context.fillStyle = '#ffffff';
        context.font = '35px Arial';
        context.textAlign = 'center';
        context.fillText('群排行榜', 750 / 2, OBJsize.frends.top+40);
        initRanklist(sortByScore(data));// 群排行榜
    }
}

// 得分面板玩家渲染
function itemRender(size){
    // 得分渲染
    getFriendsRanking("score",(userdatas)=>{
        for(let i=0;i<size;i++){
            if(!userdatas||!userdatas[i])return;
            let imgPos = {
                x: OBJsize.bg1.x+(i+1)*(OBJsize.bg1.w-3*OBJsize.item1.w)/4+(i*OBJsize.item1.w),
                y: OBJsize.bg1.y+80
            };
            let img = wx.createImage();
            img.src = userdatas[i].avatarUrl;
            img.onload = ()=>{
                // 头像
                context.drawImage(
                    img,
                    imgPos.x,
                    imgPos.y,
                    OBJsize.item1.w,
                    OBJsize.item1.h
                );
            };
            // 名称
            let text = userdatas[i].nickname;
            if(text.length>=6)text = text.slice(0,5);
            // 姓名
            context.font = "900 30px Microsoft YaHei";
            context.textAlign="center";
            context.fillStyle  = "#fdf1d3";
            context.fillText(
                `${text}`,
                Math.round(imgPos.x+OBJsize.item1.w/2),
                Math.round(OBJsize.item1.h+imgPos.y+30));
            // 排名
            context.font = "900 50px Microsoft YaHei";
            context.fillText(
                `${i+1}`,
                Math.round(imgPos.x+OBJsize.item1.w/2),
                Math.round(imgPos.y-40));
            // 分数
            context.font = "600 30px Microsoft YaHei";
            context.fillStyle = "#fff7dd";
            context.fillText(
                `${userdatas[i].score}`,
                Math.round(imgPos.x+OBJsize.item1.w/2),
                Math.round(OBJsize.item1.h+imgPos.y+70));
        }
    });
}

// 好友排行榜渲染
function initRanklist(list) {
  let length = Math.max(list.length, 6);// 最少渲染6条

  // 离屏canvas尺寸
  let itemHeight = 590 / 6;// 单行高度
  itemCanvas.width = (750 - 80 * 2);
  itemCanvas.height = itemHeight * length;

  // 用户信息框
  for (let i = 0; i < length; i++) {
    if (i % 2 === 0) {
      ctx.fillStyle = '#ffffff';
    } else {
      ctx.fillStyle = '#f6f6f6';
    }
    ctx.fillRect(0, i * itemHeight, itemCanvas.width, itemHeight);
  }

  // 用户头像
  if (list && list.length > 0) {
    list.map((item, index) => {
      let avatar = wx.createImage();
      avatar.src = item.avatarUrl;
      avatar.onload = function () {
        ctx.drawImage(avatar, 100, index * itemHeight + 14 , 70, 70);
        reDrawItem(0);
      };
      ctx.fillStyle = '#3b3b3b';
      ctx.font = '28px Arial';
      ctx.textAlign = 'left';
      // 姓名
      ctx.fillText(item.nickname, 190, index * itemHeight + 54 );
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ff685f';
      // 分数
      ctx.fillText(item.score || 0, 550, index * itemHeight + 60 );
      ctx.font = 'italic 44px Arial';
      ctx.fillStyle = '#3b3b3b';
      ctx.textAlign = 'center';
      // 排名
      ctx.fillText(index + 1, 46, index * itemHeight + 64 )
    });
  } else {
    // 没有数据
  }
  reDrawItem(0);
}

// 绘制自己的排名
function drawMyRank() {
  if (myInfo.avatarUrl && myScore) {
    let avatar = wx.createImage();
    avatar.src = myInfo.avatarUrl;
    avatar.onload = function () {
      context.drawImage(avatar, 180, 960 + 24, 70, 70);
    };
    context.fillStyle = '#fff';
    context.font = '28px Arial';
    context.textAlign = 'left';
    context.fillText(myInfo.nickName, 270, 960 + 72);
    context.font = 'bold 36px Arial';
    context.textAlign = 'right';
    context.fillText(myScore || 0, 630, 960 + 76);
    // 自己的名次
    if (myRank !== undefined) {
      context.font = 'italic 44px Arial';
      context.textAlign = 'center';
      context.fillText(myRank + 1, 126, 960 + 80);
    }
  }
}

// 渲染好友排行榜 canvas
function reDrawItem(y) {
  context.clearRect(80, OBJsize.frends.top+60, 750 - 80 * 2, 620);// 清空
  context.fillStyle = '#ffffff';// 背景色
  context.fillRect(80, OBJsize.frends.top+60, 750 - 80 * 2, 590);// 矩形背景
  RoundRect(80,OBJsize.frends.top+60,750 - 80 * 2,620,30,context,"#ffffff");// 圆角矩形背景
  context.drawImage(itemCanvas, 0, y, 750 - 80 * 2, 590, 80, + OBJsize.frends.top+60, 750 - 80 * 2, 590);// 裁剪排行榜离屏canvas
}

// 快速排序
function sortByScore(data) {
  let array = [];
  data.map(item => {

    array.push({
      avatarUrl: item.avatarUrl,
      nickname: item.nickname,
      openid: item.openid,
      score: item['KVDataList'][1] && item['KVDataList'][1].value != 'undefined' ? item['KVDataList'][1].value : (item['KVDataList'][0] ? item['KVDataList'][0].value : 0) // 取最高分
    })

  });
  array.sort((a, b) => {
    return a['score'] < b['score'];
  });
  myRank = array.findIndex((item) => {
    return item.nickname === myInfo.nickName && item.avatarUrl === myInfo.avatarUrl;
  });
  if (myRank === -1)
    myRank = array.length;

  return array;
}

// 获取当前用户信息
function getUserInfo() {
  wx.getUserInfo({
    openIdList: ['selfOpenId'],
    lang: 'zh_CN',
    success: res => {
      myInfo = res.data[0];
      console.log(myInfo);
    },
    fail: res => {
    }
  })
}

// 获取当前玩家分数
function getMyScore(callback) {
  wx.getUserCloudStorage({
    keyList: ['score', 'maxScore'],
    success: res => {
      let data = res;
      let lastScore = _score;// 取当前分数
      // 新用户
      if (!data.KVDataList[1]) {
        saveMaxScore(lastScore);
        myScore = lastScore;
      } else if (lastScore > data.KVDataList[1].value) {
        // 更新最高分
        saveMaxScore(lastScore);
        myScore = lastScore;
      } else {
      // 未超过最高分
        myScore = data.KVDataList[1].value;
      }
      if(callback)callback();
    }
  });
}

// 修改最高分数
function saveMaxScore(maxScore) {
  wx.setUserCloudStorage({
    KVDataList: [{ 'key': 'maxScore', 'value': ('' + maxScore) }],
    success: res => {
      console.log(res,"已更新最高分");
    },
    fail: res => {
      console.log(res,"分数无法更新请检查appid权限");
    }
  });
}

// 好友排行榜
function getFriendsRanking(type,callback) {
  wx.getFriendCloudStorage({
    keyList: ['score', 'maxScore'],
    success: res => {
      let data = res.data;
      if(type === "render")initRanklist(sortByScore(data));
      if(!!callback)callback(sortByScore(data));// 传入排序后的好友数据
    },
    fail: err => {
        console.log(err,"无法获取好友信息");
    }
  });
}

// 获取群排行
function getGroupRanking(ticket) {
  wx.getGroupCloudStorage({
    shareTicket: ticket,
    keyList: ['score', 'maxScore'],
    success: res => {
      console.log('getGroupCloudStorage:success');
      console.log(res.data);
      let data = res.data;
      render(3,data);
    },
    fail: res => {
      console.log('getGroupCloudStorage:fail');
      console.log(res.data);
    }
  });
}

// 绘制圆角矩形
function RoundRect(x, y, w, h, r,target,color){
    if (w < 2 * r) {r = w / 2;}
    if (h < 2 * r){ r = h / 2;}
    target.beginPath();
    target.moveTo(x+r, y);
    target.arcTo(x+w, y, x+w, y+h, r);
    target.arcTo(x+w, y+h, x, y+h, r);
    target.arcTo(x, y+h, x, y, r);
    target.arcTo(x, y, x+w, y, r);
    target.closePath();
    let _ = target.fillStyle;
    target.fillStyle = color;
    target.fill();
    target.fillStyle = _;
}

// 消息事件
function event(){
    wx.onMessage(res => {
        console.log("传入开放域的数据为===========",res);
        if(!res.type){console.info("请传入需要开启的面板类型");return;}

        if (Number(res.type) === 1) {
            // 得分面板
            if(res.data.score){
                _score = Number(res.data.score);
                render(1);
            }else{
                console.log("未传入分数");
            }
        }else if(Number(res.type) === 2){
            // 好友排行
            render(2);
        }else if (Number(res.type) === 3) {
            // 群排行
            if(res.data.shareTicket){
                getGroupRanking(res.data.shareTicket);
            }else{
                console.log("无群分享shareTicket字段");
            }
        } else if (Number(res.type) === 4) {
            if(res.data.close){
                // 关闭比分面板
                _match_content.status = false;
            }else if(res.data.score){
                // 开启比分面板
                _match_content.status = true;
                _match_content.score = res.data.score;
                if(!!res.style.top)_match_content.top=res.style.top;
                if(!!res.style.left)_match_content.left=res.style.left;
                render(4);
            }else{
                console.log("未传入当前得分");
            }
        }
    });
}

// 触摸事件
function touch(){
    let startY = undefined, moveY = 0;
    wx.onTouchMove(e => {
        let touch = e.touches[0];
        // 触摸移动第一次触发的位置
        if (startY === undefined) {
            startY = touch.clientY + moveY;
        }
        moveY = startY - touch.clientY;
        if(_renderStatus === 2 || _renderStatus === 3){
            reDrawItem(moveY);
        }
    });
    wx.onTouchEnd(e => {
        startY = undefined;
        if (moveY < 0) { // 到顶
            moveY = 0;
        } else if (moveY > itemCanvas.height - 590) { // 到底
            moveY = itemCanvas.height - 590;
        }
        if(_renderStatus === 2 || _renderStatus === 3) {
            reDrawItem(moveY);
        }
    });
}

// ui元素坐标信息
var OBJsize = {
    // 好友排行榜
    frends: {
        top: 300,// 好友排行榜Y轴坐标
        titleColor: "#3ec9ff"// “好友排行” 背景色
    },
    // 得分面板主背景
    bg: {
        w: Math.round(750 - 80 * 2),
        h: 620,
        x: 80,
        y: 350
    },
    // 得分面板子背景
    bg1: {
        w: Math.round(750 - 80 * 2.7),
        h: 320,
        x: ((750 - 80 * 2)-(750 - 80 * 2.7))/2+80,
        y: 350+300-30
    },
    // 得分面板玩家头像
    item1: {
        w: Math.round(150),
        h: Math.round(150)
    },
};