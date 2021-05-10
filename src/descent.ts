export class Descent {
    private paramW: any;
    private paramL: any;
    private meu: any;
    private numberOfAdjustmentIterations: number;

    public init(graph: any, epsilon: number, linkLength: number, numberOfAdjustmentIterations: number, maxSteps: number){
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
        this.setParamL(this.paramW, epsilon, numberOfAdjustmentIterations, maxSteps)
        this.setMeu(graph, maxSteps, this.paramW, this.paramL);
    }

    public getRandomOrder = (random: any, graph: any, tempArray: Array<number>) => {
        for(let i = 0; i < graph.nodes.length; i++){
            tempArray[i] = -1;
        }
        for(let i = 0; i < graph.nodes.length; i++){
            let index = Math.floor(random.getNextBetween(0, 1)*graph.nodes.length);
            if(tempArray[index] < 0) {
                tempArray[index] = i;
            }
            else {
                i--;
            }    
        }
    }

    public getMeu(): any {
        return this.meu;
    }

    private setMeu (graph: any, maxSteps: number, paramW: any, paramL: any) {
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

    public getParamW(): any {
        return this.paramW;
    }

    private setParamL(paramW: any, epsilon: number, numberOfAdjustmentIterations: number, maxSteps: number){
        
        this.paramL.lambda =
        -Math.log(this.paramL.min / this.paramL.max) / (numberOfAdjustmentIterations - 1);
    
        for (let i = 0; i < maxSteps; i++) {
            this.paramL.fixedIterations.push(
                (1 / paramW.min) * Math.exp(-this.paramL.lambda * i)
            );
        }          
    }

    private setParamW(linkLength: number, graph: any) {
        
        let min = Number.MAX_VALUE, max = 0;
        let wi = new Array();
        for(let i = 0; i < graph.nodes.length; i++) {
            let wj = new Array();
            for(let j = 0; j < graph.nodes.length; j++) {
                let distance = linkLength * (graph.shortestPath[i][j].length - 1);
                
                if(i == j || distance <= 0) {
                    wj.push(0);
                    continue;
                }
                let tempWij = 1/(distance*distance);
                if(tempWij > 0 && tempWij < min)
                    min = tempWij;
                if(tempWij > max)
                    max = tempWij;
                tempWij > 0 ? wj.push(tempWij) : wj.push(0);
            }    
            wi.push(wj);
        }  
        this.paramW.matrix = wi;
        this.paramW.min = min;
        this.paramW.max = max;
    }

    public getParamLUnlimitedIteration (iteration: number) {
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
      
        let stepSizeForUnlimitedIterations =
          1 / this.paramW.max / (1 + myParamL.lambda * iteration);
       
        return stepSizeForUnlimitedIterations;
      }
}

// Linear congruential pseudo random number generator
export class PseudoRandom {
    private a: number = 214013;
    private c: number = 2531011;
    private m: number = 2147483648;
    private range: number = 32767;

    constructor(public seed: number = 1) { }

    // random real between 0 and 1
    getNext(): number {
        this.seed = (this.seed * this.a + this.c) % this.m;
        return (this.seed >> 16) / this.range;
    }

    // random real between min and max
    getNextBetween(min: number, max: number) {
        return min + this.getNext() * (max - min);
    }
}