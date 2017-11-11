/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
* version: 0.0.1
* A javascript framework for building visual data. From phenom.
* 11.9.2017
*/
exports.__esModule = true;
/*
* 暴露Chart到全局
*/
var ChartUp = (function (window) {
    //默认颜色: 黑
    var defaultColor = '#333';
    //角度转弧度制
    var _degree2Radian = function (degree) {
        return Math.PI * (degree / 180);
    };
    //找出数组中的最大值
    var _MAX = function (arr) {
        return Math.max.apply(Math, arr);
    };
    /*--------------------工具方法---------------------*/
    /*
    * @DrawLine: 对canvas路径api的一个封装
    * reLine: 在改变颜色时，重新渲染路径
    * next: 下一个坐标点
    * end: 最后一个坐标点
    * paint: 画形状
    */
    var DrawLine = /** @class */ (function () {
        function DrawLine(g, x, y, color) {
            this.g = null;
            this.currentPoint = [];
            this.color = '';
            this.g = g;
            this.color = color;
            this.color && (this.g.strokeStyle = this.color);
            //开始描绘路径
            this.g.beginPath();
            //确定起点
            this.g.moveTo(x, y);
            this.currentPoint = [x, y];
        }
        DrawLine.prototype.reLine = function (color) {
            this.color = color;
            this.g.stroke();
            this.g.strokeStyle = this.color;
            this.g.beginPath();
            this.g.moveTo(this.currentPoint[0], this.currentPoint[1]);
        };
        DrawLine.prototype.next = function (x, y, color) {
            if (color) {
                this.reLine(color);
            }
            ;
            this.g.lineTo(x, y);
            this.currentPoint = [x, y];
            return this;
        };
        DrawLine.prototype.paint = function (shape) {
            //结束直线
            this.g.stroke();
            //开始描绘图形
            shape.render(this.currentPoint[0], this.currentPoint[1], this.color);
            //继续接上直线
            this.g.beginPath();
            this.g.moveTo(this.currentPoint[0], this.currentPoint[1]);
            return this;
        };
        DrawLine.prototype.end = function (x, y, isClose, color) {
            if (isClose === void 0) { isClose = false; }
            if (color) {
                this.reLine(color);
            }
            ;
            this.g.lineTo(x, y);
            this.currentPoint = [x, y];
            isClose && this.g.closePath();
            this.g.stroke();
            return this;
        };
        return DrawLine;
    }());
    /*
    * @DrawArc: 对canvas圆弧api的一个封装
    * render: 确定图形坐标，颜色，是否填充
    */
    var DrawArc = /** @class */ (function () {
        function DrawArc(g, radius, startAngle, endAngle, soild) {
            if (soild === void 0) { soild = true; }
            this.g = null;
            this.radius = 0;
            this.startAngle = 0;
            this.endAngle = 0;
            this.isSoild = true;
            this.g = g;
            this.radius = radius;
            this.startAngle = _degree2Radian(startAngle);
            this.endAngle = _degree2Radian(endAngle);
            this.isSoild = soild;
        }
        DrawArc.prototype.render = function (x, y, color) {
            if (color) {
                this.isSoild ?
                    this.g.fillStyle = color :
                    this.g.strokeStyle = color;
            }
            this.g.beginPath();
            this.g.arc(x, y, this.radius, this.startAngle, this.endAngle);
            this.isSoild ?
                this.g.fill() :
                this.g.stroke();
        };
        return DrawArc;
    }());
    /*
    * @DrawTitle: 描绘图表标题
    */
    var DrawTitle = /** @class */ (function () {
        function DrawTitle(g, text) {
            this.g = null;
            this.g = g;
            this.g.font = '24px 微软雅黑';
            this.g.textAlign = 'start';
            this.g.textBaseline = 'top';
            this.g.fillStyle = defaultColor;
            this.text = text;
        }
        DrawTitle.prototype.render = function (x, y, color) {
            color && (this.g.fillStyle = color);
            this.g.fillText(this.text, x, y);
        };
        return DrawTitle;
    }());
    /*
    * @DrawCoordinateSystem: 画直角坐标系
    * rightAngle: 画出垂直相交的x，y坐标
    * setIntervalPoint: 画出x，y坐标的间隔点
    * CoordinateSystemText: 画出间隔点的值
    * calculator: 将定义的坐标点转换为该坐标系的真实坐标点
    * render: 渲染整体
    */
    var DrawCoordinateSystem = /** @class */ (function () {
        function DrawCoordinateSystem(g, config) {
            this.g = null;
            this.config = null;
            //设置坐标系与canvas边缘的距离
            this.marginTop = 45;
            this.marginLeft = 45;
            this.marginBottom = 45;
            //真实原点
            this.oX = 0;
            this.oY = 0;
            //定义的原点
            this.xOrigin = 0;
            this.yOrigin = 0;
            //真实直角坐标长度
            this.lX = 0;
            this.lY = 0;
            //坐标的x，y边界值
            this.xEdge = 0;
            this.yEdge = 0;
            //真实坐标间隔
            this.rxIntervals = [];
            this.ryIntervals = [];
            //定义的坐标间隔
            this.xIntervals = [];
            this.yIntervals = [];
            this.g = g;
            this.config = config;
            this.oX = this.marginLeft;
            this.oY = this.config.canvasHeight - this.marginBottom;
            this.lX = this.config.canvasWidth - this.marginLeft - 20;
            this.lY = this.oY - this.marginTop - 20;
        }
        DrawCoordinateSystem.prototype.rightAngle = function () {
            new DrawLine(this.g, this.marginLeft, this.marginTop)
                .next(this.oX, this.oY)
                .end(this.config.canvasWidth, this.oY);
            return this;
        };
        DrawCoordinateSystem.prototype.setIntervalPoint = function (items) {
            var xInterval = this.config.interval[0], yInterval = this.config.interval[1], xOrigin = this.config.origin[0], yOrigin = this.config.origin[1];
            var xEdge = 0, yEdge = 0;
            //判断items是否为数组
            if (items instanceof Array) {
                xEdge = _MAX(items.map(function (item) { return _MAX(item.points.map(function (p) { return p[0]; })); })) + xInterval;
                yEdge = _MAX(items.map(function (item) { return _MAX(item.points.map(function (p) { return p[1]; })); })) + yInterval;
            }
            else {
                xEdge = _MAX(items.points.map(function (p) { return p[0]; })) + xInterval;
                yEdge = _MAX(items.points.map(function (p) { return p[1]; })) + yInterval;
            }
            var xLength = xEdge - xOrigin, yLength = yEdge - yOrigin, xCount = Math.floor(xLength / xInterval), yCount = Math.floor(yLength / yInterval);
            this.xEdge = xEdge;
            this.yEdge = yEdge;
            this.xOrigin = xOrigin;
            this.yOrigin = yOrigin;
            //标出坐标原点
            this.coordinateSystemText("(" + xOrigin + ", " + yOrigin + ")", this.oX, this.oY + 15);
            //画出X轴的断点
            for (var i = 1; i <= xCount; i++) {
                //计算每一个断点到原点距离
                var index = i * Math.floor(this.lX / xCount);
                //在该断点画一个小线
                new DrawLine(this.g, this.oX + index, this.oY).end(this.oX + index, this.oY + 5);
                //将每一个断点保存起来
                this.rxIntervals.push(this.oX + index);
                this.yIntervals.push(i * xInterval + xOrigin);
                //标上值
                this.coordinateSystemText(i * xInterval + xOrigin, this.oX + index, this.oY + 15);
            }
            //画出y轴的断点
            for (var i = 1; i <= yCount; i++) {
                //计算每一个断点到原点距离
                var index = i * Math.floor(this.lY / yCount);
                //在该断点画一个小线
                new DrawLine(this.g, this.oX - 5, this.oY - index).end(this.oX, this.oY - index);
                //将每一个断点保存起来
                this.ryIntervals.push(this.oY - index);
                this.yIntervals.push(i * yInterval + yOrigin);
                //标上值
                this.coordinateSystemText(i * yInterval + yOrigin, this.oX - 15, this.oY - index);
            }
            return this;
        };
        //画出直角坐标的坐标值
        DrawCoordinateSystem.prototype.coordinateSystemText = function (text, x, y) {
            this.g.textAlign = 'center';
            this.g.textBaseline = 'middle';
            this.g.fillText(text, x, y);
        };
        //将定义的坐标点转换为该坐标系的真实坐标点
        DrawCoordinateSystem.prototype.calc = function (x, y) {
            return {
                x: this.oX + Math.floor(((x - this.xOrigin) * this.lX) / (this.xEdge - this.xOrigin)),
                y: this.oY - Math.floor(((y - this.yOrigin) * this.lY) / (this.yEdge - this.yOrigin))
            };
        };
        DrawCoordinateSystem.prototype.render = function () {
            this.rightAngle().setIntervalPoint(this.config.items);
        };
        return DrawCoordinateSystem;
    }());
    /*
    * @Animate: canvas动画的一个封装
    * next: 下一个坐标点
    * end: 最后一个坐标点
    */
    var Animate = /** @class */ (function () {
        function Animate() {
        }
        return Animate;
    }());
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
    var LineChart = /** @class */ (function () {
        function LineChart(Graphics, config) {
            this.g = null;
            this.config = null;
            this.coordinateSystem = null;
            this.g = Graphics;
            this.config = config;
            //默认原点为(0, 0)
            this.config.origin = this.config.origin ? this.config.origin : [0, 0];
            //默认开启网格
            this.config.grid = this.config.grid ? this.config.grid : true;
            //间隔和坐标点参数为必要参数
            if (!this.config.interval) {
                console.warn("'interval' option is required.");
                return null;
            }
            if (!this.config.items) {
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
        LineChart.prototype.render = function () {
            var _this = this;
            this.drawCoordinateSystem();
            //若设置网格，则描绘网格
            this.config.grid && this.drawGrid();
            if (this.config.items instanceof Array) {
                this.config.items
                    .map(function (item) { _this.renderResult(item.points, item.color ? item.color : defaultColor); });
            }
            else {
                this.renderResult(this.config.items.points, this.config.items.color ? this.config.items.color : defaultColor);
            }
            //若设置标题，则描绘标题
            this.config.title && new DrawTitle(this.g, this.config.title).render(40, 5);
        };
        LineChart.prototype.drawCoordinateSystem = function () {
            this.coordinateSystem.render();
            return this;
        };
        //画网格
        LineChart.prototype.drawGrid = function () {
            var xLength = this.coordinateSystem.rxIntervals.length, yLength = this.coordinateSystem.ryIntervals.length, topBoundary = this.coordinateSystem.ryIntervals[yLength - 1], rightBoundary = this.coordinateSystem.rxIntervals[xLength - 1];
            //画出网格中纵向的线
            for (var i = 0; i < xLength; i++) {
                new DrawLine(this.g, this.coordinateSystem.rxIntervals[i], this.coordinateSystem.oY, '#eee')
                    .end(this.coordinateSystem.rxIntervals[i], topBoundary);
            }
            //画出网格中横向的线
            for (var i = 0; i < yLength; i++) {
                new DrawLine(this.g, this.coordinateSystem.oX, this.coordinateSystem.ryIntervals[i], '#eee')
                    .end(rightBoundary, this.coordinateSystem.ryIntervals[i]);
            }
            return this;
        };
        LineChart.prototype.renderResult = function (points, color) {
            //画第一个点
            var p = this.coordinateSystem.calc(points[0][0], points[0][1]), cyc = new DrawArc(this.g, 3, 0, 360), line = new DrawLine(this.g, p.x, p.y, color).paint(cyc);
            //继续画接下去的点
            for (var i = 1, length_1 = points.length; i < length_1; i++) {
                p = this.coordinateSystem.calc(points[i][0], points[i][1]);
                i === length_1 ? line.next(p.x, p.y) : line.end(p.x, p.y);
                //画小点
                line.paint(cyc);
            }
            return this;
        };
        return LineChart;
    }());
    /*------------------------------图表类-END----------------------------------- */
    /*---------------------------ChartUp主类------------------------------- */
    var ChartPrototype = /** @class */ (function () {
        //entrance
        function ChartPrototype() {
            //暴露的工具方法集
            this.fn = {};
            this.fn = {
                //画线方法，返回DrawLine类的实例
                drawLine: function (Graphics, x, y, color) {
                    return new DrawLine(Graphics, x, y, color);
                },
                //动画方法
                animate: function () {
                }
            };
        }
        /*
        * @extend: 扩展方法
        * @parameter: chartConfig
        *
        * 包含:
        * 1.chartType: 用作定义扩展图表的名称
        * 2.chartConfig: 定义扩展图表具体类的实例
        */
        ChartPrototype.prototype.extend = function (chartConfig) {
            if (!chartConfig.chartType) {
                console.warn("'chartType' option is required.");
                return false;
            }
            if (!chartConfig.chartClass) {
                console.warn("'chartClass' option is required.");
                return false;
            }
            this[chartConfig.chartType] = function (canvas, config) {
                var Graphics = canvas.getContext('2d');
                //获取canvas画布的宽高
                config['canvasWidth'] = canvas.offsetWidth;
                config['canvasHeight'] = canvas.offsetHeight;
                return new chartConfig.chartClass(Graphics, config);
            };
        };
        return ChartPrototype;
    }());
    //实例化Chart
    var ChartUp = new ChartPrototype();
    //扩展: 折线类图表
    ChartUp.extend({
        chartType: 'LineChart',
        chartClass: LineChart
    });
    /*------------------------------模拟使用------------------------------------ */
    var canvas1 = document.getElementById('canvas1');
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
exports["default"] = ChartUp;


/***/ })
/******/ ]);