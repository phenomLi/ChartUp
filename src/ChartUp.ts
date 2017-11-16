
/*
* - ChartUp -
* version: 0.0.2
* A javascript framework for building visual data. From phenom.
* start on 11.9.2017
*/



// ------------ MAIN ------------ //



//图表类的统一接口，每当扩展一个新的图表类时，都必须实现这个接口
export default interface chartModule {
	
	//数据分析函数，对用户输入的数据集进行分析运算
	/*
	* @parameter:
	* item: 用户输入的数据集的某一项，应为对象
	* index: 当前项目在数据集中的索引
	*/
	analyseItems(item, index: number);

	//为图表绑定鼠标事件
	bindMouseEvent();

	//结果渲染，将分析好的数据渲染出来
	/*
	* @parameter:
	* data: 已经经过analyseItems分析的数据，应为数组
	*/
	renderResult(data);


	//浮动提示框
	/*
	* @parameter:
	* x: 鼠标横坐标
	* y: 鼠标纵坐标
	* flag: 当前鼠标指向的项目的信息
	*/
	paintTipCase(x: number, y: number, flag);


	//鼠标选中项目效果处理
	/*
	* @parameter:
	* x: 鼠标横坐标
	* y: 鼠标纵坐标
	* data: 已经经过analyseItems分析的数据，应为数组
	*/
	mouseSelect(data, x: number, y: number);

	//显示图表的标题
	setTitle();

	//显示项目的标签
	paintLabel();

	//真正的渲染函数，里面包含了图表所有内容的渲染，包括坐标轴，数据结果，交互提示，图表标题，项目标签等等，同时也是图表每次刷新要执行的函数
	/*
	* @parameter:
	* x: 鼠标横坐标
	* y: 鼠标纵坐标
	*/
	reRender(x: number, y: number);

	//主入口，图表渲染的开始，并且决定了图表要显示的项目
	/*
	* @parameter:
	* itemList: 数组，定义了用户想要在图表中显示的项目，若itemList为null或者undefined，则默认被认为显示全部项目
	*/
	render(itemList: string[]);
}

