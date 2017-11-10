/*
* version: 0.0.1
* A javascript framework for building visual data. From phenom.
* 11.9.2017
*/


interface chartModule {
	//初始化
	init(): void;
	//渲染函数
    renderResult(): void;
}

/*
* 暴露Chart到全局
*/
const ChartUp = (function(window) {

interface ChartAPI {
      //扩展方法
      extend(config: object): void;
}      

//角度转弧度制
const _degree2Radian = function(degree): number {
	return Math.PI*(degree/180);
};


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
* @DrawCoordinateSystem: 画直角坐标系
* render
*/

class DrawCoordinateSystem {

	private g = null;
	private config = null;

	//设置坐标系与canvas边缘的距离
	private marginTop: number = 45;
	private marginLeft: number = 45;
	private marginBottom: number = 45;

	constructor(g, config) {
		this.g = g;
		this.config = config;
	}

	render(): void {

		const oX = this.marginLeft,
			  oY = this.config.canvasHeight - this.marginBottom;

		new DrawLine(this.g, this.marginLeft, this.marginTop)
			.next(oX, oY)
			.end(this.config.canvasWidth, oY);
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


/*---------------------------------------------*/

const config: object = {
    origin: [0, 0],
    interval: [10, 10],
    points: [[0, 0], [10, 10], [20, 20], [20, 30]],
    color: 'red',
	grid: true,
	animatie: false
};


/*
* @LineChart: 折线类图表
*
* 方法：
* init: 初始化
* drawCoordinateSystem: 直角坐标系
* drawGrid: 网格
* renderResult: 统计结果
*/
class LineChart implements chartModule {

    private g = null;
    private config: object = {};

    constructor(Graphics, config: object) {
        this.g = Graphics;
        this.config = config;
    }

	init(): void {

	}

	drawCoordinateSystem(): void {
		
	}

	drawGrid(): void {

	}

    renderResult(): void {

    }
}





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

			new chartConfig.chartClass(Graphics, config);
		}
		
	}
}

//实例化Chart
const Chart = new ChartPrototype();


//扩展: 折线类图表
Chart.extend({
	chartType: 'LineChart',
	chartClass: LineChart
});


















const canvas = document.getElementById('canvas');
const g = canvas.getContext('2d');

new DrawLine(g, 45, 45)
	.paint(new DrawArc(g, 6, 0, 360))
	.next(50, 100)
	.next(20, 30)
	.paint(new DrawArc(g, 3, 0, 360))
	.next(40, 80)
	.next(100, 100, 'red')
	.next(110, 200)
	.paint(new DrawArc(g, 10, 0, 360, true))
	.end(300, 300);


new	DrawCoordinateSystem(g, {
	canvasWidth: 400,
	canvasHeight: 300
}).render();









window['Chart'] = Chart;

return Chart;


})(window);


//const c = new Chart('#d');
