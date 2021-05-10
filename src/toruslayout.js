(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PseudoRandom = exports.Descent = void 0;
class Descent {
    constructor() {
        this.getRandomOrder = (random, graph, tempArray) => {
            for (let i = 0; i < graph.nodes.length; i++) {
                tempArray[i] = -1;
            }
            for (let i = 0; i < graph.nodes.length; i++) {
                let index = Math.floor(random.getNextBetween(0, 1) * graph.nodes.length);
                if (tempArray[index] < 0) {
                    tempArray[index] = i;
                }
                else {
                    i--;
                }
            }
        };
    }
    init(graph, epsilon, linkLength, numberOfAdjustmentIterations, maxSteps) {
        this.meu = {
            fixedIteration: {}
        };
        this.paramW = {
            "min": 0,
            "max": 0,
            "matrix": {}
        };
        this.setParamW(linkLength, graph);
        this.paramL = {
            max: 1 / this.paramW.min,
            min: epsilon / this.paramW.max,
            lambda: 0,
            fixedIterations: []
        };
        this.numberOfAdjustmentIterations = numberOfAdjustmentIterations;
        this.setParamL(this.paramW, epsilon, numberOfAdjustmentIterations, maxSteps);
        this.setMeu(graph, maxSteps, this.paramW, this.paramL);
    }
    getMeu() {
        return this.meu;
    }
    setMeu(graph, maxSteps, paramW, paramL) {
        let meui = new Array();
        for (let i = 0; i < graph.nodes.length; i++) {
            let meuj = new Array();
            for (let j = 0; j < graph.nodes.length; j++) {
                let iterations = new Array();
                for (let k = 0; k < maxSteps; k++) {
                    let product = paramW.matrix[i][j] * paramL.fixedIterations[k];
                    iterations.push(product > 1 ? 1 : product);
                }
                meuj.push(iterations);
            }
            meui.push(meuj);
        }
        this.meu.fixedIteration = meui;
    }
    getParamW() {
        return this.paramW;
    }
    setParamL(paramW, epsilon, numberOfAdjustmentIterations, maxSteps) {
        this.paramL.lambda =
            -Math.log(this.paramL.min / this.paramL.max) / (numberOfAdjustmentIterations - 1);
        for (let i = 0; i < maxSteps; i++) {
            this.paramL.fixedIterations.push((1 / paramW.min) * Math.exp(-this.paramL.lambda * i));
        }
    }
    setParamW(linkLength, graph) {
        let min = Number.MAX_VALUE, max = 0;
        let wi = new Array();
        for (let i = 0; i < graph.nodes.length; i++) {
            let wj = new Array();
            for (let j = 0; j < graph.nodes.length; j++) {
                let distance = linkLength * (graph.shortestPath[i][j].length - 1);
                if (i == j || distance <= 0) {
                    wj.push(0);
                    continue;
                }
                let tempWij = 1 / (distance * distance);
                if (tempWij > 0 && tempWij < min)
                    min = tempWij;
                if (tempWij > max)
                    max = tempWij;
                tempWij > 0 ? wj.push(tempWij) : wj.push(0);
            }
            wi.push(wj);
        }
        this.paramW.matrix = wi;
        this.paramW.min = min;
        this.paramW.max = max;
    }
    getParamLUnlimitedIteration(iteration) {
        //force to converge
        let smallEpsilon = 0.001;
        let myParamL = {
            max: 1 / this.paramW.min,
            min: smallEpsilon / this.paramW.max,
            lambda: 0,
            fixedIterations: []
        };
        myParamL.lambda =
            (myParamL.max / myParamL.min - 1) / (this.numberOfAdjustmentIterations - 1);
        let stepSizeForUnlimitedIterations = 1 / this.paramW.max / (1 + myParamL.lambda * iteration);
        return stepSizeForUnlimitedIterations;
    }
}
exports.Descent = Descent;
// Linear congruential pseudo random number generator
class PseudoRandom {
    constructor(seed = 1) {
        this.seed = seed;
        this.a = 214013;
        this.c = 2531011;
        this.m = 2147483648;
        this.range = 32767;
    }
    // random real between 0 and 1
    getNext() {
        this.seed = (this.seed * this.a + this.c) % this.m;
        return (this.seed >> 16) / this.range;
    }
    // random real between min and max
    getNextBetween(min, max) {
        return min + this.getNext() * (max - min);
    }
}
exports.PseudoRandom = PseudoRandom;
},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayoutHelper = void 0;
class LayoutHelper {
    static wrappingNode(graph, oneThirdWidth, oneThirdHeight, twoThirdsWidth, twoThirdsHeight) {
        //To wrap a node if it's not within a boundary, we apply the following 2 steps
        //1. check whether the input node is within boundary 
        //2. wrap node.x, node.y if it's outside boundary
        for (let node of graph.nodes) {
            if (node.x > twoThirdsWidth) {
                node.x -= oneThirdWidth;
                while (node.x > twoThirdsWidth)
                    node.x -= oneThirdWidth;
            }
            else if (node.x < oneThirdWidth) {
                node.x += oneThirdWidth;
                while (node.x < oneThirdWidth)
                    node.x += oneThirdWidth;
            }
            if (node.y > twoThirdsHeight) {
                node.y -= oneThirdHeight;
                while (node.y > twoThirdsHeight)
                    node.y -= oneThirdHeight;
            }
            else if (node.y < oneThirdHeight) {
                node.y += oneThirdHeight;
                while (node.y < oneThirdHeight)
                    node.y += oneThirdHeight;
            }
        }
    }
    static findMappingNodesFromOtherSquares(x, y, oneThirdWidth, oneThirdHeight, twoThirdsWidth, twoThirdsHeight) {
        //initialise mapping array
        let mappingNodes = new Array();
        if (mappingNodes != null) {
            //calculate x, y position of nodes in the 4 adjacent squares
            //in the order of [left, up, right, bottom]
            mappingNodes.push({
                x: x - oneThirdWidth,
                y: y,
                intersectedX: oneThirdWidth,
                intersectedY: 0
            });
            mappingNodes.push({
                x: x,
                y: y - oneThirdHeight,
                intersectedX: 0,
                intersectedY: oneThirdHeight
            });
            mappingNodes.push({
                x: x + oneThirdWidth,
                y: y,
                intersectedX: twoThirdsWidth,
                intersectedY: 0
            });
            mappingNodes.push({
                x: x,
                y: y + oneThirdHeight,
                intersectedX: 0,
                intersectedY: twoThirdsHeight
            });
            //calculate x, y position of nodes in the 4 corner squares
            //in the order of [upper-left, upper-right, bottom-right bottom-left]
            mappingNodes.push({
                x: x - oneThirdWidth,
                y: y - oneThirdHeight,
                intersectedX: oneThirdWidth,
                intersectedY: oneThirdHeight
            });
            mappingNodes.push({
                x: x + oneThirdWidth,
                y: y - oneThirdHeight,
                intersectedX: twoThirdsWidth,
                intersectedY: oneThirdHeight
            });
            mappingNodes.push({
                x: x + oneThirdWidth,
                y: y + oneThirdHeight,
                intersectedX: twoThirdsWidth,
                intersectedY: twoThirdsHeight
            });
            mappingNodes.push({
                x: x - oneThirdWidth,
                y: y + oneThirdHeight,
                intersectedX: oneThirdWidth,
                intersectedY: twoThirdsHeight
            });
        }
        return mappingNodes;
    }
    static findEuclideanDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    }
    static getYGivenXAndSrcMappingNodes(x1, y1, x2, y2, x) {
        let y = 0;
        if (x1 == x2)
            y = (y1 + y2) / 2;
        else {
            y = (x2 * y1 - x * y1 - x1 * y2 + x * y2) / (x2 - x1);
        }
        return y;
    }
    static getXGivenYAndSrcMappingNodes(x1, y1, x2, y2, y) {
        let x = 0;
        if (y1 == y2)
            x = (x1 + x2) / 2;
        else {
            x = (x1 * y2 - x2 * y1 - x1 * y + x2 * y) / (y2 - y1);
        }
        return x;
    }
}
exports.LayoutHelper = LayoutHelper;
},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TorusLayout = void 0;
const descent_1 = require("./descent");
const layouthelper_1 = require("./layouthelper");
class TorusLayout {
    constructor(graph, configuration, updateRender) {
        this.random = new descent_1.PseudoRandom();
        this.descent = new descent_1.Descent();
        this.graph = graph;
        this.configuration = configuration;
        this.oneThirdWidth = configuration.svgWidth / 3;
        this.twoThirdsWidth = configuration.svgWidth * 2 / 3;
        this.oneThirdHeight = configuration.svgHeight / 3;
        this.twoThirdsHeight = configuration.svgHeight * 2 / 3;
        this.updateRender = updateRender;
        this.descent = new descent_1.Descent();
        this.descent.init(graph, this.configuration.epsilon, this.configuration.linkLength, this.configuration.numberOfAdjustmentIterations, this.configuration.maxSteps);
    }
    start() {
        let w = this.configuration.svgWidth, h = this.configuration.svgHeight;
        this.graph.nodes.forEach((v, i) => {
            v.index = i;
            if (typeof v.x === 'undefined') {
                (v.x = w / 2), (v.y = h / 2);
            }
        });
        this.graph.links.forEach(l => {
            if (typeof l.source == "number")
                l.source = this.graph.nodes[l.source];
            if (typeof l.target == "number")
                l.target = this.graph.nodes[l.target];
        });
        //randomise positions of nodes
        for (let i = 0; i < this.graph.nodes.length; i++) {
            let newX = w / 2 - 0.5 + this.random.getNextBetween(0, 1);
            let newY = h / 2 - 0.5 + this.random.getNextBetween(0, 1);
            this.graph.nodes[i].x = newX;
            this.graph.nodes[i].y = newY;
        }
        this.run();
    }
    run() {
        this.visitedMatrix = new Array();
        for (let i = 0; i < this.graph.nodes.length; i++) {
            let tempArray = new Array();
            for (let j = 0; j < this.graph.nodes.length; j++) {
                tempArray.push(false);
            }
            this.visitedMatrix.push(tempArray);
        }
        this.randomOrder = {
            "nodeIndex": new Array(),
            "matrix": new Array()
        };
        for (let i = 0; i < this.graph.nodes.length; i++) {
            this.randomOrder.nodeIndex.push(-1);
        }
        //generate random node sequence
        for (let i = 0; i < this.graph.nodes.length; i++) {
            let index = Math.floor(this.random.getNextBetween(0, 1) * this.graph.nodes.length);
            if (this.randomOrder.nodeIndex[index] < 0) {
                this.randomOrder.nodeIndex[index] = i;
            }
            else {
                i--;
            }
        }
        for (let nodeIndex = 0; nodeIndex < this.graph.nodes.length; nodeIndex++) {
            let tempArray = new Array();
            for (let i = 0; i < this.graph.nodes.length; i++) {
                tempArray.push(-1);
            }
            for (let i = 0; i < this.graph.nodes.length; i++) {
                let index = Math.floor(this.random.getNextBetween(0, 1) * this.graph.nodes.length);
                if (tempArray[index] < 0) {
                    tempArray[index] = i;
                }
                else {
                    i--;
                }
            }
            this.randomOrder.matrix.push(tempArray);
        }
        this.randomOrderArray = new Array(this.graph.nodes.length);
        this.maxDisplacement = Number.MAX_VALUE;
        for (let i = 0; i < this.graph.nodes.length; i++) {
            this.randomOrderArray[i] = -1;
        }
        this.step = 0;
        this.tick();
    }
    tick() {
        let unitVector = [-1, -1];
        let vectorR = [-1, -1];
        while (this.maxDisplacement >= this.configuration.delta) {
            if (this.step > this.configuration.maxSteps) {
                break;
            }
            else {
                this.maxDisplacement = -1;
                let numVisits = 0;
                this.descent.getRandomOrder(this.random, this.graph, this.randomOrderArray);
                for (let i = 0; i < this.randomOrder.nodeIndex.length; i++) {
                    this.randomOrder.nodeIndex[i] = this.randomOrderArray[i];
                }
                for (let i = 0; i < this.randomOrder.nodeIndex.length; i++) {
                    let a = this.randomOrder.nodeIndex[i];
                    this.descent.getRandomOrder(this.random, this.graph, this.randomOrderArray);
                    for (let j = 0; j < this.randomOrderArray.length; j++) {
                        let b = this.randomOrderArray[j];
                        if (!this.visitedMatrix[a][b]) {
                            if (a == b) {
                                this.visitedMatrix[a][b] = true;
                                continue;
                            }
                            numVisits++;
                            let distance = Number.MAX_VALUE;
                            let idealDistance = this.configuration.linkLength * (this.graph.shortestPath[a][b].length - 1);
                            if (idealDistance == 0) {
                                //disconnected
                                this.visitedMatrix[a][b] = true;
                                continue;
                            }
                            if (idealDistance < 0) {
                                this.visitedMatrix[a][b] = true;
                                continue;
                            }
                            //select Xa and Xb (torus)
                            layouthelper_1.LayoutHelper.wrappingNode(this.graph, this.oneThirdWidth, this.oneThirdWidth, this.twoThirdsWidth, this.twoThirdsHeight);
                            distance = this.computeShortestDistanceOverContext(this.graph.nodes[a].x, this.graph.nodes[a].y, this.graph.nodes[b].x, this.graph.nodes[b].y, unitVector, idealDistance);
                            unitVector[0] = unitVector[0] / distance;
                            unitVector[1] = unitVector[1] / distance;
                            let temp = (distance - idealDistance) / 2;
                            vectorR[0] = unitVector[0] * temp;
                            vectorR[1] = unitVector[1] * temp;
                            let tempMeu = 0.1;
                            if (this.step < this.configuration.numberOfAdjustmentIterations) {
                                tempMeu = this.descent.getMeu().fixedIteration[a][b][this.step];
                            }
                            else {
                                tempMeu = this.descent.getParamLUnlimitedIteration(this.step) * this.descent.getParamW().matrix[a][b];
                            }
                            //update position Xa and Xb based on calculated movement
                            let newX = this.graph.nodes[a].x - tempMeu * vectorR[0];
                            let newY = this.graph.nodes[a].y - tempMeu * vectorR[1];
                            let bForceToConverge = false;
                            if (this.step >= this.configuration.numberOfAdjustmentIterations) {
                                if (newX > this.twoThirdsWidth ||
                                    newX < this.oneThirdWidth ||
                                    newY > this.twoThirdsHeight ||
                                    newY < this.oneThirdHeight) {
                                    //Force to converge: no wrapping of nodes are permitted at this stage
                                    newX = this.graph.nodes[a].x;
                                    newY = this.graph.nodes[a].y;
                                    bForceToConverge = true;
                                }
                            }
                            let tmpMovement = layouthelper_1.LayoutHelper.findEuclideanDistance(this.graph.nodes[a].x, this.graph.nodes[a].y, newX, newY);
                            if (!bForceToConverge) {
                                this.graph.nodes[a].x = this.graph.nodes[a].x - tempMeu * vectorR[0];
                                this.graph.nodes[a].y = this.graph.nodes[a].y - tempMeu * vectorR[1];
                            }
                            if (this.maxDisplacement < tmpMovement) {
                                this.maxDisplacement = tmpMovement;
                            }
                            newX = this.graph.nodes[b].x + tempMeu * vectorR[0];
                            newY = this.graph.nodes[b].y + tempMeu * vectorR[1];
                            bForceToConverge = false;
                            if (this.step >= this.configuration.numberOfAdjustmentIterations) {
                                if (newX > this.twoThirdsWidth ||
                                    newX < this.oneThirdWidth ||
                                    newY > this.twoThirdsHeight ||
                                    newY < this.oneThirdHeight) {
                                    //Force to converge: no wrapping of nodes are permitted at this stage
                                    newX = this.graph.nodes[b].x;
                                    newY = this.graph.nodes[b].y;
                                    bForceToConverge = true;
                                }
                            }
                            tmpMovement = layouthelper_1.LayoutHelper.findEuclideanDistance(this.graph.nodes[b].x, this.graph.nodes[b].y, newX, newY);
                            if (!bForceToConverge) {
                                this.graph.nodes[b].x = this.graph.nodes[b].x + tempMeu * vectorR[0];
                                this.graph.nodes[b].y = this.graph.nodes[b].y + tempMeu * vectorR[1];
                            }
                            if (this.maxDisplacement < tmpMovement) {
                                this.maxDisplacement = tmpMovement;
                            }
                            //update visited matrix
                            this.visitedMatrix[a][b] = true;
                            this.visitedMatrix[b][a] = true;
                        }
                    }
                }
                //reset visitedMatrix before next step iteration
                for (let i = 0; i < this.graph.nodes.length; i++) {
                    for (let j = 0; j < this.graph.nodes.length; j++)
                        this.visitedMatrix[i][j] = false;
                }
                this.step++;
                if (this.configuration.bEnableAnimation) {
                    layouthelper_1.LayoutHelper.wrappingNode(this.graph, this.oneThirdWidth, this.oneThirdWidth, this.twoThirdsWidth, this.twoThirdsHeight);
                    this.updateRender();
                }
            }
        }
        layouthelper_1.LayoutHelper.wrappingNode(this.graph, this.oneThirdWidth, this.oneThirdWidth, this.twoThirdsWidth, this.twoThirdsHeight);
        this.updateRender();
        this.updateRender();
    }
    computeShortestDistanceOverContext(sourceX, sourceY, targetX, targetY, unitVector, idealDistance) {
        let mappingNodes = null;
        let tmpDistance = 0;
        let results = { "edgeLength": Number.MAX_VALUE, "minDiffFromIdealDistance": Number.MAX_VALUE };
        tmpDistance = 0;
        mappingNodes = layouthelper_1.LayoutHelper.findMappingNodesFromOtherSquares(targetX, targetY, this.oneThirdHeight, this.oneThirdHeight, this.twoThirdsWidth, this.twoThirdsWidth);
        this.findWrapping(sourceX, sourceY, targetX, targetY, mappingNodes, results, unitVector, idealDistance);
        tmpDistance = layouthelper_1.LayoutHelper.findEuclideanDistance(sourceX, sourceY, targetX, targetY);
        let diffFromIdealDistance = Math.abs(tmpDistance - idealDistance);
        if (results.minDiffFromIdealDistance <= diffFromIdealDistance) {
        }
        else {
            if (unitVector != null) {
                unitVector[0] = sourceX - targetX;
                unitVector[1] = sourceY - targetY;
            }
            results.minDiffFromIdealDistance = diffFromIdealDistance;
            results.edgeLength = tmpDistance;
        }
        return results.edgeLength;
    }
    findWrapping(sourceX, sourceY, targetX, targetY, mappingNodes, results, unitVector, idealDistance) {
        let minDiffFromIdealDistance = Number.MAX_VALUE;
        let tmpDistance = Number.MAX_VALUE;
        let resultcontextnumber = -1;
        if (mappingNodes != null) {
            let contextNumber = -1;
            for (let mappingNode of mappingNodes) {
                contextNumber++;
                //update vectors directly from 8 adjacency context
                tmpDistance = layouthelper_1.LayoutHelper.findEuclideanDistance(mappingNode.x, mappingNode.y, sourceX, sourceY);
                let diffFromIdealDistance = Math.abs(tmpDistance - idealDistance);
                if (minDiffFromIdealDistance > diffFromIdealDistance) {
                    minDiffFromIdealDistance = diffFromIdealDistance;
                    if (unitVector != null) {
                        unitVector[0] = (sourceX - mappingNode.x);
                        unitVector[1] = (sourceY - mappingNode.y);
                    }
                    resultcontextnumber = contextNumber;
                    results.edgeLength = tmpDistance;
                    results.minDiffFromIdealDistance = minDiffFromIdealDistance;
                }
            }
        }
        return resultcontextnumber;
    }
}
exports.TorusLayout = TorusLayout;
},{"./descent":1,"./layouthelper":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZGVzY2VudC50cyIsInNyYy9sYXlvdXRoZWxwZXIudHMiLCJzcmMvdG9ydXNsYXlvdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7QUNBQSxNQUFhLE9BQU87SUFBcEI7UUEyQlcsbUJBQWMsR0FBRyxDQUFDLE1BQVcsRUFBRSxLQUFVLEVBQUUsU0FBd0IsRUFBRSxFQUFFO1lBQzFFLEtBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBQztnQkFDdkMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQ3JCO1lBQ0QsS0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFDO2dCQUN2QyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3ZFLElBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDckIsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDeEI7cUJBQ0k7b0JBQ0QsQ0FBQyxFQUFFLENBQUM7aUJBQ1A7YUFDSjtRQUNMLENBQUMsQ0FBQTtJQW1GTCxDQUFDO0lBckhVLElBQUksQ0FBQyxLQUFVLEVBQUUsT0FBZSxFQUFFLFVBQWtCLEVBQUUsNEJBQW9DLEVBQUUsUUFBZ0I7UUFDL0csSUFBSSxDQUFDLEdBQUcsR0FBRztZQUNQLGNBQWMsRUFBRSxFQUFFO1NBQ3JCLENBQUM7UUFDRixJQUFJLENBQUMsTUFBTSxHQUFHO1lB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QUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFDO1lBQzVDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2pGLElBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUN0QyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDekM7aUJBQ0k7Z0JBQ0QsQ0FBQyxFQUFFLENBQUM7YUFDUDtTQUNKO1FBRUQsS0FBSSxJQUFJLFNBQVMsR0FBRyxDQUFDLEVBQUUsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsRUFBRTtZQUNyRSxJQUFJLFNBQVMsR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO1lBQzVCLEtBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUM7Z0JBQzVDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN0QjtZQUVELEtBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUM7Z0JBQzVDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FB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QUU3QixJQUFHLFlBQVksSUFBSSxJQUFJLEVBQUU7WUFDdkIsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFdkIsS0FBSSxJQUFJLFdBQVcsSUFBSSxZQUFZLEVBQUU7Z0JBQ25DLGFBQWEsRUFBRSxDQUFDO2dCQUVoQixrREFBa0Q7Z0JBQ2xELFdBQVcsR0FBRywyQkFBWSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ2pHLElBQUkscUJBQXFCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsYUFBYSxDQUFDLENBQUM7Z0JBRWxFLElBQUcsd0JBQXdCLEdBQUcscUJBQXFCLEVBQUU7b0JBQ25ELHdCQUF3QixHQUFHLHFCQUFxQixDQUFDO29CQUVqRCxJQUFHLFVBQVUsSUFBSSxJQUFJLEVBQUU7d0JBQ3JCLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3hDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQ3pDO29CQUNELG1CQUFtQixHQUFHLGFBQWEsQ0FBQztvQkFDcEMsT0FBTyxDQUFDLFVBQVUsR0FBRyxXQUFXLENBQUM7b0JBQ2pDLE9BQU8sQ0FBQyx3QkFBd0IsR0FBRyx3QkFBd0IsQ0FBQztpQkFDN0Q7YUFFRjtTQUNGO1FBQ0QsT0FBTyxtQkFBbUIsQ0FBQztJQUMvQixDQUFDO0NBQ0o7QUFuVkQsa0NBbVZDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiZXhwb3J0IGNsYXNzIERlc2NlbnQge1xyXG4gICAgcHJpdmF0ZSBwYXJhbVc6IGFueTtcclxuICAgIHByaXZhdGUgcGFyYW1MOiBhbnk7XHJcbiAgICBwcml2YXRlIG1ldTogYW55O1xyXG4gICAgcHJpdmF0ZSBudW1iZXJPZkFkanVzdG1lbnRJdGVyYXRpb25zOiBudW1iZXI7XHJcblxyXG4gICAgcHVibGljIGluaXQoZ3JhcGg6IGFueSwgZXBzaWxvbjogbnVtYmVyLCBsaW5rTGVuZ3RoOiBudW1iZXIsIG51bWJlck9mQWRqdXN0bWVudEl0ZXJhdGlvbnM6IG51bWJlciwgbWF4U3RlcHM6IG51bWJlcil7XHJcbiAgICAgICAgdGhpcy5tZXUgPSB7XHJcbiAgICAgICAgICAgIGZpeGVkSXRlcmF0aW9uOiB7fVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5wYXJhbVcgPSB7XHJcbiAgICAgICAgICAgIFwibWluXCI6IDAsXHJcbiAgICAgICAgICAgIFwibWF4XCI6IDAsXHJcbiAgICAgICAgICAgIFwibWF0cml4XCI6IHt9XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnNldFBhcmFtVyhsaW5rTGVuZ3RoLCBncmFwaCk7XHJcbiAgICAgICAgdGhpcy5wYXJhbUwgPSB7XHJcbiAgICAgICAgICAgIG1heDogMSAvIHRoaXMucGFyYW1XLm1pbixcclxuICAgICAgICAgICAgbWluOiBlcHNpbG9uIC8gdGhpcy5wYXJhbVcubWF4LFxyXG4gICAgICAgICAgICBsYW1iZGE6IDAsXHJcbiAgICAgICAgICAgIGZpeGVkSXRlcmF0aW9uczogW11cclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMubnVtYmVyT2ZBZGp1c3RtZW50SXRlcmF0aW9ucyA9IG51bWJlck9mQWRqdXN0bWVudEl0ZXJhdGlvbnM7XHJcbiAgICAgICAgdGhpcy5zZXRQYXJhbUwodGhpcy5wYXJhbVcsIGVwc2lsb24sIG51bWJlck9mQWRqdXN0bWVudEl0ZXJhdGlvbnMsIG1heFN0ZXBzKVxyXG4gICAgICAgIHRoaXMuc2V0TWV1KGdyYXBoLCBtYXhTdGVwcywgdGhpcy5wYXJhbVcsIHRoaXMucGFyYW1MKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0UmFuZG9tT3JkZXIgPSAocmFuZG9tOiBhbnksIGdyYXBoOiBhbnksIHRlbXBBcnJheTogQXJyYXk8bnVtYmVyPikgPT4ge1xyXG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBncmFwaC5ub2Rlcy5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgIHRlbXBBcnJheVtpXSA9IC0xO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgZ3JhcGgubm9kZXMubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgICAgICBsZXQgaW5kZXggPSBNYXRoLmZsb29yKHJhbmRvbS5nZXROZXh0QmV0d2VlbigwLCAxKSpncmFwaC5ub2Rlcy5sZW5ndGgpO1xyXG4gICAgICAgICAgICBpZih0ZW1wQXJyYXlbaW5kZXhdIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgdGVtcEFycmF5W2luZGV4XSA9IGk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpLS07XHJcbiAgICAgICAgICAgIH0gICAgXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRNZXUoKTogYW55IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tZXU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRNZXUgKGdyYXBoOiBhbnksIG1heFN0ZXBzOiBudW1iZXIsIHBhcmFtVzogYW55LCBwYXJhbUw6IGFueSkge1xyXG4gICAgICAgIGxldCBtZXVpID0gbmV3IEFycmF5KCk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBncmFwaC5ub2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgbWV1aiA9IG5ldyBBcnJheSgpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGdyYXBoLm5vZGVzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaXRlcmF0aW9ucyA9IG5ldyBBcnJheSgpO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCBtYXhTdGVwczsgaysrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwYXJhbVcubWF0cml4W2ldW2pdICogcGFyYW1MLmZpeGVkSXRlcmF0aW9uc1trXTtcclxuICAgICAgICAgICAgICAgICAgICBpdGVyYXRpb25zLnB1c2gocHJvZHVjdCA+IDEgPyAxIDogcHJvZHVjdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBtZXVqLnB1c2goaXRlcmF0aW9ucyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbWV1aS5wdXNoKG1ldWopO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm1ldS5maXhlZEl0ZXJhdGlvbiA9IG1ldWk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFBhcmFtVygpOiBhbnkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtVztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldFBhcmFtTChwYXJhbVc6IGFueSwgZXBzaWxvbjogbnVtYmVyLCBudW1iZXJPZkFkanVzdG1lbnRJdGVyYXRpb25zOiBudW1iZXIsIG1heFN0ZXBzOiBudW1iZXIpe1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMucGFyYW1MLmxhbWJkYSA9XHJcbiAgICAgICAgLU1hdGgubG9nKHRoaXMucGFyYW1MLm1pbiAvIHRoaXMucGFyYW1MLm1heCkgLyAobnVtYmVyT2ZBZGp1c3RtZW50SXRlcmF0aW9ucyAtIDEpO1xyXG4gICAgXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtYXhTdGVwczsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGFyYW1MLmZpeGVkSXRlcmF0aW9ucy5wdXNoKFxyXG4gICAgICAgICAgICAgICAgKDEgLyBwYXJhbVcubWluKSAqIE1hdGguZXhwKC10aGlzLnBhcmFtTC5sYW1iZGEgKiBpKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH0gICAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRQYXJhbVcobGlua0xlbmd0aDogbnVtYmVyLCBncmFwaDogYW55KSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IG1pbiA9IE51bWJlci5NQVhfVkFMVUUsIG1heCA9IDA7XHJcbiAgICAgICAgbGV0IHdpID0gbmV3IEFycmF5KCk7XHJcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGdyYXBoLm5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCB3aiA9IG5ldyBBcnJheSgpO1xyXG4gICAgICAgICAgICBmb3IobGV0IGogPSAwOyBqIDwgZ3JhcGgubm9kZXMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBkaXN0YW5jZSA9IGxpbmtMZW5ndGggKiAoZ3JhcGguc2hvcnRlc3RQYXRoW2ldW2pdLmxlbmd0aCAtIDEpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZihpID09IGogfHwgZGlzdGFuY2UgPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdqLnB1c2goMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBsZXQgdGVtcFdpaiA9IDEvKGRpc3RhbmNlKmRpc3RhbmNlKTtcclxuICAgICAgICAgICAgICAgIGlmKHRlbXBXaWogPiAwICYmIHRlbXBXaWogPCBtaW4pXHJcbiAgICAgICAgICAgICAgICAgICAgbWluID0gdGVtcFdpajtcclxuICAgICAgICAgICAgICAgIGlmKHRlbXBXaWogPiBtYXgpXHJcbiAgICAgICAgICAgICAgICAgICAgbWF4ID0gdGVtcFdpajtcclxuICAgICAgICAgICAgICAgIHRlbXBXaWogPiAwID8gd2oucHVzaCh0ZW1wV2lqKSA6IHdqLnB1c2goMCk7XHJcbiAgICAgICAgICAgIH0gICAgXHJcbiAgICAgICAgICAgIHdpLnB1c2god2opO1xyXG4gICAgICAgIH0gIFxyXG4gICAgICAgIHRoaXMucGFyYW1XLm1hdHJpeCA9IHdpO1xyXG4gICAgICAgIHRoaXMucGFyYW1XLm1pbiA9IG1pbjtcclxuICAgICAgICB0aGlzLnBhcmFtVy5tYXggPSBtYXg7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFBhcmFtTFVubGltaXRlZEl0ZXJhdGlvbiAoaXRlcmF0aW9uOiBudW1iZXIpIHtcclxuICAgICAgICAvL2ZvcmNlIHRvIGNvbnZlcmdlXHJcbiAgICAgICAgbGV0IHNtYWxsRXBzaWxvbiA9IDAuMDAxO1xyXG4gICAgICAgIGxldCBteVBhcmFtTCA9IHtcclxuICAgICAgICAgIG1heDogMSAvIHRoaXMucGFyYW1XLm1pbixcclxuICAgICAgICAgIG1pbjogc21hbGxFcHNpbG9uIC8gdGhpcy5wYXJhbVcubWF4LFxyXG4gICAgICAgICAgbGFtYmRhOiAwLFxyXG4gICAgICAgICAgZml4ZWRJdGVyYXRpb25zOiBbXVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgbXlQYXJhbUwubGFtYmRhID1cclxuICAgICAgICAgIChteVBhcmFtTC5tYXggLyBteVBhcmFtTC5taW4gLSAxKSAvICh0aGlzLm51bWJlck9mQWRqdXN0bWVudEl0ZXJhdGlvbnMgLSAxKTtcclxuICAgICAgXHJcbiAgICAgICAgbGV0IHN0ZXBTaXplRm9yVW5saW1pdGVkSXRlcmF0aW9ucyA9XHJcbiAgICAgICAgICAxIC8gdGhpcy5wYXJhbVcubWF4IC8gKDEgKyBteVBhcmFtTC5sYW1iZGEgKiBpdGVyYXRpb24pO1xyXG4gICAgICAgXHJcbiAgICAgICAgcmV0dXJuIHN0ZXBTaXplRm9yVW5saW1pdGVkSXRlcmF0aW9ucztcclxuICAgICAgfVxyXG59XHJcblxyXG4vLyBMaW5lYXIgY29uZ3J1ZW50aWFsIHBzZXVkbyByYW5kb20gbnVtYmVyIGdlbmVyYXRvclxyXG5leHBvcnQgY2xhc3MgUHNldWRvUmFuZG9tIHtcclxuICAgIHByaXZhdGUgYTogbnVtYmVyID0gMjE0MDEzO1xyXG4gICAgcHJpdmF0ZSBjOiBudW1iZXIgPSAyNTMxMDExO1xyXG4gICAgcHJpdmF0ZSBtOiBudW1iZXIgPSAyMTQ3NDgzNjQ4O1xyXG4gICAgcHJpdmF0ZSByYW5nZTogbnVtYmVyID0gMzI3Njc7XHJcblxyXG4gICAgY29uc3RydWN0b3IocHVibGljIHNlZWQ6IG51bWJlciA9IDEpIHsgfVxyXG5cclxuICAgIC8vIHJhbmRvbSByZWFsIGJldHdlZW4gMCBhbmQgMVxyXG4gICAgZ2V0TmV4dCgpOiBudW1iZXIge1xyXG4gICAgICAgIHRoaXMuc2VlZCA9ICh0aGlzLnNlZWQgKiB0aGlzLmEgKyB0aGlzLmMpICUgdGhpcy5tO1xyXG4gICAgICAgIHJldHVybiAodGhpcy5zZWVkID4+IDE2KSAvIHRoaXMucmFuZ2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcmFuZG9tIHJlYWwgYmV0d2VlbiBtaW4gYW5kIG1heFxyXG4gICAgZ2V0TmV4dEJldHdlZW4obWluOiBudW1iZXIsIG1heDogbnVtYmVyKSB7XHJcbiAgICAgICAgcmV0dXJuIG1pbiArIHRoaXMuZ2V0TmV4dCgpICogKG1heCAtIG1pbik7XHJcbiAgICB9XHJcbn0iLCJleHBvcnQgY2xhc3MgTGF5b3V0SGVscGVyIHtcclxuICBwdWJsaWMgc3RhdGljIHdyYXBwaW5nTm9kZSAoZ3JhcGg6IGFueSwgb25lVGhpcmRXaWR0aDogbnVtYmVyLCBvbmVUaGlyZEhlaWdodDogbnVtYmVyLCB0d29UaGlyZHNXaWR0aDogbnVtYmVyLCB0d29UaGlyZHNIZWlnaHQ6IG51bWJlcikge1xyXG4gICAgICAvL1RvIHdyYXAgYSBub2RlIGlmIGl0J3Mgbm90IHdpdGhpbiBhIGJvdW5kYXJ5LCB3ZSBhcHBseSB0aGUgZm9sbG93aW5nIDIgc3RlcHNcclxuICAgICAgLy8xLiBjaGVjayB3aGV0aGVyIHRoZSBpbnB1dCBub2RlIGlzIHdpdGhpbiBib3VuZGFyeSBcclxuICAgICAgLy8yLiB3cmFwIG5vZGUueCwgbm9kZS55IGlmIGl0J3Mgb3V0c2lkZSBib3VuZGFyeVxyXG4gICAgIFxyXG4gICAgICBmb3IobGV0IG5vZGUgb2YgZ3JhcGgubm9kZXMpIHtcclxuICAgICAgICAgIGlmKG5vZGUueCA+IHR3b1RoaXJkc1dpZHRoKSB7XHJcbiAgICAgICAgICBub2RlLnggLT0gb25lVGhpcmRXaWR0aDtcclxuICAgICAgICAgIHdoaWxlIChub2RlLnggPiB0d29UaGlyZHNXaWR0aClcclxuICAgICAgICAgICAgICBub2RlLnggLT0gb25lVGhpcmRXaWR0aDtcclxuICAgICAgICAgIH0gICAgICAgICAgICBcclxuICAgICAgICAgIGVsc2UgaWYobm9kZS54IDwgb25lVGhpcmRXaWR0aCkge1xyXG4gICAgICAgICAgbm9kZS54ICs9IG9uZVRoaXJkV2lkdGg7XHJcbiAgICAgICAgICB3aGlsZSAobm9kZS54IDwgb25lVGhpcmRXaWR0aClcclxuICAgICAgICAgICAgICBub2RlLnggKz0gb25lVGhpcmRXaWR0aDtcclxuICAgICAgICAgIH1cclxuICAgICAgXHJcbiAgICAgICAgICBpZihub2RlLnkgPiB0d29UaGlyZHNIZWlnaHQpIHtcclxuICAgICAgICAgIG5vZGUueSAtPSBvbmVUaGlyZEhlaWdodDtcclxuICAgICAgICAgIHdoaWxlIChub2RlLnkgPiB0d29UaGlyZHNIZWlnaHQpXHJcbiAgICAgICAgICAgICAgbm9kZS55IC09IG9uZVRoaXJkSGVpZ2h0OyAgICAgICAgICAgICAgICBcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2UgaWYobm9kZS55IDwgb25lVGhpcmRIZWlnaHQpIHtcclxuICAgICAgICAgIG5vZGUueSArPSBvbmVUaGlyZEhlaWdodDtcclxuICAgICAgICAgIHdoaWxlIChub2RlLnkgPCBvbmVUaGlyZEhlaWdodClcclxuICAgICAgICAgICAgICBub2RlLnkgKz0gb25lVGhpcmRIZWlnaHQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgZmluZE1hcHBpbmdOb2Rlc0Zyb21PdGhlclNxdWFyZXMgKHg6IG51bWJlciwgeTogbnVtYmVyLCBvbmVUaGlyZFdpZHRoOiBudW1iZXIsIG9uZVRoaXJkSGVpZ2h0OiBudW1iZXIsXHJcbiAgICAgIHR3b1RoaXJkc1dpZHRoOiBudW1iZXIsIHR3b1RoaXJkc0hlaWdodDogbnVtYmVyKTogQXJyYXk8YW55PiB7XHJcbiAgICAgIC8vaW5pdGlhbGlzZSBtYXBwaW5nIGFycmF5XHJcbiAgICAgIGxldCBtYXBwaW5nTm9kZXMgPSBuZXcgQXJyYXkoKTtcclxuICAgIFxyXG4gICAgIFxyXG4gICAgICBpZiAobWFwcGluZ05vZGVzICE9IG51bGwpIHtcclxuICAgICAgICAvL2NhbGN1bGF0ZSB4LCB5IHBvc2l0aW9uIG9mIG5vZGVzIGluIHRoZSA0IGFkamFjZW50IHNxdWFyZXNcclxuICAgICAgICAvL2luIHRoZSBvcmRlciBvZiBbbGVmdCwgdXAsIHJpZ2h0LCBib3R0b21dXHJcbiAgICAgICAgbWFwcGluZ05vZGVzLnB1c2goe1xyXG4gICAgICAgICAgeDogeCAtIG9uZVRoaXJkV2lkdGgsXHJcbiAgICAgICAgICB5OiB5LFxyXG4gICAgICAgICAgaW50ZXJzZWN0ZWRYOiBvbmVUaGlyZFdpZHRoLFxyXG4gICAgICAgICAgaW50ZXJzZWN0ZWRZOiAwXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbWFwcGluZ05vZGVzLnB1c2goe1xyXG4gICAgICAgICAgeDogeCxcclxuICAgICAgICAgIHk6IHkgLSBvbmVUaGlyZEhlaWdodCxcclxuICAgICAgICAgIGludGVyc2VjdGVkWDogMCxcclxuICAgICAgICAgIGludGVyc2VjdGVkWTogb25lVGhpcmRIZWlnaHRcclxuICAgICAgICB9KTtcclxuICAgICAgICBtYXBwaW5nTm9kZXMucHVzaCh7XHJcbiAgICAgICAgICB4OiB4ICsgb25lVGhpcmRXaWR0aCxcclxuICAgICAgICAgIHk6IHksXHJcbiAgICAgICAgICBpbnRlcnNlY3RlZFg6IHR3b1RoaXJkc1dpZHRoLFxyXG4gICAgICAgICAgaW50ZXJzZWN0ZWRZOiAwXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbWFwcGluZ05vZGVzLnB1c2goe1xyXG4gICAgICAgICAgeDogeCxcclxuICAgICAgICAgIHk6IHkgKyBvbmVUaGlyZEhlaWdodCxcclxuICAgICAgICAgIGludGVyc2VjdGVkWDogMCxcclxuICAgICAgICAgIGludGVyc2VjdGVkWTogdHdvVGhpcmRzSGVpZ2h0XHJcbiAgICAgICAgfSk7XHJcbiAgICBcclxuICAgICAgICAvL2NhbGN1bGF0ZSB4LCB5IHBvc2l0aW9uIG9mIG5vZGVzIGluIHRoZSA0IGNvcm5lciBzcXVhcmVzXHJcbiAgICAgICAgLy9pbiB0aGUgb3JkZXIgb2YgW3VwcGVyLWxlZnQsIHVwcGVyLXJpZ2h0LCBib3R0b20tcmlnaHQgYm90dG9tLWxlZnRdXHJcbiAgICAgICAgbWFwcGluZ05vZGVzLnB1c2goe1xyXG4gICAgICAgICAgeDogeCAtIG9uZVRoaXJkV2lkdGgsXHJcbiAgICAgICAgICB5OiB5IC0gb25lVGhpcmRIZWlnaHQsXHJcbiAgICAgICAgICBpbnRlcnNlY3RlZFg6IG9uZVRoaXJkV2lkdGgsXHJcbiAgICAgICAgICBpbnRlcnNlY3RlZFk6IG9uZVRoaXJkSGVpZ2h0XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbWFwcGluZ05vZGVzLnB1c2goe1xyXG4gICAgICAgICAgeDogeCArIG9uZVRoaXJkV2lkdGgsXHJcbiAgICAgICAgICB5OiB5IC0gb25lVGhpcmRIZWlnaHQsXHJcbiAgICAgICAgICBpbnRlcnNlY3RlZFg6IHR3b1RoaXJkc1dpZHRoLFxyXG4gICAgICAgICAgaW50ZXJzZWN0ZWRZOiBvbmVUaGlyZEhlaWdodFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG1hcHBpbmdOb2Rlcy5wdXNoKHtcclxuICAgICAgICAgIHg6IHggKyBvbmVUaGlyZFdpZHRoLFxyXG4gICAgICAgICAgeTogeSArIG9uZVRoaXJkSGVpZ2h0LFxyXG4gICAgICAgICAgaW50ZXJzZWN0ZWRYOiB0d29UaGlyZHNXaWR0aCxcclxuICAgICAgICAgIGludGVyc2VjdGVkWTogdHdvVGhpcmRzSGVpZ2h0XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbWFwcGluZ05vZGVzLnB1c2goe1xyXG4gICAgICAgICAgeDogeCAtIG9uZVRoaXJkV2lkdGgsXHJcbiAgICAgICAgICB5OiB5ICsgb25lVGhpcmRIZWlnaHQsXHJcbiAgICAgICAgICBpbnRlcnNlY3RlZFg6IG9uZVRoaXJkV2lkdGgsXHJcbiAgICAgICAgICBpbnRlcnNlY3RlZFk6IHR3b1RoaXJkc0hlaWdodFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBtYXBwaW5nTm9kZXM7XHJcbiAgfVxyXG4gICAgXHJcbiAgcHVibGljIHN0YXRpYyBmaW5kRXVjbGlkZWFuRGlzdGFuY2UoeDE6IG51bWJlciwgeTE6IG51bWJlciwgeDI6IG51bWJlciwgeTI6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KHgxLXgyLDIpICsgTWF0aC5wb3coeTEteTIsMikpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXRpYyBnZXRZR2l2ZW5YQW5kU3JjTWFwcGluZ05vZGVzICh4MTogbnVtYmVyLCB5MTogbnVtYmVyLCB4MjogbnVtYmVyLCB5MjogbnVtYmVyLCB4OiBudW1iZXIpIHtcclxuICAgIGxldCB5ID0gMDtcclxuICAgIGlmKHgxID09IHgyKVxyXG4gICAgICB5ID0gKHkxK3kyKS8yO1xyXG4gICAgZWxzZSB7XHJcbiAgICAgIHkgPSAoeDIqeTEteCp5MS14MSp5Mit4KnkyKS8oeDIteDEpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljIGdldFhHaXZlbllBbmRTcmNNYXBwaW5nTm9kZXMgKHgxOiBudW1iZXIsIHkxOiBudW1iZXIsIHgyOiBudW1iZXIsIHkyOiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgbGV0IHggPSAwO1xyXG4gICAgaWYoeTEgPT0geTIpXHJcbiAgICAgIHggPSAoeDEreDIpLzI7XHJcbiAgICBlbHNlIHtcclxuICAgICAgeCA9ICh4MSp5Mi14Mip5MS14MSp5K3gyKnkpLyh5Mi15MSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4geDtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgRGVzY2VudCwgUHNldWRvUmFuZG9tIH0gZnJvbSAnLi9kZXNjZW50JztcclxuaW1wb3J0IHsgTGF5b3V0SGVscGVyIH0gZnJvbSAnLi9sYXlvdXRoZWxwZXInO1xyXG5cclxuZXhwb3J0IGNsYXNzIFRvcnVzTGF5b3V0IHtcclxuICAgIHByaXZhdGUgZ3JhcGg6IGFueTtcclxuICAgIHByaXZhdGUgY29uZmlndXJhdGlvbjogYW55O1xyXG4gICAgcHJpdmF0ZSByYW5kb20gPSBuZXcgUHNldWRvUmFuZG9tKCk7XHJcbiAgICBwcml2YXRlIGRlc2NlbnQgPSBuZXcgRGVzY2VudCgpO1xyXG4gICAgcHJpdmF0ZSBvbmVUaGlyZFdpZHRoOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIG9uZVRoaXJkSGVpZ2h0OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHR3b1RoaXJkc1dpZHRoOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHR3b1RoaXJkc0hlaWdodDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSB1cGRhdGVSZW5kZXI6IGFueTtcclxuXHJcbiAgICAvL2FjY2Vzc2VkIGJ5IHRpY2tcclxuICAgIHByaXZhdGUgc3RlcDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBtYXhEaXNwbGFjZW1lbnQ6IG51bWJlcjtcclxuICAgIHByaXZhdGUgcmFuZG9tT3JkZXJBcnJheTogQXJyYXk8bnVtYmVyPjtcclxuICAgIHByaXZhdGUgcmFuZG9tT3JkZXI6IGFueTtcclxuICAgIHByaXZhdGUgdmlzaXRlZE1hdHJpeDogQXJyYXk8YW55PjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihncmFwaDogYW55LCBjb25maWd1cmF0aW9uOiBhbnksIHVwZGF0ZVJlbmRlcjogYW55KXtcclxuICAgICAgICB0aGlzLmdyYXBoID0gZ3JhcGg7XHJcbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uID0gY29uZmlndXJhdGlvbjtcclxuICAgICAgICB0aGlzLm9uZVRoaXJkV2lkdGggPSBjb25maWd1cmF0aW9uLnN2Z1dpZHRoLzM7XHJcbiAgICAgICAgdGhpcy50d29UaGlyZHNXaWR0aCA9IGNvbmZpZ3VyYXRpb24uc3ZnV2lkdGgqMi8zO1xyXG4gICAgICAgIHRoaXMub25lVGhpcmRIZWlnaHQgPSAgY29uZmlndXJhdGlvbi5zdmdIZWlnaHQvMztcclxuICAgICAgICB0aGlzLnR3b1RoaXJkc0hlaWdodCA9IGNvbmZpZ3VyYXRpb24uc3ZnSGVpZ2h0KjIvMztcclxuICAgICAgICB0aGlzLnVwZGF0ZVJlbmRlciA9IHVwZGF0ZVJlbmRlcjtcclxuICAgICAgICB0aGlzLmRlc2NlbnQgPSBuZXcgRGVzY2VudCgpO1xyXG4gICAgICAgIHRoaXMuZGVzY2VudC5pbml0KGdyYXBoLCB0aGlzLmNvbmZpZ3VyYXRpb24uZXBzaWxvbiwgdGhpcy5jb25maWd1cmF0aW9uLmxpbmtMZW5ndGgsIHRoaXMuY29uZmlndXJhdGlvbi5udW1iZXJPZkFkanVzdG1lbnRJdGVyYXRpb25zLCB0aGlzLmNvbmZpZ3VyYXRpb24ubWF4U3RlcHMpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGFydCgpIHtcclxuICAgICAgICBsZXQgdyA9IHRoaXMuY29uZmlndXJhdGlvbi5zdmdXaWR0aCxcclxuICAgICAgICAgICAgaCA9IHRoaXMuY29uZmlndXJhdGlvbi5zdmdIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5ncmFwaC5ub2Rlcy5mb3JFYWNoKCh2LCBpKSA9PiB7XHJcbiAgICAgICAgICAgIHYuaW5kZXggPSBpO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHYueCA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgKHYueCA9IHcgLyAyKSwgKHYueSA9IGggLyAyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuZ3JhcGgubGlua3MuZm9yRWFjaChsID0+IHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBsLnNvdXJjZSA9PSBcIm51bWJlclwiKSBsLnNvdXJjZSA9IHRoaXMuZ3JhcGgubm9kZXNbbC5zb3VyY2VdO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGwudGFyZ2V0ID09IFwibnVtYmVyXCIpIGwudGFyZ2V0ID0gdGhpcy5ncmFwaC5ub2Rlc1tsLnRhcmdldF07XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9yYW5kb21pc2UgcG9zaXRpb25zIG9mIG5vZGVzXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmdyYXBoLm5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgbmV3WCA9IHcgLyAyIC0gMC41ICsgdGhpcy5yYW5kb20uZ2V0TmV4dEJldHdlZW4oMCwgMSk7XHJcbiAgICAgICAgICAgIGxldCBuZXdZID0gaCAvIDIgLSAwLjUgKyB0aGlzLnJhbmRvbS5nZXROZXh0QmV0d2VlbigwLCAxKTtcclxuICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5ncmFwaC5ub2Rlc1tpXS54ID0gbmV3WDtcclxuICAgICAgICAgICAgdGhpcy5ncmFwaC5ub2Rlc1tpXS55ID0gbmV3WTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5ydW4oKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJ1bigpe1xyXG4gICAgICAgIHRoaXMudmlzaXRlZE1hdHJpeCA9IG5ldyBBcnJheSgpO1xyXG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLmdyYXBoLm5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCB0ZW1wQXJyYXkgPSBuZXcgQXJyYXkoKTtcclxuICAgICAgICAgICAgZm9yKGxldCBqID0gMDsgaiA8IHRoaXMuZ3JhcGgubm9kZXMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgdGVtcEFycmF5LnB1c2goZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMudmlzaXRlZE1hdHJpeC5wdXNoKHRlbXBBcnJheSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnJhbmRvbU9yZGVyID0ge1xyXG4gICAgICAgICAgICBcIm5vZGVJbmRleFwiOiBuZXcgQXJyYXkoKSxcclxuICAgICAgICAgICAgICBcIm1hdHJpeFwiOiBuZXcgQXJyYXkoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy5ncmFwaC5ub2Rlcy5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgIHRoaXMucmFuZG9tT3JkZXIubm9kZUluZGV4LnB1c2goLTEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvL2dlbmVyYXRlIHJhbmRvbSBub2RlIHNlcXVlbmNlXHJcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMuZ3JhcGgubm9kZXMubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgICAgICBsZXQgaW5kZXggPSBNYXRoLmZsb29yKHRoaXMucmFuZG9tLmdldE5leHRCZXR3ZWVuKDAsIDEpKnRoaXMuZ3JhcGgubm9kZXMubGVuZ3RoKTtcclxuICAgICAgICAgICAgaWYodGhpcy5yYW5kb21PcmRlci5ub2RlSW5kZXhbaW5kZXhdIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yYW5kb21PcmRlci5ub2RlSW5kZXhbaW5kZXhdID0gaTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGktLTtcclxuICAgICAgICAgICAgfSAgICBcclxuICAgICAgICB9ICBcclxuICAgICAgICBcclxuICAgICAgICBmb3IobGV0IG5vZGVJbmRleCA9IDA7IG5vZGVJbmRleCA8IHRoaXMuZ3JhcGgubm9kZXMubGVuZ3RoOyBub2RlSW5kZXgrKykge1xyXG4gICAgICAgICAgICBsZXQgdGVtcEFycmF5ID0gbmV3IEFycmF5KCk7XHJcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLmdyYXBoLm5vZGVzLmxlbmd0aDsgaSsrKXtcclxuICAgICAgICAgICAgICAgIHRlbXBBcnJheS5wdXNoKC0xKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy5ncmFwaC5ub2Rlcy5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSBNYXRoLmZsb29yKHRoaXMucmFuZG9tLmdldE5leHRCZXR3ZWVuKDAsIDEpKnRoaXMuZ3JhcGgubm9kZXMubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgIGlmKHRlbXBBcnJheVtpbmRleF0gPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGVtcEFycmF5W2luZGV4XSA9IGk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpLS07XHJcbiAgICAgICAgICAgICAgICB9ICAgIFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucmFuZG9tT3JkZXIubWF0cml4LnB1c2godGVtcEFycmF5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucmFuZG9tT3JkZXJBcnJheSA9IG5ldyBBcnJheSh0aGlzLmdyYXBoLm5vZGVzLmxlbmd0aCk7XHJcbiAgICAgICAgdGhpcy5tYXhEaXNwbGFjZW1lbnQgPSBOdW1iZXIuTUFYX1ZBTFVFO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5ncmFwaC5ub2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLnJhbmRvbU9yZGVyQXJyYXlbaV0gPSAtMTtcclxuICAgICAgICB9XHJcbiAgICAgIFxyXG4gICAgICAgIHRoaXMuc3RlcCA9IDA7XHJcbiAgICAgICAgdGhpcy50aWNrKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgdGljaygpe1xyXG4gICAgICAgIGxldCB1bml0VmVjdG9yID0gWy0xLCAtMV07XHJcbiAgICAgICAgbGV0IHZlY3RvclIgPSBbLTEsIC0xXTtcclxuICAgIFxyXG4gICAgICAgIHdoaWxlICh0aGlzLm1heERpc3BsYWNlbWVudCA+PSB0aGlzLmNvbmZpZ3VyYXRpb24uZGVsdGEpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc3RlcCA+IHRoaXMuY29uZmlndXJhdGlvbi5tYXhTdGVwcykge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXhEaXNwbGFjZW1lbnQgPSAtMTtcclxuICAgICAgICAgICAgICAgIGxldCBudW1WaXNpdHMgPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXNjZW50LmdldFJhbmRvbU9yZGVyKHRoaXMucmFuZG9tLCB0aGlzLmdyYXBoLCB0aGlzLnJhbmRvbU9yZGVyQXJyYXkpO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnJhbmRvbU9yZGVyLm5vZGVJbmRleC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmFuZG9tT3JkZXIubm9kZUluZGV4W2ldID0gdGhpcy5yYW5kb21PcmRlckFycmF5W2ldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5yYW5kb21PcmRlci5ub2RlSW5kZXgubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYSA9IHRoaXMucmFuZG9tT3JkZXIubm9kZUluZGV4W2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVzY2VudC5nZXRSYW5kb21PcmRlcih0aGlzLnJhbmRvbSwgdGhpcy5ncmFwaCwgdGhpcy5yYW5kb21PcmRlckFycmF5KTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMucmFuZG9tT3JkZXJBcnJheS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYiA9IHRoaXMucmFuZG9tT3JkZXJBcnJheVtqXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLnZpc2l0ZWRNYXRyaXhbYV1bYl0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhID09IGIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZpc2l0ZWRNYXRyaXhbYV1bYl0gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtVmlzaXRzKys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZGlzdGFuY2UgPSBOdW1iZXIuTUFYX1ZBTFVFO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGlkZWFsRGlzdGFuY2UgPVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmxpbmtMZW5ndGggKiAodGhpcy5ncmFwaC5zaG9ydGVzdFBhdGhbYV1bYl0ubGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlkZWFsRGlzdGFuY2UgPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vZGlzY29ubmVjdGVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52aXNpdGVkTWF0cml4W2FdW2JdID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpZGVhbERpc3RhbmNlIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmlzaXRlZE1hdHJpeFthXVtiXSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vc2VsZWN0IFhhIGFuZCBYYiAodG9ydXMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBMYXlvdXRIZWxwZXIud3JhcHBpbmdOb2RlKHRoaXMuZ3JhcGgsIHRoaXMub25lVGhpcmRXaWR0aCwgdGhpcy5vbmVUaGlyZFdpZHRoLCB0aGlzLnR3b1RoaXJkc1dpZHRoLCB0aGlzLnR3b1RoaXJkc0hlaWdodCk7XHJcbiAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2UgPSB0aGlzLmNvbXB1dGVTaG9ydGVzdERpc3RhbmNlT3ZlckNvbnRleHQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JhcGgubm9kZXNbYV0ueCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncmFwaC5ub2Rlc1thXS55LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyYXBoLm5vZGVzW2JdLngsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JhcGgubm9kZXNbYl0ueSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pdFZlY3RvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWRlYWxEaXN0YW5jZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXRWZWN0b3JbMF0gPSB1bml0VmVjdG9yWzBdIC8gZGlzdGFuY2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bml0VmVjdG9yWzFdID0gdW5pdFZlY3RvclsxXSAvIGRpc3RhbmNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRlbXAgPSAoZGlzdGFuY2UgLSBpZGVhbERpc3RhbmNlKSAvIDI7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmVjdG9yUlswXSA9IHVuaXRWZWN0b3JbMF0gKiB0ZW1wO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmVjdG9yUlsxXSA9IHVuaXRWZWN0b3JbMV0gKiB0ZW1wO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0ZW1wTWV1ID0gMC4xO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RlcCA8IHRoaXMuY29uZmlndXJhdGlvbi5udW1iZXJPZkFkanVzdG1lbnRJdGVyYXRpb25zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcE1ldSA9IHRoaXMuZGVzY2VudC5nZXRNZXUoKS5maXhlZEl0ZXJhdGlvblthXVtiXVt0aGlzLnN0ZXBdOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBNZXUgPSB0aGlzLmRlc2NlbnQuZ2V0UGFyYW1MVW5saW1pdGVkSXRlcmF0aW9uKHRoaXMuc3RlcCkgKiB0aGlzLmRlc2NlbnQuZ2V0UGFyYW1XKCkubWF0cml4W2FdW2JdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vdXBkYXRlIHBvc2l0aW9uIFhhIGFuZCBYYiBiYXNlZCBvbiBjYWxjdWxhdGVkIG1vdmVtZW50XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmV3WCA9IHRoaXMuZ3JhcGgubm9kZXNbYV0ueCAtIHRlbXBNZXUgKiB2ZWN0b3JSWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5ld1kgPSB0aGlzLmdyYXBoLm5vZGVzW2FdLnkgLSB0ZW1wTWV1ICogdmVjdG9yUlsxXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBiRm9yY2VUb0NvbnZlcmdlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGVwID49IHRoaXMuY29uZmlndXJhdGlvbi5udW1iZXJPZkFkanVzdG1lbnRJdGVyYXRpb25zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdYID4gdGhpcy50d29UaGlyZHNXaWR0aCB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdYIDwgdGhpcy5vbmVUaGlyZFdpZHRoIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1kgPiB0aGlzLnR3b1RoaXJkc0hlaWdodCB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdZIDwgdGhpcy5vbmVUaGlyZEhlaWdodFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0ZvcmNlIHRvIGNvbnZlcmdlOiBubyB3cmFwcGluZyBvZiBub2RlcyBhcmUgcGVybWl0dGVkIGF0IHRoaXMgc3RhZ2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3WCA9IHRoaXMuZ3JhcGgubm9kZXNbYV0ueDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3WSA9IHRoaXMuZ3JhcGgubm9kZXNbYV0ueTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYkZvcmNlVG9Db252ZXJnZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRtcE1vdmVtZW50ID0gTGF5b3V0SGVscGVyLmZpbmRFdWNsaWRlYW5EaXN0YW5jZShcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyYXBoLm5vZGVzW2FdLngsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncmFwaC5ub2Rlc1thXS55LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1gsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3WVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWJGb3JjZVRvQ29udmVyZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyYXBoLm5vZGVzW2FdLnggPSB0aGlzLmdyYXBoLm5vZGVzW2FdLnggLSB0ZW1wTWV1ICogdmVjdG9yUlswXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyYXBoLm5vZGVzW2FdLnkgPSB0aGlzLmdyYXBoLm5vZGVzW2FdLnkgLSB0ZW1wTWV1ICogdmVjdG9yUlsxXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5tYXhEaXNwbGFjZW1lbnQgPCB0bXBNb3ZlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWF4RGlzcGxhY2VtZW50ID0gdG1wTW92ZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3WCA9IHRoaXMuZ3JhcGgubm9kZXNbYl0ueCArIHRlbXBNZXUgKiB2ZWN0b3JSWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3WSA9IHRoaXMuZ3JhcGgubm9kZXNbYl0ueSArIHRlbXBNZXUgKiB2ZWN0b3JSWzFdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYkZvcmNlVG9Db252ZXJnZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RlcCA+PSB0aGlzLmNvbmZpZ3VyYXRpb24ubnVtYmVyT2ZBZGp1c3RtZW50SXRlcmF0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3WCA+IHRoaXMudHdvVGhpcmRzV2lkdGggfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3WCA8IHRoaXMub25lVGhpcmRXaWR0aCB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdZID4gdGhpcy50d29UaGlyZHNIZWlnaHQgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3WSA8IHRoaXMub25lVGhpcmRIZWlnaHRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9Gb3JjZSB0byBjb252ZXJnZTogbm8gd3JhcHBpbmcgb2Ygbm9kZXMgYXJlIHBlcm1pdHRlZCBhdCB0aGlzIHN0YWdlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1ggPSB0aGlzLmdyYXBoLm5vZGVzW2JdLng7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1kgPSB0aGlzLmdyYXBoLm5vZGVzW2JdLnk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJGb3JjZVRvQ29udmVyZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRtcE1vdmVtZW50ID0gTGF5b3V0SGVscGVyLmZpbmRFdWNsaWRlYW5EaXN0YW5jZShcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyYXBoLm5vZGVzW2JdLngsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncmFwaC5ub2Rlc1tiXS55LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1gsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3WVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWJGb3JjZVRvQ29udmVyZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyYXBoLm5vZGVzW2JdLnggPSB0aGlzLmdyYXBoLm5vZGVzW2JdLnggKyB0ZW1wTWV1ICogdmVjdG9yUlswXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyYXBoLm5vZGVzW2JdLnkgPSB0aGlzLmdyYXBoLm5vZGVzW2JdLnkgKyB0ZW1wTWV1ICogdmVjdG9yUlsxXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5tYXhEaXNwbGFjZW1lbnQgPCB0bXBNb3ZlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWF4RGlzcGxhY2VtZW50ID0gdG1wTW92ZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy91cGRhdGUgdmlzaXRlZCBtYXRyaXhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmlzaXRlZE1hdHJpeFthXVtiXSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZpc2l0ZWRNYXRyaXhbYl1bYV0gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vcmVzZXQgdmlzaXRlZE1hdHJpeCBiZWZvcmUgbmV4dCBzdGVwIGl0ZXJhdGlvblxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmdyYXBoLm5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLmdyYXBoLm5vZGVzLmxlbmd0aDsgaisrKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlzaXRlZE1hdHJpeFtpXVtqXSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGVwKys7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24uYkVuYWJsZUFuaW1hdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIExheW91dEhlbHBlci53cmFwcGluZ05vZGUodGhpcy5ncmFwaCwgdGhpcy5vbmVUaGlyZFdpZHRoLCB0aGlzLm9uZVRoaXJkV2lkdGgsIHRoaXMudHdvVGhpcmRzV2lkdGgsIHRoaXMudHdvVGhpcmRzSGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVJlbmRlcigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBcclxuICAgICAgICBMYXlvdXRIZWxwZXIud3JhcHBpbmdOb2RlKHRoaXMuZ3JhcGgsIHRoaXMub25lVGhpcmRXaWR0aCwgdGhpcy5vbmVUaGlyZFdpZHRoLCB0aGlzLnR3b1RoaXJkc1dpZHRoLCB0aGlzLnR3b1RoaXJkc0hlaWdodCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVSZW5kZXIoKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVJlbmRlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY29tcHV0ZVNob3J0ZXN0RGlzdGFuY2VPdmVyQ29udGV4dCAoc291cmNlWDogbnVtYmVyLCBzb3VyY2VZOiBudW1iZXIsIHRhcmdldFg6IG51bWJlciwgdGFyZ2V0WTogbnVtYmVyLCB1bml0VmVjdG9yOiBBcnJheTxudW1iZXI+LCBcclxuICAgICAgICBpZGVhbERpc3RhbmNlOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBtYXBwaW5nTm9kZXMgPSBudWxsO1xyXG4gICAgICAgIGxldCB0bXBEaXN0YW5jZSA9IDA7XHJcbiAgICAgICAgbGV0IHJlc3VsdHMgPSB7XCJlZGdlTGVuZ3RoXCI6IE51bWJlci5NQVhfVkFMVUUsIFwibWluRGlmZkZyb21JZGVhbERpc3RhbmNlXCI6IE51bWJlci5NQVhfVkFMVUV9O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRtcERpc3RhbmNlID0gMDtcclxuICAgICAgICBcclxuICAgICAgICBtYXBwaW5nTm9kZXMgPSBMYXlvdXRIZWxwZXIuZmluZE1hcHBpbmdOb2Rlc0Zyb21PdGhlclNxdWFyZXModGFyZ2V0WCwgdGFyZ2V0WSwgdGhpcy5vbmVUaGlyZEhlaWdodCwgdGhpcy5vbmVUaGlyZEhlaWdodCwgXHJcbiAgICAgICAgICAgIHRoaXMudHdvVGhpcmRzV2lkdGgsIHRoaXMudHdvVGhpcmRzV2lkdGgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuZmluZFdyYXBwaW5nKHNvdXJjZVgsIHNvdXJjZVksIHRhcmdldFgsIHRhcmdldFksIG1hcHBpbmdOb2RlcywgcmVzdWx0cywgXHJcbiAgICAgICAgICAgIHVuaXRWZWN0b3IsIGlkZWFsRGlzdGFuY2UpO1xyXG4gICAgXHJcbiAgICAgICAgdG1wRGlzdGFuY2UgPSBMYXlvdXRIZWxwZXIuZmluZEV1Y2xpZGVhbkRpc3RhbmNlKHNvdXJjZVgsIHNvdXJjZVksIHRhcmdldFgsIHRhcmdldFkpO1xyXG4gICAgICAgIGxldCBkaWZmRnJvbUlkZWFsRGlzdGFuY2UgPSBNYXRoLmFicyh0bXBEaXN0YW5jZSAtIGlkZWFsRGlzdGFuY2UpO1xyXG4gICAgICAgIGlmKHJlc3VsdHMubWluRGlmZkZyb21JZGVhbERpc3RhbmNlIDw9IGRpZmZGcm9tSWRlYWxEaXN0YW5jZSkgeyBcclxuICAgICAgICB9ICBcclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaWYodW5pdFZlY3RvciAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICB1bml0VmVjdG9yWzBdID0gc291cmNlWCAtIHRhcmdldFg7XHJcbiAgICAgICAgICAgICAgICB1bml0VmVjdG9yWzFdID0gc291cmNlWSAtIHRhcmdldFk7ICAgICAgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzdWx0cy5taW5EaWZmRnJvbUlkZWFsRGlzdGFuY2UgPSBkaWZmRnJvbUlkZWFsRGlzdGFuY2U7XHJcbiAgICAgICAgICAgIHJlc3VsdHMuZWRnZUxlbmd0aCA9IHRtcERpc3RhbmNlO1xyXG4gICAgICAgIH0gXHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHRzLmVkZ2VMZW5ndGg7ICBcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGZpbmRXcmFwcGluZyAoc291cmNlWDogbnVtYmVyLCBzb3VyY2VZOiBudW1iZXIsIHRhcmdldFg6IG51bWJlciwgdGFyZ2V0WTogbnVtYmVyLCBtYXBwaW5nTm9kZXM6IEFycmF5PGFueT4sIHJlc3VsdHM6IGFueSwgXHJcbiAgICAgICAgdW5pdFZlY3RvcjogQXJyYXk8bnVtYmVyPiwgaWRlYWxEaXN0YW5jZTogbnVtYmVyKSB7ICAgICAgICBcclxuICAgICAgICBsZXQgbWluRGlmZkZyb21JZGVhbERpc3RhbmNlID0gTnVtYmVyLk1BWF9WQUxVRTtcclxuICAgICAgICBsZXQgdG1wRGlzdGFuY2UgPSBOdW1iZXIuTUFYX1ZBTFVFO1xyXG4gICAgICAgIGxldCByZXN1bHRjb250ZXh0bnVtYmVyID0gLTE7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYobWFwcGluZ05vZGVzICE9IG51bGwpIHtcclxuICAgICAgICAgIGxldCBjb250ZXh0TnVtYmVyID0gLTE7XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIGZvcihsZXQgbWFwcGluZ05vZGUgb2YgbWFwcGluZ05vZGVzKSB7XHJcbiAgICAgICAgICAgIGNvbnRleHROdW1iZXIrKztcclxuICAgICAgXHJcbiAgICAgICAgICAgIC8vdXBkYXRlIHZlY3RvcnMgZGlyZWN0bHkgZnJvbSA4IGFkamFjZW5jeSBjb250ZXh0XHJcbiAgICAgICAgICAgIHRtcERpc3RhbmNlID0gTGF5b3V0SGVscGVyLmZpbmRFdWNsaWRlYW5EaXN0YW5jZShtYXBwaW5nTm9kZS54LCBtYXBwaW5nTm9kZS55LCBzb3VyY2VYLCBzb3VyY2VZKTtcclxuICAgICAgICAgICAgbGV0IGRpZmZGcm9tSWRlYWxEaXN0YW5jZSA9IE1hdGguYWJzKHRtcERpc3RhbmNlIC0gaWRlYWxEaXN0YW5jZSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZihtaW5EaWZmRnJvbUlkZWFsRGlzdGFuY2UgPiBkaWZmRnJvbUlkZWFsRGlzdGFuY2UpIHtcclxuICAgICAgICAgICAgICBtaW5EaWZmRnJvbUlkZWFsRGlzdGFuY2UgPSBkaWZmRnJvbUlkZWFsRGlzdGFuY2U7XHJcbiAgICAgIFxyXG4gICAgICAgICAgICAgIGlmKHVuaXRWZWN0b3IgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgdW5pdFZlY3RvclswXSA9IChzb3VyY2VYLW1hcHBpbmdOb2RlLngpO1xyXG4gICAgICAgICAgICAgICAgdW5pdFZlY3RvclsxXSA9IChzb3VyY2VZLW1hcHBpbmdOb2RlLnkpOyAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgICByZXN1bHRjb250ZXh0bnVtYmVyID0gY29udGV4dE51bWJlcjtcclxuICAgICAgICAgICAgICByZXN1bHRzLmVkZ2VMZW5ndGggPSB0bXBEaXN0YW5jZTtcclxuICAgICAgICAgICAgICByZXN1bHRzLm1pbkRpZmZGcm9tSWRlYWxEaXN0YW5jZSA9IG1pbkRpZmZGcm9tSWRlYWxEaXN0YW5jZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdGNvbnRleHRudW1iZXI7XHJcbiAgICB9XHJcbn1cclxuIl19
