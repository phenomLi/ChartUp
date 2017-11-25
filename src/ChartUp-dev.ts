
/*
* - ChartUp -
* version: 0.0.2
* A javascript library for building visual data. From phenom.
* start on 11.9.2017
*/




// ------------ MAIN ------------ //


/*
* 暴露Chart到全局
*/
const ChartUp = (function(window) {

//图表类的统一接口，每当扩展一个新的图表类时，都必须实现这个接口
interface chartModule {
	
	//主入口，图表渲染的开始，并且决定了图表要显示的项目
	/*
	* @parameter:
	* itemList: Array，定义了用户想要在图表中显示的项目，若itemList为null或者undefined，则默认被认为显示全部项目
	*/
	render(itemList: string[]);

	//增加项目
	/*
	* @parameter:
	* item: object，定义了用户想要在图表中增加的项目
	*/
	addItem(item);

	//删除项目
	/*
	* @parameter:
	* label: string，定义了用户想要在图表中删除的项目
	*/
	removeItem(label: string | number);

	//修改项目
	/*
	* @parameter:
	* label: string，定义了用户想要在图表中修改的项目的名称
	* value: any，定义了用户想要修改的项目的值
	*/
	setItem(label: string | number, value);
}
   


//全局设置
const _Gconfig = {
	//所有图表默认颜色
	defaultColor: '#000',
	//所有直角坐标图表默认边界
	edge: [20, 20],
	//所有图表默认坐标间隔
	interval: 10
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


//数组求和
const _SUM = function(arr) {
	return arr.length? arr.reduce((prev, cur, index, arr) => prev + cur): 0;
}








/*---------------------------ChartUp主类------------------------------- */


class ChartPrototype {
	
  //暴露的工具方法集
  public fn: object = {};

  //version
  public version = '0.0.2';

  //全局设置API
  private configuration = _Gconfig;
  
  //entrance
  constructor() {
	  this.fn = {
		  //绘制线方法，返回DrawLine类的实例
		  drawLine(Graphics: object, x: number, y: number, color?: string): DrawLine {
			  return new DrawLine(Graphics, x, y, color);
		  },

		  //绘制扇形方法，返回DrawArc类的实例
		  DrawArc(Graphics: object, radius: number, angle: number, isSoild = true): DrawArc {
			  return new DrawArc(Graphics, radius, angle, isSoild);
		  },

		  //绘制矩形方法，返回DrawRect类的实例
		  DrawRect(Graphics: object, width: number, height: number, isFill: boolean = true): DrawRect {
			  return new DrawRect(Graphics, width, height, true);
		  },

		  //动绘制方法
		  animate: _Animate
	  }
  }

  private changeItem(el: HTMLElement, config) {
	  const label = el.getAttribute('data-item');

	  if(el.className.indexOf('active') > -1) {
		  el.classList.remove('active');
		  config.itemList.push(label);
	  }
	  else {
		  el.classList.add('active');
		  config.itemList.splice(config.itemList.indexOf(label), 1);
	  }

	  config.chartIntance.render(config.itemList);
  }

  //创建项目控件
  public createTagItem(container: HTMLElement, item, config) {
	  const tagItem = document.createElement('li'),
			tag = document.createElement('span'),
			labelText = document.createElement('span');

	  const _self = this;

	  tagItem.setAttribute('data-item', item.label);	
	  
	  tag.classList.add('tag');
	  tag.style.backgroundColor = item.color;
	  labelText.classList.add('label');
  
	  labelText.innerHTML = item.label;

	  tagItem.appendChild(tag);
	  tagItem.appendChild(labelText);
	  
	  //绑定选择项目事件
	  tagItem.addEventListener('click', function(e) {
		  _self.changeItem(this, config);
	  });

	  container.appendChild(tagItem);
  }

  //销毁项目控件
  public destoryTagItem(container: HTMLElement, label: string | number) {
	  let targetEle: HTMLElement = null;

	  [].slice.call(container.children).map(tag => {

	      if(tag.querySelector('.label').innerHTML === label) {
			  targetEle = tag;
		  }	
	  });

      targetEle && container.removeChild(targetEle);
  }

  //用作为图表添加标题，标签等
  private addCondition(container: HTMLElement, config) {
	  const title = document.createElement('h2'),
			canvas = document.createElement('canvas'),
			tagCon = document.createElement('ul'),
			comment = document.createElement('div');

	  container.classList.add('chartUp-container');
	  comment.classList.add('comment');

	  title.innerHTML = config.title? config.title: '';
	  comment.innerHTML = config.comment? config.comment: '';

	  tagCon.classList.add('tag-con');

	  config.items.map(item => {
		  this.createTagItem(tagCon, item, config);
	  });
	  
	  container.appendChild(title);
	  container.appendChild(comment);
	  container.appendChild(canvas);
	  container.appendChild(tagCon);

	  canvas.width = canvas.offsetWidth;
	  canvas.height = canvas.offsetHeight;

	  config.canvas = canvas;	
	  config.tagCon = tagCon;
	  
	  //获取canvas绘制布的宽高
	  config.canvasWidth = canvas.offsetWidth;
	  config.canvasHeight = canvas.offsetHeight;

	  return canvas.getContext('2d');
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
	  
	  this[chartConfig.chartType] = function(container: string, config) {

		  const Graphics = this.addCondition(document.querySelector(container), config);

		  //图表类型
		  config.chartType = chartConfig.chartType;
		  config.itemList = config.items.map(item => item.label);

		  //保存图表实例
		  config.chartIntance = new chartConfig.chartClass(Graphics, config).render(config.itemList);

		  return config.chartIntance;
	  }
	  
  }
}

//实例化Chart
const ChartUp = new ChartPrototype();


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

    end(x: number, y: number, isFill: boolean = false, color?: string) {

		if(color) {
			this.reLine(color);
		};

		isFill && (this.g.fillStyle = color);

		this.g.lineTo(x, y);
		this.currentPoint = [x, y];
		
	    isFill? this.g.fill(): this.g.stroke();
		
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

	private isDrawCircle: boolean = false;
	
	constructor(g: object, radius: number, angle: number, soild: boolean = true) {
		this.g = g;
		this.radius = radius;

		this.startAngle = 0;
		this.endAngle = _degree2Radian(angle);
		this.isSoild = soild;

		angle === 360 && (this.isDrawCircle = true);
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
		!this.isDrawCircle && this.g.moveTo(this.x, this.y);
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
	private items = [];

	//设置坐标系与canvas边缘的距离
	private margin: number = 45;

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

	constructor(g, config, items) {
		this.g = g;
		this.config = config;
		this.items = items;

		this.oX = this.margin;
		this.oY = this.config.canvasHeight - this.margin;

		this.lX = this.config.canvasWidth - this.oX - 20 - this.margin;
		this.lY = this.oY - this.margin - 20;

		this.rxEdge = this.oX + this.lX;
		this.ryEdge = this.oY - this.lY;

		this.xInterval = this.config.interval[0]? this.config.interval[0]: 1,
		this.yInterval = this.config.interval[1]? this.config.interval[1]: this.config.interval;

		const xMax: number = this.getMax(this.items, 'x'),
			  yMax: number = this.getMax(this.items, 'y'),
			  xMin: number = Math.ceil(this.getMin(this.items, 'x')),
			  yMin: number = Math.ceil(this.getMin(this.items, 'y'));

		this.xOrigin = xMin,
		this.yOrigin = yMin;	  

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

		if(this.yOrigin < 0) {
			new DrawLine(this.g, start, y, '#666')
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

		if(this.xOrigin < 0) {
			new DrawLine(this.g, x, start, '#666')
				.end(x, this.ryEdge);
		}	
		
		this.g.restore();

		return this;
	}

	private rightAngle() {
		new DrawLine(this.g, this.margin, this.margin)
			.next(this.oX, this.oY)
			.end(this.config.canvasWidth - this.margin, this.oY);

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

		if(items.length === 0) {
			return _Gconfig.edge[flag];
		}

		if(this.config.chartType === 'BaseChart' || this.config.chartType === 'PointChart') {
			//判断items是否为数组
			return _MAX(items.map(item => {
				if(typeof item.value === 'function') {
					return _Gconfig.edge[flag];
				}
				else {
					return _MAX(item.value.map(p => p[flag]));
				}			
			}));
		}
		else if(this.config.chartType === 'AreaChart') {
			let temp: number[] = [],
			sum = 0;

			for(let i = 0; i < this.config.length; i ++) {
				for(let j = 0; j < this.items.length; j ++) {
					sum = this.items[j].value[i] + sum;
				}
				temp.push(sum);
				sum = 0;
			}

			return _MAX(temp);
		}
		else {
			return _MAX(this.items.map(item => _MAX(item.value)));
		}
	}

	//获取坐标点的最小值
	private getMin(items, dir: string) {
		const flag = dir === 'x'? 0: 1;

		if(items.length === 0) {
			return 0;
		}

		//若是柱状图表，则没有x轴的断点，只需要y轴
		if(this.config.chartType === 'BaseChart' || this.config.chartType === 'PointChart') {
			//判断items是否为数组
			return _MIN(items.map(item => {
				if(typeof item.value === 'function') {
					return 0;
				}
				else {
					return Math.ceil(_MIN(item.value.map(p => p[flag]))) - this.config.interval[flag];
				}			
			}));
		}
		else if(this.config.chartType === 'AreaChart') {
			return _MIN(items[0].value);
		}
		else {
			const min = _MIN(this.items.map(item => _MIN(item.value)));
			return min > 0? 0: min - Math.abs(min);
		}
	}

}


/*
* @DrawRadarSystem: 绘制雷达坐标系
*/

class DrawRadarSystem {

	private g = null;
	private config = null;
	private items = null;

	public oX: number = 0;
	public oY: number = 0;

	public angleList = [];

	//雷达坐标的虚拟值
	public edge: number = 0;
	private max: number = 0;
	private count: number = 0;

	constructor(g, config, items) {
		this.g = g;
		this.config = config;
		this.items = items;

		this.oX = this.config.centerX;
		this.oY = this.config.centerY;

		this.max = this.getMax(this.items);
		this.count = Math.floor(this.max/this.config.interval) + 1;
		this.edge = this.count*this.config.interval;
	}

	//获取每一个角的坐标值
	private getAngleValue(index, radius) {
		let angleList = [],
			curAngle: number = 0,
			angle: number = (2*Math.PI)/index.length,
			pi2 = Math.PI/2;

		index.map((t, i) => {
			curAngle = i*angle;

			angleList.push({
				x: this.oX + radius*Math.cos(curAngle + pi2),
				y: this.oY + radius*Math.sin(curAngle + pi2)
			});
		});

		return angleList;
	}
 
	//绘制多边形形状
	private drawPolygon() {
		let angleList = [],
			radius = 0,
			line = null;

		for(let j = 0; j < this.count; j ++) {
			radius = ((this.edge - j*this.config.interval)*this.config.defaultRadius)/this.edge;
			angleList = this.getAngleValue(this.config.index, radius);

			for(let i = 0; i < angleList.length; i ++) {
				if(i === angleList.length - 1) {
					line = line.next(angleList[i].x, angleList[i].y).end(angleList[0].x, angleList[0].y);
				}
				else if(i === 0) {
					line = new DrawLine(this.g, angleList[i].x, angleList[i].y, '#ddd');
				}
				else {
					line = line.next(angleList[i].x, angleList[i].y);
				}
			}

			if(j === 0) {
				this.angleList = angleList;
			}
		}

		return this;
	}

	//填充多边形条纹颜色
	private fillPolygon() {
		let angleList = [],
			radius = 0,
			line = null;

		this.g.save();	

		for(let j = 0; j < this.count; j ++) {
			radius = ((this.edge - j*this.config.interval)*this.config.defaultRadius)/this.edge;
			angleList = this.getAngleValue(this.config.index, radius);

			this.g.fillStyle = j%2? '#eee': '#fff';

			for(let i = 0; i < angleList.length; i ++) {
				if(i === angleList.length - 1) {
					line = line.next(angleList[i].x, angleList[i].y).end(angleList[0].x, angleList[0].y, j>0? true: false);
				}
				else if(i === 0) {
					line = new DrawLine(this.g, angleList[i].x, angleList[i].y, '#ddd');
				} 
				else {
					line = line.next(angleList[i].x, angleList[i].y);
				}
			}
		}

		this.g.restore();

		return this;
	}

	//绘制放射线
	private drawRay() {
		this.angleList.map(a => {
			new DrawLine(this.g, this.oX, this.oY, '#ddd').end(a.x, a.y);
		});	
		
		return this;
	}

	//绘制指标文字
	private drawText() {

		const margin: number = 35;

		this.g.save();
		this.g.textAlign = 'center';

		this.angleList.map((a, i) => {
			let x: number = a.x,
				y: number = a.y;

			if(a.x > this.oX) {
				x = a.x + margin;
			}
			
			if(a.x < this.oX) {
				x = a.x - margin;
			}

			if(a.y > this.oY) {
				y = a.y + margin;
			}
			
			if(a.y < this.oY) {
				y = a.y - margin;
			}

			this.g.fillText(this.config.index[i], x ,y);
		});	

		this.g.restore();

		return this;
	}

	private getMax(items) {

		if(items.length === 0) {
			return _Gconfig.edge[0];
		}

		return _MAX(items.map(item => _MAX(item.value)));
	}

	public calc(v: number, index: number) {
		const curAngle = index*((2*Math.PI)/this.config.index.length),
			  radius = (v*this.config.defaultRadius)/this.edge,
			  pi2 = Math.PI/2;

		return {
			x: this.oX + radius*Math.cos(curAngle + pi2),
			y: this.oY + radius*Math.sin(curAngle + pi2) 
		};
	} 

	public render() {
		this
			.fillPolygon()
			.drawPolygon()
			.drawRay()
			.drawText();
	}
}


/*
* @DrawRadarSystem: 绘制极地坐标系
*/

class DrawPolarSystem {
	private g = null;
	private config = null;
	private items = null;

	public oX: number = 0;
	public oY: number = 0;

	//极地坐标的虚拟值
	public edge: number = 0;
	private max: number = 0;
	private count: number = 0;

	constructor(g, config, items) {
		this.g = g;
		this.config = config;
		this.items = items;

		this.oX = this.config.canvasWidth/2;
		this.oY = this.config.canvasHeight/2;

		this.max = this.getMax(this.items);
		this.count = Math.floor(this.max/this.config.interval) + 2;
		this.edge = this.count*this.config.interval;
	}

	private getMax(items): number {
		return items.length? _MAX(items.map(item => item.value)): 60;
	}

	private drawPolarNet() {
		let radius: number = 0;

		for(let i = 0; i < this.count; i ++) {
			radius = ((this.edge - i*this.config.interval)*this.config.defaultRadius)/this.edge;
			new DrawArc(this.g, radius, 360, false).render(this.oX, this.oY, '#ddd');
		}

		return this;
	}

	private drawText() {
		let radius: number = 0;

		this.g.save();
		this.g.font = '12px serif';
			
		for(let i = 0; i < this.count; i ++) {
			this.g.fillStyle = 'rgba(255, 255, 255, 0.5)';
			radius = ((this.edge - i*this.config.interval)*this.config.defaultRadius)/this.edge;
			this.g.fillRect(this.oX - 15, this.oY - radius - 10, 30, 20);
			this.g.fillStyle = '#666';
			this.g.textAlign = 'center';
			this.g.textBaseline = 'middle';
			this.g.fillText(this.edge - i*this.config.interval, this.oX, this.oY - radius)
		}

		this.g.restore();

		return this;	
	}

	public calc(v: number): number {
		return (v*this.config.defaultRadius)/this.edge;
	}

	public render() {
		this.drawPolarNet().drawText();
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
* @InitialChart: 所有图表的基础类，即所有图表都继承自这个类
*/

class InitialChart implements chartModule {

	protected g = null;
	protected config = null;

	protected data = [];
	protected items = [];

	protected coordinateSystem = null;
	protected radarSystem = null;
	protected polarSystem = null;

	constructor(Graphics, config) {
		this.g = Graphics;
		this.config = config;

		if(!this.config.items) {
			console.warn("'items' option is required.");
			return null;
		}

		if(this.config.chartType !== 'PieChart' && this.config.chartType !== 'AnnularChart') {
			if(this.config.interval === undefined) {
				console.warn("'interval' option is required.");
				return null;
			}
		}

		//默认开启网格
		this.config.grid = this.config.grid === undefined? true: this.config.grid;
		
		//默认开启测量线
		this.config.measureLine = this.config.measureLine === undefined? true: this.config.measureLine;

		//绑定鼠标事件
		this.bindMouseEvent();
		
		this.indexItem(this.config.items);
	}

	protected analyseItems(item, index: number) {};
	
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

	//结果渲染，将分析好的数据渲染出来
	/*
	* @parameter:
	* data: 已经经过analyseItems分析的数据，应为数组
	*/
	protected renderResult(data) {};


	//浮动提示框
	/*
	* @parameter:
	* x: 鼠标横坐标
	* y: 鼠标纵坐标
	* flag: 当前鼠标指向的项目的信息
	*/
	protected paintTipCase(x: number, y: number, flag) {};


	//鼠标选中项目效果处理
	/*
	* @parameter:
	* x: 鼠标横坐标
	* y: 鼠标纵坐标
	* data: 已经经过analyseItems分析的数据，应为数组
	*/
	protected mouseSelect(data, x: number, y: number) {};

	//真正的渲染函数，里面包含了图表所有内容的渲染，包括坐标轴，数据结果，交互提示，图表标题，项目标签等等，同时也是图表每次刷新要执行的函数
	/*
	* @parameter:
	* x: 鼠标横坐标
	* y: 鼠标纵坐标
	*/
	protected reRender(x: number, y: number) {};

	
	//为每一个项目标上索引
	protected indexItem(items) {
		items.map((item, index) => {
			item.index = index;
		});

		return this;
	}

	//入口
	render(itemList: string[]) {
		
		this.items = [];
		this.data = [];	

		itemList.map(label => {
			this.config.items.map(item => {
				if(item.label === label) {
					this.items.push(item);
				}
			});
		});
		
		this.items.sort((i1, i2) => i1.index - i2.index);

		/*
		* @DrawCoordinateSystem: 建立坐标系
		* 对象返回坐标系的信息，包括
		* 坐标真实原点
		* 坐标间隔
		* 坐标真实间隔
		*/
		this.g.clearRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);

		if(this.coordinateSystem) {
			this.coordinateSystem = new DrawCoordinateSystem(this.g, this.config, this.items);
		} 

		if(this.radarSystem) {
			this.radarSystem = new DrawRadarSystem(this.g, this.config, this.items);
		}

		if(this.polarSystem) {
			this.polarSystem = new DrawPolarSystem(this.g, this.config, this.items);
		}

		if(this.config.chartType === 'PieChart' || this.config.chartType === 'AnnularChart') {
			this.sortItem(this.items);
		}

		//遍历items分析数据
		this.items.map((item, index) => {
			this.data.push({
				ele: this.analyseItems(item, index),
				color: item.color,
				label: item.label
			});
		});

		//第一次渲染
		this.reRender(0, 0);

		return this;
	}

	//对项目进行排序
	protected sortItem(items) {
		items.sort((item1, item2) => item1.value - item2.value);
		return this;
	}

	addItem(item) {
		this.config.items.push(item);
		this.config.itemList.push(item.label);

		ChartUp.createTagItem(this.config.tagCon, item, this.config);

		this.render(this.config.itemList);
	};

	removeItem(label:string | number) {
		let index: number = 0;

		this.config.items.map((item, i) => {
			if(item.label === label) index = i;
		});

		this.config.items.splice(index, 1);

		this.config.itemList.splice(this.config.itemList.indexOf(label), 1);

		this.render(this.config.itemList);

		ChartUp.destoryTagItem(this.config.tagCon, label);
	}

	setItem(label: string | number, value) {
		this.config.items[this.config.items.map(item => item.label).indexOf(label)].value = value;

		this.render(this.config.itemList);
	}  
}





/*
* @BaseChart: 基本图表
*
* 新类型
* 就是一个基础直角坐标系，支持折线，方程
*
* 方法：
* render: 渲染整体
* drawCoordinateSystem: 直角坐标系
* drawGrid: 网格
* renderResult: 统计结果
*/
class BaseChart extends InitialChart {

	//默认半径
	protected defaultRadius = 3;

	protected coordinateSystem: any = true;

    constructor(Graphics, config: object) {
        super(Graphics, config);
		
		//设置默认半径
		if(this.config.defaultRadius) {
			this.defaultRadius = this.config.defaultRadius;
		}

    }

	protected reRender(x: number, y: number) {

		this.g.save();

		//绘制坐标轴
		this
			.paintGrid()
			.drawCoordinateSystem()
			.renderResult(this.data)
			.paintTargetLineX(x, y)
			.paintTargetLineY(x, y)
			.paintTipCase(x, y, this.mouseSelect(this.data, x, y));

		this.g.restore();
	}

	//绘制网格
	protected paintGrid() {

		this.g.save();
		this.config.grid && this.drawGridX().drawGridY();
		this.g.restore();

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

	
	//鼠标选中元素处理
	protected mouseSelect(circles, x: number, y: number) {
		//标志符：用作判断鼠标是否移到了圆点里面
		let flag: object = null;

		circles.map(cir => {
			if(typeof cir.ele !== 'function') {
				cir.ele.map(c => {	
					this.g.beginPath();
					this.g.arc(c.x, c.y, c.r + 2, 0, 2*Math.PI);
					if(this.g.isPointInPath(x, y)) {
						this.g.save();
						this.g.shadowOffsetX = 1;
						this.g.shadowOffsetY = 1;
						this.g.shadowBlur = 2;
						this.g.shadowColor = "rgba(0, 0, 0, 0.5)";
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
	protected paintTipCase(x: number, y: number, flag) {

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


	//分析点数据
	protected analyseItems(item, index: number) {
		let circleInfo = [];

		if(typeof item.value === 'function') {
			return item.value;
		}
		else {
			//遍历获取原点信息
			item.value.map((it, index) => {
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
		let cyc = new DrawArc(this.g, this.defaultRadius, 360),
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

    protected renderResult(data) {
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
* 继承自BaseChart
*
* 重写方法：
* analyseItems
* renderResult
* paintTipCase
*/
class PointChart extends BaseChart {

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
	protected analyseItems(item, index: number) {
		const radiusList = this.getRadius(item.value.map(i => i[2])),
			  circleInfo = [];
		
		//遍历获取原点信息
		item.value.map((it, index) => {
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
	protected renderResult(data) {

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
	protected paintTipCase(x: number, y: number, flag) {

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
* @AreaChart: 面积图表
* 继承自BaseChart
*
* 重写方法：
* reRender
* analyseItems
* paintTipCase
* mouseSelect
* paintGrid
* drawCoordinateSystem
* renderResult
*/

class AreaChart extends BaseChart {

	protected length: number = 0;
	protected interval: number = 0;

	protected defaultRadius: number = 4.5;

	constructor(Graphics, config) {
		super(Graphics, config);

		if(this.config.xAxis === undefined) {
			console.warn("'xAxis' option is required.");
			return null;
		}

		this.length = this.config.xAxis.length;
		this.config.length = this.length;
		
		this.checkDataIsComplete(this.config.items);
	}
		

	protected reRender(x: number, y: number) {
		
		this.g.save();

		//绘制坐标轴
		this
			.drawXaxis()
			.paintGrid()
			.drawCoordinateSystem()
			.renderResult(this.data)
			.paintTargetLineY(x, y)
			.paintTipCase(x, y, this.mouseSelect(this.data, x, y));

		this.g.restore();
	}

	//检查数据完整性
	protected checkDataIsComplete(items) {
		let diff: number = 0;

		items.map(item => {
			diff = this.length - item.value.length;

			if(diff > 0) {
				while(diff --) {
					item.value.push(0);
				}
			}
		});

		return this;
	}

	//分析点数据
	protected analyseItems(item, index: number) {

		let circleInfo = [];

		//遍历获取原点信息
		item.value.map((p, i) => {
			let pi = this.data.length > 0? this.data[index - 1].ele[i].cy + p: p,
				cyc = this.coordinateSystem.calc(0, pi);

			circleInfo.push({
				y: cyc.y,
				cy: pi,
				count: p
			});
		});

		return circleInfo;
	}


	//绘制坐标提升框
	protected paintTipCase(x: number, y: number, flag) {
	
		let sum: number = 0;

		if(x + 90 > this.coordinateSystem.rxEdge + 20) {
			x = this.coordinateSystem.rxEdge - 70;
		}

		if(this.isInChart(x, y)) {
			this.g.fillStyle = 'rgba(0, 0, 0, 0.7)';
	
			if(flag) {
				this.g.fillRect(x + 15, y, 80, 35 + this.items.length*20);
				this.g.font = '12px serif';
				this.g.fillStyle = '#fff';

				this.g.fillText(flag.xLabel, x + 20, y + 15);
				
				flag.points.map((p, i) => {
					this.g.fillText(`${p.label}: ${p.p.count}`, x + 20, 18 + y + (i + 1)*17);
					sum = sum + p.p.count;
				});

				this.g.fillText(`total: ${sum}`, x + 20, y + 25 + this.items.length*20);
				sum = 0;
			}
		}

		return this;
	}


	//鼠标选中元素处理
	protected mouseSelect(data, x: number, y: number) {
		//标志符：用作判断鼠标是否移到了圆点里面
		let flag: object = null;

		this.g.strokeStyle = '#000';

		this.g.setLineDash([4, 2]);
		this.g.strokeStyle = '#666';

		if(this.items.length) {
			data[0].ele.map((p, i) => {
				this.g.beginPath();
				this.g.rect(p.x - this.interval/2, this.coordinateSystem.ryEdge, this.interval, this.coordinateSystem.lY);
				
				if(this.g.isPointInPath(x, y)) {
					new DrawLine(this.g, p.x, this.coordinateSystem.ryEdge).end(p.x, this.coordinateSystem.oY);
	
					data.map(item => {
						return {
							p: item.ele[i],
							color: item.color
						};
					}).map(p => {
						new DrawArc(this.g, Math.floor(this.defaultRadius*1.4), 360)
							.render(p.p.x, p.p.y, p.color);
					})
	
					flag = {
						points: data.map(item => {
							return {
								p: item.ele[i],
								label: item.label
							};
						}),
						xLabel: this.config.xAxis[i] 
					};
				}
			});
		} 

		return flag;
	}


	//绘制网格
	protected paintGrid() {
		
		this.g.save();
		this.config.grid && this.drawGridY();
		this.g.restore();

		return this;
	}

	//绘制坐标轴
	protected drawCoordinateSystem() {
		this.coordinateSystem
			.rightAngle()
			.setYIntervalPoint()
			.baseLineX();

		return this;
	}

	//绘制x轴元素
	protected drawXaxis() {
		const interval = this.coordinateSystem.lX/(this.length - 1);
		this.interval = interval;

		this.g.save();
		this.g.textAlign = 'center';

		this.config.xAxis.map((gapName, index) => {
			let x = this.coordinateSystem.oX + index*interval;

			new DrawLine(this.g, x, this.coordinateSystem.oY)
				.end(x, this.coordinateSystem.oY + 5);

			this.data.map(item => {
				item.ele[index].x = x;
			});

			this.g.fillText(gapName, x, this.coordinateSystem.oY + 25);
		});

		this.g.restore();

		return this;
	}

	protected renderResult(data) {

		this.g.save();

		for(let j = 0; j < data.length ;j ++) {
			let line = null,
				cur = data[j],
				prev = j > 0? data[j - 1]: cur;

			for(let i = 0; i < cur.ele.length; i ++) {
				let c = cur.ele[i],
					p = prev.ele[i];

				this.g.fillStyle = cur.color;
				this.g.globalAlpha = 0.5;
				
				if(j === 0) {

					if(i === 0) {
						line = new DrawLine(this.g, this.coordinateSystem.oX, this.coordinateSystem.oY, prev.color)
							.next(p.x, p.y);
					}
					else if(i === prev.ele.length - 1) {
						line = line.next(p.x, p.y)
							.end(this.coordinateSystem.rxEdge, this.coordinateSystem.oY, true);
					}
					else {
						line = line.next(p.x, p.y);
					}
				}
				else {
					if(i === 0) {
						line = new DrawLine(this.g, p.x, p.y, cur.color)
							.next(c.x, c.y);
					}
					else if(i === cur.ele.length - 1) {
						line = line.next(c.x, c.y);

						for(let k = prev.ele.length - 1; k >=0; k --) {
							line = line.next(prev.ele[k].x, prev.ele[k].y);
						}

						line.end(cur.ele[0].x, cur.ele[0].y, true);
					}
					else {
						line = line.next(c.x, c.y);
					}
				}
			}
		}

		this.g.restore();

		//绘制圆环
		data.map(c => {
			c.ele.map(p => {
				new DrawArc(this.g, this.defaultRadius, 360).render(p.x, p.y, c.color);
			});
		});
		
		return this;
    }

}






/*
* @PillarChart: 柱状图表
* 继承自AreaChart
*
* 重写方法：
* analyseItems
* paintTipCase
* mouseSelect
* drawXaxis
* renderResult
*/
class PillarChart extends AreaChart {
	
	private width: number = 0;

	constructor(Graphics, config: object) {
		super(Graphics, config);

		//是否显示趋势线
		this.config.trendLine = this.config.trendLine === undefined? false: this.config.trendLine;
	}


	//分析点数据
	protected analyseItems(item, index: number) {
		let valueInfo = [];

		this.interval = this.coordinateSystem.lX/this.length;
		this.width = this.interval/(2*this.items.length + 1);

		item.value.map((v, i) => {
			let x = this.coordinateSystem.oX + i*this.interval + this.width*(2*index + 1),
				height = this.coordinateSystem.oY - this.coordinateSystem.calc(0, v).y;

			valueInfo.push({
				x: x,
				y: this.coordinateSystem.oY - height,
				width: this.width,
				height: height,
				value: v
			});
		});
		
		return valueInfo;
	}


	//绘制坐标提升框
	protected paintTipCase(x: number, y: number, flag) {
		
		if(x + 90 > this.coordinateSystem.rxEdge + 20) {
			x = this.coordinateSystem.rxEdge - 70;
		}

		if(this.isInChart(x, y)) {
			this.g.fillStyle = 'rgba(0, 0, 0, 0.7)';
	
			if(flag.data.length) {
				this.g.fillRect(x + 15, y, 80, 25 + this.items.length*20);
				this.g.font = '12px serif';
				this.g.fillStyle = '#fff';
				this.g.fillText(flag.xLabel, x + 20, y + 15);
				
				flag.data.map((v, i) => {
					this.g.fillText(`${v.label}: ${v.value}`, x + 20, y + 35 + i*20);
				});
			}
		}

		return this;
	}


	//鼠标选中元素处理
	protected mouseSelect(data, x: number, y: number) {
		//标志符：用作判断鼠标是否移到了圆点里面
		let flag = {
			data: [],
			xLabel: ''
		};

		if(this.items.length) {

			for(let i = 0; i < this.length; i ++) {
				let rx = this.coordinateSystem.oX + i*this.interval;
	
				this.g.beginPath();
				this.g.rect(rx, this.coordinateSystem.ryEdge, this.interval, this.coordinateSystem.lY);
	
				if(this.g.isPointInPath(x, y)) {
					this.g.save();
					this.g.fillStyle = _Gconfig.defaultColor;
					this.g.globalAlpha = 0.1;
					this.g.fill();
					
					data.map(rect => {
						flag.data.push({
							value: rect.ele[i].value,
							label: rect.label
						});
					});

					flag.xLabel = this.config.xAxis[i];
	
					this.g.restore();
				}
			}
		}

		return flag;
	}


	//绘制x轴元素
	protected drawXaxis() {
		const interval = this.interval;

		this.g.save();
		this.g.textAlign = 'center';

		this.config.xAxis.map((gapName, index) => {
			let x = this.coordinateSystem.oX + index*interval;

			new DrawLine(this.g, x, this.coordinateSystem.oY)
				.end(x, this.coordinateSystem.oY + 5);

			this.g.fillText(gapName, x + interval/2, this.coordinateSystem.oY + 25);
		});

		this.g.restore();

		return this;
	}

	protected renderResult(data) {
		data.map((rect, index) => {
			rect.ele.map((v, i) => {
				new DrawRect(this.g, v.width, v.height).render(v.x, v.y, rect.color);
			});
		});	
		return this;
	}
}


/*
* @LineChart: 折线图表
* 继承自AreaChart
*
* 重写方法：
* analyseItems
* paintTipCase
* drawXaxis
* renderResult
*/

class LineChart extends AreaChart {
	constructor(Graphics, config) {
		super(Graphics, config);
	}

	//绘制x轴元素
	protected drawXaxis() {
		const interval = this.interval;

		this.g.save();
		this.g.textAlign = 'center';

		this.config.xAxis.map((gapName, index) => {
			let x = this.coordinateSystem.oX + (index + 1)*interval;

			new DrawLine(this.g, x, this.coordinateSystem.oY)
				.end(x, this.coordinateSystem.oY + 5);

			this.data.map(item => {
				item.ele[index].x = x;
			});

			this.g.fillText(gapName, x, this.coordinateSystem.oY + 25);
		});

		this.g.restore();

		return this;
	}

	//分析点数据
	protected analyseItems(item, index: number) {
		
		let circleInfo = [];
		this.interval = this.coordinateSystem.lX/(this.length + 1);

		//遍历获取原点信息
		item.value.map((p, i) => {
			let cyc = this.coordinateSystem.calc(0, p),
				x = this.coordinateSystem.oX + this.interval + this.interval*i;

			circleInfo.push({
				x: x,
				y: cyc.y,
				value: p
			});
		});

		return circleInfo;
	}

	
	//绘制坐标提升框
	protected paintTipCase(x: number, y: number, flag) {

		if(x + 90 > this.coordinateSystem.rxEdge + 20) {
			x = this.coordinateSystem.rxEdge - 70;
		}

		if(this.isInChart(x, y)) {
			this.g.fillStyle = 'rgba(0, 0, 0, 0.7)';
	
			if(flag) {
				this.g.fillRect(x + 15, y, 80, 20 + this.items.length*20);
				this.g.font = '12px serif';
				this.g.fillStyle = '#fff';

				this.g.fillText(flag.xLabel, x + 20, y + 15);
				
				flag.points.map((p, i) => {
					this.g.fillText(`${p.label}: ${p.p.value}`, x + 20, 18 + y + (i + 1)*17);
				});
			}
		}

		return this;
	}


	protected renderResult(data) {
		let line = null,
			cyc = new DrawArc(this.g, this.defaultRadius, 360);

		data.map((p, index) => {
			p.ele.map((v, i) => {
				if(i === 0) {
					line = new DrawLine(this.g, v.x, v.y, p.color);
				}
				else if(i === p.ele.length - 1) {
					line = line.end(v.x, v.y);
				}
				else {
					line = line.next(v.x, v.y);
				}

				line.paint(cyc);
			});
		});	

		return this;
	}

}




/*
* 新类型
* @PieChart: 饼状图表
*/
class PieChart extends InitialChart {

	//图形默认半径
	protected radius: number = 120;

	//画布的中心点，用作圆心
	protected centerPoint: number[] = [];

	//数据总和
	protected total: number = 0;

	constructor(Graphics, config) {
		super(Graphics, config);

		//设置默认半径
		this.config.radius = this.config.radius === undefined? this.radius: this.config.radius;

		//计算中心点
		this.centerPoint = [this.config.canvasWidth/2, this.config.canvasHeight/2];
	}

	

	//数据分析函数，对用户输入的数据集进行分析运算
	protected analyseItems(item, index: number) {

		if(index === 0) {
			//计算总和
			this.total = _SUM(this.items.map(item => item.value));
		}

		return {
			value: item.value,
			angle: (item.value*360)/this.total,
			ratio: ((item.value/this.total)*100).toFixed(1) + '%'
		};
	};
	

	//结果渲染，将分析好的数据渲染出来
	protected renderResult(data) {
		let cir = null,
			startAngle: number = 0,
			endAngle: number = 0;

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

		this.g.strokeStyle = '#fff';
		this.g.lineWidth = 1.5;

		data.map((pie, index) => {
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
			this.g.arc(this.centerPoint[0], this.centerPoint[1], this.config.radius, _degree2Radian(startAngle), _degree2Radian(endAngle));
			this.g.closePath();
			this.g.stroke();
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
	protected paintTipCase(x: number, y: number, flag) {
		if(this.isInCircle(x, y)) {
			this.g.fillStyle = 'rgba(0, 0, 0, 0.5)';

			if(flag) {
				this.g.fillRect(x, y - 60, 110, 50);
				this.g.font = '12px serif';
				this.g.fillStyle = '#fff';
				this.g.fillText(`lable: ${flag.label}`, x + 10, y - 45);
				this.g.fillText(`data: ${flag.ele.value}`, x + 10, y - 30);
				this.g.fillText(`ratio: ${flag.ele.ratio}`, x + 10, y - 15);
			}
		}

		return this;
	};


	//鼠标选中项目效果处理
	protected mouseSelect(data, x: number, y: number) {
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

	protected reRender(x: number, y: number) {
		this.g.save();

		//绘制图表结果
		this
			.renderResult(this.data)
			.paintTipCase(x, y, this.mouseSelect(this.data, x, y));

		this.g.restore();
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
	protected mouseSelect(data, x: number, y: number) {
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
					this.g.save();
					this.g.globalAlpha = 0.5;
					this.g.fill();
					flag = pie;
					this.g.restore();
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
	protected paintTipCase(x: number, y: number, flag) {

		this.drawCenterCircle();

		if(this.isInAnnular(x, y)) {
			this.g.fillStyle = 'rgba(0, 0, 0, 0.5)';

			if(flag) {
				this.g.fillRect(x, y - 60, 110, 50);
				this.g.font = '12px serif';
				this.g.fillStyle = '#fff';
				this.g.fillText(`lable: ${flag.label}`, x + 10, y - 45);
				this.g.fillText(`data: ${flag.ele.value}`, x + 10, y - 30);
				this.g.fillText(`ratio: ${flag.ele.ratio}`, x + 10, y - 15);
			}
		}

		return this;
	};
}









/*
* 新类型
* @RadarChart: 雷达图表
*/

class RadarChart extends InitialChart {

	private defaultRadius: number = 200;
	private length: number = 0;

	protected radarSystem: any = true;

	constructor(Graphics, config) {
		super(Graphics, config);

		//index为必要配置项
		if(this.config.index === undefined) {
			console.warn("'index' option is required.");
			return null;
		}

		//设置默认半径
		this.defaultRadius = this.config.defaultRadius === undefined? this.defaultRadius: this.config.defaultRadius;
		this.config.defaultRadius = this.defaultRadius;

		this.length = this.config.index.length;

		this.config.centerX = this.config.canvasWidth/2;
		this.config.centerY = this.config.canvasHeight/2;

		this.checkDataIsComplete(this.config.items);
	}

	//检查数据完整性
	protected checkDataIsComplete(items) {
		let diff: number = 0;

		items.map(item => {
			diff = this.length - item.value.length;

			if(diff > 0) {
				while(diff --) {
					item.value.push(0);
				}
			}
		});

		return this;
	}

	//绘制雷达网
	private drawRadarNet(index) {
		this.radarSystem.render();
		return this;
	}

	protected analyseItems(item, index: number) {
		let valueList = [];

		item.value.map((v, i) => {
			let d = this.radarSystem.calc(v, i);

			valueList.push({
				x: d.x,
				y: d.y,
				value: v
			});
		});

		return valueList;
	};
	  

	protected renderResult(data) {
		let line = null;

		this.g.save();

		this.g.globalAlpha = 0.7;

		data.map(d => {
			this.g.fillStyle = d.color;
			d.ele.map((p, i) => {
				if(i === 0) {
					line = new DrawLine(this.g, p.x, p.y, d.color);
				}
				else if(i === d.ele.length - 1) {
					line = line.end(p.x, p.y, true);
				}
				else {
					line = line.next(p.x, p.y);
				}
			});
		});

		this.g.restore();

		data.map(d => {
			d.ele.map(p => {
				new DrawArc(this.g, 3, 360).render(p.x, p.y, d.color);
			});
		});

		return this;
	};


	//浮动提示框
	protected paintTipCase(x: number, y: number, flag) {
		
		this.g.fillStyle = 'rgba(0, 0, 0, 0.5)';

		if(flag) {
			this.g.fillRect(x + 15, y, 110, 30 + this.config.index.length*20);
			this.g.font = '12px serif';
			this.g.fillStyle = '#fff';
			this.g.fillText(`lable: ${flag.label}`, x + 20, y + 20);

			this.config.index.map((t, i) => {
				this.g.fillText(`${t}: ${flag.ele[i].value}`, x + 20, y + 40 + i*20);
			});
		}
		
		return this;
	};


	//鼠标选中项目效果处理
	protected mouseSelect(data, x: number, y: number) {
		//标志符：用作判断鼠标是否移到了圆点里面
		let flag: object = null,
			startAngle: number = 0,
			endAngle: number = 0;
		
		data.map((d, index) => {

			this.g.save();

			this.g.fillStyle = d.color;
		
			this.g.beginPath();

			d.ele.map((v, i) => {
				if(i === 0) {
					this.g.moveTo(v.x, v.y);
				}
				else {
					this.g.lineTo(v.x, v.y);
				}
			});
			
			this.g.closePath();

			if(this.g.isPointInPath(x, y)) {
				this.g.globalAlpha = 0.7;
				this.g.fill();
				flag = d;
			}

			this.g.restore();
		});
		
		return flag;
	};


	protected reRender(x: number, y: number) {
		this.g.save();

		//绘制图表结果
		this
			.drawRadarNet(this.config.index)
			.renderResult(this.data)
			.paintTipCase(x, y, this.mouseSelect(this.data, x, y));
 
		this.g.restore();
	};
}




/*
* 新类型
* @PolarChart: 极地图表
*/

class PolarChart extends InitialChart {
	private defaultRadius: number = 250;

	protected polarSystem: any = true;
	private margin = 3;

	constructor(Graphics, config) {
		super(Graphics, config);
		
		//设置默认半径
		this.defaultRadius = this.config.defaultRadius === undefined? this.defaultRadius: this.config.defaultRadius;
		this.config.defaultRadius = this.defaultRadius;
	}

	//绘制雷达网
	private drawPolarNet() {
		this.polarSystem.render();
		return this;
	}

	//判断鼠标是否在圆内
	private isInCircle(x: number, y: number) {
		this.g.beginPath();
		this.g.arc(this.polarSystem.oX, this.polarSystem.oY, this.defaultRadius, 0, 2*Math.PI);
		return this.g.isPointInPath(x, y);
	}

	//绘制测量线
	private paintTargetLine(x: number, y: number) {
		const radius = Math.sqrt(Math.abs((Math.pow(x - this.polarSystem.oX, 2) + Math.pow(y - this.polarSystem.oY, 2))));

		if(this.isInCircle(x, y)) {
			this.g.save();
			
			this.g.setLineDash([4, 2]);
			new DrawArc(this.g, radius, 360, false).render(this.polarSystem.oX, this.polarSystem.oY, '#bbb');
			new DrawLine(this.g, this.polarSystem.oX, this.polarSystem.oY, '#bbb').end(x, y);
	
			this.g.restore();
		}

		return this;
	}


	//鼠标选中项目效果处理
	protected mouseSelect(data, x: number, y: number) {
		//标志符：用作判断鼠标是否移到了扇形里面
		let flag: object = null,
			angle = Math.PI*2/this.items.length;
		
		this.g.save();

		this.g.translate(this.polarSystem.oX, this.polarSystem.oY);
		//this.g.globalAlpha = 0.5;

		data.map((d, index) => {
			this.g.fillStyle = d.color;
			this.g.rotate(angle);

			this.g.beginPath();
			this.g.moveTo(3, 3);
			this.g.arc(3, 3, d.ele.radius - this.margin, 0, angle);
			this.g.closePath();

			if(this.g.isPointInPath(x, y)) {
				this.g.fill();
				flag = d;
			}
		});
		
		this.g.restore();

		return flag;
	};


	//浮动提示框
	protected paintTipCase(x: number, y: number, flag) {
		const radius = Math.sqrt(Math.abs((Math.pow(x - this.polarSystem.oX, 2) + Math.pow(y - this.polarSystem.oY, 2))));	

		this.g.fillStyle = 'rgba(0, 0, 0, 0.5)';
		this.g.font = '12px serif';

		if(this.isInCircle(x, y)) {
			if(flag) {
				this.g.fillRect(x + 15, y, 80, 50);
				this.g.font = '12px serif';
				this.g.fillStyle = '#fff';
				this.g.fillText(`lable: ${flag.label}`, x + 20, y + 20);
				this.g.fillText(`value: ${flag.ele.value}`, x + 20, y + 40);
			}
			else {
				this.g.fillRect(x + 15, y, 50, 20);
				this.g.fillStyle = '#fff';
				this.g.fillText(((radius*this.polarSystem.edge)/this.defaultRadius).toFixed(2), x + 20, y + 15);
			}
		}
		
		return this;
	};


	protected reRender(x: number, y: number) {
		this.g.save();

		//绘制图表结果
		this
			.drawPolarNet()
			.renderResult(this.data)
			.paintTargetLine(x, y)
			.paintTipCase(x, y, this.mouseSelect(this.data, x, y));
 
		this.g.restore();
	};

	protected analyseItems(item) {
		return {
			radius: this.polarSystem.calc(item.value),
			value: item.value
		};
	}

	protected renderResult(data) {
		let angle: number = (Math.PI*2)/this.items.length,
			pi2: number = Math.PI/2, 
			x: number = 0,
			y: number = 0;

		this.g.save();

		this.g.translate(this.polarSystem.oX, this.polarSystem.oY);
		this.g.globalAlpha = 0.5;

		data.map((r, i) => {
			this.g.rotate(angle);
			new DrawArc(this.g, r.ele.radius - this.margin, 360/this.items.length).render(3, 3, r.color);
		});

		this.g.restore();

		return this;
	}

}


/*------------------------------图表类-END----------------------------------- */






//扩展: 基础图表
ChartUp.extend({
	chartType: 'BaseChart',
	chartClass: BaseChart
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

//扩展: 折线图表
ChartUp.extend({
	chartType: 'LineChart',
	chartClass: LineChart
});

//扩展: 面积图表
ChartUp.extend({
	chartType: 'AreaChart',
	chartClass: AreaChart
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


//扩展: 雷达图表
ChartUp.extend({
	chartType: 'RadarChart',
	chartClass: RadarChart
});


//扩展: 极地图表
ChartUp.extend({
	chartType: 'PolarChart',
	chartClass: PolarChart
});



window['Chart'] = ChartUp;
return ChartUp;

})(window);





//es6 module  
//export default ChartUp;

