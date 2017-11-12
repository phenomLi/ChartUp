/*
* version: 0.0.1
* A javascript framework for building visual data. From phenom.
* 11.9.2017
*/


interface chartModule {
	//渲染整体
	render(x: number, y: number): void;
}

/*
* 暴露Chart到全局
*/
const ChartUp = (function(window) {


interface ChartAPI {
      //扩展方法
      extend(config: object): void;
}      


//全局设置
const _Gconfig = {
	defaultColor: '#000',
	edge: [20, 20]
};

//角度转弧度制
const _degree2Radian = function(degree): number {
	return Math.PI*(degree/180);
};


//找出数组中的最大值
const _MAX = function(arr) {
	return Math.max.apply(Math, arr);
}



/*--------------------工具方法---------------------*/

/*
* @DrawLine: 对canvas路径api的一个封装
* reLine: 在改变颜色时，重新渲染路径
* next: 下一个坐标点
* end: 最后一个坐标点
* paint: 绘制形状
*/

class DrawLine {

	private g = null;
	private currentPoint: number[] = [];
	private color: string = '';

    constructor(g: object, x: number, y: number, color?: string) {
        this.g = g;  
	
		this.color = color;
        this.color && (this.g.strokeStyle = this.color);

        //开始描绘路径
        this.g.beginPath();
        //确定起点
		this.g.moveTo(x, y);
		this.currentPoint = [x, y];
	}
	
	private reLine(color: string) {

		this.color = color;

		this.g.stroke();
		
		this.g.strokeStyle = this.color;
		this.g.beginPath();
		this.g.moveTo(this.currentPoint[0], this.currentPoint[1]);
	}
    
    next(x: number, y: number, color?: string) {

        if(color) {
			this.reLine(color);
		};

		this.g.lineTo(x, y);
		this.currentPoint = [x, y];

        return this;
	}
	
	paint(shape) {
		//结束直线
		this.g.stroke();

		//开始描绘图形
		shape.render(this.currentPoint[0], this.currentPoint[1], this.color);

		//继续接上直线
		this.g.beginPath();
		this.g.moveTo(this.currentPoint[0], this.currentPoint[1]);

		return this;
	}

    end(x: number, y: number, isClose: boolean = false, color?: string) {

		if(color) {
			this.reLine(color);
		};

		this.g.lineTo(x, y);
		this.currentPoint = [x, y];
        isClose && this.g.closePath();
		this.g.stroke();

		return this;
    }
}


/*
* @DrawArc: 对canvas圆弧api的一个封装
* render: 确定图形坐标，颜色，是否填充
*/

class DrawArc {

	private g = null;
	private radius: number = 0;
	private startAngle: number = 0;
	private endAngle: number = 0;
	private isSoild: boolean = true;
	
	constructor(g: object, radius: number, startAngle: number, endAngle: number, soild: boolean = true) {
		this.g = g;
		this.radius = radius;

		this.startAngle = _degree2Radian(startAngle);
		this.endAngle = _degree2Radian(endAngle);
		this.isSoild = soild;
	}

	render(x: number, y: number, color?: string) {

		if(color) {
			this.isSoild? 
				this.g.fillStyle = color:
				this.g.strokeStyle = color;
		}

		this.g.beginPath();
		this.g.arc(x, y, this.radius, this.startAngle, this.endAngle);

		this.isSoild? 
			this.g.fill():
			this.g.stroke();	
	}
}


/*
* @DrawTitle: 描绘图表标题
*/

class DrawTitle {

	private g = null;
	private text: string | number;

	constructor(g, text: string | number) {
		this.g = g;
		this.g.font = '24px 微软雅黑';
		this.g.textAlign = 'start';
		this.g.textBaseline = 'top'
		this.g.fillStyle = _Gconfig.defaultColor;

		this.text = text;
	}

	render(x: number, y: number, color?: string) {
		color && (this.g.fillStyle = color);
		this.g.fillText(this.text, x, y);
	}
}



/*
* @DrawCoordinateSystem: 绘制直角坐标系
* rightAngle: 绘制出垂直相交的x，y坐标
* setIntervalPoint: 绘制出x，y坐标的间隔点
* CoordinateSystemText: 绘制出间隔点的值
* calculator: 将定义的坐标点转换为该坐标系的真实坐标点
* render: 渲染整体
*/

class DrawCoordinateSystem {

	private g = null;
	private config = null;

	//设置坐标系与canvas边缘的距离
	private marginTop: number = 45;
	private marginLeft: number = 45;
	private marginBottom: number = 45;

	//真实原点
	public oX: number = 0;
	public oY: number = 0;

	//定义的原点
	private xOrigin: number = 0;
	private yOrigin: number = 0;

	//真实直角坐标长度
	private lX: number = 0;
	private lY: number = 0;

	//坐标的x，y边界值
	private xEdge: number = 0;
	private yEdge: number = 0;

	//坐标的真实x, y边界值
	public rxEdge: number = 0;
	public ryEdge: number = 0;

	//真实坐标间隔
	public rxIntervals: number[] = [];
	public ryIntervals: number[] = [];

	//定义的坐标间隔
	public xIntervals: number[] = [];
	public yIntervals: number[] = [];


	private xCount: number = 0;
	private yCount: number = 0;

	private xInterval: number = 0;
	private yInterval: number = 0;

	constructor(g, config) {
		this.g = g;
		this.config = config;

		this.oX = this.marginLeft;
		this.oY = this.config.canvasHeight - this.marginBottom;

		this.lX = this.config.canvasWidth - this.oX - 20;
		this.lY = this.oY - this.marginTop - 20;

		this.rxEdge = this.oX + this.lX;
		this.ryEdge = this.oY - this.lY;

		this.xOrigin = this.config.origin[0],
		this.yOrigin = this.config.origin[1];
		
		const xMax: number = this.getMax(this.config.items, 'x'),
			  yMax: number = this.getMax(this.config.items, 'y'),
			  xLength: number = xMax - this.xOrigin,
			  yLength: number = yMax - this.yOrigin;

		this.xInterval = this.config.interval[0],
		this.yInterval = this.config.interval[1];

		this.xCount = Math.floor(xLength/this.xInterval) + 1,
		this.yCount = Math.floor(yLength/this.yInterval) + 1;
				
		this.xEdge = this.xInterval*this.xCount,
		this.yEdge = this.yInterval*this.yCount;


		for(let i = 1; i <= this.xCount; i ++) {
			//计算每一个断点到原点距离
			let index = i*(this.lX/this.xCount);
			//将每一个断点保存起来
			this.rxIntervals.push(this.oX + index);
			this.yIntervals.push(i*this.xInterval + this.xOrigin);
		}
		
		//绘制出y轴的断点
		for(let i = 1; i <= this.yCount; i ++) {
			//计算每一个断点到原点距离
			let index = i*(this.lY/this.yCount);
			//将每一个断点保存起来
			this.ryIntervals.push(this.oY - index);
			this.yIntervals.push(i*this.yInterval + this.yOrigin);
		}

	}

	private rightAngle() {
		new DrawLine(this.g, this.marginLeft, this.marginTop)
			.next(this.oX, this.oY)
			.end(this.config.canvasWidth, this.oY);

		return this;
	}

	private setIntervalPoint() {

		//标出坐标原点
		this.coordinateSystemText(`(${this.xOrigin}, ${this.yOrigin})`, this.oX, this.oY + 15);

		//绘制出X轴的断点
		for(let i = 1; i <= this.xCount; i ++) {
			//计算每一个断点到原点距离
			let index = i*(this.lX/this.xCount);
			//在该断点绘制一个小线
			new DrawLine(this.g, this.oX + index, this.oY).end(this.oX + index, this.oY + 5);
			//标上值
			this.coordinateSystemText(i*this.xInterval + this.xOrigin, this.oX + index, this.oY + 15);
		}
		
		//绘制出y轴的断点
		for(let i = 1; i <= this.yCount; i ++) {
			//计算每一个断点到原点距离
			let index = i*(this.lY/this.yCount);
			//在该断点绘制一个小线
			new DrawLine(this.g, this.oX - 5, this.oY - index).end(this.oX, this.oY - index);
			//标上值
			this.coordinateSystemText(i*this.yInterval + this.yOrigin, this.oX - 15, this.oY - index);
		}

		return this;
	}

	//绘制出直角坐标的坐标值
	private coordinateSystemText(text: string | number, x: number, y: number) {
		this.g.textAlign = 'center';
		this.g.textBaseline = 'middle';

		this.g.fillText(text, x, y);
	}

	//将定义的坐标点转换为该坐标系的真实坐标点
	public calc(x: number, y: number): object {
		return {
			x: this.oX + ((x - this.xOrigin)*this.lX)/(this.xEdge - this.xOrigin),
			y: this.oY - ((y - this.yOrigin)*this.lY)/(this.yEdge - this.yOrigin)
		};
	}

	//获取坐标点的最大值
	private getMax(items, dir: string) {
		const flag = dir === 'x'? 0: 1;

		//判断items是否为数组
		if(items instanceof Array) {
			return _MAX(items.map(item => {
				if(typeof item.points === 'function') {
					return _Gconfig.edge[flag];
				}
				else {
					return _MAX(item.points.map(p => p[flag]));
				}			
			}));
		}
		else {
			return typeof items.points === 'function'? _Gconfig.edge[flag]: _MAX(items.points.map(p => p[flag]));
		}
	}

	public render(): void {
		this.rightAngle().setIntervalPoint();
	}
}




/*
* @Animate: canvas动绘制的一个封装
* next: 下一个坐标点
* end: 最后一个坐标点
*/

class Animate {
    constructor() {

    }
}


/*--------------------工具方法 END-------------------------*/


/*------------------------------图表类------------------------------------ */

/*
* @LineChart: 折线类图表
*
* 方法：
* render: 渲染整体
* drawCoordinateSystem: 直角坐标系
* drawGrid: 网格
* renderResult: 统计结果
*/
class LineChart implements chartModule {

    protected g = null;
	protected config = null;
	
	protected coordinateSystem = null;

    constructor(Graphics, config: object) {
        this.g = Graphics;
		this.config = config;
		
		//默认原点为(0, 0)
		this.config.origin = this.config.origin? this.config.origin: [0, 0];
		//默认开启网格
		this.config.grid = this.config.grid? this.config.grid: true;

		//间隔和坐标点参数为必要参数
		if(!this.config.interval) {
			console.warn("'interval' option is required.");
			return null;
		}

		if(!this.config.items) {
			console.warn("'items' option is required.");
			return null;
		}

		
		/*
		* @DrawCoordinateSystem: 建立坐标系
		* 对象返回坐标系的信息，包括
		* 坐标真实原点
		* 坐标间隔
		* 坐标真实间隔
		*/
		this.coordinateSystem = new DrawCoordinateSystem(this.g, this.config);

		//绑定鼠标事件
		this.bindMouseEvent();
    }

	//入口
	render(x: number, y: number): void {

		this.g.save();
		
		//绘制坐标轴
		this.drawCoordinateSystem();

		//若设置网格，则描绘网格
		this.config.grid && this.drawGridX().drawGridY();

		//绘制图表结果
		if(this.config.items instanceof Array) {
			this.config.items
				.map(item => {this.renderResult(item.points, item.color? item.color: _Gconfig.defaultColor)});
		}
		else {
			this.renderResult(
				this.config.items.points, 
				this.config.items.color? this.config.items.color: _Gconfig.defaultColor
			);
		}

		//若设置标题，则描绘标题
		this.config.title && new DrawTitle(this.g, this.config.title).render(40, 5);

		//绘制聚焦线
		this.paintTargetLine(x, y);

		this.g.restore();
	}

	protected drawCoordinateSystem() {
		this.coordinateSystem.render();
		return this;
	}

	//绘制纵向网格
	protected drawGridX() {
		const xLength = this.coordinateSystem.rxIntervals.length,
			  topBoundary = this.coordinateSystem.ryEdge;
			  

		//绘制出网格中纵向的线
		for(let i = 0; i < xLength; i ++) {
			new DrawLine(this.g, this.coordinateSystem.rxIntervals[i], this.coordinateSystem.oY, '#eee')
				.end(this.coordinateSystem.rxIntervals[i], topBoundary);
		}

		return this;
	}

	//绘制横向网格
	protected drawGridY() {
		const yLength = this.coordinateSystem.ryIntervals.length,
			  rightBoundary = this.coordinateSystem.rxEdge;

		//绘制出网格中横向的线
		for(let i = 0; i < yLength; i ++) {
			new DrawLine(this.g, this.coordinateSystem.oX, this.coordinateSystem.ryIntervals[i], '#eee')
				.end(rightBoundary, this.coordinateSystem.ryIntervals[i]);
		}	
		
		return this;
	}



	//为图表绑定鼠标事件
	protected bindMouseEvent() {
		this.config.canvas.addEventListener('mousemove', e => {
			let x = e.clientX - this.config.canvas.getBoundingClientRect().left,
				y = e.clientY - this.config.canvas.getBoundingClientRect().top; 

			this.g.clearRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);
			this.render(x, y);
		});

		return this;
	}

	

	//绘制聚焦线
	protected paintTargetLine(x: number, y: number) {
	
		if(x > this.coordinateSystem.oX && x < this.coordinateSystem.rxEdge &&
		   y < this.coordinateSystem.oY && y > this.coordinateSystem.ryEdge) {
			new DrawLine(this.g, this.coordinateSystem.oX, y, 'rgba(0, 0, 0, 0.2)')
				.next(x, y)
				.end(x, this.coordinateSystem.oY);

			this.paintTipCase(x, y);	
		}

		return this;
	}

	//绘制坐标提升框
	protected paintTipCase(x: number, y: number) {

		const vx: number = (x - 45)*(this.coordinateSystem.xEdge - this.coordinateSystem.xOrigin)/(this.coordinateSystem.lX),
		      vy: number = Math.abs((y - this.config.canvasHeight + 45))*(this.coordinateSystem.yEdge - this.coordinateSystem.yOrigin)/(this.coordinateSystem.lY)


		this.g.fillStyle = 'rgba(0, 0, 0, 0.3)';
		this.g.fillRect(x + 10, y, 80, 40);

		this.g.font = '12px serif';
		this.g.fillStyle = '#fff';
		this.g.fillText(`x: ${vx.toFixed(3)}`, x + 15, y + 2);
		this.g.fillText(`y: ${vy.toFixed(3)}`, x + 15, y + 18);
	}


	protected paintLabel() {
		
	}


	//绘制点函数
	protected renderPoints(points: number[], color: string) {
		//绘制第一个点
		let p = this.coordinateSystem.calc(points[0][0], points[0][1]),
			cyc = new DrawArc(this.g, 3, 0, 360),
			line = new DrawLine(this.g, p.x, p.y, color).paint(cyc);

		//继续绘制接下去的点
		for(let i = 1, length = points.length; i < length; i ++) {
			p = this.coordinateSystem.calc(points[i][0], points[i][1]);
			i === length? line.next(p.x, p.y): line.end(p.x, p.y);

			//绘制小点
			line.paint(cyc);
		}
	}

	//绘制方程函数
	private renderExpression(exp, color: string) {
		let i = this.coordinateSystem.xOrigin,
			p = this.coordinateSystem.calc(i, exp(i)),
			line = new DrawLine(this.g, p.x, p.y, color);
	
		//循环不断求方程的解，直到方程的解>yEdge
		while(1) {
			i ++;
			p = this.coordinateSystem.calc(i, exp(i));
			
			if(i > this.coordinateSystem.xEdge || exp(i) > this.coordinateSystem.yEdge) {
				line.end(p.x, p.y);
				break;
			}
			else {
				line.next(p.x, p.y);
			}
		}
	}

    protected renderResult(points: number[], color: string) {
		if(points instanceof Array) {
			this.renderPoints(points, color);
		}

		if(typeof points === 'function') {
			this.renderExpression(points, color);
		}

		return this;
    }
}



class PointChart extends LineChart {

	constructor(Graphics, config: object) {
		super(Graphics, config);
	}

	//绘制点函数
	protected renderPoints(points: number[], color: string) {
		//绘制第一个点
		let p = this.coordinateSystem.calc(points[0][0], points[0][1]);

		//继续绘制接下去的点
		for(let i = 1, length = points.length; i < length; i ++) {
			p = this.coordinateSystem.calc(points[i][0], points[i][1]);

			new DrawArc(this.g, 4, 0, 360).render(p.x, p.y, color);
		}
	}

	protected renderResult(points: number[], color: string) {
		
		this.renderPoints(points, color);
		
		return this;
    }
}




/*------------------------------图表类-END----------------------------------- */



/*---------------------------ChartUp主类------------------------------- */


class ChartPrototype implements ChartAPI {
      
	//暴露的工具方法集
	public fn: object = {};

	//全局设置API
	private configuration = _Gconfig;
	
	//entrance
	constructor() {
		this.fn = {
			//绘制线方法，返回DrawLine类的实例
			drawLine(Graphics: object, x: number, y: number, color?: string): DrawLine {
				return new DrawLine(Graphics, x, y, color);
			},
			//动绘制方法
			animate() {
				
			}
		}
	}


	config(c) {
		this.configuration = Object.assign(this.configuration, c);
	}


	/*
	* @extend: 扩展方法
	* @parameter: chartConfig
	*
	* 包含: 
	* 1.chartType: 用作定义扩展图表的名称
	* 2.chartConfig: 定义扩展图表具体类的实例
	*/

	extend(chartConfig): void | boolean {
		if(!chartConfig.chartType) {
			console.warn("'chartType' option is required.");
			return false;
		}
		
		if(!chartConfig.chartClass) {
			console.warn("'chartClass' option is required.");
			return false;
		}
		
		this[chartConfig.chartType] = function(canvas: HTMLElement, config: object) {
			const Graphics = canvas.getContext('2d');

			config['canvas'] = canvas;	

			//获取canvas绘制布的宽高
			config['canvasWidth'] = canvas.offsetWidth;
			config['canvasHeight'] = canvas.offsetHeight;

			return new chartConfig.chartClass(Graphics, config);
		}
		
	}
}

//实例化Chart
const ChartUp = new ChartPrototype();


//扩展: 折线类图表
ChartUp.extend({
	chartType: 'LineChart',
	chartClass: LineChart
});

//扩展: 点状类图表
ChartUp.extend({
	chartType: 'PointChart',
	chartClass: PointChart
});







/*------------------------------模拟使用------------------------------------ */



const canvas1 = document.getElementById('canvas1'),
	  canvas2 = document.getElementById('canvas2');

ChartUp.LineChart(canvas1, {
	title: 'Mychart',
	interval: [5, 10],
     items: [
		{
			lable: 'A',
			points: [[0, 0], [4, 2], [10, 10], [20, 25], [30, 40]],
			color: 'orange'
		},
		{
			lable: 'B',
			points: function(x: number) {
				return x*x;
			},
			color: 'green'
		}
	]
}).render();


ChartUp.PointChart(canvas2, {
	title: 'Myanotherchart',
	interval: [5, 5],
     items: [
		{
			lable: 'A',
			points: [[1, 1, 1], [4, 2, 20], [10, 10, 8], [20, 25, 9], [30, 40, 1], [30, 20, 4]],
			color: 'blue'
		}
	]
}).render();











window['Chart'] = ChartUp;
return ChartUp;
})(window);


//es6 module
export default ChartUp;