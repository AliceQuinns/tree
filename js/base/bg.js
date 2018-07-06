let screenHeight = window.innerHeight;
let screenWidth  = window.innerWidth;

export default class back{
	constructor(ctx,src){
        let bg = new Image();
        bg.src = src;
		this.ctx = ctx;
		this.bg = bg;
	}

	render(){
		let that = this;
		that.ctx.drawImage(this.bg,0,0,screenWidth,screenHeight);
	}
}