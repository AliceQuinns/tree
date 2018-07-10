export default class TOOLS{
    constructor(){}
    // 取随机数
    getRandomInt(min,max){
        return Math.floor(Math.random()*(max-min)+min);
    };
    // 系统震动接口
    getshock(type,callback){
        if(type === 1){
            window["wx"].vibrateShort({
                complete: callback
            })
        }else if(type === 2){
            window["wx"].vibrateLong({
                complete: callback
            })
        }
    }
}