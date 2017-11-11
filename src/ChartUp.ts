/*
* version: 0.0.1
* A javascript framework for building visual data. From phenom.
* 11.9.2017
*/


interface chartModule {
	//渲染整体
	render(): void;
	//渲染函数
    renderResult(points: number[], color: string): void;
}

/*
* 暴露Chart到全局
*/
const ChartUp = (function(window) {


interface ChartAPI {
      //扩展方法
      extend(config: object): void;
}      

//默认颜色: 黑
const defaultColor = '#333';

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
* paint: 画形状
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
		this.g.fillStyle = defaultColor;

		this.text = text;
	}

	render(x: number, y: number, color?: string) {
		color && (this.g.fillStyle = color);
		this.g.fillText(this.text, x, y);
	}
}



/*
* @DrawCoordinateSystem: 画直角坐标系
* rightAngle: 画出垂直相交的x，y坐标
* setIntervalPoint: 画出x，y坐标的间隔点
* CoordinateSystemText: 画出间隔点的值
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

	//真实坐标间隔
	public rxIntervals: number[] = [];
	public ryIntervals: number[] = [];

	//定义的坐标间隔
	public xIntervals: number[] = [];
	public yIntervals: number[] = [];

	constructor(g, config) {
		this.g = g;
		this.config = config;

		this.oX = this.marginLeft;
		this.oY = this.config.canvasHeight - this.marginBottom;

		this.lX = this.config.canvasWidth - this.marginLeft - 20;
		this.lY = this.oY - this.marginTop - 20;
	}

	private rightAngle() {
		new DrawLine(this.g, this.marginLeft, this.marginTop)
			.next(this.oX, this.oY)
			.end(this.config.canvasWidth, this.oY);

		return this;
	}

	private setIntervalPoint(items) {

		const xInterval: number = this.config.interval[0],
			  yInterval: number = this.config.interval[1],
			  xOrigin: number = this.config.origin[0],
			  yOrigin: number = this.config.origin[1];	  

		let xEdge = 0,
			yEdge = 0;

		//判断items是否为数组
		if(items instanceof Array) {
			xEdge = _MAX(items.map(item => _MAX(item.points.map(p => p[0])))) + xInterval;
			yEdge = _MAX(items.map(item => _MAX(item.points.map(p => p[1])))) + yInterval;
		}
		else {
			xEdge = _MAX(items.points.map(p => p[0])) + xInterval;
			yEdge = _MAX(items.points.map(p => p[1])) + yInterval;
		}
		
		const xLength: number = xEdge - xOrigin,
			  yLength: number = yEdge - yOrigin,
			  xCount: number = Math.floor(xLength/xInterval),
			  yCount: number = Math.floor(yLength/yInterval);

		this.xEdge = xEdge;
		this.yEdge = yEdge;	  

		this.xOrigin = xOrigin;
		this.yOrigin = yOrigin;

		//标出坐标原点
		this.coordinateSystemText(`(${xOrigin}, ${yOrigin})`, this.oX, this.oY + 15);

		//画出X轴的断点
		for(let i = 1; i <= xCount; i ++) {
			//计算每一个断点到原点距离
			let index = i*Math.floor(this.lX/xCount);
			//在该断点画一个小线
			new DrawLine(this.g, this.oX + index, this.oY).end(this.oX + index, this.oY + 5);

			//将每一个断点保存起来
			this.rxIntervals.push(this.oX + index);
			this.yIntervals.push(i*xInterval + xOrigin);

			//标上值
			this.coordinateSystemText(i*xInterval + xOrigin, this.oX + index, this.oY + 15);
		}
		
		//画出y轴的断点
		for(let i = 1; i <= yCount; i ++) {
			//计算每一个断点到原点距离
			let index = i*Math.floor(this.lY/yCount);
			//在该断点画一个小线
			new DrawLine(this.g, this.oX - 5, this.oY - index).end(this.oX, this.oY - index);

			//将每一个断点保存起来
			this.ryIntervals.push(this.oY - index);
			this.yIntervals.push(i*yInterval + yOrigin);

			//标上值
			this.coordinateSystemText(i*yInterval + yOrigin, this.oX - 15, this.oY - index);
		}

		return this;
	}

	//画出直角坐标的坐标值
	private coordinateSystemText(text: string | number, x: number, y: number) {
		this.g.textAlign = 'center';
		this.g.textBaseline = 'middle';

		this.g.fillText(text, x, y);
	}

	//将定义的坐标点转换为该坐标系的真实坐标点
	public calc(x: number, y: number): object {
		return {
			x: this.oX + Math.floor(((x - this.xOrigin)*this.lX)/(this.xEdge - this.xOrigin)),
			y: this.oY - Math.floor(((y - this.yOrigin)*this.lY)/(this.yEdge - this.yOrigin))
		};
	}

	public render(): void {
		this.rightAngle().setIntervalPoint(this.config.items);
	}
}




/*
* @Animate: canvas动画的一个封装
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

    private g = null;
	private config = null;
	
	private coordinateSystem = null;

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
    }

	//入口
	render(): void {
		this.drawCoordinateSystem();

		//若设置网格，则描绘网格
		this.config.grid && this.drawGrid();

		if(this.config.items instanceof Array) {
			this.config.items
				.map(item => {this.renderResult(item.points, item.color? item.color: defaultColor)});
		}
		else {
			this.renderResult(
				this.config.items.points, 
				this.config.items.color? this.config.items.color: defaultColor
			);
		}

		
		//若设置标题，则描绘标题
		this.config.title && new DrawTitle(this.g, this.config.title).render(40, 5);
	}

	private drawCoordinateSystem() {
		this.coordinateSystem.render();

		return this;
	}

	//画网格
	private drawGrid() {
		const xLength = this.coordinateSystem.rxIntervals.length,
			  yLength = this.coordinateSystem.ryIntervals.length,
			  topBoundary = this.coordinateSystem.ryIntervals[yLength - 1],
			  rightBoundary = this.coordinateSystem.rxIntervals[xLength - 1];

		//画出网格中纵向的线
		for(let i = 0; i < xLength; i ++) {
			new DrawLine(this.g, this.coordinateSystem.rxIntervals[i], this.coordinateSystem.oY, '#eee')
				.end(this.coordinateSystem.rxIntervals[i], topBoundary);
		}
		//画出网格中横向的线
		for(let i = 0; i < yLength; i ++) {
			new DrawLine(this.g, this.coordinateSystem.oX, this.coordinateSystem.ryIntervals[i], '#eee')
				.end(rightBoundary, this.coordinateSystem.ryIntervals[i]);
		}

		return this;
	}

    renderResult(points: number[], color: string) {
		//画第一个点
		let p = this.coordinateSystem.calc(points[0][0], points[0][1]),
			cyc = new DrawArc(this.g, 3, 0, 360),
			line = new DrawLine(this.g, p.x, p.y, color).paint(cyc);

		//继续画接下去的点
		for(let i = 1, length = points.length; i < length; i ++) {
			p = this.coordinateSystem.calc(points[i][0], points[i][1]);
			i === length? line.next(p.x, p.y): line.end(p.x, p.y);

			//画小点
			line.paint(cyc);
		}

		return this;
    }
}

/*------------------------------图表类-END----------------------------------- */



