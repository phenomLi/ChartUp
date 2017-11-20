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
* - ChartUp -
* version: 0.0.2
* A javascript library for building visual data. From phenom.
* start on 11.9.2017
*/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
/*
* 暴露Chart到全局
*/
var ChartUp = (function (window) {
    //全局设置
    var _Gconfig = {
        defaultColor: '#000',
        edge: [20, 20]
    };
    //角度转弧度制
    var _degree2Radian = function (degree) {
        return Math.PI * (degree / 180);
    };
    //找出数组中的最大值
    var _MAX = function (arr) {
        return Math.max.apply(Math, arr);
    };
    //找出数组中的最小值
    var _MIN = function (arr) {
        return Math.min.apply(Math, arr);
    };
    //数组求和
    var _SUM = function (arr) {
        return arr.length ? arr.reduce(function (prev, cur, index, arr) { return prev + cur; }) : 0;
    };
    /*--------------------工具方法---------------------*/
    /*
    * @DrawLine: 对canvas路径api的一个封装
    * reLine: 在改变颜色时，重新渲染路径
    * next: 下一个坐标点
    * end: 最后一个坐标点
    * paint: 绘制形状
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
        function DrawArc(g, radius, angle, soild) {
            if (soild === void 0) { soild = true; }
            this.g = null;
            this.radius = 0;
            this.startAngle = 0;
            this.endAngle = 0;
            this.isSoild = true;
            this.x = 0;
            this.y = 0;
            this.isDrawCircle = false;
            this.g = g;
            this.radius = radius;
            this.startAngle = 0;
            this.endAngle = _degree2Radian(angle);
            this.isSoild = soild;
            angle === 360 && (this.isDrawCircle = true);
        }
        DrawArc.prototype.next = function (angle, color) {
            this.startAngle = this.endAngle;
            this.endAngle = this.endAngle + _degree2Radian(angle);
            this.render(this.x, this.y, color);
            return this;
        };
        DrawArc.prototype.render = function (x, y, color) {
            this.x = x;
            this.y = y;
            if (color) {
                this.isSoild ?
                    this.g.fillStyle = color :
                    this.g.strokeStyle = color;
            }
            this.g.beginPath();
            !this.isDrawCircle && this.g.moveTo(this.x, this.y);
            this.g.arc(this.x, this.y, this.radius, this.startAngle, this.endAngle);
            this.g.closePath();
            this.isSoild ?
                this.g.fill() :
                this.g.stroke();
            return this;
        };
        return DrawArc;
    }());
    /*
    * @DrawArc: 对canvas矩形api的一个封装
    * render: 确定矩形坐标，颜色，是否填充
    */
    var DrawRect = /** @class */ (function () {
        function DrawRect(g, width, height, soild) {
            if (soild === void 0) { soild = true; }
            this.g = null;
            this.width = 0;
            this.height = 0;
            this.isSoild = true;
            this.g = g;
            this.isSoild = soild;
            this.width = width;
            this.height = height;
        }
        DrawRect.prototype.render = function (x, y, color) {
            if (color) {
                this.isSoild ?
                    this.g.fillStyle = color :
                    this.g.strokeStyle = color;
            }
            this.g.beginPath();
            this.g.rect(x, y, this.width, this.height);
            this.isSoild ?
                this.g.fill() :
                this.g.stroke();
        };
        return DrawRect;
    }());
    /*
    * @DrawTitle: 描绘图表标题
    */
    var DrawTitle = /** @class */ (function () {
        function DrawTitle(g, text) {
            this.g = null;
            this.g = g;
            this.g.font = '24px 微软雅黑';
            this.g.fillStyle = _Gconfig.defaultColor;
            this.text = text;
        }
        DrawTitle.prototype.render = function (x, y, color) {
            color && (this.g.fillStyle = color);
            this.g.fillText(this.text, x, y);
        };
        return DrawTitle;
    }());
    /*
    * @DrawCoordinateSystem: 绘制直角坐标系
    * rightAngle: 绘制出垂直相交的x，y坐标
    * setIntervalPoint: 绘制出x，y坐标的间隔点
    * CoordinateSystemText: 绘制出间隔点的值
    * calculator: 将定义的坐标点转换为该坐标系的真实坐标点
    * render: 渲染整体
    */
    var DrawCoordinateSystem = /** @class */ (function () {
        function DrawCoordinateSystem(g, config, items) {
            this.g = null;
            this.config = null;
            this.items = [];
            //设置坐标系与canvas边缘的距离
            this.margin = 45;
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
            //坐标的真实x, y边界值
            this.rxEdge = 0;
            this.ryEdge = 0;
            //真实坐标间隔
            this.rxIntervals = [];
            this.ryIntervals = [];
            //定义的坐标间隔
            this.xIntervals = [];
            this.yIntervals = [];
            this.xCount = 0;
            this.yCount = 0;
            this.xInterval = 0;
            this.yInterval = 0;
            this.g = g;
            this.config = config;
            this.items = items;
            this.oX = this.margin;
            this.oY = this.config.canvasHeight - this.margin;
            this.lX = this.config.canvasWidth - this.oX - 20 - this.margin;
            this.lY = this.oY - this.margin - 20;
            this.rxEdge = this.oX + this.lX;
            this.ryEdge = this.oY - this.lY;
            this.xInterval = this.config.interval[0],
                this.yInterval = this.config.interval[1];
            var xMax = this.getMax(this.items, 'x'), yMax = this.getMax(this.items, 'y'), xMin = Math.ceil(this.getMin(this.items, 'x')), yMin = Math.ceil(this.getMin(this.items, 'y'));
            this.xOrigin = xMin - this.xInterval,
                this.yOrigin = yMin - this.yInterval;
            var xLength = xMax - this.xOrigin, yLength = yMax - this.yOrigin;
            this.xCount = Math.floor(xLength / this.xInterval) + 1,
                this.yCount = Math.floor(yLength / this.yInterval) + 1;
            this.xEdge = this.xInterval * this.xCount + this.xOrigin,
                this.yEdge = this.yInterval * this.yCount + this.yOrigin;
            for (var i = 1; i <= this.xCount; i++) {
                //计算每一个断点到原点距离
                var index = i * (this.lX / this.xCount);
                //将每一个断点保存起来
                this.rxIntervals.push(this.oX + index);
                this.yIntervals.push(i * this.xInterval + this.xOrigin);
            }
            for (var i = 1; i <= this.yCount; i++) {
                //计算每一个断点到原点距离
                var index = i * (this.lY / this.yCount);
                //将每一个断点保存起来
                this.ryIntervals.push(this.oY - index);
                this.yIntervals.push(i * this.yInterval + this.yOrigin);
            }
        }
        //绘制x=0轴
        DrawCoordinateSystem.prototype.baseLineX = function () {
            var y = this.calc(0, 0)['y'], start = this.calc(this.xOrigin, 0)['x'];
            this.g.save();
            this.g.lineWidth = 2;
            if (this.yOrigin < 0) {
                new DrawLine(this.g, start, y, '#999')
                    .end(this.rxEdge, y);
            }
            this.g.restore();
            return this;
        };
        //绘制y=0轴
        DrawCoordinateSystem.prototype.baseLineY = function () {
            var x = this.calc(0, 0)['x'], start = this.calc(0, this.yOrigin)['y'];
            this.g.save();
            this.g.lineWidth = 2;
            if (this.xOrigin < 0) {
                new DrawLine(this.g, x, start, '#999')
                    .end(x, this.ryEdge);
            }
            this.g.restore();
            return this;
        };
        DrawCoordinateSystem.prototype.rightAngle = function () {
            new DrawLine(this.g, this.margin, this.margin)
                .next(this.oX, this.oY)
                .end(this.config.canvasWidth - this.margin, this.oY);
            return this;
        };
        DrawCoordinateSystem.prototype.setXIntervalPoint = function () {
            //标出坐标原点
            this.coordinateSystemText("(" + this.xOrigin + ", " + this.yOrigin + ")", this.oX, this.oY + 15);
            //绘制出X轴的断点
            for (var i = 1; i <= this.xCount; i++) {
                //计算每一个断点到原点距离
                var index = i * (this.lX / this.xCount);
                //在该断点绘制一个小线
                new DrawLine(this.g, this.oX + index, this.oY).end(this.oX + index, this.oY + 5);
                //标上值
                this.coordinateSystemText(i * this.xInterval + this.xOrigin, this.oX + index, this.oY + 15);
            }
            return this;
        };
        DrawCoordinateSystem.prototype.setYIntervalPoint = function () {
            //绘制出y轴的断点
            for (var i = 1; i <= this.yCount; i++) {
                //计算每一个断点到原点距离
                var index = i * (this.lY / this.yCount);
                //在该断点绘制一个小线
                new DrawLine(this.g, this.oX - 5, this.oY - index).end(this.oX, this.oY - index);
                //标上值
                this.coordinateSystemText(i * this.yInterval + this.yOrigin, this.oX - 15, this.oY - index);
            }
            return this;
        };
        //绘制出直角坐标的坐标值
        DrawCoordinateSystem.prototype.coordinateSystemText = function (text, x, y) {
            this.g.save();
            this.g.textAlign = 'center';
            this.g.textBaseline = 'middle';
            this.g.fillText(text, x, y);
            this.g.restore();
        };
        //将定义的坐标点转换为该坐标系的真实坐标点
        DrawCoordinateSystem.prototype.calc = function (x, y) {
            return {
                x: this.oX + ((x - this.xOrigin) * this.lX) / (this.xEdge - this.xOrigin),
                y: this.oY - ((y - this.yOrigin) * this.lY) / (this.yEdge - this.yOrigin)
            };
        };
        //获取坐标点的最大值
        DrawCoordinateSystem.prototype.getMax = function (items, dir) {
            var flag = dir === 'x' ? 0 : 1;
            if (items.length === 0) {
                return _Gconfig.edge[flag];
            }
            //若是柱状图表，则没有x轴的断点，只需要y轴
            if (this.config.chartType === 'PillarChart') {
                var pointsArr_1 = [];
                items.map(function (item) {
                    pointsArr_1.push(item.height);
                });
                return _MAX(pointsArr_1);
            }
            else if (this.config.chartType === 'AreaChart') {
                return _MAX(items[this.items.length - 1].points);
            }
            else {
                //判断items是否为数组
                return _MAX(items.map(function (item) {
                    if (typeof item.points === 'function') {
                        return _Gconfig.edge[flag];
                    }
                    else {
                        return _MAX(item.points.map(function (p) { return p[flag]; }));
                    }
                }));
            }
        };
        //获取坐标点的最小值
        DrawCoordinateSystem.prototype.getMin = function (items, dir) {
            var _this = this;
            var flag = dir === 'x' ? 0 : 1;
            if (items.length === 0) {
                return this.config.interval[flag];
            }
            //若是柱状图表，则没有x轴的断点，只需要y轴
            if (this.config.chartType === 'PillarChart') {
                var pointsArr_2 = [];
                items.map(function (item) {
                    pointsArr_2.push(item.height);
                });
                return _MIN(pointsArr_2);
            }
            else if (this.config.chartType === 'AreaChart') {
                return _MIN(items[0].points);
            }
            else {
                //判断items是否为数组
                return _MIN(items.map(function (item) {
                    if (typeof item.points === 'function') {
                        return flag ? _this.yInterval : _this.xInterval;
                    }
                    else {
                        return _MIN(item.points.map(function (p) { return p[flag]; }));
                    }
                }));
            }
        };
        return DrawCoordinateSystem;
    }());
    /*
    * @Animate: canvas动绘制的一个封装
    */
    var _Animate = function () {
    };
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
    var LineChart = /** @class */ (function () {
        function LineChart(Graphics, config) {
            this.g = null;
            this.config = null;
            //保存数据分析结果
            this.data = [];
            //数组，填入label，用作选择显示哪一个结果，若为null，则显示全部
            this.itemList = [];
            //默认半径
            this.defaultRadius = 3;
            this.coordinateSystem = null;
            this.items = [];
            this.g = Graphics;
            this.config = config;
            //默认开启网格
            this.config.grid = this.config.grid === undefined ? true : this.config.grid;
            //默认开启测量线
            this.config.measureLine = this.config.measureLine === undefined ? true : this.config.measureLine;
            //间隔和坐标点参数为必要参数
            if (!this.config.interval) {
                console.warn("'interval' option is required.");
                return null;
            }
            if (!this.config.items) {
                console.warn("'items' option is required.");
                return null;
            }
            //设置默认半径
            if (this.config.defaultRadius) {
                this.defaultRadius = this.config.defaultRadius;
            }
            //绑定鼠标事件
            this.bindMouseEvent();
            //渲染总体
            this.indexItem(this.config.items).render(null);
        }
        //为每一个项目标上索引
        LineChart.prototype.indexItem = function (items) {
            items.map(function (item, index) {
                item.index = index;
            });
            return this;
        };
        //入口
        LineChart.prototype.render = function (itemList) {
            var _this = this;
            this.items = [];
            this.data = [];
            if (itemList) {
                itemList.map(function (label) {
                    _this.config.items.map(function (item) {
                        if (item.label === label) {
                            _this.items.splice(item.index, 0, item);
                        }
                    });
                });
            }
            else {
                this.items = this.config.items;
            }
            /*
            * @DrawCoordinateSystem: 建立坐标系
            * 对象返回坐标系的信息，包括
            * 坐标真实原点
            * 坐标间隔
            * 坐标真实间隔
            */
            this.g.clearRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);
            this.coordinateSystem = new DrawCoordinateSystem(this.g, this.config, this.items);
            this.itemList = itemList;
            //遍历items分析数据
            this.items.map(function (item, index) {
                _this.data.push({
                    ele: _this.analyseItems(item, index),
                    color: item.color,
                    label: item.label
                });
            });
            //第一次渲染
            this.reRender(0, 0);
            return this;
        };
        LineChart.prototype.reRender = function (x, y) {
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
        };
        //绘制网格
        LineChart.prototype.paintGrid = function () {
            this.g.save();
            this.config.grid && this.drawGridX().drawGridY();
            this.g.restore();
            return this;
        };
        //绘制坐标轴
        LineChart.prototype.drawCoordinateSystem = function () {
            this.coordinateSystem
                .rightAngle()
                .setXIntervalPoint()
                .setYIntervalPoint()
                .baseLineX()
                .baseLineY();
            return this;
        };
        //绘制纵向网格
        LineChart.prototype.drawGridX = function () {
            var xLength = this.coordinateSystem.rxIntervals.length, topBoundary = this.coordinateSystem.ryEdge;
            //绘制出网格中纵向的线
            for (var i = 0; i < xLength; i++) {
                new DrawLine(this.g, this.coordinateSystem.rxIntervals[i], this.coordinateSystem.oY, '#eee')
                    .end(this.coordinateSystem.rxIntervals[i], topBoundary);
            }
            return this;
        };
        //绘制横向网格
        LineChart.prototype.drawGridY = function () {
            var yLength = this.coordinateSystem.ryIntervals.length, rightBoundary = this.coordinateSystem.rxEdge;
            //绘制出网格中横向的线
            for (var i = 0; i < yLength; i++) {
                new DrawLine(this.g, this.coordinateSystem.oX, this.coordinateSystem.ryIntervals[i], '#eee')
                    .end(rightBoundary, this.coordinateSystem.ryIntervals[i]);
            }
            return this;
        };
        //判断鼠标是否在图表内
        LineChart.prototype.isInChart = function (x, y) {
            return x > this.coordinateSystem.oX && x < this.coordinateSystem.rxEdge && y < this.coordinateSystem.oY && y > this.coordinateSystem.ryEdge;
        };
        //为图表绑定鼠标事件
        LineChart.prototype.bindMouseEvent = function () {
            var _this = this;
            this.config.canvas.addEventListener('mousemove', function (e) {
                var x = e.clientX - _this.config.canvas.getBoundingClientRect().left, y = e.clientY - _this.config.canvas.getBoundingClientRect().top;
                _this.g.clearRect(0, 0, _this.config.canvasWidth, _this.config.canvasHeight);
                _this.reRender(x, y);
            });
            return this;
        };
        //鼠标选中元素处理
        LineChart.prototype.mouseSelect = function (circles, x, y) {
            var _this = this;
            //标志符：用作判断鼠标是否移到了圆点里面
            var flag = null;
            circles.map(function (cir) {
                if (typeof cir.ele !== 'function') {
                    cir.ele.map(function (c) {
                        _this.g.beginPath();
                        _this.g.arc(c.x, c.y, c.r + 2, 0, 2 * Math.PI);
                        if (_this.g.isPointInPath(x, y)) {
                            _this.g.save();
                            _this.g.shadowOffsetX = 1;
                            _this.g.shadowOffsetY = 1;
                            _this.g.shadowBlur = 2;
                            _this.g.shadowColor = "rgba(0, 0, 0, 0.5)";
                            _this.g.fillStyle = cir.color;
                            _this.g.fill();
                            _this.g.restore();
                            flag = c;
                        }
                    });
                }
            });
            return flag;
        };
        //绘制横向测量线
        LineChart.prototype.paintTargetLineY = function (x, y) {
            var vy = this.coordinateSystem.yOrigin + Math.abs((y - this.config.canvasHeight + 45)) * (this.coordinateSystem.yEdge - this.coordinateSystem.yOrigin) / (this.coordinateSystem.lY);
            this.g.save();
            this.g.setLineDash([4, 2]);
            if (this.isInChart(x, y)) {
                if (this.config.measureLine) {
                    new DrawLine(this.g, this.coordinateSystem.oX, y, 'rgba(0, 0, 0, 0.2)')
                        .end(this.coordinateSystem.rxEdge, y);
                    this.g.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    this.g.rect(this.coordinateSystem.oX + 5, y - 21, 70, 18);
                    this.g.fill();
                    this.g.font = '12px serif';
                    this.g.fillStyle = '#fff';
                    this.g.fillText("y: " + vy.toFixed(3), this.coordinateSystem.oX + 10, y - 9);
                }
            }
            this.g.restore();
            return this;
        };
        //绘制纵向测量线
        LineChart.prototype.paintTargetLineX = function (x, y) {
            var vx = this.coordinateSystem.xOrigin + (x - 45) * (this.coordinateSystem.xEdge - this.coordinateSystem.xOrigin) / (this.coordinateSystem.lX);
            this.g.save();
            this.g.setLineDash([4, 2]);
            if (this.isInChart(x, y)) {
                if (this.config.measureLine) {
                    new DrawLine(this.g, x, this.coordinateSystem.ryEdge, 'rgba(0, 0, 0, 0.2)')
                        .end(x, this.coordinateSystem.oY);
                    this.g.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    this.g.rect(x + 5, this.coordinateSystem.oY - 21, 70, 18);
                    this.g.fill();
                    this.g.font = '12px serif';
                    this.g.fillStyle = '#fff';
                    this.g.fillText("x: " + vx.toFixed(3), x + 10, this.coordinateSystem.oY - 8);
                }
            }
            this.g.restore();
            return this;
        };
        //绘制坐标提升框
        LineChart.prototype.paintTipCase = function (x, y, flag) {
            var vx = this.coordinateSystem.xOrigin + (x - 45) * (this.coordinateSystem.xEdge - this.coordinateSystem.xOrigin) / (this.coordinateSystem.lX), vy = this.coordinateSystem.yOrigin + Math.abs((y - this.config.canvasHeight + 45)) * (this.coordinateSystem.yEdge - this.coordinateSystem.yOrigin) / (this.coordinateSystem.lY);
            if (this.isInChart(x, y)) {
                this.g.fillStyle = 'rgba(0, 0, 0, 0.7)';
                if (x + 90 > this.coordinateSystem.rxEdge) {
                    x = this.coordinateSystem.rxEdge - 90;
                }
                if (flag) {
                    this.g.fillRect(x + 10, y + 10, 80, 40);
                    this.g.font = '12px serif';
                    this.g.fillStyle = '#fff';
                    this.g.fillText("x: " + flag.cx.toFixed(3), x + 15, y + 25);
                    this.g.fillText("y: " + flag.cy.toFixed(3), x + 15, y + 40);
                }
            }
            return this;
        };
        //分析点数据
        LineChart.prototype.analyseItems = function (item, index) {
            var _this = this;
            var circleInfo = [];
            if (typeof item.points === 'function') {
                return item.points;
            }
            else {
                //遍历获取原点信息
                item.points.map(function (it, index) {
                    var cyc = _this.coordinateSystem.calc(it[0], it[1]);
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
        };
        //绘制点函数
        LineChart.prototype.renderPoints = function (p, color) {
            //绘制第一个点
            var cyc = new DrawArc(this.g, this.defaultRadius, 360), line = new DrawLine(this.g, p[0].x, p[0].y, color).paint(cyc);
            //继续绘制接下去的点
            for (var i = 1, length_1 = p.length; i < length_1; i++) {
                i === length_1 ?
                    line.next(p[i].x, p[i].y).paint(cyc) :
                    line.end(p[i].x, p[i].y).paint(cyc);
            }
        };
        //绘制方程函数
        LineChart.prototype.renderExpression = function (exp, color) {
            var i = this.coordinateSystem.xOrigin, p = this.coordinateSystem.calc(i, exp(i)), line = new DrawLine(this.g, p.x, p.y, color);
            //循环不断求方程的解，直到方程的解>yEdge
            while (i < this.coordinateSystem.xEdge) {
                i += 0.02;
                p = this.coordinateSystem.calc(i, exp(i));
                if (i > this.coordinateSystem.xEdge || exp(i) > this.coordinateSystem.yEdge ||
                    exp(i) < this.coordinateSystem.yOrigin || i < this.coordinateSystem.xOrigin) {
                    line.next(p.x, p.y, 'transparent');
                }
                else {
                    line.next(p.x, p.y, color);
                }
            }
            line.end(p.x, p.y);
        };
        LineChart.prototype.renderResult = function (data) {
            var _this = this;
            data.map(function (cir) {
                if (typeof cir.ele === 'function') {
                    _this.renderExpression(cir.ele, cir.color);
                }
                else {
                    _this.renderPoints(cir.ele, cir.color);
                }
            });
            return this;
        };
        return LineChart;
    }());
    /*
    * @PointChart: 散点图表
    * 继承自LineChart
    *
    * 重写方法：
    * analyseItems
    * renderResult
    * paintTipCase
    */
    var PointChart = /** @class */ (function (_super) {
        __extends(PointChart, _super);
        function PointChart(Graphics, config) {
            return _super.call(this, Graphics, config) || this;
        }
        //根据权重分析半径
        PointChart.prototype.getRadius = function (weights) {
            var _this = this;
            var temp = [], minWeight = 0;
            weights.map(function (w) {
                if (w) {
                    temp.push(w);
                }
            });
            //找出最小的权重
            //若都没有设置权重，则全部默认设置权重为 1
            minWeight = temp.length ? _MIN(temp) : 1;
            //若改点没有设置权重，则将其默认设置为最小权重
            weights = weights.map(function (w) {
                if (w === undefined) {
                    w = minWeight;
                }
                return w;
            });
            return weights.map(function (w) { return Math.sqrt(w / minWeight) * _this.defaultRadius; });
        };
        //分析点数据
        PointChart.prototype.analyseItems = function (item, index) {
            var _this = this;
            var radiusList = this.getRadius(item.points.map(function (i) { return i[2]; })), circleInfo = [];
            //遍历获取原点信息
            item.points.map(function (it, index) {
                var cyc = _this.coordinateSystem.calc(it[0], it[1]);
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
        };
        //绘制点函数
        PointChart.prototype.renderResult = function (data) {
            var _this = this;
            this.g.save();
            this.g.shadowOffsetX = 1;
            this.g.shadowOffsetY = 1;
            this.g.shadowBlur = 2;
            this.g.shadowColor = "rgba(0, 0, 0, 0.5)";
            data.map(function (cir) {
                cir.ele.map(function (c) {
                    new DrawArc(_this.g, c.r, 360).render(c.x, c.y, cir.color);
                });
            });
            this.g.restore();
            return this;
        };
        //绘制坐标提升框
        PointChart.prototype.paintTipCase = function (x, y, flag) {
            var vx = (x - 45) * (this.coordinateSystem.xEdge - this.coordinateSystem.xOrigin) / (this.coordinateSystem.lX), vy = Math.abs((y - this.config.canvasHeight + 45)) * (this.coordinateSystem.yEdge - this.coordinateSystem.yOrigin) / (this.coordinateSystem.lY);
            this.g.fillStyle = 'rgba(0, 0, 0, 0.7)';
            if (x + 90 > this.coordinateSystem.rxEdge) {
                x = this.coordinateSystem.rxEdge - 90;
            }
            if (this.isInChart(x, y)) {
                if (flag) {
                    this.g.fillRect(x + 10, y + 10, 80, 55);
                    this.g.font = '12px serif';
                    this.g.fillStyle = '#fff';
                    this.g.fillText("x: " + flag.cx.toFixed(3), x + 15, y + 25);
                    this.g.fillText("y: " + flag.cy.toFixed(3), x + 15, y + 40);
                    this.g.fillText("weight: " + (flag.w ? flag.w : 'none'), x + 15, y + 55);
                }
            }
            return this;
        };
        return PointChart;
    }(LineChart));
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
    var PillarChart = /** @class */ (function (_super) {
        __extends(PillarChart, _super);
        function PillarChart(Graphics, config) {
            var _this = _super.call(this, Graphics, config) || this;
            //是否显示趋势线
            _this.config.trendLine = _this.config.trendLine === undefined ? false : _this.config.trendLine;
            return _this;
        }
        //入口
        PillarChart.prototype.render = function (itemList) {
            var _this = this;
            this.items = [];
            this.data = [];
            if (itemList) {
                itemList.map(function (label) {
                    _this.config.items.map(function (item) {
                        if (item.label === label) {
                            _this.items.splice(item.index, 0, item);
                        }
                    });
                });
            }
            else {
                this.items = this.config.items;
            }
            /*
            * @DrawCoordinateSystem: 建立坐标系
            * 对象返回坐标系的信息，包括
            * 坐标真实原点
            * 坐标间隔
            * 坐标真实间隔
            */
            this.g.clearRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);
            this.coordinateSystem = new DrawCoordinateSystem(this.g, this.config, this.items);
            this.itemList = itemList;
            this.config.itemWidth = this.getWidth(this.config.interval[0]);
            //遍历items分析数据
            this.items.map(function (item, index) {
                _this.data.push({
                    ele: _this.analyseItems(item, index),
                    color: item.color,
                    label: item.label
                });
            });
            //第一次渲染
            this.reRender(0, 0);
            return this;
        };
        //绘制坐标轴
        PillarChart.prototype.drawCoordinateSystem = function () {
            this.coordinateSystem
                .rightAngle()
                .setYIntervalPoint()
                .baseLineX();
            return this;
        };
        //绘制横向网格
        PillarChart.prototype.drawGridY = function () {
            var yLength = this.coordinateSystem.ryIntervals.length, rightBoundary = this.coordinateSystem.rxEdge;
            //绘制出网格中横向的线
            for (var i = 0; i < yLength; i++) {
                new DrawLine(this.g, this.coordinateSystem.oX, this.coordinateSystem.ryIntervals[i], '#eee')
                    .end(rightBoundary + 20, this.coordinateSystem.ryIntervals[i]);
            }
            return this;
        };
        //绘制网格
        PillarChart.prototype.paintGrid = function () {
            this.config.grid && this.drawGridY();
            return this;
        };
        //分析点数据
        PillarChart.prototype.analyseItems = function (item, index) {
            //经过转换后的高度
            var height = this.coordinateSystem.oY - this.coordinateSystem.calc(0, item.height).y;
            return {
                x: this.coordinateSystem.oX + (index + 1) * this.config.interval[0] + index * this.config.itemWidth,
                y: this.coordinateSystem.oY - height,
                width: this.config.itemWidth,
                height: height,
                cheight: item.height
            };
        };
        //根据x轴interval计算柱宽
        PillarChart.prototype.getWidth = function (xInterval) {
            var length = this.itemList ? this.itemList.length : this.config.items.length;
            return (this.coordinateSystem.lX + 20 - (length + 1) * xInterval) / length;
        };
        //绘制横向测量线
        PillarChart.prototype.paintTargetLineY = function (x, y) {
            var vy = this.coordinateSystem.yOrigin + Math.abs((y - this.config.canvasHeight + 45)) * (this.coordinateSystem.yEdge - this.coordinateSystem.yOrigin) / (this.coordinateSystem.lY);
            this.g.save();
            this.g.setLineDash([4, 2]);
            if (this.isInChart(x, y)) {
                if (this.config.measureLine) {
                    new DrawLine(this.g, this.coordinateSystem.oX, y, 'rgba(0, 0, 0, 0.2)')
                        .end(this.coordinateSystem.rxEdge, y);
                    this.g.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    this.g.rect(this.coordinateSystem.oX + 5, y - 21, 70, 18);
                    this.g.fill();
                    this.g.font = '12px serif';
                    this.g.fillStyle = '#fff';
                    this.g.fillText("y: " + vy.toFixed(3), this.coordinateSystem.oX + 10, y - 9);
                }
            }
            this.g.restore();
            return this;
        };
        //绘制坐标提升框
        PillarChart.prototype.paintTipCase = function (x, y, flag) {
            var vy = Math.abs((y - this.config.canvasHeight + 45)) * (this.coordinateSystem.yEdge - this.coordinateSystem.yOrigin) / (this.coordinateSystem.lY);
            if (x + 90 > this.coordinateSystem.rxEdge + 20) {
                x = this.coordinateSystem.rxEdge - 70;
            }
            if (this.isInChart(x, y)) {
                this.g.fillStyle = 'rgba(0, 0, 0, 0.7)';
                if (flag) {
                    this.g.fillRect(x, y - 40, 110, 35);
                    this.g.font = '12px serif';
                    this.g.fillStyle = '#fff';
                    this.g.fillText("height: " + flag.ele.cheight.toFixed(3), x + 15, y - 25);
                    this.g.fillText("lable: " + flag.label, x + 15, y - 10);
                }
            }
            return this;
        };
        //鼠标选中元素处理
        PillarChart.prototype.mouseSelect = function (rects, x, y) {
            var _this = this;
            //标志符：用作判断鼠标是否移到了圆点里面
            var flag = null;
            this.g.strokeStyle = '#000';
            rects.map(function (r) {
                _this.g.beginPath();
                _this.g.rect(r.ele.x - 1, r.ele.y - 1, r.ele.width + 2, r.ele.height + 1);
                if (_this.g.isPointInPath(x, y)) {
                    _this.g.stroke();
                    flag = r;
                }
            });
            return flag;
        };
        //绘制趋势线
        PillarChart.prototype.drawTrendLine = function () {
            var _this = this;
            var halfWidth = this.config.itemWidth / 2;
            var line = null, cir = new DrawArc(this.g, this.defaultRadius, 360, false);
            if (this.config.trendLine) {
                this.data.map(function (rect, index) {
                    if (index === 0) {
                        line = new DrawLine(_this.g, rect.ele.x + halfWidth, rect.ele.y, '#333');
                    }
                    else if (index === _this.data.length) {
                        line = line.end(rect.ele.x + halfWidth, rect.ele.y);
                    }
                    else {
                        line = line.next(rect.ele.x + halfWidth, rect.ele.y);
                    }
                    line.paint(cir);
                });
            }
            return this;
        };
        //为每一个项目标上名字
        PillarChart.prototype.paintLabel = function () {
            var _this = this;
            var halfWidth = this.config.itemWidth / 2;
            this.g.save();
            this.g.fillStyle = _Gconfig.defaultColor;
            this.g.textAlign = 'center';
            this.data.map(function (rect) {
                _this.g.fillText(rect.label, rect.ele.x + halfWidth, _this.coordinateSystem.oY + 20);
            });
            this.g.restore();
            return this;
        };
        PillarChart.prototype.renderResult = function (data) {
            var _this = this;
            data.map(function (rect) {
                new DrawRect(_this.g, rect.ele.width, rect.ele.height).render(rect.ele.x, rect.ele.y, rect.color);
            });
            return this;
        };
        //刷新图表，重新渲染
        PillarChart.prototype.reRender = function (x, y) {
            this.g.save();
            //绘制坐标轴
            this.drawCoordinateSystem()
                .paintGrid()
                .renderResult(this.data)
                .paintLabel()
                .paintTargetLineY(x, y)
                .paintTipCase(x, y, this.mouseSelect(this.data, x, y))
                .drawTrendLine();
            this.g.restore();
        };
        return PillarChart;
    }(LineChart));
    /*
    * @AreaChart: 面积图表
    * 继承自LineChart
    *
    * 重写方法：
    */
    var AreaChart = /** @class */ (function (_super) {
        __extends(AreaChart, _super);
        function AreaChart(Graphics, config) {
            var _this = _super.call(this, Graphics, config) || this;
            if (_this.config.xAxis === undefined) {
                console.warn("'xAxis' option is required.");
                return null;
            }
            return _this;
        }
        //入口
        AreaChart.prototype.render = function (itemList) {
            var _this = this;
            this.items = [];
            this.data = [];
            this.config.length = this.config.xAxis.length;
            this.checkDataIsComplete(this.config.items);
            if (itemList) {
                itemList.map(function (label) {
                    _this.config.items.map(function (item) {
                        if (item.label === label) {
                            _this.items.splice(item.index, 0, item);
                        }
                    });
                });
            }
            else {
                this.items = this.config.items;
            }
            this.addData(this.items);
            /*
            * @DrawCoordinateSystem: 建立坐标系
            * 对象返回坐标系的信息，包括
            * 坐标真实原点
            * 坐标间隔
            * 坐标真实间隔
            */
            this.g.clearRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);
            this.coordinateSystem = new DrawCoordinateSystem(this.g, this.config, this.items);
            this.itemList = itemList;
            //遍历items分析数据
            this.items.map(function (item, index) {
                _this.data.push({
                    ele: _this.analyseItems(item, index),
                    color: item.color,
                    label: item.label
                });
            });
            //第一次渲染
            this.reRender(0, 0);
            return this;
        };
        AreaChart.prototype.reRender = function (x, y) {
            this.g.save();
            //绘制坐标轴
            this
                .drawXaxis()
                .paintGrid()
                .drawCoordinateSystem()
                .renderResult(this.data)
                .paintTargetLineX(x, y)
                .paintTipCase(x, y, this.mouseSelect(this.data, x, y));
            this.g.restore();
        };
        //检查数据完整性
        AreaChart.prototype.checkDataIsComplete = function (items) {
            var _this = this;
            var diff = 0;
            items.map(function (item) {
                diff = _this.config.length - item.points.length;
                if (diff > 0) {
                    while (diff--) {
                        item.points.push(0);
                    }
                }
            });
            return this;
        };
        //处理数据：将数据相加
        AreaChart.prototype.addData = function (items) {
            for (var i = 0; i < this.config.length; i++) {
                for (var j = 1; j < items.length; j++) {
                    items[j].points[i] = items[j].points[i] + items[j - 1].points[i];
                }
            }
            return this;
        };
        //分析点数据
        AreaChart.prototype.analyseItems = function (item, index) {
            var _this = this;
            var circleInfo = [];
            //遍历获取原点信息
            item.points.map(function (p, index) {
                var cyc = _this.coordinateSystem.calc(0, p);
                circleInfo.push({
                    y: cyc.y,
                    cy: p
                });
            });
            return circleInfo;
        };
        //绘制网格
        AreaChart.prototype.paintGrid = function () {
            this.g.save();
            this.config.grid && this.drawGridY();
            this.g.restore();
            return this;
        };
        //绘制坐标轴
        AreaChart.prototype.drawCoordinateSystem = function () {
            this.coordinateSystem
                .rightAngle()
                .setYIntervalPoint()
                .baseLineX();
            return this;
        };
        //绘制x轴元素
        AreaChart.prototype.drawXaxis = function () {
            var _this = this;
            var interval = this.coordinateSystem.lX / (this.config.length + 1);
            this.config.xAxis.map(function (gapName, index) {
                var x = _this.coordinateSystem.oX + (index + 1) * interval;
                new DrawLine(_this.g, x, _this.coordinateSystem.oY)
                    .end(x, _this.coordinateSystem.oY + 5);
                _this.data.map(function (item) {
                    item.ele[index].x = x;
                });
            });
            return this;
        };
        AreaChart.prototype.renderResult = function (data) {
            var _this = this;
            data.map(function (cir) {
                cir.ele.map(function (c) {
                    new DrawArc(_this.g, _this.defaultRadius, 360, false).render(c.x, c.y, cir.color);
                });
            });
            return this;
        };
        return AreaChart;
    }(LineChart));
    /*
    * @PieChart: 饼状图表
    */
    var PieChart = /** @class */ (function () {
        function PieChart(Graphics, config) {
            this.g = null;
            this.config = null;
            this.items = [];
            this.itemList = [];
            //存放分析好的数据
            this.data = [];
            //图形默认半径
            this.radius = 120;
            //画布的中心点，用作圆心
            this.centerPoint = [];
            //数据总和
            this.total = 0;
            this.g = Graphics;
            this.config = config;
            //设置默认半径
            this.config.radius = this.config.radius === undefined ? this.radius : this.config.radius;
            //计算中心点
            this.centerPoint = [this.config.canvasWidth / 2, this.config.canvasHeight / 2];
            this.bindMouseEvent();
            this.indexItem(this.config.items).render(null);
        }
        //对项目进行排序
        PieChart.prototype.sortItem = function (items) {
            items.sort(function (item1, item2) { return item1.data - item2.data; });
            return this;
        };
        //为每一个项目标上索引
        PieChart.prototype.indexItem = function (items) {
            items.map(function (item, index) {
                item.index = index;
            });
            return this;
        };
        //数据分析函数，对用户输入的数据集进行分析运算
        PieChart.prototype.analyseItems = function (item, index) {
            return {
                data: item.data,
                angle: (item.data * 360) / this.total,
                ratio: ((item.data / this.total) * 100).toFixed(1) + '%'
            };
        };
        ;
        //为图表绑定鼠标事件
        PieChart.prototype.bindMouseEvent = function () {
            var _this = this;
            this.config.canvas.addEventListener('mousemove', function (e) {
                var x = e.clientX - _this.config.canvas.getBoundingClientRect().left, y = e.clientY - _this.config.canvas.getBoundingClientRect().top;
                _this.g.clearRect(0, 0, _this.config.canvasWidth, _this.config.canvasHeight);
                _this.reRender(x, y);
            });
            return this;
        };
        ;
        //结果渲染，将分析好的数据渲染出来
        PieChart.prototype.renderResult = function (data) {
            var _this = this;
            var cir = null;
            this.g.save();
            data.map(function (pie) {
                if (!cir) {
                    cir = new DrawArc(_this.g, _this.config.radius, pie.ele.angle)
                        .render(_this.centerPoint[0], _this.centerPoint[1], pie.color);
                }
                else {
                    cir = cir.next(pie.ele.angle, pie.color);
                }
            });
            this.g.restore();
            return this;
        };
        ;
        //判断是否在圆内
        PieChart.prototype.isInCircle = function (x, y) {
            this.g.beginPath();
            this.g.arc(this.centerPoint[0], this.centerPoint[1], this.config.radius, 0, 2 * Math.PI);
            return this.g.isPointInPath(x, y);
        };
        //浮动提示框
        PieChart.prototype.paintTipCase = function (x, y, flag) {
            if (this.isInCircle(x, y)) {
                this.g.fillStyle = 'rgba(0, 0, 0, 0.5)';
                if (flag) {
                    this.g.fillRect(x, y - 60, 110, 50);
                    this.g.font = '12px serif';
                    this.g.fillStyle = '#fff';
                    this.g.fillText("lable: " + flag.label, x + 10, y - 45);
                    this.g.fillText("data: " + flag.ele.data, x + 10, y - 30);
                    this.g.fillText("ratio: " + flag.ele.ratio, x + 10, y - 15);
                }
            }
            return this;
        };
        ;
        //鼠标选中项目效果处理
        PieChart.prototype.mouseSelect = function (data, x, y) {
            var _this = this;
            //标志符：用作判断鼠标是否移到了圆点里面
            var flag = null, startAngle = 0, endAngle = 0;
            data.map(function (pie, index) {
                _this.g.save();
                _this.g.fillStyle = pie.color;
                if (index === 0) {
                    startAngle = 0;
                    endAngle = pie.ele.angle;
                }
                else {
                    startAngle = endAngle;
                    endAngle = startAngle + pie.ele.angle;
                }
                _this.g.beginPath();
                _this.g.moveTo(_this.centerPoint[0], _this.centerPoint[1]);
                _this.g.arc(_this.centerPoint[0], _this.centerPoint[1], _this.config.radius + _this.config.radius * 0.15, _degree2Radian(startAngle), _degree2Radian(endAngle));
                _this.g.closePath();
                if (_this.g.isPointInPath(x, y)) {
                    _this.g.shadowOffsetX = 2;
                    _this.g.shadowOffsetY = 2;
                    _this.g.shadowBlur = 8;
                    _this.g.shadowColor = "rgba(0, 0, 0, 0.5)";
                    _this.g.fill();
                    flag = pie;
                }
                _this.g.restore();
            });
            return flag;
        };
        ;
        //显示项目的标签
        PieChart.prototype.paintLabel = function () {
            return this;
        };
        ;
        PieChart.prototype.reRender = function (x, y) {
            this.g.save();
            //绘制图表结果
            this
                .renderResult(this.data)
                .paintTipCase(x, y, this.mouseSelect(this.data, x, y));
            this.g.restore();
        };
        ;
        PieChart.prototype.render = function (itemList) {
            var _this = this;
            this.items = [];
            this.data = [];
            if (itemList) {
                itemList.map(function (label) {
                    _this.config.items.map(function (item) {
                        if (item.label === label) {
                            _this.items.splice(item.index, 0, item);
                        }
                    });
                });
            }
            else {
                this.items = this.config.items;
            }
            this.sortItem(this.items);
            /*
            * @DrawCoordinateSystem: 建立坐标系
            * 对象返回坐标系的信息，包括
            * 坐标真实原点
            * 坐标间隔
            * 坐标真实间隔
            */
            this.g.clearRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);
            this.itemList = itemList;
            //计算总和
            this.total = _SUM(this.items.map(function (item) { return item.data; }));
            //遍历items分析数据
            this.items.map(function (item, index) {
                _this.data.push({
                    ele: _this.analyseItems(item, index),
                    color: item.color,
                    label: item.label
                });
            });
            //第一次渲染
            this.reRender(0, 0);
            return this;
        };
        ;
        return PieChart;
    }());
    /*
    * @PieChart: 环形图表
    * 继承自PieChart
    *
    * 重写方法：
    * paintTipCase
    * mouseSelect
    */
    var AnnularChart = /** @class */ (function (_super) {
        __extends(AnnularChart, _super);
        function AnnularChart(Graphics, config) {
            var _this = _super.call(this, Graphics, config) || this;
            //环形宽度
            _this.width = 65;
            _this.config.width = _this.config.width === undefined ? _this.width : _this.config.width;
            return _this;
        }
        //绘制中心白色的圆
        AnnularChart.prototype.drawCenterCircle = function () {
            new DrawArc(this.g, this.config.radius - this.config.width, 360)
                .render(this.centerPoint[0], this.centerPoint[1], '#fff');
            return this;
        };
        //鼠标选中项目效果处理
        AnnularChart.prototype.mouseSelect = function (data, x, y) {
            var _this = this;
            //标志符：用作判断鼠标是否移到了圆点里面
            var flag = null, startAngle = 0, endAngle = 0;
            this.g.strokeStyle = '#000';
            data.map(function (pie, index) {
                if (index === 0) {
                    startAngle = 0;
                    endAngle = pie.ele.angle;
                }
                else {
                    startAngle = endAngle;
                    endAngle = startAngle + pie.ele.angle;
                }
                if (_this.isInAnnular(x, y)) {
                    _this.g.beginPath();
                    _this.g.moveTo(_this.centerPoint[0], _this.centerPoint[1]);
                    _this.g.arc(_this.centerPoint[0], _this.centerPoint[1], _this.config.radius, _degree2Radian(startAngle), _degree2Radian(endAngle));
                    _this.g.closePath();
                    if (_this.g.isPointInPath(x, y)) {
                        _this.g.stroke();
                        _this.g.beginPath();
                        _this.g.arc(_this.centerPoint[0], _this.centerPoint[1], _this.config.radius - _this.config.width, _degree2Radian(startAngle), _degree2Radian(endAngle));
                        _this.g.stroke();
                        flag = pie;
                    }
                }
            });
            return flag;
        };
        ;
        //判断是否在圆内
        AnnularChart.prototype.isInAnnular = function (x, y) {
            var inCircle = false, outAnnular = false;
            this.g.beginPath();
            this.g.arc(this.centerPoint[0], this.centerPoint[1], this.config.radius, 0, 2 * Math.PI);
            if (this.g.isPointInPath(x, y)) {
                inCircle = true;
            }
            this.g.beginPath();
            this.g.arc(this.centerPoint[0], this.centerPoint[1], this.config.radius - this.config.width, 0, 2 * Math.PI);
            if (!this.g.isPointInPath(x, y)) {
                outAnnular = true;
            }
            return outAnnular && inCircle;
        };
        //浮动提示框
        AnnularChart.prototype.paintTipCase = function (x, y, flag) {
            this.drawCenterCircle();
            if (this.isInAnnular(x, y)) {
                this.g.fillStyle = 'rgba(0, 0, 0, 0.5)';
                if (flag) {
                    this.g.fillRect(x, y - 60, 110, 50);
                    this.g.font = '12px serif';
                    this.g.fillStyle = '#fff';
                    this.g.fillText("lable: " + flag.label, x + 10, y - 45);
                    this.g.fillText("data: " + flag.ele.data, x + 10, y - 30);
                    this.g.fillText("ratio: " + flag.ele.ratio, x + 10, y - 15);
                }
            }
            return this;
        };
        ;
        return AnnularChart;
    }(PieChart));
    /*------------------------------图表类-END----------------------------------- */
    /*---------------------------ChartUp主类------------------------------- */
    var ChartPrototype = /** @class */ (function () {
        //entrance
        function ChartPrototype() {
            //暴露的工具方法集
            this.fn = {};
            //全局设置API
            this.configuration = _Gconfig;
            this.fn = {
                //绘制线方法，返回DrawLine类的实例
                drawLine: function (Graphics, x, y, color) {
                    return new DrawLine(Graphics, x, y, color);
                },
                //动绘制方法
                animate: _Animate
            };
        }
        ChartPrototype.prototype.changeItem = function (el, itemList, config) {
            var label = el.getAttribute('data-item');
            if (el.className.indexOf('active') > -1) {
                el.classList.remove('active');
                itemList.push(label);
            }
            else {
                el.classList.add('active');
                itemList.splice(itemList.indexOf(label), 1);
            }
            config.chartIntance.render(itemList);
        };
        ChartPrototype.prototype.createTagItem = function (label, color, itemList, config) {
            var tagItem = document.createElement('li'), tag = document.createElement('span'), labelText = document.createElement('span');
            var _self = this;
            tagItem.setAttribute('data-item', label);
            tag.classList.add('tag');
            tag.style.backgroundColor = color;
            labelText.classList.add('label');
            labelText.innerHTML = label;
            tagItem.appendChild(tag);
            tagItem.appendChild(labelText);
            //绑定选择项目事件
            tagItem.addEventListener('click', function (e) {
                _self.changeItem(this, itemList, config);
            });
            return tagItem;
        };
        //用作为图表添加标题，标签等
        ChartPrototype.prototype.addCondition = function (container, config) {
            var _this = this;
            var title = document.createElement('h2'), canvas = document.createElement('canvas'), tagCon = document.createElement('ul'), itemList = config.items.map(function (item) { return item.label; });
            container.classList.add('chartUp-container');
            title.innerHTML = config.title ? config.title : '';
            tagCon.classList.add('tag-con');
            config.items.map(function (item) {
                tagCon.appendChild(_this.createTagItem(item.label, item.color, itemList, config));
            });
            container.appendChild(title);
            container.appendChild(canvas);
            container.appendChild(tagCon);
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            config['canvas'] = canvas;
            //获取canvas绘制布的宽高
            config['canvasWidth'] = canvas.offsetWidth;
            config['canvasHeight'] = canvas.offsetHeight;
            return canvas.getContext('2d');
        };
        ChartPrototype.prototype.config = function (c) {
            this.configuration = Object.assign(this.configuration, c);
        };
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
            this[chartConfig.chartType] = function (container, config) {
                var Graphics = this.addCondition(document.querySelector(container), config);
                //图表类型
                config['chartType'] = chartConfig.chartType;
                //保存图表实例
                config['chartIntance'] = new chartConfig.chartClass(Graphics, config);
            };
        };
        return ChartPrototype;
    }());
    //实例化Chart
    var ChartUp = new ChartPrototype();
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
    /*------------------------------模拟使用------------------------------------ */
    ChartUp.LineChart('#con1', {
        title: 'Mychart',
        interval: [5, 5],
        items: [
            {
                label: 'income',
                points: Array.from(new Array(10 + Math.ceil(Math.random() * 5)), function (x) { return [Math.ceil(Math.random() * 40), Math.ceil(Math.random() * 40)]; }),
                color: '#009688'
            },
            {
                label: 'y = (1/16)*x^2',
                points: function (x) {
                    return (1 / 16) * x * x;
                },
                color: 'green'
            },
            {
                label: 'y = (1/20)*e^x',
                points: function (x) {
                    return (1 / 20) * Math.pow(Math.E, x);
                },
                color: '#512DA8'
            },
            {
                label: 'y = 15*sin(x) + 20',
                points: function (x) {
                    return 15 * Math.sin(x) + 20;
                },
                color: '#FFC107'
            }
        ]
    });
    ChartUp.PointChart('#con2', {
        title: 'Myanotherchart',
        interval: [5, 5],
        defaultRadius: 4,
        items: [{
                label: '小绿',
                points: Array.from(new Array(50), function (n) { return [Math.random() * 65, Math.random() * 30, Math.floor(Math.random() * 20)]; }),
                color: '#00796B'
            },
            {
                label: '小橙',
                points: Array.from(new Array(20), function (n) { return [Math.random() * 40, Math.random() * 30, Math.floor(Math.random() * 15)]; }),
                color: '#E64A19'
            }]
    });
    ChartUp.PillarChart('#con3', {
        title: 'Thrirdchart',
        interval: [30, 20],
        trendLine: true,
        items: [{
                label: 'A',
                height: Math.ceil(Math.random() * 100),
                color: '#03A9F4'
            },
            {
                label: 'B',
                height: Math.ceil(Math.random() * 100),
                color: '#7B1FA2'
            },
            {
                label: 'C',
                height: Math.ceil(Math.random() * 100),
                color: '#8BC34A'
            },
            {
                label: 'D',
                height: Math.ceil(Math.random() * 100),
                color: '#FF4081'
            },
            {
                label: 'E',
                height: Math.ceil(Math.random() * 100),
                color: '#FF5722'
            },
            {
                label: 'F',
                height: Math.ceil(Math.random() * 100),
                color: '#5c6bc0'
            }]
    });
    ChartUp.AreaChart('#con4', {
        titlt: 'Area',
        interval: [30, 20],
        xAxis: Array.from(new Array(new Date().getFullYear() - 2010), function (y, i) { return new Date().getFullYear() - i; }).reverse(),
        items: [
            {
                label: 'C',
                color: '#673AB7',
                points: Array.from(new Array(new Date().getFullYear() - 2010), function (x) { return Math.ceil(Math.random() * 30); })
            },
            {
                label: 'C++',
                color: '#FFC107',
                points: Array.from(new Array(new Date().getFullYear() - 2010), function (x) { return Math.ceil(Math.random() * 30); })
            },
            {
                label: 'java',
                color: '#CDDC39',
                points: Array.from(new Array(new Date().getFullYear() - 2010), function (x) { return Math.ceil(Math.random() * 30); })
            }
        ]
    });
    ChartUp.PieChart('#con5', {
        title: 'PieChart',
        radius: 200,
        items: [{
                label: 'A',
                data: Math.ceil(Math.random() * 100),
                color: '#ff5722'
            },
            {
                label: 'B',
                data: Math.ceil(Math.random() * 100),
                color: '#1b5e20'
            },
            {
                label: 'C',
                data: Math.ceil(Math.random() * 100),
                color: '#1565c0'
            },
            {
                label: 'D',
                data: Math.ceil(Math.random() * 100),
                color: '#ffa000'
            },
            {
                label: 'E',
                data: Math.ceil(Math.random() * 100),
                color: '#C2185B'
            },
            {
                label: 'F',
                data: 18,
                color: '#5D4037'
            }]
    });
    ChartUp.AnnularChart('#con6', {
        title: 'AnnularChart',
        radius: 200,
        width: 80,
        items: [{
                label: 'A',
                data: Math.ceil(Math.random() * 100),
                color: '#ff5722'
            },
            {
                label: 'B',
                data: Math.ceil(Math.random() * 100),
                color: '#1b5e20'
            },
            {
                label: 'C',
                data: Math.ceil(Math.random() * 100),
                color: '#1565c0'
            },
            {
                label: 'D',
                data: Math.ceil(Math.random() * 100),
                color: '#ffa000'
            },
            {
                label: 'Esss',
                data: Math.ceil(Math.random() * 100),
                color: '#e6ee9c'
            },
            {
                label: '看电影',
                data: Math.ceil(Math.random() * 100),
                color: '#7986cb'
            }]
    });
    window['Chart'] = ChartUp;
    return ChartUp;
})(window);
//es6 module
exports["default"] = ChartUp;


/***/ })
/******/ ]);