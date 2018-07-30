// 音频
const _url = {
    bg: {
      bg1: "https://shop.yunfanshidai.com/xcxht/fmgxcx/1.mp3",
      bg2: "https://shop.yunfanshidai.com/xcxht/fmgxcx/1.mp3",
    },
    action: "",// 动作
    victory: ""// 胜利
};

export default class audio{
    constructor(ctx){
        this._Music_audio = null;// 背景音乐实例
        this._Sound_audio = null;// 音效实例
        this._play_queue = {};// 音效播放队列
        this.switch = true; // 全局音效开关
    };
    // 播放背景音乐
    playMusic(type,auto,loop){
        if(!this.switch)return;
        if(!!this._Music_audio)this._Music_audio.destroy();
        this._Music_audio = wx.createInnerAudioContext();// 创建一个新实例
        let url = _url.bg[type];
        this._Music_audio.src = url;
        this._Music_audio.loop = loop;
        this._Music_audio.autoplay = auto;
        this._Music_audio.obeyMuteSwitch = false;
        wx.onShow(()=>{
            this._Music_audio.play();
        });
        wx.onAudioInterruptionEnd(function () {
            this._Music_audio.play();
        });
    };
    // 播放音效
    playSound(type,once){
       if(!this.switch)return;
       let target;
       if(!this._play_queue[`${type}`]){
           target = this._play_queue[`${type}`] = wx.createInnerAudioContext();//创建一个音效实例
           target.src = _url[`${type}`];
       }else{
           target = this._play_queue[`${type}`];
       }
       target.play();
       if(once){
           target.onEnded(()=>{
               target.destroy();//销毁
               this._play_queue[`${type}`] = null;
           });
       }
    };
}