/*---------------------------ChartUp主类------------------------------- */


class ChartPrototype implements ChartAPI {
      
	//暴露的工具方法集
	public fn: object = {};

	//entrance
	constructor() {
		this.fn = {
			//画线方法，返回DrawLine类的实例
			drawLine(Graphics: object, x: number, y: number, color?: string): DrawLine {
				return new DrawLine(Graphics, x, y, color);
			},
			//动画方法
			animate() {
				
			}
		}
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

			//获取canvas画布的宽高
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









/*------------------------------模拟使用------------------------------------ */

const canvas1 = document.getElementById('canvas1');

ChartUp.LineChart(canvas1, {
	title: 'Mychart',
    interval: [5, 10],
    items: [
		{
			lable: 'A',
			points: [[0, 4], [2, 40], [8, 5], [10, 8], [14, 10], [20, 31], [25, 36], [40, 40], [50, 42]],
			color: 'red'
		},
		{
			lable: 'B',
			points: [[5, 5], [10, 10], [20, 30], [40, 60]],
			color: 'green'
		},
		{
			lable: 'C',
			points: [[0, 0], [4, 8.5], [20, 46], [40, 60]],
			color: 'orange'
		}
	]
}).render();










window['Chart'] = ChartUp;
return ChartUp;
})(window);


//es6 module
export default ChartUp;