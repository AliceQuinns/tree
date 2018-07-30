// ui元素坐标信息
var OBJsize = {
    // 好友排行与群排行ui
    frends: {
        width: 590,
        height: 620,
        top: 300,// Y轴坐标
        left: 80,// X轴坐标
        titleColor: "#3ec9ff"// “好友排行” 背景色
    },
    // 得分面板主背景
    bg: {
        w: 590,
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

// 比分面板 元素定位信息
var _match_content = {
    initData: [],// 待超越好友
    status: false,
    width: 120,
    height: 170,
    top: 150,
    left: 630,
    score: 0 // 玩家实时分数
};

// 主屏sharedCanvas
let sharedCanvas = wx.getSharedCanvas();
let context = sharedCanvas.getContext("2d");
// 普通离屏canvas 好友排行榜 群排行榜
let itemCanvas = wx.createCanvas();
let ctx = itemCanvas.getContext('2d');

// 设备实际尺寸和缩放
const screenWidth = wx.getSystemInfoSync().screenWidth;
const screenHeight = wx.getSystemInfoSync().screenHeight;
const ratio = wx.getSystemInfoSync().pixelRatio;

// 全局变量
let myScore = 0;// 最高分数
let myInfo = {};// 玩家信息
let myRank = null;// 玩家名次
let _renderStatus = 0;//渲染状态
let myself = {};// 玩家自身信息
let _score =0;//当前分数

init();

// 初始化
function init() {
  // canvas适配
  context.restore();
  context.scale(ratio, ratio);
  context.clearRect(0, 0, screenWidth * ratio, screenHeight * ratio);
  let scales = screenWidth / 750;
  context.scale(scales, screenHeight / 1280);
  // 获取好友数据
  getTimeFriend();
  // 数据事件
  event();
  // 触摸滑动
  touch();
  console.log("排行榜开启成功")
}

// 获取全部待超越好友数据
function getTimeFriend(){
    getFriendsRanking("score",(data)=>{
        myself = data[myRank-1];//玩家自己信息
        _match_content.initData = data.slice(0,myRank-1);
    });
}

// 分析下一个待超越好友
function scorecompare(){
    let content = null,type = 1;
    if(!_match_content.score||!_match_content.initData)content =  myself;
    let _ = ()=>{
        if(_match_content.initData.length<=0){content = myself;type=2}//达到第一名
        else{
            let target = Number(_match_content.initData[_match_content.initData.length-1].score);
            if(Number(_match_content.score)>target){
                _match_content.initData.pop();//删除已经超过的好友
                _();// 递归
            }
            else{
                content =  _match_content.initData[_match_content.initData.length-1]
            }
        }
    };
    _();
    return {data:content,type:type};
}

// 渲染函数
function render(type,data) {
    _renderStatus = type;// 切换渲染状态
    context.restore();// 状态还原
    context.clearRect(0, 0, 750, 1280);//清空像素
    // 好友比分
    if(_match_content.status){
        let _ = scorecompare(); // 即将超越的玩家
        let header = wx.createImage();
        header.src = _.data.avatarUrl;
        header.onload = ()=>{
            context.clearRect(_match_content.left,_match_content.top,_match_content.width,_match_content.height);
            context.font = '22px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'alphabetic';
            // 背景
            context.fillStyle = "rgba(0,0,0,0.5)";
            context.fillRect(_match_content.left,_match_content.top,_match_content.width,_match_content.height);
            // 头像
            context.drawImage(header,_match_content.left+_match_content.width*.1,_match_content.top+35,_match_content.width*.8,90);
            // 字体截取
            let name = _.data.nickname;//姓名
            let fontWidth = context.measureText(name);
            // 限制字体宽度
            var filterFont =()=>{
                if(fontWidth.width>=_match_content.width){
                    name = name.slice(0,name.length-1);
                    fontWidth = context.measureText(name);
                    filterFont();
                }
            };
            filterFont();
            context.fillStyle = '#ffffff';
            context.fillText("即将超越", _match_content.left+_match_content.width/2, _match_content.top+25);
            context.font = '20px Arial';
            context.fillText(name, _match_content.left+_match_content.width/2, _match_content.top+145);
            context.fillStyle = '#fcff0b';
            if(_.type === 2){
                context.fillText(_match_content.score, _match_content.left+_match_content.width/2, _match_content.top+165);
            }else{
                context.fillText(_.data.score, _match_content.left+_match_content.width/2, _match_content.top+165);
            }
        };
    }
    // 得分面板
    if(type === 1){
        context.save();
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
                    context.font = "14px";
                    // 分数
                    context.font = "160px Arial";
                    context.textAlign="center";
                    context.textBaseline="middle";
                    // 阴影字体
                    context.fillStyle  = "#573300";
                    context.fillText(`${_score}`, 750 / 2, _size.bg.y+120);
                    // 实际字体
                    context.fillStyle  = "#fdf1d3";
                    context.fillText(`${_score}`, 750 / 2, _size.bg.y+110);
                    // 最高分
                    context.font = "40px Arial";
                    context.fillStyle  = "#573300";
                    context.fillText(`最佳记录: ${myScore}`, 750 / 2,  Math.round(_size.bg.y+225));
                    // 头像渲染
                    itemRender(3);
                };
            };
        });
        context.restore();
    }
    // 好友排行榜
    else if(type === 2){
        getFriendsRanking("render");// 绘制好友排行榜
    }
    // 群排行榜
    else if(type === 3){
        initRanklist(sortByScore(data),3);// 群排行榜
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
                if(_renderStatus !== 1)return;                
                // 头像
                context.drawImage(
                    img,
                    imgPos.x,
                    imgPos.y,
                    OBJsize.item1.w,
                    OBJsize.item1.h
                );
                context.restore();
                // 名称
                let text = userdatas[i].nickname;
                if(text.length>=6)text = text.slice(0,5);
                // 姓名
                context.font = "30px Arial";
                context.textAlign="center";
                context.fillStyle  = "#fdf1d3";
                context.fillText(
                    `${text}`,
                    Math.round(imgPos.x+OBJsize.item1.w/2),
                    Math.round(OBJsize.item1.h+imgPos.y+30));
                // 排名
                context.font = "50px Arial";
                context.fillText(
                    `${i+1}`,
                    Math.round(imgPos.x+OBJsize.item1.w/2),
                    Math.round(imgPos.y-40));
                // 分数
                context.font = "30px Arial";
                context.fillStyle = "#fff7dd";
                context.fillText(
                    `${userdatas[i].score}`,
                    Math.round(imgPos.x+OBJsize.item1.w/2),
                    Math.round(OBJsize.item1.h+imgPos.y+70));
                context.save();
            };
        }
    });
}