/*
* 暴露Chart到全局
*/
const ChartUp = (function(window) {


interface ChartAPI {
	  
	  //工具方法，里面包含了ChartUp里面已经封装好的某些工具函数，用作画图
	  fn;

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

//找出数组中的最小值
const _MIN = function(arr) {
	return Math.min.apply(Math, arr);
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

	private x: number = 0;
	private y: number = 0;
	
	constructor(g: object, radius: number, angle: number, soild: boolean = true) {
		this.g = g;
		this.radius = radius;

		this.startAngle = 0;
		this.endAngle = _degree2Radian(angle);
		this.isSoild = soild;
	}

	next(angle: number, color?: string) {
		this.startAngle = this.endAngle;
		this.endAngle = this.endAngle + _degree2Radian(angle);

		this.render(this.x, this.y, color);

		return this;
	}

	render(x: number, y: number, color?: string) {

		this.x = x;
		this.y = y;

		if(color) {
			this.isSoild? 
				this.g.fillStyle = color:
				this.g.strokeStyle = color;
		}

		this.g.beginPath();
		this.g.moveTo(this.x, this.y);
		this.g.arc(this.x, this.y, this.radius, this.startAngle, this.endAngle);
		this.g.closePath();

		this.isSoild? 
			this.g.fill():
			this.g.stroke();
		
		return this;	
	}
}


/*
* @DrawArc: 对canvas矩形api的一个封装
* render: 确定矩形坐标，颜色，是否填充
*/

class DrawRect {
	
	private g = null;
	private width: number = 0;
	private height: number = 0;
	private isSoild: boolean = true;
	
	constructor(g: object, width: number, height: number, soild: boolean = true) {
		this.g = g;
		this.isSoild = soild;

		this.width = width;
		this.height = height;
	}

	render(x: number, y: number, color?: string) {

		if(color) {
			this.isSoild? 
				this.g.fillStyle = color:
				this.g.strokeStyle = color;
		}

		this.g.beginPath();
		this.g.rect(x, y, this.width, this.height);

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

		const xMax: number = this.getMax(this.config.items, 'x'),
			  yMax: number = this.getMax(this.config.items, 'y'),
			  xMin: number = Math.ceil(this.getMin(this.config.items, 'x')),
			  yMin: number = Math.ceil(this.getMin(this.config.items, 'y'));

		this.xInterval = this.config.interval[0],
		this.yInterval = this.config.interval[1];

		this.xOrigin = xMin - this.xInterval,
		this.yOrigin = yMin - this.yInterval;	  

		const xLength: number = xMax - this.xOrigin,
			  yLength: number = yMax - this.yOrigin;

		this.xCount = Math.floor(xLength/this.xInterval) + 1,
		this.yCount = Math.floor(yLength/this.yInterval) + 1;
				
		this.xEdge = this.xInterval*this.xCount + this.xOrigin,
		this.yEdge = this.yInterval*this.yCount + this.yOrigin;

		for(let i = 1; i <= this.xCount; i ++) {
			//计算每一个断点到原点距离
			let index = i*(this.lX/this.xCount);
			//将每一个断点保存起来
			this.rxIntervals.push(this.oX + index);
			this.yIntervals.push(i*this.xInterval + this.xOrigin);
		}
		
		for(let i = 1; i <= this.yCount; i ++) {
			//计算每一个断点到原点距离
			let index = i*(this.lY/this.yCount);
			//将每一个断点保存起来
			this.ryIntervals.push(this.oY - index);
			this.yIntervals.push(i*this.yInterval + this.yOrigin);
		}

	}

	//绘制x=0轴
	private baseLineX() {
		let y = this.calc(0, 0)['y'],
			start = this.calc(this.xOrigin, 0)['x'];

		this.g.save();
		this.g.lineWidth = 2;

		if(this.yOrigin < 0) {
			new DrawLine(this.g, start, y, '#999')
				.end(this.rxEdge, y);
		}

		this.g.restore();

		return this;
	}

	//绘制y=0轴
	private baseLineY() {
		let x = this.calc(0, 0)['x'],
			start = this.calc(0, this.yOrigin)['y'];

		this.g.save();
		this.g.lineWidth = 2;

		if(this.xOrigin < 0) {
			new DrawLine(this.g, x, start, '#999')
				.end(x, this.ryEdge);
		}	
		
		this.g.restore();

		return this;
	}

	private rightAngle() {
		new DrawLine(this.g, this.marginLeft, this.marginTop)
			.next(this.oX, this.oY)
			.end(this.config.canvasWidth, this.oY);

		return this;
	}

	private setXIntervalPoint() {

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

		return this;
	}

	private setYIntervalPoint() {
	
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
		this.g.save();

		this.g.textAlign = 'center';
		this.g.textBaseline = 'middle';

		this.g.fillText(text, x, y);

		this.g.restore();
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

		//若是柱状图表，则没有x轴的断点，只需要y轴
		if(this.config.chartType === 'PillarChart') {
			let pointsArr = [];
			
			items.map(item => {
				pointsArr.push(item.height);
			});

			return _MAX(pointsArr);
		}
		else {
			//判断items是否为数组
			return _MAX(items.map(item => {
				if(typeof item.points === 'function') {
					return _Gconfig.edge[flag];
				}
				else {
					return _MAX(item.points.map(p => p[flag]));
				}			
			}));
		}
	}

	//获取坐标点的最小值
	private getMin(items, dir: string) {
		const flag = dir === 'x'? 0: 1;

		//若是柱状图表，则没有x轴的断点，只需要y轴
		if(this.config.chartType === 'PillarChart') {
			let pointsArr = [];
			
			items.map(item => {
				pointsArr.push(item.height);
			});

			return _MIN(pointsArr);
		}
		else {
			//判断items是否为数组
			return _MIN(items.map(item => {
				if(typeof item.points === 'function') {
					return _Gconfig.edge[flag];
				}
				else {
					return _MIN(item.points.map(p => p[flag]));
				}			
			}));
		}
	}

}



/*
* @Animate: canvas动绘制的一个封装
*/

const _Animate = function() {

}


/*--------------------工具方法 END-------------------------*/


/*------------------------------图表类------------------------------------ */

/*
* @LineChart: 折线图表
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

	//保存数据分析结果
	protected data = [];
	//数组，填入label，用作选择显示哪一个结果，若为null，则显示全部
	protected itemList: string[] = [];

	//默认半径
	protected defaultRadius = 3;

	protected coordinateSystem = null;

    constructor(Graphics, config: object) {
        this.g = Graphics;
		this.config = config;
		
		//默认原点为(0, 0)
		//this.config.origin = this.config.origin? this.config.origin: [0, 0];
		//默认开启网格
		this.config.grid = this.config.grid === undefined? true: this.config.grid;

		//默认开启测量线
		this.config.measureLine = this.config.measureLine === undefined? true: this.config.measureLine;

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

		//设置默认半径
		if(this.config.defaultRadius) {
			this.defaultRadius = this.config.defaultRadius;
		}

		//绑定鼠标事件
		this.bindMouseEvent();
    }

	//入口
	render(itemList: string[]) {
		this.itemList = itemList;

		//遍历items分析数据
		this.config.items.map((item, index) => {
			if(this.itemList) {
				this.itemList.map(label => {
					if(item.label === label) {
						this.data.push({
							ele: this.analyseItems(item, index),
							color: item.color,
							label: item.label
						});
					}
				});
			}
			else {
				this.data.push({
					ele: this.analyseItems(item, index),
					color: item.color,
					label: item.label
				});
			}
		});

		//第一次渲染
		this.reRender(0, 0);

		return this;
	}

	reRender(x: number, y: number) {
		this.g.save();

		//绘制坐标轴
		this
			.paintGrid()
			.drawCoordinateSystem()
			.renderResult(this.data)
			.paintTargetLineX(x, y)
			.paintTargetLineY(x, y)
			.paintTipCase(x, y, this.mouseSelect(this.data, x, y))
			.setTitle()
			.paintLabel();

		this.g.restore();
	}

	//绘制网格
	protected paintGrid() {

		this.g.save();
		this.config.grid && this.drawGridX().drawGridY();
		this.g.restore();

		return this;
	}

	//设置图表标题
	setTitle() {
		//若设置标题，则描绘标题
		this.config.title && new DrawTitle(this.g, this.config.title).render(40, 30);
		return this;
	}

	//绘制坐标轴
	protected drawCoordinateSystem() {
		this.coordinateSystem
			.rightAngle()
			.setXIntervalPoint()
			.setYIntervalPoint()
			.baseLineX()
			.baseLineY();

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

	//判断鼠标是否在图表内
	protected isInChart(x: number, y: number) {
		return x > this.coordinateSystem.oX && x < this.coordinateSystem.rxEdge && y < this.coordinateSystem.oY && y > this.coordinateSystem.ryEdge;
	}

	//为图表绑定鼠标事件
	bindMouseEvent() {
		this.config.canvas.addEventListener('mousemove', e => {
			let x = e.clientX - this.config.canvas.getBoundingClientRect().left,
				y = e.clientY - this.config.canvas.getBoundingClientRect().top; 

			this.g.clearRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);
			this.reRender(x, y);
		});

		return this;
	}

	//鼠标选中元素处理
	mouseSelect(circles, x: number, y: number) {
		//标志符：用作判断鼠标是否移到了圆点里面
		let flag: object = null;

		circles.map(cir => {
			if(typeof cir.ele !== 'function') {
				cir.ele.map(c => {	
					this.g.beginPath();
					this.g.arc(c.x, c.y, c.r + 2, 0, 2*Math.PI);
					if(this.g.isPointInPath(x, y)) {
						this.g.save();
						this.g.fillStyle = cir.color;
						this.g.fill();
						this.g.restore();
						flag = c;
					}
				});
			}
		});

		return flag;
	}

	//绘制横向测量线
	protected paintTargetLineY(x: number, y: number) {
		
		const vy: number = this.coordinateSystem.yOrigin + Math.abs((y - this.config.canvasHeight + 45))*(this.coordinateSystem.yEdge - this.coordinateSystem.yOrigin)/(this.coordinateSystem.lY);

		this.g.save();
		this.g.setLineDash([4, 2]);

		if(this.isInChart(x, y)) { 
			if(this.config.measureLine) {
				new DrawLine(this.g, this.coordinateSystem.oX, y, 'rgba(0, 0, 0, 0.2)')
					.end(this.coordinateSystem.rxEdge, y);

				this.g.fillStyle = 'rgba(0, 0, 0, 0.7)';
				this.g.rect(this.coordinateSystem.oX + 5, y - 21, 70, 18);
				this.g.fill();
				this.g.font = '12px serif';
				this.g.fillStyle = '#fff';
				this.g.fillText(`y: ${vy.toFixed(3)}`, this.coordinateSystem.oX + 10, y - 9);	
			}	
		}

		this.g.restore();

		return this;
	}

	//绘制纵向测量线
	protected paintTargetLineX(x: number, y: number) {

		const vx: number = this.coordinateSystem.xOrigin + (x - 45)*(this.coordinateSystem.xEdge - this.coordinateSystem.xOrigin)/(this.coordinateSystem.lX);

		this.g.save();
		this.g.setLineDash([4, 2]);

		if(this.isInChart(x, y)) { 
			if(this.config.measureLine) {
				new DrawLine(this.g, x, this.coordinateSystem.ryEdge, 'rgba(0, 0, 0, 0.2)')
					.end(x, this.coordinateSystem.oY);

				this.g.fillStyle = 'rgba(0, 0, 0, 0.7)';
				this.g.rect(x + 5, this.coordinateSystem.oY - 21, 70, 18);
				this.g.fill();
				this.g.font = '12px serif';
				this.g.fillStyle = '#fff';
				this.g.fillText(`x: ${vx.toFixed(3)}`, x + 10, this.coordinateSystem.oY - 8);
	
			}	
		}

		this.g.restore();

		return this;
	}

	//绘制坐标提升框
	paintTipCase(x: number, y: number, flag) {

		const vx: number = this.coordinateSystem.xOrigin + (x - 45)*(this.coordinateSystem.xEdge - this.coordinateSystem.xOrigin)/(this.coordinateSystem.lX),
		      vy: number = this.coordinateSystem.yOrigin + Math.abs((y - this.config.canvasHeight + 45))*(this.coordinateSystem.yEdge - this.coordinateSystem.yOrigin)/(this.coordinateSystem.lY)

		if(this.isInChart(x, y)) {
			this.g.fillStyle = 'rgba(0, 0, 0, 0.7)';

			if(x + 90 > this.coordinateSystem.rxEdge) {
				x = this.coordinateSystem.rxEdge - 90;
			}
			
			if(flag) {
				this.g.fillRect(x + 10, y + 10, 80, 40);
				this.g.font = '12px serif';
				this.g.fillStyle = '#fff';
				this.g.fillText(`x: ${flag.cx.toFixed(3)}`, x + 15, y + 25);
				this.g.fillText(`y: ${flag.cy.toFixed(3)}`, x + 15, y + 40);
			}
		}

		return this;
	}

	paintLabel() {
		return this;
	}


	//分析点数据
	analyseItems(item, index: number) {
		let circleInfo = [];

		if(typeof item.points === 'function') {
			return item.points;
		}
		else {
			//遍历获取原点信息
			item.points.map((it, index) => {
				let cyc = this.coordinateSystem.calc(it[0], it[1]);
				circleInfo.push({
					x: cyc.x,
					y: cyc.y,
					cx: it[0],
					cy: it[1],
					r: 3
				});
			});

			return circleInfo;
		}
	}

	//绘制点函数
	protected renderPoints(p, color: string) {
		//绘制第一个点
		let cyc = new DrawArc(this.g, 3, 360),
			line = new DrawLine(this.g, p[0].x, p[0].y, color).paint(cyc);

		//继续绘制接下去的点
		for(let i = 1, length = p.length; i < length; i ++) {
			i === length? 
				line.next(p[i].x, p[i].y).paint(cyc): 
				line.end(p[i].x, p[i].y).paint(cyc);
		}
	}

	//绘制方程函数
	private renderExpression(exp, color: string) {
		let i = this.coordinateSystem.xOrigin,
			p = this.coordinateSystem.calc(i, exp(i)),
			line = new DrawLine(this.g, p.x, p.y, color);
	
		//循环不断求方程的解，直到方程的解>yEdge
		while(i < this.coordinateSystem.xEdge) {
			i += 0.02;
			p = this.coordinateSystem.calc(i, exp(i));
			
			if(i > this.coordinateSystem.xEdge || exp(i) > this.coordinateSystem.yEdge ||
			   exp(i) < this.coordinateSystem.yOrigin || i < this.coordinateSystem.xOrigin) {
				line.next(p.x, p.y, 'transparent');
			}
			else {
				line.next(p.x, p.y, color);
			}
		}

		line.end(p.x, p.y);
	}

    renderResult(data) {
		data.map(cir => {
			if(typeof cir.ele === 'function') {
				this.renderExpression(cir.ele, cir.color);
			}
			else {
				this.renderPoints(cir.ele, cir.color);
			}
		});
	
		return this;
    }
}


/*
* @PointChart: 散点图表
* 继承自LineChart
*
* 重写方法：
* analyseItems
* renderResult
* paintTipCase
*/
class PointChart extends LineChart {

	constructor(Graphics, config: object) {
		super(Graphics, config);
	}

	//根据权重分析半径
	private getRadius(weights: number[]) {

		let temp = [],
			minWeight: number = 0;

		weights.map(w => {
			if(w) {
				temp.push(w);
			}
		});

		//找出最小的权重
		//若都没有设置权重，则全部默认设置权重为 1
		minWeight = temp.length? _MIN(temp): 1;

		//若改点没有设置权重，则将其默认设置为最小权重
		weights = weights.map(w => {
			if(w === undefined) {
				w = minWeight;
			}
			return w;
		});

		return weights.map(w => Math.sqrt(w/minWeight)*this.defaultRadius);
	}


	//分析点数据
	analyseItems(item, index: number) {
		const radiusList = this.getRadius(item.points.map(i => i[2])),
			  circleInfo = [];
		
		//遍历获取原点信息
		item.points.map((it, index) => {
			let cyc = this.coordinateSystem.calc(it[0], it[1]);
			circleInfo.push({
				x: cyc.x,
				y: cyc.y,
				r: radiusList[index],
				w: it[2],
				cx: it[0],
				cy: it[1]
			});
		});

		return circleInfo;
	}


	//绘制点函数
	renderResult(data) {

		this.g.save();
		this.g.shadowOffsetX = 1;
		this.g.shadowOffsetY = 1;
		this.g.shadowBlur = 2;
		this.g.shadowColor = "rgba(0, 0, 0, 0.5)";

		data.map(cir => {
			cir.ele.map(c => {
				new DrawArc(this.g, c.r, 360).render(c.x, c.y, cir.color);
			});
		});

		this.g.restore();

		return this;
	}

	//绘制坐标提升框
	paintTipCase(x: number, y: number, flag) {

		const vx: number = (x - 45)*(this.coordinateSystem.xEdge - this.coordinateSystem.xOrigin)/(this.coordinateSystem.lX),
			  vy: number = Math.abs((y - this.config.canvasHeight + 45))*(this.coordinateSystem.yEdge - this.coordinateSystem.yOrigin)/(this.coordinateSystem.lY)

		this.g.fillStyle = 'rgba(0, 0, 0, 0.7)';
		
		if(x + 90 > this.coordinateSystem.rxEdge) {
			x = this.coordinateSystem.rxEdge - 90;
		}

		if(this.isInChart(x, y)) {
			if(flag) {
				this.g.fillRect(x + 10, y + 10, 80, 55);
				this.g.font = '12px serif';
				this.g.fillStyle = '#fff';
				this.g.fillText(`x: ${flag.cx.toFixed(3)}`, x + 15, y + 25);
				this.g.fillText(`y: ${flag.cy.toFixed(3)}`, x + 15, y + 40);
				this.g.fillText(`weight: ${flag.w?flag.w:'none'}`, x + 15, y + 55);
			}
		}

		return this;
	}
}



/*
* @PillarChart: 柱状图表
* 继承自LineChart
*
* 重写方法：
* drawCoordinateSystem
* drawGridY
* analyseItems
* paintTargetLineY
* paintTipCase
* mouseSelect
* paintLabel
* renderResult
* reRender
*/
class PillarChart extends LineChart {

	//柱宽
	private itemWidth: number = 0;

	constructor(Graphics, config: object) {
		super(Graphics, config);

		this.itemWidth = this.getWidth(this.config.interval[0]);

		//是否显示趋势线
		this.config.trendLine = this.config.trendLine === undefined? false: this.config.trendLine;
	}

	//绘制坐标轴
	protected drawCoordinateSystem() {
		this.coordinateSystem
			.rightAngle()
			.setYIntervalPoint()
			.baseLineX();

		return this;
	}

	//绘制横向网格
	protected drawGridY() {
		const yLength = this.coordinateSystem.ryIntervals.length,
			  rightBoundary = this.coordinateSystem.rxEdge;

		//绘制出网格中横向的线
		for(let i = 0; i < yLength; i ++) {
			new DrawLine(this.g, this.coordinateSystem.oX, this.coordinateSystem.ryIntervals[i], '#eee')
				.end(rightBoundary + 20, this.coordinateSystem.ryIntervals[i]);
		}	
		
		return this;
	}

	//绘制网格
	protected paintGrid() {
		this.config.grid && this.drawGridY();
		return this;
	}

	//分析点数据
	analyseItems(item, index: number) {

		//经过转换后的高度
		let height = this.coordinateSystem.oY - this.coordinateSystem.calc(0, item.height).y;

		return {
			x: this.coordinateSystem.oX + (index + 1)*this.config.interval[0] + index*this.itemWidth,
			y: this.coordinateSystem.oY - height,
			width: this.itemWidth,
			height: height,
			cheight: item.height,
		}
	}

	//根据x轴interval计算柱宽
	private getWidth(xInterval) {
		return (this.coordinateSystem.lX + 20 - (this.config.items.length + 1)*xInterval)/this.config.items.length;
	}
	
	
	//绘制横向测量线
	protected paintTargetLineY(x: number, y: number) {
		
		const vy: number = this.coordinateSystem.yOrigin + Math.abs((y - this.config.canvasHeight + 45))*(this.coordinateSystem.yEdge - this.coordinateSystem.yOrigin)/(this.coordinateSystem.lY);

		this.g.save();
		this.g.setLineDash([4, 2]);

		if(this.isInChart(x, y)) { 
			if(this.config.measureLine) {
				new DrawLine(this.g, this.coordinateSystem.oX, y, 'rgba(0, 0, 0, 0.2)')
					.end(this.coordinateSystem.rxEdge, y);

				this.g.fillStyle = 'rgba(0, 0, 0, 0.7)';
				this.g.rect(this.coordinateSystem.oX + 5, y - 21, 70, 18);
				this.g.fill();
				this.g.font = '12px serif';
				this.g.fillStyle = '#fff';
				this.g.fillText(`y: ${vy.toFixed(3)}`, this.coordinateSystem.oX + 10, y - 9);	
			}	
		}

		this.g.restore();

		return this;
	}


	//绘制坐标提升框
	paintTipCase(x: number, y: number, flag) {
		
		const vy: number = Math.abs((y - this.config.canvasHeight + 45))*(this.coordinateSystem.yEdge - this.coordinateSystem.yOrigin)/(this.coordinateSystem.lY)

		if(x + 90 > this.coordinateSystem.rxEdge + 20) {
			x = this.coordinateSystem.rxEdge - 70;
		}

		if(this.isInChart(x, y)) {
			this.g.fillStyle = 'rgba(0, 0, 0, 0.7)';
	
			if(flag) {
				this.g.fillRect(x, y - 40, 110, 35);
				this.g.font = '12px serif';
				this.g.fillStyle = '#fff';
				this.g.fillText(`height: ${flag.ele.cheight.toFixed(3)}`, x + 15, y - 25);
				this.g.fillText(`lable: ${flag.label}`, x + 15, y - 10);
			}
		}

		return this;
	}


	//鼠标选中元素处理
	mouseSelect(rects, x: number, y: number) {
		//标志符：用作判断鼠标是否移到了圆点里面
		let flag: object = null;

		this.g.strokeStyle = '#000';

		rects.map(r => {
			this.g.beginPath();
			this.g.rect(r.ele.x - 1, r.ele.y - 1, r.ele.width + 2, r.ele.height + 1);
			if(this.g.isPointInPath(x, y)) {
				this.g.stroke();
				flag = r;
			}
		});
		
		return flag;
	}

	//绘制趋势线
	private drawTrendLine() {

		const halfWidth = this.itemWidth/2;

		let line = null,
			cir = new DrawArc(this.g, 3, 360, false);

		if(this.config.trendLine) {
			this.data.map((rect, index) => {
				if(index === 0) {
					line = new DrawLine(this.g, rect.ele.x + halfWidth, rect.ele.y, '#333');
				}
				else if(index === this.data.length) {
					line = line.end(rect.ele.x + halfWidth, rect.ele.y);
				}
				else {
					line = line.next(rect.ele.x + halfWidth, rect.ele.y);
				}
	
				line.paint(cir);
			});
		}

		return this;
	}

	//为每一个项目标上名字
	paintLabel() {

		const halfWidth = this.itemWidth/2;

		this.g.save();

		this.g.fillStyle = _Gconfig.defaultColor;
		this.g.textAlign = 'center';

		this.data.map(rect => {
			this.g.fillText(rect.label, rect.ele.x + halfWidth, this.coordinateSystem.oY + 20);
		});

		this.g.restore();

		return this;
	}

	renderResult(data) {
		data.map(rect => {
			new DrawRect(this.g, rect.ele.width, rect.ele.height).render(rect.ele.x, rect.ele.y, rect.color);
		});	
		return this;
	}

	//刷新图表，重新渲染
	reRender(x: number, y: number): void {
		this.g.save();

		//绘制坐标轴
		this.drawCoordinateSystem()
			.paintGrid()
			.renderResult(this.data)
			.paintLabel()
			.paintTargetLineY(x, y)
			.paintTipCase(x, y, this.mouseSelect(this.data, x, y))
			.drawTrendLine()
			.setTitle();	

		this.g.restore();
	}
}




/*
* @PieChart: 饼状图表
*/
class PieChart implements chartModule{

	protected g = null;
	protected config = null;

	protected itemList = [];

	//存放分析好的数据
	protected data = [];

	//图形默认半径
	protected radius: number = 120;

	//画布的中心点，用作圆心
	protected centerPoint: number[] = [];

	//数据总和
	protected total: number = 0;

	constructor(Graphics, config) {
		this.g = Graphics;
		this.config = config;

		//设置默认半径
		this.config.radius = this.config.radius === undefined? this.radius: this.config.radius;

		//计算中心点
		this.centerPoint = [this.config.canvasWidth/2, this.config.canvasHeight/2];

		//计算总和
		this.total = this.sum(this.config.items);

		this.bindMouseEvent();
	}

	//计算数据量总和
	private sum(items) {
		return items.map(item => item.data).reduce((prev, cur, index, arr) => prev + cur);
	}

	//数据分析函数，对用户输入的数据集进行分析运算
	analyseItems(item, index: number) {
		return {
			data: item.data,
			angle: (item.data*360)/this.total,
			ratio: ((item.data/this.total)*100).toFixed(1) + '%'
		};
	};
	
	//为图表绑定鼠标事件
	bindMouseEvent() {
		this.config.canvas.addEventListener('mousemove', e => {
			let x = e.clientX - this.config.canvas.getBoundingClientRect().left,
				y = e.clientY - this.config.canvas.getBoundingClientRect().top; 

			this.g.clearRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);
			this.reRender(x, y);
		});

		return this;
	};

	//结果渲染，将分析好的数据渲染出来
	renderResult(data) {
		let cir = null;

		this.g.save();

		data.map(pie => {
			if(!cir) {
				cir = new DrawArc(this.g, this.config.radius, pie.ele.angle)
					.render(this.centerPoint[0], this.centerPoint[1], pie.color);
			}
			else {
				cir = cir.next(pie.ele.angle, pie.color);
			}
		});

		this.g.restore();

		return this;
	};

	//判断是否在圆内
	private isInCircle(x: number, y: number) {
		this.g.beginPath();
		this.g.arc(this.centerPoint[0], this.centerPoint[1], this.config.radius, 0, 2*Math.PI);
		return this.g.isPointInPath(x, y);
	}

	//浮动提示框
	paintTipCase(x: number, y: number, flag) {
		if(this.isInCircle(x, y)) {
			this.g.fillStyle = 'rgba(0, 0, 0, 0.5)';

			if(flag) {
				this.g.fillRect(x, y - 60, 110, 50);
				this.g.font = '12px serif';
				this.g.fillStyle = '#fff';
				this.g.fillText(`lable: ${flag.label}`, x + 10, y - 45);
				this.g.fillText(`data: ${flag.ele.data}`, x + 10, y - 30);
				this.g.fillText(`ratio: ${flag.ele.ratio}`, x + 10, y - 15);
			}
		}

		return this;
	};


	//鼠标选中项目效果处理
	mouseSelect(data, x: number, y: number) {
		//标志符：用作判断鼠标是否移到了圆点里面
		let flag: object = null,
			startAngle: number = 0,
			endAngle: number = 0;
		
		data.map((pie, index) => {

			this.g.save();

			this.g.fillStyle = pie.color;

			if(index === 0) {
				startAngle = 0;
				endAngle = pie.ele.angle;
			}
			else {
				startAngle = endAngle;
				endAngle = startAngle + pie.ele.angle;
			}

			this.g.beginPath();
			this.g.moveTo(this.centerPoint[0], this.centerPoint[1]);
			this.g.arc(this.centerPoint[0], this.centerPoint[1], this.config.radius + this.config.radius*0.15, _degree2Radian(startAngle), _degree2Radian(endAngle));
			this.g.closePath();

			if(this.g.isPointInPath(x, y)) {
				this.g.shadowOffsetX = 2;
				this.g.shadowOffsetY = 2;
				this.g.shadowBlur = 8;
				this.g.shadowColor = "rgba(0, 0, 0, 0.5)";
				this.g.fill();
				flag = pie;
			}

			this.g.restore();
		});
		
		return flag;
	};

	setTitle() {
		if(this.config.title) {
			this.g.save();
			this.g.textAlign = 'center';
			new DrawTitle(this.g, this.config.title).render(this.centerPoint[0], 30);
			this.g.restore();
		}

		return this;
	}

	//显示项目的标签
	paintLabel() {
		return this;
	};

	reRender(x: number, y: number) {
		this.g.save();

		//绘制图表结果
		this
			.renderResult(this.data)
			.setTitle()
			.paintTipCase(x, y, this.mouseSelect(this.data, x, y));

		this.g.restore();
	};

	render(itemList: string[]) {
		this.itemList = itemList;
		
		//遍历items分析数据
		this.config.items.map((item, index) => {
			if(this.itemList) {
				this.itemList.map(label => {
					if(item.label === label) {
						this.data.push({
							ele: this.analyseItems(item, index),
							color: item.color,
							label: item.label
						});
					}
				});
			}
			else {
				this.data.push({
					ele: this.analyseItems(item, index),
					color: item.color,
					label: item.label
				});
			}
		});

		//第一次渲染
		this.reRender(0, 0);

		return this;
	};
}



/*
* @PieChart: 环形图表
* 继承自PieChart
*
* 重写方法：
* paintTipCase
* mouseSelect
*/

class AnnularChart extends PieChart {

	//环形宽度
	private width: number = 65;

	constructor(Graphics, config) {
		super(Graphics, config);

		this.config.width = this.config.width === undefined? this.width: this.config.width;
	}

	//绘制中心白色的圆
	private drawCenterCircle() {
		new DrawArc(this.g, this.config.radius - this.config.width, 360)
			.render(this.centerPoint[0], this.centerPoint[1], '#fff');

		return this;
	}

	//鼠标选中项目效果处理
	mouseSelect(data, x: number, y: number) {
		//标志符：用作判断鼠标是否移到了圆点里面
		let flag: object = null,
			startAngle: number = 0,
			endAngle: number = 0;
		
		this.g.strokeStyle = '#000';

		data.map((pie, index) => {
			if(index === 0) {
				startAngle = 0;
				endAngle = pie.ele.angle;
			}
			else {
				startAngle = endAngle;
				endAngle = startAngle + pie.ele.angle;
			}

			if(this.isInAnnular(x, y)) {
				this.g.beginPath();
				this.g.moveTo(this.centerPoint[0], this.centerPoint[1]);
				this.g.arc(this.centerPoint[0], this.centerPoint[1], this.config.radius, _degree2Radian(startAngle), _degree2Radian(endAngle));
				this.g.closePath();
				
				if(this.g.isPointInPath(x, y)) {
					this.g.stroke();

					this.g.beginPath();
					this.g.arc(this.centerPoint[0], this.centerPoint[1], this.config.radius - this.config.width, _degree2Radian(startAngle), _degree2Radian(endAngle));
					this.g.stroke();
	
					flag = pie;
				}
			}
		});
		
		return flag;
	};

	//判断是否在圆内
	private isInAnnular(x: number, y: number) {
		let inCircle: boolean = false,
			outAnnular: boolean = false;

		this.g.beginPath();
		this.g.arc(this.centerPoint[0], this.centerPoint[1], this.config.radius, 0, 2*Math.PI);

		if(this.g.isPointInPath(x, y)) {
			inCircle = true;
		}

		this.g.beginPath();
		this.g.arc(this.centerPoint[0], this.centerPoint[1], this.config.radius - this.config.width, 0, 2*Math.PI);

		if(!this.g.isPointInPath(x, y)) {
			outAnnular = true;
		}

		return outAnnular && inCircle;
	}

	//浮动提示框
	paintTipCase(x: number, y: number, flag) {

		this.drawCenterCircle();

		if(this.isInAnnular(x, y)) {
			this.g.fillStyle = 'rgba(0, 0, 0, 0.5)';

			if(flag) {
				this.g.fillRect(x, y - 60, 110, 50);
				this.g.font = '12px serif';
				this.g.fillStyle = '#fff';
				this.g.fillText(`lable: ${flag.label}`, x + 10, y - 45);
				this.g.fillText(`data: ${flag.ele.data}`, x + 10, y - 30);
				this.g.fillText(`ratio: ${flag.ele.ratio}`, x + 10, y - 15);
			}
		}

		return this;
	};
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
			animate: _Animate
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

			//图表类型
			config['chartType'] = chartConfig.chartType;

			return new chartConfig.chartClass(Graphics, config);
		}
		
	}
}

