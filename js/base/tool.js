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
    // 绘制圆角矩形
    RoundRect(x, y, w, h, r,target,color,storke,lineWidth){
        if (w < 2 * r) {r = w / 2;}
        if (h < 2 * r){ r = h / 2;}
        target.beginPath();
        target.moveTo(x+r, y);
        target.arcTo(x+w, y, x+w, y+h, r);
        target.arcTo(x+w, y+h, x, y+h, r);
        target.arcTo(x, y+h, x, y, r);
        target.arcTo(x, y, x+w, y, r);
        target.closePath();
        if(storke){
            let _ = target.strokeStyle;
            target.strokeStyle=color;
            !!lineWidth?target.lineWidth=lineWidth:target.lineWidth=5;
            target.stroke();
            target.strokeStyle = _;
        }else{
            let _ = target.fillStyle;
            target.fillStyle = color;
            target.fill();
            target.fillStyle = _;
        }
    }
}