// 好友排行榜 群排行榜渲染
function initRanklist(list,type) {
    console.log(list);
  if(Number(_renderStatus) != 2 && Number(_renderStatus) !=  3)return;
  let length = Math.max(list.length, 6);// 最少渲染6条

  // 离屏canvas尺寸
  let itemHeight = 590 / 6;// 单行高度
  itemCanvas.width = (750 - 80 * 2);
  itemCanvas.height = itemHeight * length;

  // 用户背景框绘制
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
    if(type === 2){
        // 好友面板
        RoundRect(OBJsize.frends.left,OBJsize.frends.top,OBJsize.frends.width,100,30,context,OBJsize.frends.titleColor);//标题框
        context.fillStyle = '#ffffff';
        context.font = '35px Arial';
        context.textAlign = 'center';
        context.fillText('好友排行', 750 / 2, OBJsize.frends.top+40);
    }else if (type === 3){
        // 群排行
        RoundRect(OBJsize.frends.left,OBJsize.frends.top,OBJsize.frends.width,100,30,context,OBJsize.frends.titleColor);//标题框
        context.fillStyle = '#ffffff';
        context.font = '35px Arial';
        context.textAlign = 'center';
        context.fillText('群排行榜', 750 / 2, OBJsize.frends.top+40);
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
  context.clearRect(OBJsize.frends.left, OBJsize.frends.top+60, OBJsize.frends.width, OBJsize.frends.height);// 清空
  context.fillStyle = '#ffffff';// 背景色
  context.fillRect(OBJsize.frends.left, OBJsize.frends.top+60, OBJsize.frends.width, OBJsize.frends.height-30);// 矩形背景
  RoundRect(OBJsize.frends.left,OBJsize.frends.top+60,OBJsize.frends.width,OBJsize.frends.height,30,context,"#ffffff");// 白色圆角矩形背景
  context.drawImage(itemCanvas, 0, y, OBJsize.frends.width, OBJsize.frends.height-30, OBJsize.frends.left, + OBJsize.frends.top+60, OBJsize.frends.width, OBJsize.frends.height-30);// 裁剪排行榜离屏canvas
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
      if(type === "render")initRanklist(sortByScore(data),2);
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
      let data = res.data;
      render(3,data);
    },
    fail: res => {
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

        // 得分面板
        if (Number(res.type) === 1) {
            if(res.data.score||Number(res.data.score)===0){
                _score = Number(res.data.score);
                if("style" in res && "top" in res.style){
                    OBJsize.bg.y = res.style.top;
                    OBJsize.bg1.y = res.style.top+300-30;
                }
                render(1);
            }
            else{
                console.log("未传入分数");
            }
        }
        // 好友排行
        else if(Number(res.type) === 2){
            if("style" in res && "top" in res.style){
                OBJsize.frends.top = res.style.top;
            }
            if("style" in res && "titleColor" in res.style){
                OBJsize.frends.titleColor = res.style.titleColor;
            }
            render(2);
        }
        // 群排行
        else if (Number(res.type) === 3) {
            if("style" in res && "top" in res.style){
                OBJsize.frends.top = res.style.top;
            }
            if("style" in res && "titleColor" in res.style){
                OBJsize.frends.titleColor = res.style.titleColor;
            }
            if(res.data.shareTicket){
                getGroupRanking(res.data.shareTicket);
            }
            else{
                console.log("未传入shareTicket字段");
            }
        }
        // 比分面板
        else if (Number(res.type) === 4) {
            if('close' in res){
                // 关闭比分面板
                _match_content.status = false;
                context.clearRect(_match_content.left,_match_content.top,_match_content.width,_match_content.height);
                render(_renderStatus);
            }
            else if('effect' in res){
                // 开启并初始化比分面板
                if('style' in res){
                    if(!!res.style.top&&res.style.top<=1130)_match_content.top=res.style.top;
                    if(!!res.style.left&&res.style.left<=600)_match_content.left=res.style.left;
                    if(!!res.style.height&&res.style.height>=250)_match_content.height=res.style.height;
                    if(!!res.style.width&&res.style.width>=150)_match_content.width=res.style.width;
                }
                // 如果带分数就渲染
                if('data' in res && 'score' in res.data){
                    render();
                }
                _match_content.status = true;
            }
            else if('data' in res && 'score' in res.data){
                // 更新比分面板
                _match_content.score = res.data.score;//当前玩家实时分数
                render();
            }
        }
        // 清空全部内容
        else if(Number(res.type) === 5){
            _renderStatus = 5;
            context.clearRect(0,0,750,1280);
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