//实例化Chart
const ChartUp = new ChartPrototype();


//扩展: 折线图表
ChartUp.extend({
	chartType: 'LineChart',
	chartClass: LineChart
});

//扩展: 散点图表
ChartUp.extend({
	chartType: 'PointChart',
	chartClass: PointChart
});

//扩展: 柱状图表
ChartUp.extend({
	chartType: 'PillarChart',
	chartClass: PillarChart
});

//扩展: 饼状图表
ChartUp.extend({
	chartType: 'PieChart',
	chartClass: PieChart
});

//扩展: 环形图表
ChartUp.extend({
	chartType: 'AnnularChart',
	chartClass: AnnularChart
});








/*------------------------------模拟使用------------------------------------ */



const canvas1 = document.getElementById('canvas1'),
	  canvas2 = document.getElementById('canvas2'),
	  canvas3 = document.getElementById('canvas3'),
	  canvas4 = document.getElementById('canvas4'),
	  canvas5 = document.getElementById('canvas5');

ChartUp.LineChart(canvas1, {
	title: 'Mychart',
	interval: [5, 5],
    items: [
		{
			label: 'A',
			points: [[3, 6], [8, 7], [12, 14], [20, 31]],
			color: '#009688'
		},
		{
			label: 'B',
			points: function(x: number) {
				return (1/16)*x*x;
			},
			color: 'green'
		},
		{
			label: 'C',
			points: function(x: number) {
				return (1/20)*Math.pow(Math.E, x);
			},
			color: '#512DA8'
		},
		{
			label: 'D',
			points: function(x: number) {
				return 15*Math.sin(x) + 20;
			},
			color: '#FFC107'
		}
	]
}).render();

