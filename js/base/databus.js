import Pool from './pool.js'

/*状态管理*/
export default class databus{
	constructor(){
		this.score = 0;// 分数
		this.gameOver = false; // 游戏状态控制
		this.pool = new Pool(); // 对象池
		this.trees = [];
		this.moveTree = [];
	}

	// 重置
	reset(){
		this.score = 0;
		this.gameOver = false;
		this.trees = [];
		this.moveTree = [];
	}	

	pushTree(tree){		
		this.trees.push(tree);
	}

	shiftTree(){
		let temp = this.trees.shift();
		// 回收
	    this.pool.recover('tree', temp);
	}
}