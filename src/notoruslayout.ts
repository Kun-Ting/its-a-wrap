import { Descent, PseudoRandom } from './descent';
import { LayoutHelper } from './layouthelper';

export class NoTorusLayout {
    private graph: any;
    private configuration: any;
    private random = new PseudoRandom();
    private descent = new Descent();
    private oneThirdWidth: number;
    private oneThirdHeight: number;
    private twoThirdsWidth: number;
    private twoThirdsHeight: number;
    private updateRender: any;

    //accessed by tick
    private step: number;
    private maxDisplacement: number;
    private randomOrderArray: Array<number>;
    private randomOrder: any;
    private visitedMatrix: Array<any>;

    constructor(graph: any, configuration: any, updateRender: any){
        this.graph = graph;
        this.configuration = configuration;
        this.oneThirdWidth = configuration.svgWidth/3;
        this.twoThirdsWidth = configuration.svgWidth*2/3;
        this.oneThirdHeight =  configuration.svgHeight/3;
        this.twoThirdsHeight = configuration.svgHeight*2/3;
        this.updateRender = updateRender;
        this.descent = new Descent();
        this.descent.init(graph, this.configuration.epsilon, this.configuration.linkLength, this.configuration.numberOfAdjustmentIterations, this.configuration.maxSteps);
    }

    public start() {
        let w = this.configuration.svgWidth,
            h = this.configuration.svgHeight;
        this.graph.nodes.forEach((v, i) => {
            v.index = i;
            if (typeof v.x === 'undefined') {
            (v.x = w / 2), (v.y = h / 2);
            }
        });
        
        this.graph.links.forEach(l => {
            if (typeof l.source == "number") l.source = this.graph.nodes[l.source];
            if (typeof l.target == "number") l.target = this.graph.nodes[l.target];
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

    private run(){
        this.visitedMatrix = new Array();
        for(let i = 0; i < this.graph.nodes.length; i++) {
            let tempArray = new Array();
            for(let j = 0; j < this.graph.nodes.length; j++) {
            tempArray.push(false);
            }
            this.visitedMatrix.push(tempArray);
        }

        this.randomOrder = {
            "nodeIndex": new Array(),
              "matrix": new Array()
        }
        
        for(let i = 0; i < this.graph.nodes.length; i++){
            this.randomOrder.nodeIndex.push(-1);
        }
        
        //generate random node sequence
        for(let i = 0; i < this.graph.nodes.length; i++){
            let index = Math.floor(this.random.getNextBetween(0, 1)*this.graph.nodes.length);
            if(this.randomOrder.nodeIndex[index] < 0) {
                this.randomOrder.nodeIndex[index] = i;
            }
            else {
                i--;
            }    
        }  
        
        for(let nodeIndex = 0; nodeIndex < this.graph.nodes.length; nodeIndex++) {
            let tempArray = new Array();
            for(let i = 0; i < this.graph.nodes.length; i++){
                tempArray.push(-1);
            }
        
            for(let i = 0; i < this.graph.nodes.length; i++){
                let index = Math.floor(this.random.getNextBetween(0, 1)*this.graph.nodes.length);
                if(tempArray[index] < 0) {
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
    
    private tick(){
        let unitVector = [-1, -1];
        let vectorR = [-1, -1];
    
        while (this.maxDisplacement >= this.configuration.delta) {
            if (this.step > this.configuration.maxSteps) {
                break;
            } else {
            
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
                            let idealDistance =
                            this.configuration.linkLength * (this.graph.shortestPath[a][b].length - 1);
            
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
                            distance = LayoutHelper.findEuclideanDistance(
                                this.graph.nodes[a].x,
                                this.graph.nodes[a].y,
                                this.graph.nodes[b].x,
                                this.graph.nodes[b].y
                            );
        
                            // ignore long range attractions for nodes not immediately connected
                            if (
                                this.graph.shortestPath[a][b].length - 1 > 1 &&
                                distance > idealDistance
                            ) {
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
                                
                            } else {
                                tempMeu = this.descent.getParamLUnlimitedIteration(this.step) * this.descent.getParamW().matrix[a][b];
                            }
            
                            //update position Xa and Xb based on calculated movement
                            let newX = this.graph.nodes[a].x - tempMeu * vectorR[0];
                            let newY = this.graph.nodes[a].y - tempMeu * vectorR[1];
                            let bForceToConverge = false;
                            if (this.step >= this.configuration.numberOfAdjustmentIterations) {
                                if (
                                    newX > this.twoThirdsWidth ||
                                    newX < this.oneThirdWidth ||
                                    newY > this.twoThirdsHeight ||
                                    newY < this.oneThirdHeight
                                ) {
                                    //Force to converge: no wrapping of nodes are permitted at this stage
                                    newX = this.graph.nodes[a].x;
                                    newY = this.graph.nodes[a].y;
                                    bForceToConverge = true;
                                }
                            }
                            let tmpMovement = LayoutHelper.findEuclideanDistance(
                                this.graph.nodes[a].x,
                                this.graph.nodes[a].y,
                                newX,
                                newY
                            );
            
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
                                if (
                                    newX > this.twoThirdsWidth ||
                                    newX < this.oneThirdWidth ||
                                    newY > this.twoThirdsHeight ||
                                    newY < this.oneThirdHeight
                                ) {
                                    //Force to converge: no wrapping of nodes are permitted at this stage
                                    newX = this.graph.nodes[b].x;
                                    newY = this.graph.nodes[b].y;
                                    bForceToConverge = true;
                                }
                            }
                            tmpMovement = LayoutHelper.findEuclideanDistance(
                                this.graph.nodes[b].x,
                                this.graph.nodes[b].y,
                                newX,
                                newY
                            );
            
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

    private rescale () {
        //rescale node positions for NoTorus layout
        let leftmost = Number.MAX_VALUE;
        let rightmost = 0;
        let upmost = Number.MAX_VALUE;
        let bottommost = 0;
        this.graph.nodes.forEach(node => {
        if (node.x < leftmost) leftmost = node.x;
        if (node.x > rightmost) rightmost = node.x;
        if (node.y < upmost) upmost = node.y;
        if (node.y > bottommost) bottommost = node.y;
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