ChartUp.PointChart(canvas2, {
	title: 'Myanotherchart',
	interval: [5, 5],
	grid: false,
	defaultRadius: 4,
    items: [{
		label: 'A',
		points: Array.from(new Array(50), n => [Math.random()*65, Math.random()*30, Math.floor(Math.random()*20)]),
		color: '#00796B'
	}]
}).render();

ChartUp.PillarChart(canvas3, {
	title: 'Thrirdchart',
	interval: [30, 20],
	trendLine: true,
    items: [{
		label: 'A',
		height: 20,
		color: '#03A9F4'
	}, 
	{
		label: 'B',
		height: -25,
		color: '#7B1FA2'
	},
	{
		label: 'C',
		height: 37,
		color: '#8BC34A'
	},
	{
		label: 'D',
		height: 50,
		color: '#FF4081'
	},
	{
		label: 'E',
		height: 100,
		color: '#FF5722'
	},
	{
		label: 'F',
		height: 88,
		color: '#5c6bc0'
	}]
}).render();


ChartUp.PieChart(canvas4, {
	title: 'PieChart',
    items: [{
		label: 'A',
		data: 25,
		color: '#ff5722'
	},
	{
		label: 'B',
		data: 18,
		color: '#1b5e20'
	},
	{
		label: 'C',
		data: 20,
		color: '#1565c0'
	},
	{
		label: 'D',
		data: 40,
		color: '#ffa000'
	},
	{
		label: 'E',
		data: 15,
		color: '#C2185B'
	},
	{
		label: 'F',
		data: 18,
		color: '#5D4037'
	}]
}).render();


ChartUp.AnnularChart(canvas5, {
	title: 'AnnularChart',
	radius: 120,
	width: 60,
    items: [{
		label: 'A',
		data: 25,
		color: '#ff5722'
	},
	{
		label: 'B',
		data: 18,
		color: '#1b5e20'
	},
	{
		label: 'C',
		data: 20,
		color: '#1565c0'
	},
	{
		label: 'D',
		data: 40,
		color: '#ffa000'
	},
	{
		label: 'Esss',
		data: 10,
		color: '#e6ee9c'
	},
	{
		label: '看电影',
		data: 28,
		color: '#7986cb'
	}]
}).render();



















window['Chart'] = ChartUp;
return ChartUp;

})(window);





//es6 module
export default ChartUp;

