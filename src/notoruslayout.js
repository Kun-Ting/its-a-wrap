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
exports.NoTorusLayout = void 0;
const descent_1 = require("./descent");
const layouthelper_1 = require("./layouthelper");
class NoTorusLayout {
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
                            //vector r
                            distance = layouthelper_1.LayoutHelper.findEuclideanDistance(this.graph.nodes[a].x, this.graph.nodes[a].y, this.graph.nodes[b].x, this.graph.nodes[b].y);
                            // ignore long range attractions for nodes not immediately connected
                            if (this.graph.shortestPath[a][b].length - 1 > 1 &&
                                distance > idealDistance) {
                                this.visitedMatrix[a][b] = true;
                                continue;
                            }
                            unitVector[0] =
                                (this.graph.nodes[a].x - this.graph.nodes[b].x) / distance;
                            unitVector[1] =
                                (this.graph.nodes[a].y - this.graph.nodes[b].y) / distance;
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
                    this.rescale();
                    this.updateRender();
                }
            }
        }
        this.rescale();
        this.updateRender();
        this.updateRender();
    }
    rescale() {
        //rescale node positions for NoTorus layout
        let leftmost = Number.MAX_VALUE;
        let rightmost = 0;
        let upmost = Number.MAX_VALUE;
        let bottommost = 0;
        this.graph.nodes.forEach(node => {
            if (node.x < leftmost)
                leftmost = node.x;
            if (node.x > rightmost)
                rightmost = node.x;
            if (node.y < upmost)
                upmost = node.y;
            if (node.y > bottommost)
                bottommost = node.y;
        });
        let margin = 10;
        this.graph.nodes.forEach((v, index) => {
            v.x =
                this.graph.nodes[index].x -
                    (leftmost - this.oneThirdWidth) +
                    margin;
            v.y =
                this.graph.nodes[index].y -
                    (upmost - this.oneThirdHeight) +
                    margin;
        });
        let boundingboxWidth = rightmost - leftmost;
        let boundingboxHeight = bottommost - upmost;
        let cellWidth = this.oneThirdWidth - 2 * margin;
        if (boundingboxWidth != 0 && boundingboxWidth != 0) {
            let baselineX = this.oneThirdWidth + margin;
            let baselineY = this.oneThirdHeight + margin;
            this.graph.nodes.forEach((v, index) => {
                v.x =
                    baselineX +
                        ((this.graph.nodes[index].x - baselineX) * cellWidth) / boundingboxWidth;
                v.y =
                    baselineY +
                        ((this.graph.nodes[index].y - baselineY) * cellWidth) / boundingboxHeight;
            });
        }
        //invoke render callback
        this.updateRender();
    }
}
exports.NoTorusLayout = NoTorusLayout;
},{"./descent":1,"./layouthelper":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZGVzY2VudC50cyIsInNyYy9sYXlvdXRoZWxwZXIudHMiLCJzcmMvbm90b3J1c2xheW91dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztBQ0FBLE1BQWEsT0FBTztJQUFwQjtRQTJCVyxtQkFBYyxHQUFHLENBQUMsTUFBVyxFQUFFLEtBQVUsRUFBRSxTQUF3QixFQUFFLEVBQUU7WUFDMUUsS0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFDO2dCQUN2QyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDckI7WUFDRCxLQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUM7Z0JBQ3ZDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDdkUsSUFBRyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUNyQixTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUN4QjtxQkFDSTtvQkFDRCxDQUFDLEVBQUUsQ0FBQztpQkFDUDthQUNKO1FBQ0wsQ0FBQyxDQUFBO0lBbUZMLENBQUM7SUFySFUsSUFBSSxDQUFDLEtBQVUsRUFBRSxPQUFlLEVBQUUsVUFBa0IsRUFBRSw0QkFBb0MsRUFBRSxRQUFnQjtRQUMvRyxJQUFJLENBQUMsR0FBRyxHQUFHO1lBQ1AsY0FBYyxFQUFFLEVBQUU7U0FDckIsQ0FBQztRQUNGLElBQUksQ0FBQyxNQUFNLEdBQUc7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SSxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUM7WUFDNUMsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLGNBQWMsR0FBRyxNQUFNLENBQUM7WUFDN0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUNsQyxDQUFDLENBQUMsQ0FBQztvQkFDSCxTQUFTO3dCQUNULENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsZ0JBQWdCLENBQUM7Z0JBQ3pFLENBQUMsQ0FBQyxDQUFDO29CQUNILFNBQVM7d0JBQ1QsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsR0FBRyxTQUFTLENBQUMsR0FBRyxpQkFBaUIsQ0FBQztZQUMxRSxDQUFDLENBQUMsQ0FBQztTQUNOO1FBRUQsd0JBQXdCO1FBQ3hCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUN4QixDQUFDO0NBQ0o7QUF4VUQsc0NBd1VDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiZXhwb3J0IGNsYXNzIERlc2NlbnQge1xyXG4gICAgcHJpdmF0ZSBwYXJhbVc6IGFueTtcclxuICAgIHByaXZhdGUgcGFyYW1MOiBhbnk7XHJcbiAgICBwcml2YXRlIG1ldTogYW55O1xyXG4gICAgcHJpdmF0ZSBudW1iZXJPZkFkanVzdG1lbnRJdGVyYXRpb25zOiBudW1iZXI7XHJcblxyXG4gICAgcHVibGljIGluaXQoZ3JhcGg6IGFueSwgZXBzaWxvbjogbnVtYmVyLCBsaW5rTGVuZ3RoOiBudW1iZXIsIG51bWJlck9mQWRqdXN0bWVudEl0ZXJhdGlvbnM6IG51bWJlciwgbWF4U3RlcHM6IG51bWJlcil7XHJcbiAgICAgICAgdGhpcy5tZXUgPSB7XHJcbiAgICAgICAgICAgIGZpeGVkSXRlcmF0aW9uOiB7fVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5wYXJhbVcgPSB7XHJcbiAgICAgICAgICAgIFwibWluXCI6IDAsXHJcbiAgICAgICAgICAgIFwibWF4XCI6IDAsXHJcbiAgICAgICAgICAgIFwibWF0cml4XCI6IHt9XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnNldFBhcmFtVyhsaW5rTGVuZ3RoLCBncmFwaCk7XHJcbiAgICAgICAgdGhpcy5wYXJhbUwgPSB7XHJcbiAgICAgICAgICAgIG1heDogMSAvIHRoaXMucGFyYW1XLm1pbixcclxuICAgICAgICAgICAgbWluOiBlcHNpbG9uIC8gdGhpcy5wYXJhbVcubWF4LFxyXG4gICAgICAgICAgICBsYW1iZGE6IDAsXHJcbiAgICAgICAgICAgIGZpeGVkSXRlcmF0aW9uczogW11cclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMubnVtYmVyT2ZBZGp1c3RtZW50SXRlcmF0aW9ucyA9IG51bWJlck9mQWRqdXN0bWVudEl0ZXJhdGlvbnM7XHJcbiAgICAgICAgdGhpcy5zZXRQYXJhbUwodGhpcy5wYXJhbVcsIGVwc2lsb24sIG51bWJlck9mQWRqdXN0bWVudEl0ZXJhdGlvbnMsIG1heFN0ZXBzKVxyXG4gICAgICAgIHRoaXMuc2V0TWV1KGdyYXBoLCBtYXhTdGVwcywgdGhpcy5wYXJhbVcsIHRoaXMucGFyYW1MKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0UmFuZG9tT3JkZXIgPSAocmFuZG9tOiBhbnksIGdyYXBoOiBhbnksIHRlbXBBcnJheTogQXJyYXk8bnVtYmVyPikgPT4ge1xyXG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBncmFwaC5ub2Rlcy5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgIHRlbXBBcnJheVtpXSA9IC0xO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgZ3JhcGgubm9kZXMubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgICAgICBsZXQgaW5kZXggPSBNYXRoLmZsb29yKHJhbmRvbS5nZXROZXh0QmV0d2VlbigwLCAxKSpncmFwaC5ub2Rlcy5sZW5ndGgpO1xyXG4gICAgICAgICAgICBpZih0ZW1wQXJyYXlbaW5kZXhdIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgdGVtcEFycmF5W2luZGV4XSA9IGk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpLS07XHJcbiAgICAgICAgICAgIH0gICAgXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRNZXUoKTogYW55IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tZXU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRNZXUgKGdyYXBoOiBhbnksIG1heFN0ZXBzOiBudW1iZXIsIHBhcmFtVzogYW55LCBwYXJhbUw6IGFueSkge1xyXG4gICAgICAgIGxldCBtZXVpID0gbmV3IEFycmF5KCk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBncmFwaC5ub2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgbWV1aiA9IG5ldyBBcnJheSgpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGdyYXBoLm5vZGVzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaXRlcmF0aW9ucyA9IG5ldyBBcnJheSgpO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCBtYXhTdGVwczsgaysrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHByb2R1Y3QgPSBwYXJhbVcubWF0cml4W2ldW2pdICogcGFyYW1MLmZpeGVkSXRlcmF0aW9uc1trXTtcclxuICAgICAgICAgICAgICAgICAgICBpdGVyYXRpb25zLnB1c2gocHJvZHVjdCA+IDEgPyAxIDogcHJvZHVjdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBtZXVqLnB1c2goaXRlcmF0aW9ucyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbWV1aS5wdXNoKG1ldWopO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm1ldS5maXhlZEl0ZXJhdGlvbiA9IG1ldWk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFBhcmFtVygpOiBhbnkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtVztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldFBhcmFtTChwYXJhbVc6IGFueSwgZXBzaWxvbjogbnVtYmVyLCBudW1iZXJPZkFkanVzdG1lbnRJdGVyYXRpb25zOiBudW1iZXIsIG1heFN0ZXBzOiBudW1iZXIpe1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMucGFyYW1MLmxhbWJkYSA9XHJcbiAgICAgICAgLU1hdGgubG9nKHRoaXMucGFyYW1MLm1pbiAvIHRoaXMucGFyYW1MLm1heCkgLyAobnVtYmVyT2ZBZGp1c3RtZW50SXRlcmF0aW9ucyAtIDEpO1xyXG4gICAgXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtYXhTdGVwczsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGFyYW1MLmZpeGVkSXRlcmF0aW9ucy5wdXNoKFxyXG4gICAgICAgICAgICAgICAgKDEgLyBwYXJhbVcubWluKSAqIE1hdGguZXhwKC10aGlzLnBhcmFtTC5sYW1iZGEgKiBpKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH0gICAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRQYXJhbVcobGlua0xlbmd0aDogbnVtYmVyLCBncmFwaDogYW55KSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IG1pbiA9IE51bWJlci5NQVhfVkFMVUUsIG1heCA9IDA7XHJcbiAgICAgICAgbGV0IHdpID0gbmV3IEFycmF5KCk7XHJcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGdyYXBoLm5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCB3aiA9IG5ldyBBcnJheSgpO1xyXG4gICAgICAgICAgICBmb3IobGV0IGogPSAwOyBqIDwgZ3JhcGgubm9kZXMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBkaXN0YW5jZSA9IGxpbmtMZW5ndGggKiAoZ3JhcGguc2hvcnRlc3RQYXRoW2ldW2pdLmxlbmd0aCAtIDEpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZihpID09IGogfHwgZGlzdGFuY2UgPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdqLnB1c2goMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBsZXQgdGVtcFdpaiA9IDEvKGRpc3RhbmNlKmRpc3RhbmNlKTtcclxuICAgICAgICAgICAgICAgIGlmKHRlbXBXaWogPiAwICYmIHRlbXBXaWogPCBtaW4pXHJcbiAgICAgICAgICAgICAgICAgICAgbWluID0gdGVtcFdpajtcclxuICAgICAgICAgICAgICAgIGlmKHRlbXBXaWogPiBtYXgpXHJcbiAgICAgICAgICAgICAgICAgICAgbWF4ID0gdGVtcFdpajtcclxuICAgICAgICAgICAgICAgIHRlbXBXaWogPiAwID8gd2oucHVzaCh0ZW1wV2lqKSA6IHdqLnB1c2goMCk7XHJcbiAgICAgICAgICAgIH0gICAgXHJcbiAgICAgICAgICAgIHdpLnB1c2god2opO1xyXG4gICAgICAgIH0gIFxyXG4gICAgICAgIHRoaXMucGFyYW1XLm1hdHJpeCA9IHdpO1xyXG4gICAgICAgIHRoaXMucGFyYW1XLm1pbiA9IG1pbjtcclxuICAgICAgICB0aGlzLnBhcmFtVy5tYXggPSBtYXg7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFBhcmFtTFVubGltaXRlZEl0ZXJhdGlvbiAoaXRlcmF0aW9uOiBudW1iZXIpIHtcclxuICAgICAgICAvL2ZvcmNlIHRvIGNvbnZlcmdlXHJcbiAgICAgICAgbGV0IHNtYWxsRXBzaWxvbiA9IDAuMDAxO1xyXG4gICAgICAgIGxldCBteVBhcmFtTCA9IHtcclxuICAgICAgICAgIG1heDogMSAvIHRoaXMucGFyYW1XLm1pbixcclxuICAgICAgICAgIG1pbjogc21hbGxFcHNpbG9uIC8gdGhpcy5wYXJhbVcubWF4LFxyXG4gICAgICAgICAgbGFtYmRhOiAwLFxyXG4gICAgICAgICAgZml4ZWRJdGVyYXRpb25zOiBbXVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgbXlQYXJhbUwubGFtYmRhID1cclxuICAgICAgICAgIChteVBhcmFtTC5tYXggLyBteVBhcmFtTC5taW4gLSAxKSAvICh0aGlzLm51bWJlck9mQWRqdXN0bWVudEl0ZXJhdGlvbnMgLSAxKTtcclxuICAgICAgXHJcbiAgICAgICAgbGV0IHN0ZXBTaXplRm9yVW5saW1pdGVkSXRlcmF0aW9ucyA9XHJcbiAgICAgICAgICAxIC8gdGhpcy5wYXJhbVcubWF4IC8gKDEgKyBteVBhcmFtTC5sYW1iZGEgKiBpdGVyYXRpb24pO1xyXG4gICAgICAgXHJcbiAgICAgICAgcmV0dXJuIHN0ZXBTaXplRm9yVW5saW1pdGVkSXRlcmF0aW9ucztcclxuICAgICAgfVxyXG59XHJcblxyXG4vLyBMaW5lYXIgY29uZ3J1ZW50aWFsIHBzZXVkbyByYW5kb20gbnVtYmVyIGdlbmVyYXRvclxyXG5leHBvcnQgY2xhc3MgUHNldWRvUmFuZG9tIHtcclxuICAgIHByaXZhdGUgYTogbnVtYmVyID0gMjE0MDEzO1xyXG4gICAgcHJpdmF0ZSBjOiBudW1iZXIgPSAyNTMxMDExO1xyXG4gICAgcHJpdmF0ZSBtOiBudW1iZXIgPSAyMTQ3NDgzNjQ4O1xyXG4gICAgcHJpdmF0ZSByYW5nZTogbnVtYmVyID0gMzI3Njc7XHJcblxyXG4gICAgY29uc3RydWN0b3IocHVibGljIHNlZWQ6IG51bWJlciA9IDEpIHsgfVxyXG5cclxuICAgIC8vIHJhbmRvbSByZWFsIGJldHdlZW4gMCBhbmQgMVxyXG4gICAgZ2V0TmV4dCgpOiBudW1iZXIge1xyXG4gICAgICAgIHRoaXMuc2VlZCA9ICh0aGlzLnNlZWQgKiB0aGlzLmEgKyB0aGlzLmMpICUgdGhpcy5tO1xyXG4gICAgICAgIHJldHVybiAodGhpcy5zZWVkID4+IDE2KSAvIHRoaXMucmFuZ2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcmFuZG9tIHJlYWwgYmV0d2VlbiBtaW4gYW5kIG1heFxyXG4gICAgZ2V0TmV4dEJldHdlZW4obWluOiBudW1iZXIsIG1heDogbnVtYmVyKSB7XHJcbiAgICAgICAgcmV0dXJuIG1pbiArIHRoaXMuZ2V0TmV4dCgpICogKG1heCAtIG1pbik7XHJcbiAgICB9XHJcbn0iLCJleHBvcnQgY2xhc3MgTGF5b3V0SGVscGVyIHtcclxuICBwdWJsaWMgc3RhdGljIHdyYXBwaW5nTm9kZSAoZ3JhcGg6IGFueSwgb25lVGhpcmRXaWR0aDogbnVtYmVyLCBvbmVUaGlyZEhlaWdodDogbnVtYmVyLCB0d29UaGlyZHNXaWR0aDogbnVtYmVyLCB0d29UaGlyZHNIZWlnaHQ6IG51bWJlcikge1xyXG4gICAgICAvL1RvIHdyYXAgYSBub2RlIGlmIGl0J3Mgbm90IHdpdGhpbiBhIGJvdW5kYXJ5LCB3ZSBhcHBseSB0aGUgZm9sbG93aW5nIDIgc3RlcHNcclxuICAgICAgLy8xLiBjaGVjayB3aGV0aGVyIHRoZSBpbnB1dCBub2RlIGlzIHdpdGhpbiBib3VuZGFyeSBcclxuICAgICAgLy8yLiB3cmFwIG5vZGUueCwgbm9kZS55IGlmIGl0J3Mgb3V0c2lkZSBib3VuZGFyeVxyXG4gICAgIFxyXG4gICAgICBmb3IobGV0IG5vZGUgb2YgZ3JhcGgubm9kZXMpIHtcclxuICAgICAgICAgIGlmKG5vZGUueCA+IHR3b1RoaXJkc1dpZHRoKSB7XHJcbiAgICAgICAgICBub2RlLnggLT0gb25lVGhpcmRXaWR0aDtcclxuICAgICAgICAgIHdoaWxlIChub2RlLnggPiB0d29UaGlyZHNXaWR0aClcclxuICAgICAgICAgICAgICBub2RlLnggLT0gb25lVGhpcmRXaWR0aDtcclxuICAgICAgICAgIH0gICAgICAgICAgICBcclxuICAgICAgICAgIGVsc2UgaWYobm9kZS54IDwgb25lVGhpcmRXaWR0aCkge1xyXG4gICAgICAgICAgbm9kZS54ICs9IG9uZVRoaXJkV2lkdGg7XHJcbiAgICAgICAgICB3aGlsZSAobm9kZS54IDwgb25lVGhpcmRXaWR0aClcclxuICAgICAgICAgICAgICBub2RlLnggKz0gb25lVGhpcmRXaWR0aDtcclxuICAgICAgICAgIH1cclxuICAgICAgXHJcbiAgICAgICAgICBpZihub2RlLnkgPiB0d29UaGlyZHNIZWlnaHQpIHtcclxuICAgICAgICAgIG5vZGUueSAtPSBvbmVUaGlyZEhlaWdodDtcclxuICAgICAgICAgIHdoaWxlIChub2RlLnkgPiB0d29UaGlyZHNIZWlnaHQpXHJcbiAgICAgICAgICAgICAgbm9kZS55IC09IG9uZVRoaXJkSGVpZ2h0OyAgICAgICAgICAgICAgICBcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2UgaWYobm9kZS55IDwgb25lVGhpcmRIZWlnaHQpIHtcclxuICAgICAgICAgIG5vZGUueSArPSBvbmVUaGlyZEhlaWdodDtcclxuICAgICAgICAgIHdoaWxlIChub2RlLnkgPCBvbmVUaGlyZEhlaWdodClcclxuICAgICAgICAgICAgICBub2RlLnkgKz0gb25lVGhpcmRIZWlnaHQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgZmluZE1hcHBpbmdOb2Rlc0Zyb21PdGhlclNxdWFyZXMgKHg6IG51bWJlciwgeTogbnVtYmVyLCBvbmVUaGlyZFdpZHRoOiBudW1iZXIsIG9uZVRoaXJkSGVpZ2h0OiBudW1iZXIsXHJcbiAgICAgIHR3b1RoaXJkc1dpZHRoOiBudW1iZXIsIHR3b1RoaXJkc0hlaWdodDogbnVtYmVyKTogQXJyYXk8YW55PiB7XHJcbiAgICAgIC8vaW5pdGlhbGlzZSBtYXBwaW5nIGFycmF5XHJcbiAgICAgIGxldCBtYXBwaW5nTm9kZXMgPSBuZXcgQXJyYXkoKTtcclxuICAgIFxyXG4gICAgIFxyXG4gICAgICBpZiAobWFwcGluZ05vZGVzICE9IG51bGwpIHtcclxuICAgICAgICAvL2NhbGN1bGF0ZSB4LCB5IHBvc2l0aW9uIG9mIG5vZGVzIGluIHRoZSA0IGFkamFjZW50IHNxdWFyZXNcclxuICAgICAgICAvL2luIHRoZSBvcmRlciBvZiBbbGVmdCwgdXAsIHJpZ2h0LCBib3R0b21dXHJcbiAgICAgICAgbWFwcGluZ05vZGVzLnB1c2goe1xyXG4gICAgICAgICAgeDogeCAtIG9uZVRoaXJkV2lkdGgsXHJcbiAgICAgICAgICB5OiB5LFxyXG4gICAgICAgICAgaW50ZXJzZWN0ZWRYOiBvbmVUaGlyZFdpZHRoLFxyXG4gICAgICAgICAgaW50ZXJzZWN0ZWRZOiAwXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbWFwcGluZ05vZGVzLnB1c2goe1xyXG4gICAgICAgICAgeDogeCxcclxuICAgICAgICAgIHk6IHkgLSBvbmVUaGlyZEhlaWdodCxcclxuICAgICAgICAgIGludGVyc2VjdGVkWDogMCxcclxuICAgICAgICAgIGludGVyc2VjdGVkWTogb25lVGhpcmRIZWlnaHRcclxuICAgICAgICB9KTtcclxuICAgICAgICBtYXBwaW5nTm9kZXMucHVzaCh7XHJcbiAgICAgICAgICB4OiB4ICsgb25lVGhpcmRXaWR0aCxcclxuICAgICAgICAgIHk6IHksXHJcbiAgICAgICAgICBpbnRlcnNlY3RlZFg6IHR3b1RoaXJkc1dpZHRoLFxyXG4gICAgICAgICAgaW50ZXJzZWN0ZWRZOiAwXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbWFwcGluZ05vZGVzLnB1c2goe1xyXG4gICAgICAgICAgeDogeCxcclxuICAgICAgICAgIHk6IHkgKyBvbmVUaGlyZEhlaWdodCxcclxuICAgICAgICAgIGludGVyc2VjdGVkWDogMCxcclxuICAgICAgICAgIGludGVyc2VjdGVkWTogdHdvVGhpcmRzSGVpZ2h0XHJcbiAgICAgICAgfSk7XHJcbiAgICBcclxuICAgICAgICAvL2NhbGN1bGF0ZSB4LCB5IHBvc2l0aW9uIG9mIG5vZGVzIGluIHRoZSA0IGNvcm5lciBzcXVhcmVzXHJcbiAgICAgICAgLy9pbiB0aGUgb3JkZXIgb2YgW3VwcGVyLWxlZnQsIHVwcGVyLXJpZ2h0LCBib3R0b20tcmlnaHQgYm90dG9tLWxlZnRdXHJcbiAgICAgICAgbWFwcGluZ05vZGVzLnB1c2goe1xyXG4gICAgICAgICAgeDogeCAtIG9uZVRoaXJkV2lkdGgsXHJcbiAgICAgICAgICB5OiB5IC0gb25lVGhpcmRIZWlnaHQsXHJcbiAgICAgICAgICBpbnRlcnNlY3RlZFg6IG9uZVRoaXJkV2lkdGgsXHJcbiAgICAgICAgICBpbnRlcnNlY3RlZFk6IG9uZVRoaXJkSGVpZ2h0XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbWFwcGluZ05vZGVzLnB1c2goe1xyXG4gICAgICAgICAgeDogeCArIG9uZVRoaXJkV2lkdGgsXHJcbiAgICAgICAgICB5OiB5IC0gb25lVGhpcmRIZWlnaHQsXHJcbiAgICAgICAgICBpbnRlcnNlY3RlZFg6IHR3b1RoaXJkc1dpZHRoLFxyXG4gICAgICAgICAgaW50ZXJzZWN0ZWRZOiBvbmVUaGlyZEhlaWdodFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG1hcHBpbmdOb2Rlcy5wdXNoKHtcclxuICAgICAgICAgIHg6IHggKyBvbmVUaGlyZFdpZHRoLFxyXG4gICAgICAgICAgeTogeSArIG9uZVRoaXJkSGVpZ2h0LFxyXG4gICAgICAgICAgaW50ZXJzZWN0ZWRYOiB0d29UaGlyZHNXaWR0aCxcclxuICAgICAgICAgIGludGVyc2VjdGVkWTogdHdvVGhpcmRzSGVpZ2h0XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbWFwcGluZ05vZGVzLnB1c2goe1xyXG4gICAgICAgICAgeDogeCAtIG9uZVRoaXJkV2lkdGgsXHJcbiAgICAgICAgICB5OiB5ICsgb25lVGhpcmRIZWlnaHQsXHJcbiAgICAgICAgICBpbnRlcnNlY3RlZFg6IG9uZVRoaXJkV2lkdGgsXHJcbiAgICAgICAgICBpbnRlcnNlY3RlZFk6IHR3b1RoaXJkc0hlaWdodFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBtYXBwaW5nTm9kZXM7XHJcbiAgfVxyXG4gICAgXHJcbiAgcHVibGljIHN0YXRpYyBmaW5kRXVjbGlkZWFuRGlzdGFuY2UoeDE6IG51bWJlciwgeTE6IG51bWJlciwgeDI6IG51bWJlciwgeTI6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KHgxLXgyLDIpICsgTWF0aC5wb3coeTEteTIsMikpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXRpYyBnZXRZR2l2ZW5YQW5kU3JjTWFwcGluZ05vZGVzICh4MTogbnVtYmVyLCB5MTogbnVtYmVyLCB4MjogbnVtYmVyLCB5MjogbnVtYmVyLCB4OiBudW1iZXIpIHtcclxuICAgIGxldCB5ID0gMDtcclxuICAgIGlmKHgxID09IHgyKVxyXG4gICAgICB5ID0gKHkxK3kyKS8yO1xyXG4gICAgZWxzZSB7XHJcbiAgICAgIHkgPSAoeDIqeTEteCp5MS14MSp5Mit4KnkyKS8oeDIteDEpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljIGdldFhHaXZlbllBbmRTcmNNYXBwaW5nTm9kZXMgKHgxOiBudW1iZXIsIHkxOiBudW1iZXIsIHgyOiBudW1iZXIsIHkyOiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgbGV0IHggPSAwO1xyXG4gICAgaWYoeTEgPT0geTIpXHJcbiAgICAgIHggPSAoeDEreDIpLzI7XHJcbiAgICBlbHNlIHtcclxuICAgICAgeCA9ICh4MSp5Mi14Mip5MS14MSp5K3gyKnkpLyh5Mi15MSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4geDtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgRGVzY2VudCwgUHNldWRvUmFuZG9tIH0gZnJvbSAnLi9kZXNjZW50JztcclxuaW1wb3J0IHsgTGF5b3V0SGVscGVyIH0gZnJvbSAnLi9sYXlvdXRoZWxwZXInO1xyXG5cclxuZXhwb3J0IGNsYXNzIE5vVG9ydXNMYXlvdXQge1xyXG4gICAgcHJpdmF0ZSBncmFwaDogYW55O1xyXG4gICAgcHJpdmF0ZSBjb25maWd1cmF0aW9uOiBhbnk7XHJcbiAgICBwcml2YXRlIHJhbmRvbSA9IG5ldyBQc2V1ZG9SYW5kb20oKTtcclxuICAgIHByaXZhdGUgZGVzY2VudCA9IG5ldyBEZXNjZW50KCk7XHJcbiAgICBwcml2YXRlIG9uZVRoaXJkV2lkdGg6IG51bWJlcjtcclxuICAgIHByaXZhdGUgb25lVGhpcmRIZWlnaHQ6IG51bWJlcjtcclxuICAgIHByaXZhdGUgdHdvVGhpcmRzV2lkdGg6IG51bWJlcjtcclxuICAgIHByaXZhdGUgdHdvVGhpcmRzSGVpZ2h0OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHVwZGF0ZVJlbmRlcjogYW55O1xyXG5cclxuICAgIC8vYWNjZXNzZWQgYnkgdGlja1xyXG4gICAgcHJpdmF0ZSBzdGVwOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIG1heERpc3BsYWNlbWVudDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSByYW5kb21PcmRlckFycmF5OiBBcnJheTxudW1iZXI+O1xyXG4gICAgcHJpdmF0ZSByYW5kb21PcmRlcjogYW55O1xyXG4gICAgcHJpdmF0ZSB2aXNpdGVkTWF0cml4OiBBcnJheTxhbnk+O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGdyYXBoOiBhbnksIGNvbmZpZ3VyYXRpb246IGFueSwgdXBkYXRlUmVuZGVyOiBhbnkpe1xyXG4gICAgICAgIHRoaXMuZ3JhcGggPSBncmFwaDtcclxuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24gPSBjb25maWd1cmF0aW9uO1xyXG4gICAgICAgIHRoaXMub25lVGhpcmRXaWR0aCA9IGNvbmZpZ3VyYXRpb24uc3ZnV2lkdGgvMztcclxuICAgICAgICB0aGlzLnR3b1RoaXJkc1dpZHRoID0gY29uZmlndXJhdGlvbi5zdmdXaWR0aCoyLzM7XHJcbiAgICAgICAgdGhpcy5vbmVUaGlyZEhlaWdodCA9ICBjb25maWd1cmF0aW9uLnN2Z0hlaWdodC8zO1xyXG4gICAgICAgIHRoaXMudHdvVGhpcmRzSGVpZ2h0ID0gY29uZmlndXJhdGlvbi5zdmdIZWlnaHQqMi8zO1xyXG4gICAgICAgIHRoaXMudXBkYXRlUmVuZGVyID0gdXBkYXRlUmVuZGVyO1xyXG4gICAgICAgIHRoaXMuZGVzY2VudCA9IG5ldyBEZXNjZW50KCk7XHJcbiAgICAgICAgdGhpcy5kZXNjZW50LmluaXQoZ3JhcGgsIHRoaXMuY29uZmlndXJhdGlvbi5lcHNpbG9uLCB0aGlzLmNvbmZpZ3VyYXRpb24ubGlua0xlbmd0aCwgdGhpcy5jb25maWd1cmF0aW9uLm51bWJlck9mQWRqdXN0bWVudEl0ZXJhdGlvbnMsIHRoaXMuY29uZmlndXJhdGlvbi5tYXhTdGVwcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXJ0KCkge1xyXG4gICAgICAgIGxldCB3ID0gdGhpcy5jb25maWd1cmF0aW9uLnN2Z1dpZHRoLFxyXG4gICAgICAgICAgICBoID0gdGhpcy5jb25maWd1cmF0aW9uLnN2Z0hlaWdodDtcclxuICAgICAgICB0aGlzLmdyYXBoLm5vZGVzLmZvckVhY2goKHYsIGkpID0+IHtcclxuICAgICAgICAgICAgdi5pbmRleCA9IGk7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygdi54ID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAodi54ID0gdyAvIDIpLCAodi55ID0gaCAvIDIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5ncmFwaC5saW5rcy5mb3JFYWNoKGwgPT4ge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGwuc291cmNlID09IFwibnVtYmVyXCIpIGwuc291cmNlID0gdGhpcy5ncmFwaC5ub2Rlc1tsLnNvdXJjZV07XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbC50YXJnZXQgPT0gXCJudW1iZXJcIikgbC50YXJnZXQgPSB0aGlzLmdyYXBoLm5vZGVzW2wudGFyZ2V0XTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICAvL3JhbmRvbWlzZSBwb3NpdGlvbnMgb2Ygbm9kZXNcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZ3JhcGgubm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBuZXdYID0gdyAvIDIgLSAwLjUgKyB0aGlzLnJhbmRvbS5nZXROZXh0QmV0d2VlbigwLCAxKTtcclxuICAgICAgICAgICAgbGV0IG5ld1kgPSBoIC8gMiAtIDAuNSArIHRoaXMucmFuZG9tLmdldE5leHRCZXR3ZWVuKDAsIDEpO1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLmdyYXBoLm5vZGVzW2ldLnggPSBuZXdYO1xyXG4gICAgICAgICAgICB0aGlzLmdyYXBoLm5vZGVzW2ldLnkgPSBuZXdZO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnJ1bigpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcnVuKCl7XHJcbiAgICAgICAgdGhpcy52aXNpdGVkTWF0cml4ID0gbmV3IEFycmF5KCk7XHJcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMuZ3JhcGgubm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHRlbXBBcnJheSA9IG5ldyBBcnJheSgpO1xyXG4gICAgICAgICAgICBmb3IobGV0IGogPSAwOyBqIDwgdGhpcy5ncmFwaC5ub2Rlcy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICB0ZW1wQXJyYXkucHVzaChmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy52aXNpdGVkTWF0cml4LnB1c2godGVtcEFycmF5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucmFuZG9tT3JkZXIgPSB7XHJcbiAgICAgICAgICAgIFwibm9kZUluZGV4XCI6IG5ldyBBcnJheSgpLFxyXG4gICAgICAgICAgICAgIFwibWF0cml4XCI6IG5ldyBBcnJheSgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLmdyYXBoLm5vZGVzLmxlbmd0aDsgaSsrKXtcclxuICAgICAgICAgICAgdGhpcy5yYW5kb21PcmRlci5ub2RlSW5kZXgucHVzaCgtMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vZ2VuZXJhdGUgcmFuZG9tIG5vZGUgc2VxdWVuY2VcclxuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy5ncmFwaC5ub2Rlcy5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgIGxldCBpbmRleCA9IE1hdGguZmxvb3IodGhpcy5yYW5kb20uZ2V0TmV4dEJldHdlZW4oMCwgMSkqdGhpcy5ncmFwaC5ub2Rlcy5sZW5ndGgpO1xyXG4gICAgICAgICAgICBpZih0aGlzLnJhbmRvbU9yZGVyLm5vZGVJbmRleFtpbmRleF0gPCAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJhbmRvbU9yZGVyLm5vZGVJbmRleFtpbmRleF0gPSBpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaS0tO1xyXG4gICAgICAgICAgICB9ICAgIFxyXG4gICAgICAgIH0gIFxyXG4gICAgICAgIFxyXG4gICAgICAgIGZvcihsZXQgbm9kZUluZGV4ID0gMDsgbm9kZUluZGV4IDwgdGhpcy5ncmFwaC5ub2Rlcy5sZW5ndGg7IG5vZGVJbmRleCsrKSB7XHJcbiAgICAgICAgICAgIGxldCB0ZW1wQXJyYXkgPSBuZXcgQXJyYXkoKTtcclxuICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMuZ3JhcGgubm9kZXMubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgICAgICAgICAgdGVtcEFycmF5LnB1c2goLTEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLmdyYXBoLm5vZGVzLmxlbmd0aDsgaSsrKXtcclxuICAgICAgICAgICAgICAgIGxldCBpbmRleCA9IE1hdGguZmxvb3IodGhpcy5yYW5kb20uZ2V0TmV4dEJldHdlZW4oMCwgMSkqdGhpcy5ncmFwaC5ub2Rlcy5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgaWYodGVtcEFycmF5W2luZGV4XSA8IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0ZW1wQXJyYXlbaW5kZXhdID0gaTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGktLTtcclxuICAgICAgICAgICAgICAgIH0gICAgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5yYW5kb21PcmRlci5tYXRyaXgucHVzaCh0ZW1wQXJyYXkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5yYW5kb21PcmRlckFycmF5ID0gbmV3IEFycmF5KHRoaXMuZ3JhcGgubm9kZXMubGVuZ3RoKTtcclxuICAgICAgICB0aGlzLm1heERpc3BsYWNlbWVudCA9IE51bWJlci5NQVhfVkFMVUU7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmdyYXBoLm5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmFuZG9tT3JkZXJBcnJheVtpXSA9IC0xO1xyXG4gICAgICAgIH1cclxuICAgICAgXHJcbiAgICAgICAgdGhpcy5zdGVwID0gMDtcclxuICAgICAgICB0aGlzLnRpY2soKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSB0aWNrKCl7XHJcbiAgICAgICAgbGV0IHVuaXRWZWN0b3IgPSBbLTEsIC0xXTtcclxuICAgICAgICBsZXQgdmVjdG9yUiA9IFstMSwgLTFdO1xyXG4gICAgXHJcbiAgICAgICAgd2hpbGUgKHRoaXMubWF4RGlzcGxhY2VtZW50ID49IHRoaXMuY29uZmlndXJhdGlvbi5kZWx0YSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zdGVwID4gdGhpcy5jb25maWd1cmF0aW9uLm1heFN0ZXBzKSB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLm1heERpc3BsYWNlbWVudCA9IC0xO1xyXG4gICAgICAgICAgICAgICAgbGV0IG51bVZpc2l0cyA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlc2NlbnQuZ2V0UmFuZG9tT3JkZXIodGhpcy5yYW5kb20sIHRoaXMuZ3JhcGgsIHRoaXMucmFuZG9tT3JkZXJBcnJheSk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucmFuZG9tT3JkZXIubm9kZUluZGV4Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yYW5kb21PcmRlci5ub2RlSW5kZXhbaV0gPSB0aGlzLnJhbmRvbU9yZGVyQXJyYXlbaV07XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnJhbmRvbU9yZGVyLm5vZGVJbmRleC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBhID0gdGhpcy5yYW5kb21PcmRlci5ub2RlSW5kZXhbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXNjZW50LmdldFJhbmRvbU9yZGVyKHRoaXMucmFuZG9tLCB0aGlzLmdyYXBoLCB0aGlzLnJhbmRvbU9yZGVyQXJyYXkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5yYW5kb21PcmRlckFycmF5Lmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBiID0gdGhpcy5yYW5kb21PcmRlckFycmF5W2pdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMudmlzaXRlZE1hdHJpeFthXVtiXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGEgPT0gYikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmlzaXRlZE1hdHJpeFthXVtiXSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBudW1WaXNpdHMrKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkaXN0YW5jZSA9IE51bWJlci5NQVhfVkFMVUU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgaWRlYWxEaXN0YW5jZSA9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubGlua0xlbmd0aCAqICh0aGlzLmdyYXBoLnNob3J0ZXN0UGF0aFthXVtiXS5sZW5ndGggLSAxKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaWRlYWxEaXN0YW5jZSA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9kaXNjb25uZWN0ZWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZpc2l0ZWRNYXRyaXhbYV1bYl0gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlkZWFsRGlzdGFuY2UgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52aXNpdGVkTWF0cml4W2FdW2JdID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy92ZWN0b3IgclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2UgPSBMYXlvdXRIZWxwZXIuZmluZEV1Y2xpZGVhbkRpc3RhbmNlKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JhcGgubm9kZXNbYV0ueCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyYXBoLm5vZGVzW2FdLnksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncmFwaC5ub2Rlc1tiXS54LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JhcGgubm9kZXNbYl0ueVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlnbm9yZSBsb25nIHJhbmdlIGF0dHJhY3Rpb25zIGZvciBub2RlcyBub3QgaW1tZWRpYXRlbHkgY29ubmVjdGVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncmFwaC5zaG9ydGVzdFBhdGhbYV1bYl0ubGVuZ3RoIC0gMSA+IDEgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXN0YW5jZSA+IGlkZWFsRGlzdGFuY2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmlzaXRlZE1hdHJpeFthXVtiXSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bml0VmVjdG9yWzBdID1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICh0aGlzLmdyYXBoLm5vZGVzW2FdLnggLSB0aGlzLmdyYXBoLm5vZGVzW2JdLngpIC8gZGlzdGFuY2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bml0VmVjdG9yWzFdID1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICh0aGlzLmdyYXBoLm5vZGVzW2FdLnkgLSB0aGlzLmdyYXBoLm5vZGVzW2JdLnkpIC8gZGlzdGFuY2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0ZW1wID0gKGRpc3RhbmNlIC0gaWRlYWxEaXN0YW5jZSkgLyAyO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZlY3RvclJbMF0gPSB1bml0VmVjdG9yWzBdICogdGVtcDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZlY3RvclJbMV0gPSB1bml0VmVjdG9yWzFdICogdGVtcDtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGVtcE1ldSA9IDAuMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0ZXAgPCB0aGlzLmNvbmZpZ3VyYXRpb24ubnVtYmVyT2ZBZGp1c3RtZW50SXRlcmF0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBNZXUgPSB0aGlzLmRlc2NlbnQuZ2V0TWV1KCkuZml4ZWRJdGVyYXRpb25bYV1bYl1bdGhpcy5zdGVwXTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wTWV1ID0gdGhpcy5kZXNjZW50LmdldFBhcmFtTFVubGltaXRlZEl0ZXJhdGlvbih0aGlzLnN0ZXApICogdGhpcy5kZXNjZW50LmdldFBhcmFtVygpLm1hdHJpeFthXVtiXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3VwZGF0ZSBwb3NpdGlvbiBYYSBhbmQgWGIgYmFzZWQgb24gY2FsY3VsYXRlZCBtb3ZlbWVudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5ld1ggPSB0aGlzLmdyYXBoLm5vZGVzW2FdLnggLSB0ZW1wTWV1ICogdmVjdG9yUlswXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBuZXdZID0gdGhpcy5ncmFwaC5ub2Rlc1thXS55IC0gdGVtcE1ldSAqIHZlY3RvclJbMV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgYkZvcmNlVG9Db252ZXJnZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RlcCA+PSB0aGlzLmNvbmZpZ3VyYXRpb24ubnVtYmVyT2ZBZGp1c3RtZW50SXRlcmF0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3WCA+IHRoaXMudHdvVGhpcmRzV2lkdGggfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3WCA8IHRoaXMub25lVGhpcmRXaWR0aCB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdZID4gdGhpcy50d29UaGlyZHNIZWlnaHQgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3WSA8IHRoaXMub25lVGhpcmRIZWlnaHRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9Gb3JjZSB0byBjb252ZXJnZTogbm8gd3JhcHBpbmcgb2Ygbm9kZXMgYXJlIHBlcm1pdHRlZCBhdCB0aGlzIHN0YWdlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1ggPSB0aGlzLmdyYXBoLm5vZGVzW2FdLng7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1kgPSB0aGlzLmdyYXBoLm5vZGVzW2FdLnk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJGb3JjZVRvQ29udmVyZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0bXBNb3ZlbWVudCA9IExheW91dEhlbHBlci5maW5kRXVjbGlkZWFuRGlzdGFuY2UoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncmFwaC5ub2Rlc1thXS54LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JhcGgubm9kZXNbYV0ueSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdYLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1lcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFiRm9yY2VUb0NvbnZlcmdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncmFwaC5ub2Rlc1thXS54ID0gdGhpcy5ncmFwaC5ub2Rlc1thXS54IC0gdGVtcE1ldSAqIHZlY3RvclJbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncmFwaC5ub2Rlc1thXS55ID0gdGhpcy5ncmFwaC5ub2Rlc1thXS55IC0gdGVtcE1ldSAqIHZlY3RvclJbMV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubWF4RGlzcGxhY2VtZW50IDwgdG1wTW92ZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1heERpc3BsYWNlbWVudCA9IHRtcE1vdmVtZW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1ggPSB0aGlzLmdyYXBoLm5vZGVzW2JdLnggKyB0ZW1wTWV1ICogdmVjdG9yUlswXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1kgPSB0aGlzLmdyYXBoLm5vZGVzW2JdLnkgKyB0ZW1wTWV1ICogdmVjdG9yUlsxXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJGb3JjZVRvQ29udmVyZ2UgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0ZXAgPj0gdGhpcy5jb25maWd1cmF0aW9uLm51bWJlck9mQWRqdXN0bWVudEl0ZXJhdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1ggPiB0aGlzLnR3b1RoaXJkc1dpZHRoIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1ggPCB0aGlzLm9uZVRoaXJkV2lkdGggfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3WSA+IHRoaXMudHdvVGhpcmRzSGVpZ2h0IHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1kgPCB0aGlzLm9uZVRoaXJkSGVpZ2h0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vRm9yY2UgdG8gY29udmVyZ2U6IG5vIHdyYXBwaW5nIG9mIG5vZGVzIGFyZSBwZXJtaXR0ZWQgYXQgdGhpcyBzdGFnZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdYID0gdGhpcy5ncmFwaC5ub2Rlc1tiXS54O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdZID0gdGhpcy5ncmFwaC5ub2Rlc1tiXS55O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiRm9yY2VUb0NvbnZlcmdlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bXBNb3ZlbWVudCA9IExheW91dEhlbHBlci5maW5kRXVjbGlkZWFuRGlzdGFuY2UoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncmFwaC5ub2Rlc1tiXS54LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JhcGgubm9kZXNbYl0ueSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdYLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1lcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFiRm9yY2VUb0NvbnZlcmdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncmFwaC5ub2Rlc1tiXS54ID0gdGhpcy5ncmFwaC5ub2Rlc1tiXS54ICsgdGVtcE1ldSAqIHZlY3RvclJbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncmFwaC5ub2Rlc1tiXS55ID0gdGhpcy5ncmFwaC5ub2Rlc1tiXS55ICsgdGVtcE1ldSAqIHZlY3RvclJbMV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubWF4RGlzcGxhY2VtZW50IDwgdG1wTW92ZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1heERpc3BsYWNlbWVudCA9IHRtcE1vdmVtZW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3VwZGF0ZSB2aXNpdGVkIG1hdHJpeFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52aXNpdGVkTWF0cml4W2FdW2JdID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmlzaXRlZE1hdHJpeFtiXVthXSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy9yZXNldCB2aXNpdGVkTWF0cml4IGJlZm9yZSBuZXh0IHN0ZXAgaXRlcmF0aW9uXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZ3JhcGgubm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMuZ3JhcGgubm9kZXMubGVuZ3RoOyBqKyspXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aXNpdGVkTWF0cml4W2ldW2pdID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0ZXArKztcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5iRW5hYmxlQW5pbWF0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNjYWxlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVSZW5kZXIoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gXHJcbiAgICAgICAgdGhpcy5yZXNjYWxlKCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVSZW5kZXIoKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVJlbmRlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVzY2FsZSAoKSB7XHJcbiAgICAgICAgLy9yZXNjYWxlIG5vZGUgcG9zaXRpb25zIGZvciBOb1RvcnVzIGxheW91dFxyXG4gICAgICAgIGxldCBsZWZ0bW9zdCA9IE51bWJlci5NQVhfVkFMVUU7XHJcbiAgICAgICAgbGV0IHJpZ2h0bW9zdCA9IDA7XHJcbiAgICAgICAgbGV0IHVwbW9zdCA9IE51bWJlci5NQVhfVkFMVUU7XHJcbiAgICAgICAgbGV0IGJvdHRvbW1vc3QgPSAwO1xyXG4gICAgICAgIHRoaXMuZ3JhcGgubm9kZXMuZm9yRWFjaChub2RlID0+IHtcclxuICAgICAgICBpZiAobm9kZS54IDwgbGVmdG1vc3QpIGxlZnRtb3N0ID0gbm9kZS54O1xyXG4gICAgICAgIGlmIChub2RlLnggPiByaWdodG1vc3QpIHJpZ2h0bW9zdCA9IG5vZGUueDtcclxuICAgICAgICBpZiAobm9kZS55IDwgdXBtb3N0KSB1cG1vc3QgPSBub2RlLnk7XHJcbiAgICAgICAgaWYgKG5vZGUueSA+IGJvdHRvbW1vc3QpIGJvdHRvbW1vc3QgPSBub2RlLnk7XHJcbiAgICAgICAgfSk7XHJcbiAgICBcclxuICAgICAgICBsZXQgbWFyZ2luID0gMTA7XHJcbiAgICAgICAgdGhpcy5ncmFwaC5ub2Rlcy5mb3JFYWNoKCh2LCBpbmRleCkgPT4ge1xyXG4gICAgICAgIHYueCA9XHJcbiAgICAgICAgICAgIHRoaXMuZ3JhcGgubm9kZXNbaW5kZXhdLnggLVxyXG4gICAgICAgICAgICAobGVmdG1vc3QgLSB0aGlzLm9uZVRoaXJkV2lkdGgpICtcclxuICAgICAgICAgICAgbWFyZ2luO1xyXG4gICAgICAgIHYueSA9XHJcbiAgICAgICAgICAgIHRoaXMuZ3JhcGgubm9kZXNbaW5kZXhdLnkgLVxyXG4gICAgICAgICAgICAodXBtb3N0IC0gdGhpcy5vbmVUaGlyZEhlaWdodCkgK1xyXG4gICAgICAgICAgICBtYXJnaW47XHJcbiAgICAgICAgfSk7XHJcbiAgICBcclxuICAgICAgICBsZXQgYm91bmRpbmdib3hXaWR0aCA9IHJpZ2h0bW9zdCAtIGxlZnRtb3N0O1xyXG4gICAgICAgIGxldCBib3VuZGluZ2JveEhlaWdodCA9IGJvdHRvbW1vc3QgLSB1cG1vc3Q7XHJcbiAgICBcclxuICAgICAgICBsZXQgY2VsbFdpZHRoID0gdGhpcy5vbmVUaGlyZFdpZHRoIC0gMiAqIG1hcmdpbjtcclxuICAgICAgICBpZiAoYm91bmRpbmdib3hXaWR0aCAhPSAwICYmIGJvdW5kaW5nYm94V2lkdGggIT0gMCkge1xyXG4gICAgICAgIGxldCBiYXNlbGluZVggPSB0aGlzLm9uZVRoaXJkV2lkdGggKyBtYXJnaW47XHJcbiAgICAgICAgbGV0IGJhc2VsaW5lWSA9IHRoaXMub25lVGhpcmRIZWlnaHQgKyBtYXJnaW47XHJcbiAgICAgICAgdGhpcy5ncmFwaC5ub2Rlcy5mb3JFYWNoKCh2LCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgICB2LnggPVxyXG4gICAgICAgICAgICBiYXNlbGluZVggK1xyXG4gICAgICAgICAgICAoKHRoaXMuZ3JhcGgubm9kZXNbaW5kZXhdLnggLSBiYXNlbGluZVgpICogY2VsbFdpZHRoKSAvIGJvdW5kaW5nYm94V2lkdGg7XHJcbiAgICAgICAgICAgIHYueSA9XHJcbiAgICAgICAgICAgIGJhc2VsaW5lWSArXHJcbiAgICAgICAgICAgICgodGhpcy5ncmFwaC5ub2Rlc1tpbmRleF0ueSAtIGJhc2VsaW5lWSkgKiBjZWxsV2lkdGgpIC8gYm91bmRpbmdib3hIZWlnaHQ7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgXHJcbiAgICAgICAgLy9pbnZva2UgcmVuZGVyIGNhbGxiYWNrXHJcbiAgICAgICAgdGhpcy51cGRhdGVSZW5kZXIoKTtcclxuICAgIH1cclxufVxyXG5cclxuIl19
