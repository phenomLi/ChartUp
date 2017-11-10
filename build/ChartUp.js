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
/***/ (function(module, exports) {

/*
* version: 0.0.1
* A javascript framework for building visual data. From phenom.
* 11.9.2017
*/
/*
* 暴露Chart到全局
*/
var ChartUp = (function (window) {
    //角度转弧度制
    var _degree2Radian = function (degree) {
        return Math.PI * (degree / 180);
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
    * @DrawCoordinateSystem: 画直角坐标系
    * render
    */
    var DrawCoordinateSystem = /** @class */ (function () {
        function DrawCoordinateSystem(g, config) {
            this.g = null;
            this.config = null;
            //设置坐标系与canvas边缘的距离
            this.marginTop = 45;
            this.marginLeft = 45;
            this.marginBottom = 45;
            this.g = g;
            this.config = config;
        }
        DrawCoordinateSystem.prototype.render = function () {
            var oX = this.marginLeft, oY = this.config.canvasHeight - this.marginBottom;
            new DrawLine(this.g, this.marginLeft, this.marginTop)
                .next(oX, oY)
                .end(this.config.canvasWidth, oY);
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
    /*---------------------------------------------*/
    var config = {
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
    var LineChart = /** @class */ (function () {
        function LineChart(Graphics, config) {
            this.g = null;
            this.config = {};
            this.g = Graphics;
            this.config = config;
        }
        LineChart.prototype.init = function () {
        };
        LineChart.prototype.drawCoordinateSystem = function () {
        };
        LineChart.prototype.drawGrid = function () {
        };
        LineChart.prototype.renderResult = function () {
        };
        return LineChart;
    }());
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
                new chartConfig.chartClass(Graphics, config);
            };
        };
        return ChartPrototype;
    }());
    //实例化Chart
    var Chart = new ChartPrototype();
    //扩展: 折线类图表
    Chart.extend({
        chartType: 'LineChart',
        chartClass: LineChart
    });
    var canvas = document.getElementById('canvas');
    var g = canvas.getContext('2d');
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
    new DrawCoordinateSystem(g, {
        canvasWidth: 400,
        canvasHeight: 300
    }).render();
    window['Chart'] = Chart;
    return Chart;
})(window);
//const c = new Chart('#d');


/***/ })
/******/ ]);