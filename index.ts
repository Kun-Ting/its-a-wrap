import * as d3 from 'd3';
import { NoTorusLayout } from './src/notoruslayout';
import { TorusLayout } from './src/toruslayout';
import { BaseView } from './view/baseview';
import { TorusView } from './view/torusView';

export class MainComponent {
    private static INSTANCE: MainComponent;

    private graph: any;
    private configuration: any;

    static getInstance(): MainComponent {
        if(MainComponent.INSTANCE == null) {
            MainComponent.INSTANCE = new MainComponent();
        }
        return MainComponent.INSTANCE;
    }

    constructor() {
        d3.select('#intmode')
        .on('change', () => {
            this.init(true);
        });
        d3.select('#questionnum')
        .on('change', () => {
            this.init(true);
        });
        this.init(true);
    }

    private getLinkLength(graphDiameter: number) {        
        let divisor = graphDiameter + 1;
        let linkLength = 0;
        linkLength = this.configuration.svgWidth / 3 / divisor;
        if (
            linkLength > this.configuration.svgWidth / 3 / 3 - 5 &&
            linkLength < this.configuration.svgWidth / 3 / 3 + 5
        ) {
            divisor += 1;
            linkLength = this.configuration.svgWidth / 3 / divisor;
        }
        return linkLength;          
    }

    private init(bInitConfig: boolean){
        let intmode = d3.select("#intmode").property("value"); //0: notorus, 1: td
        let questionnum = d3.select("#questionnum").property("value");

        if(bInitConfig) {
            this.configuration = new Object(
            {
                "originX": 0, 
                "originY": 0, 
                "dragStartX":0, 
                "dragStartY": 0,
                "width": 30000,
                "height": 30000,
                "svgWidth": 1300,
                "svgHeight": 1300,
                "paramW": null,
                "paramL": null,
                "epsilon": 0.1,
                "numberOfAdjustmentIterations": 80,
                "delta": 0.03,
                "maxSteps": 200,
                "bEnableAnimation": false
            });
            
            d3.select("#mainSvg").attr("viewBox", this.configuration.svgWidth / 3 +
            " " +
            this.configuration.svgWidth / 3 +
            " " +
            this.configuration.svgWidth / 3 +
            " " +
            this.configuration.svgWidth / 3);

            d3.select("#mainSvg").style("max-width", "100%");
            d3.select("#mainSvg").style("width", "150% !important");
            d3.select("#mainSvg").style("height", "auto");            
        }
        
        d3.select("#mainSvg").selectAll(".cleanOnInit").remove();
        d3.json("graphdata/"+String(parseInt(questionnum))+".json").then((graph: any) => {
            this.generateGraph(graph);
            if(intmode == "0") { 
                let view: BaseView = new BaseView(d3.select("#mainSvg").node(), graph);
                let layout: NoTorusLayout = new NoTorusLayout(graph, this.configuration, () => {
                    view.updateOuterlinks();
                    view.updateRender(0, 0);
                });                
                layout.start();
            } else if (intmode == "1") {
                let view: TorusView = new TorusView(d3.select("#mainSvg").node(), graph, this.configuration);
                let layout: TorusLayout = new TorusLayout(graph, this.configuration, () => {
                    view.computeWrappingGraphForRendering();
                    view.updateTorusLayoutRender();                    
                });
                layout.start();
            }
            
        });               
    }

    private generateGraph(graphData: any): void{

        this.graph = graphData;
        this.graph.shortestPath = JSON.parse(graphData.path);
        
        for(let i = 0; i < this.graph.nodes.length; i++) {
            this.graph.nodes[i].visible = true;
            for(let j = 0; j < this.graph.nodes.length; j++) {
                let path = new Array();
                if(this.graph.shortestPath[i] == undefined) {
                    this.graph.shortestPath[i] = new Array();
                    path.push(0);
                    this.graph.shortestPath[i].push(path);
                }   
                else if(this.graph.shortestPath[i] != undefined && this.graph.shortestPath[i][j] == undefined) {
                    path.push(0);
                    this.graph.shortestPath[i][j] = path;
                }                
            }
        }
        let graphDiameter: number = 0;

        for(let i = 0; i < this.graph.nodes.length; i++) {
            for(let j = i + 1; j < this.graph.nodes.length; j++) {
            if(this.graph.shortestPath[i][j].length - 1 > graphDiameter)
                graphDiameter = this.graph.shortestPath[i][j].length - 1;
            }
        }    

        this.graph.links.forEach((l: any) => {
            l.visible = true;
        });
        
        this.configuration.linkLength = this.getLinkLength(graphDiameter);        
    }
}

MainComponent.getInstance();