import * as d3 from 'd3';
import { BaseView } from './baseview';
import { LayoutHelper } from '../src/layouthelper';


export class TorusView extends BaseView {
    private twoEdgeWrappingGraph: any;
    private threeEdgeWrappingGraph: any;
    private configuration: any;
    private oneThirdWidth: number;
    private oneThirdHeight: number;
    private twoThirdsWidth: number;
    private twoThirdsHeight: number;
    private bLayoutStarted: boolean;

    constructor(element: any, graph: any, configuration: any){
        super(element, graph);
        this.twoEdgeWrappingGraph = {
            nodes: [],
            links: []
        };
        this.threeEdgeWrappingGraph = {
            nodes: [],
            links: []
        };
        this.configuration = configuration;   
        this.oneThirdWidth = configuration.svgWidth/3;
        this.twoThirdsWidth = configuration.svgWidth*2/3;
        this.oneThirdHeight =  configuration.svgHeight/3;
        this.twoThirdsHeight = configuration.svgHeight*2/3;     
        this.bLayoutStarted = false;
    }

    private initPanning() {
        let svgGroup = this.svgs.selectAll(".draggableGroup")
            .data([{"x": 0, "y": 0}])
            .enter()
            .append("g")
            .attr("class", "draggableGroup" + " cleanOnInit")
            .attr("id", "parentGroup")
            .attr("draggable", true)
            .raise()
            .on('touchstart', () => {
                this.configuration.dragStartX = d3.event.touches[0].clientX;
                this.configuration.dragStartY = d3.event.touches[0].clientY;        
            })
            .on("touchmove", () => {
                this.transformGroup(d3.event.touches[0].clientX - this.configuration.dragStartX, d3.event.touches[0].clientY - this.configuration.dragStartY);
            
                this.configuration.dragStartX = d3.event.touches[0].clientX;
                this.configuration.dragStartY = d3.event.touches[0].clientY;
            
                LayoutHelper.wrappingNode(this.graph, this.oneThirdWidth, this.oneThirdWidth, this.twoThirdsWidth, this.twoThirdsHeight);
                this.computeWrappingGraphForRendering();
                this.updateTorusLayoutRender();                
            })
            .on("touchend", () => {
                this.transformGroup(d3.event.touches[0].clientX - this.configuration.dragStartX, d3.event.touches[0].clientY - this.configuration.dragStartY);
            
                this.configuration.dragStartX = d3.event.touches[0].clientX;
                this.configuration.dragStartY = d3.event.touches[0].clientY;
            
            })
            .call(d3.drag()
            .on('start', () => {
                this.configuration.dragStartX = d3.event.x;
                this.configuration.dragStartY = d3.event.y;        
            })
            .on("drag", () => {
                this.transformGroup(d3.event.x - this.configuration.dragStartX, d3.event.y - this.configuration.dragStartY);
            
                this.configuration.dragStartX = d3.event.x;
                this.configuration.dragStartY = d3.event.y;
            
                LayoutHelper.wrappingNode(this.graph, this.oneThirdWidth, this.oneThirdWidth, this.twoThirdsWidth, this.twoThirdsHeight);
                this.computeWrappingGraphForRendering();
                this.updateTorusLayoutRender();               
            })
            .on("end", () => {
                this.transformGroup(d3.event.x - this.configuration.dragStartX, d3.event.y - this.configuration.dragStartY);
            
                this.configuration.dragStartX = d3.event.x;
                this.configuration.dragStartY = d3.event.y;
            })            
        );

        let rectangle = svgGroup
            .selectAll(".background")
            .data([{"x": 0, "y": 0}])
            .enter()
            .append("rect")
            .attr("x", this.configuration.originX)
            .attr("y", this.configuration.originY)
            .attr("rx", 0)
            .attr("ry", 0)
            .attr("fill-opacity", 0)
            .attr("width", this.configuration.width)
            .attr("height", this.configuration.height)
            .attr("class", "background" + " cleanOnInit")
            .style("stroke", "black")
            .style("fill", "white")
            .raise();
            
    }

    public computeWrappingGraphForRendering() {
        if (
            this.twoEdgeWrappingGraph != null &&
            this.twoEdgeWrappingGraph.links != null &&
            this.twoEdgeWrappingGraph.nodes != null
        ) {
            //restore visibility of edges on graph
            //overwrite all the wrapping edges derived in previous layout round
            this.graph.links.forEach(d => {
              d.visible = true;
            });
        
            this.graph.links.forEach(d => {
                if (d.source.visible && d.target.visible) d.visible = true;
                else d.visible = false;
            });
            this.twoEdgeWrappingGraph.nodes.splice(
              0,
              this.twoEdgeWrappingGraph.nodes.length
            );
            this.twoEdgeWrappingGraph.links.splice(
              0,
              this.twoEdgeWrappingGraph.links.length
            );
            this.threeEdgeWrappingGraph.nodes.splice(
              0,
              this.threeEdgeWrappingGraph.nodes.length
            );
            this.threeEdgeWrappingGraph.links.splice(
              0,
              this.threeEdgeWrappingGraph.links.length
            );
        
            for (let node of this.graph.nodes) {
                if (node.visible) {
                    this.twoEdgeWrappingGraph.nodes.push({
                        x: node.x,
                        y: node.y,
                        visible: false,
                        name: ""
                    });
                    this.threeEdgeWrappingGraph.nodes.push({
                        x: node.x,
                        y: node.y,
                        visible: false,
                        name: ""
                    });
                }
            }
        }
        let sourceX = 0;
        let sourceY = 0;
        let targetX = 0;
        let targetY = 0;
        let mappingNodes = null;
        let intersectionPoints = null;
        let tmpDistance = 0;
        let results: any = null;
    
        for (let edge of this.graph.links) {
            if (edge.visible) {
                sourceX = edge.source.x;
                sourceY = edge.source.y;
                targetX = edge.target.x;
                targetY = edge.target.y;
                results = {
                        edgeLength: Number.MAX_VALUE,
                        minDiffFromIdealDistance: Number.MAX_VALUE
                };
                tmpDistance = 0;
                let idealDistance =
                    this.configuration.linkLength *
                    (this.graph.shortestPath[edge.source.id][edge.target.id].length - 1);
                mappingNodes = LayoutHelper.findMappingNodesFromOtherSquares(
                    targetX,
                    targetY, this.oneThirdHeight, this.oneThirdHeight, 
                    this.twoThirdsWidth, this.twoThirdsWidth);
                
            
                intersectionPoints = this.findIntersectionPointsWithWrapping(
                    sourceX,
                    sourceY,
                    targetX,
                    targetY,
                    mappingNodes,
                    results,                    
                    idealDistance
                );
        
                tmpDistance = this.findEuclideanDistance(sourceX, sourceY, targetX, targetY);
                let diffFromIdealDistance = Math.abs(tmpDistance - idealDistance);
                if (
                    results.minDiffFromIdealDistance <= diffFromIdealDistance &&
                    intersectionPoints != null &&
                    intersectionPoints.length > 0
                    ) {
                    if (intersectionPoints.length > 2 && intersectionPoints.length < 5) {
                        this.threeEdgeWrappingGraph.links.push({
                            x1: intersectionPoints[0].x,
                            y1: intersectionPoints[0].y,
                            x2: sourceX,
                            y2: sourceY,
                            visible: true,
                            edgeLength: results.edgeLength
                        });
                        this.threeEdgeWrappingGraph.links.push({
                            x1: intersectionPoints[1].x,
                            y1: intersectionPoints[1].y,
                            x2: targetX,
                            y2: targetY,
                            visible: true,
                            edgeLength: results.edgeLength
                        });
            
                        this.threeEdgeWrappingGraph.links.push({
                            x1: intersectionPoints[2].x,
                            y1: intersectionPoints[2].y,
                            x2: intersectionPoints[3].x,
                            y2: intersectionPoints[3].y,
                            visible: true,
                            edgeLength: results.edgeLength
                        });
            
                       
                    } else {
                       
                        this.twoEdgeWrappingGraph.links.push({
                        x1: intersectionPoints[0].x,
                        y1: intersectionPoints[0].y,
                        x2: sourceX,
                        y2: sourceY,
                        visible: true,
                        edgeLength: results.edgeLength
                        });
                        this.twoEdgeWrappingGraph.links.push({
                        x1: intersectionPoints[1].x,
                        y1: intersectionPoints[1].y,
                        x2: targetX,
                        y2: targetY,
                        visible: true,
                        edgeLength: results.edgeLength
                        });
            
                        
                    }
                    edge.visible = false;
                } 
            }
        }
    }

    private findEuclideanDistance(x1: number, y1: number, x2: number, y2: number): number {
        return Math.sqrt(Math.pow(x1-x2,2) + Math.pow(y1-y2,2));
    }

    private findIntersectionPointsWithWrapping (
        sourceX: number,
        sourceY: number,
        targetX: number,
        targetY: number,
        mappingNodes: Array<any>,
        results: any,
        idealDistance: number
      ) {
        let intersectionPoints = new Array();
        let minDiffFromIdealDistance = Number.MAX_VALUE;
        let minDistance = Number.MAX_VALUE;
        if (mappingNodes == null) intersectionPoints = null;
        else {
          //for each targetNode, we need to calculate a pair of intersection points on two sides of boundaries
          //the following steps are performed in each loop
          //step 1: find intersection point 1
          //step 2: find intersection point 2
          //step 3: check whether it is smaller than the minDiffFromIdealDistance
          
          for (let mappingNode of mappingNodes) {
            let intersectedX1 = 0;
            let intersectedY1 = 0;
            let intersectedX2 = 0;
            let intersectedY2 = 0;
            let intersectedX3 = 0;
            let intersectedY3 = 0;
            let intersectedX4 = 0;
            let intersectedY4 = 0;
      
            if (
              mappingNode.intersectedX != 0 &&
              mappingNode.intersectedY != 0               
            ) {
              //upper-left corner
              if (
                mappingNode.intersectedX == this.oneThirdWidth &&
                mappingNode.intersectedY == this.oneThirdHeight
              ) {
                let testX1 = mappingNode.intersectedX;
                let testY1 = LayoutHelper.getYGivenXAndSrcMappingNodes(
                  sourceX,
                  sourceY,
                  mappingNode.x,
                  mappingNode.y,
                  mappingNode.intersectedX
                );
      
                let testY2 = mappingNode.intersectedY;
                let testX2 = LayoutHelper.getXGivenYAndSrcMappingNodes(
                  sourceX,
                  sourceY,
                  mappingNode.x,
                  mappingNode.y,
                  mappingNode.intersectedY
                );
      
                //check whether testY1 is within center square boundary
                if (
                  testY1 >= this.oneThirdHeight &&
                  testY1 <= this.twoThirdsHeight
                ) {
                  intersectedX1 = mappingNode.intersectedX;
                  intersectedY1 = testY1;
      
                  intersectedX2 = testX2 + this.oneThirdWidth;
                  intersectedY2 = testY2 + this.oneThirdHeight;
      
                  intersectedX3 = intersectedX1 + this.oneThirdWidth;
                  intersectedY3 = intersectedY1;
      
                  intersectedX4 = testX2 + this.oneThirdWidth;
                  intersectedY4 = testY2;
                } else if (
                  testX2 >= this.oneThirdWidth &&
                  testX2 <= this.twoThirdsWidth
                ) {
                  intersectedX1 = testX2;
                  intersectedY1 = mappingNode.intersectedY;
      
                  intersectedX2 = testX1 + this.oneThirdWidth;
                  intersectedY2 = testY1 + this.oneThirdHeight;
      
                  intersectedX3 = intersectedX1;
                  intersectedY3 = intersectedY1 + this.oneThirdHeight;
      
                  intersectedX4 = testX1;
                  intersectedY4 = testY1 + this.oneThirdHeight;
                }
              }
              //upper-right corner
              else if (
                mappingNode.intersectedX == this.twoThirdsWidth &&
                mappingNode.intersectedY == this.oneThirdHeight
              ) {
                let testX1 = mappingNode.intersectedX;
                let testY1 = LayoutHelper.getYGivenXAndSrcMappingNodes(
                  sourceX,
                  sourceY,
                  mappingNode.x,
                  mappingNode.y,
                  mappingNode.intersectedX
                );
      
                let testY2 = mappingNode.intersectedY;
                let testX2 = LayoutHelper.getXGivenYAndSrcMappingNodes(
                  sourceX,
                  sourceY,
                  mappingNode.x,
                  mappingNode.y,
                  mappingNode.intersectedY
                );
      
                //check whether testY1 is within center square boundary
                if (
                  testY1 >= this.oneThirdHeight &&
                  testY1 <= this.twoThirdsHeight
                ) {
                  intersectedX1 = mappingNode.intersectedX;
                  intersectedY1 = testY1;
      
                  intersectedX2 = testX2 - this.oneThirdWidth;
                  intersectedY2 = testY2 + this.oneThirdHeight;
      
                  intersectedX3 = intersectedX1 - this.oneThirdWidth;
                  intersectedY3 = intersectedY1;
      
                  intersectedX4 = testX2 - this.oneThirdWidth;
                  intersectedY4 = testY2;
                } else if (
                  testX2 >= this.oneThirdWidth &&
                  testX2 <= this.twoThirdsWidth
                ) {
                  intersectedX1 = testX2;
                  intersectedY1 = mappingNode.intersectedY;
      
                  intersectedX2 = testX1 - this.oneThirdWidth;
                  intersectedY2 = testY1 + this.oneThirdHeight;
      
                  intersectedX3 = intersectedX1;
                  intersectedY3 = intersectedY1 + this.oneThirdHeight;
      
                  intersectedX4 = testX1;
                  intersectedY4 = testY1 + this.oneThirdHeight;
                }
              }
              //bottom-right corner
              else if (
                mappingNode.intersectedX == this.twoThirdsWidth &&
                mappingNode.intersectedY == this.twoThirdsHeight
              ) {
                let testX1 = mappingNode.intersectedX;
                let testY1 = LayoutHelper.getYGivenXAndSrcMappingNodes(
                  sourceX,
                  sourceY,
                  mappingNode.x,
                  mappingNode.y,
                  mappingNode.intersectedX
                );
      
                let testY2 = mappingNode.intersectedY;
                let testX2 = LayoutHelper.getXGivenYAndSrcMappingNodes(
                  sourceX,
                  sourceY,
                  mappingNode.x,
                  mappingNode.y,
                  mappingNode.intersectedY
                );
      
                //check whether testY1 is within center square boundary
                if (
                  testY1 >= this.oneThirdHeight &&
                  testY1 <= this.twoThirdsHeight
                ) {
                  intersectedX1 = mappingNode.intersectedX;
                  intersectedY1 = testY1;
      
                  intersectedX2 = testX2 - this.oneThirdWidth;
                  intersectedY2 = testY2 - this.oneThirdHeight;
      
                  intersectedX3 = intersectedX1 - this.oneThirdWidth;
                  intersectedY3 = intersectedY1;
      
                  intersectedX4 = testX2 - this.oneThirdWidth;
                  intersectedY4 = testY2;
                } else if (
                  testX2 >= this.oneThirdWidth &&
                  testX2 <= this.twoThirdsWidth
                ) {
                  intersectedX1 = testX2;
                  intersectedY1 = mappingNode.intersectedY;
      
                  intersectedX2 = testX1 - this.oneThirdWidth;
                  intersectedY2 = testY1 - this.oneThirdHeight;
      
                  intersectedX3 = intersectedX1;
                  intersectedY3 = intersectedY1 - this.oneThirdHeight;
      
                  intersectedX4 = testX1;
                  intersectedY4 = testY1 - this.oneThirdHeight;
                }
              }
              //bottom-left corner
              else if (
                mappingNode.intersectedX == this.oneThirdWidth &&
                mappingNode.intersectedY == this.twoThirdsHeight
              ) {
                let testX1 = mappingNode.intersectedX;
                let testY1 = LayoutHelper.getYGivenXAndSrcMappingNodes(
                  sourceX,
                  sourceY,
                  mappingNode.x,
                  mappingNode.y,
                  mappingNode.intersectedX
                );
      
                let testY2 = mappingNode.intersectedY;
                let testX2 = LayoutHelper.getXGivenYAndSrcMappingNodes(
                  sourceX,
                  sourceY,
                  mappingNode.x,
                  mappingNode.y,
                  mappingNode.intersectedY
                );
      
                //check whether testY1 is within center square boundary
                if (
                  testY1 >= this.oneThirdHeight &&
                  testY1 <= this.twoThirdsHeight
                ) {
                  intersectedX1 = mappingNode.intersectedX;
                  intersectedY1 = testY1;
      
                  intersectedX2 = testX2 + this.oneThirdWidth;
                  intersectedY2 = testY2 - this.oneThirdHeight;
      
                  intersectedX3 = intersectedX1 + this.oneThirdWidth;
                  intersectedY3 = intersectedY1;
      
                  intersectedX4 = testX2 + this.oneThirdWidth;
                  intersectedY4 = testY2;
                } else if (
                  testX2 >= this.oneThirdWidth &&
                  testX2 <= this.twoThirdsWidth
                ) {
                  intersectedX1 = testX2;
                  intersectedY1 = mappingNode.intersectedY;
      
                  intersectedX2 = testX1 + this.oneThirdWidth;
                  intersectedY2 = testY1 - this.oneThirdHeight;
      
                  intersectedX3 = intersectedX1;
                  intersectedY3 = intersectedY1 - this.oneThirdHeight;
      
                  intersectedX4 = testX1;
                  intersectedY4 = testY1 - this.oneThirdHeight;
                }
              }
            } else if (mappingNode.intersectedX != 0) {
              intersectedX1 = mappingNode.intersectedX;
              intersectedY1 = LayoutHelper.getYGivenXAndSrcMappingNodes(
                sourceX,
                sourceY,
                mappingNode.x,
                mappingNode.y,
                mappingNode.intersectedX
              );
              intersectedX2 =
                mappingNode.intersectedX == this.oneThirdWidth
                  ? this.twoThirdsWidth
                  : this.oneThirdWidth;
              intersectedY2 = intersectedY1;
            } else if (mappingNode.intersectedY != 0) {
              intersectedY1 = mappingNode.intersectedY;
              intersectedX1 = LayoutHelper.getXGivenYAndSrcMappingNodes(
                sourceX,
                sourceY,
                mappingNode.x,
                mappingNode.y,
                mappingNode.intersectedY
              );
      
              intersectedX2 = intersectedX1;
              intersectedY2 =
                mappingNode.intersectedY == this.oneThirdHeight
                  ? this.twoThirdsHeight
                  : this.oneThirdHeight;
            }
      
            let tmpDistanceBtnSourceAndIntersectPt1 = LayoutHelper.findEuclideanDistance(
              intersectedX1,
              intersectedY1,
              sourceX,
              sourceY
            );
            let tmpDistanceBtnTargetAndIntersectPt2 = LayoutHelper.findEuclideanDistance(
              intersectedX2,
              intersectedY2,
              targetX,
              targetY
            );
      
            let diffFromIdealDistance = Math.abs(
              tmpDistanceBtnSourceAndIntersectPt1 +
                tmpDistanceBtnTargetAndIntersectPt2 -
                idealDistance
            );
      
            if (
                (mappingNode.intersectedX == 0 || mappingNode.intersectedY == 0) &&
                minDiffFromIdealDistance > diffFromIdealDistance
              ) {
                if (mappingNode.intersectedX != 0 || mappingNode.intersectedY != 0) {
                  minDiffFromIdealDistance = diffFromIdealDistance;
                  results.edgeLength =
                    tmpDistanceBtnSourceAndIntersectPt1 +
                    tmpDistanceBtnTargetAndIntersectPt2;
                  results.minDiffFromIdealDistance = minDiffFromIdealDistance;
                  intersectionPoints.splice(0, intersectionPoints.length);
                  intersectionPoints.push({ x: intersectedX1, y: intersectedY1 });
                  intersectionPoints.push({ x: intersectedX2, y: intersectedY2 });
                }
              } else if (
                (mappingNode.intersectedX != 0 && mappingNode.intersectedY != 0)
              ) {
                let tmpDistanceBtnIntersectPt3Pt4 = LayoutHelper.findEuclideanDistance(
                  intersectedX3,
                  intersectedY3,
                  intersectedX4,
                  intersectedY4
                );
      
                diffFromIdealDistance = Math.abs(
                  tmpDistanceBtnSourceAndIntersectPt1 +
                    tmpDistanceBtnTargetAndIntersectPt2 +
                    tmpDistanceBtnIntersectPt3Pt4 -
                    idealDistance
                );
      
                if (minDiffFromIdealDistance > diffFromIdealDistance) {
                  minDiffFromIdealDistance = diffFromIdealDistance;
                  results.edgeLength =
                    tmpDistanceBtnSourceAndIntersectPt1 +
                    tmpDistanceBtnTargetAndIntersectPt2 +
                    tmpDistanceBtnIntersectPt3Pt4;
                  results.minDiffFromIdealDistance = minDiffFromIdealDistance;
                  intersectionPoints.splice(0, intersectionPoints.length);
                  intersectionPoints.push({ x: intersectedX1, y: intersectedY1 });
                  intersectionPoints.push({ x: intersectedX2, y: intersectedY2 });
                  intersectionPoints.push({ x: intersectedX3, y: intersectedY3 });
                  intersectionPoints.push({ x: intersectedX4, y: intersectedY4 });
                }
              }
          }
        }
        return intersectionPoints;
      }

    public updateTorusLayoutRender () {
        this.updateOuterlinks();
        for (let i = 0; i < this.twoEdgeWrappingGraph.links.length; i++) {
            let angle = this.getAngleInRadiansBetweenPointAndOrigin(
              Math.abs(
                this.twoEdgeWrappingGraph.links[i].x1 - this.twoEdgeWrappingGraph.links[i].x2
              ),
              Math.abs(
                this.twoEdgeWrappingGraph.links[i].y1 - this.twoEdgeWrappingGraph.links[i].y2
              )
            );
            let addInnerX = this.innerRadius * Math.cos(angle);
            let addOuterX = this.outerRadiusPlusStrokeWidth * Math.cos(angle);
            let addInnerY = this.innerRadius * Math.sin(angle);
            let addOuterY = this.outerRadiusPlusStrokeWidth * Math.sin(angle);
      
            //add source node link
            if (
              this.twoEdgeWrappingGraph.links[i].x1 != this.oneThirdWidth &&
              this.twoEdgeWrappingGraph.links[i].x1 != this.twoThirdsWidth &&
              this.twoEdgeWrappingGraph.links[i].y1 != this.oneThirdHeight &&
              this.twoEdgeWrappingGraph.links[i].y1 != this.twoThirdsHeight
            ) {
              let innerX =
                this.twoEdgeWrappingGraph.links[i].x2 > this.twoEdgeWrappingGraph.links[i].x1
                  ? this.twoEdgeWrappingGraph.links[i].x1 + addInnerX
                  : this.twoEdgeWrappingGraph.links[i].x1 - addInnerX;
              let outerX =
                this.twoEdgeWrappingGraph.links[i].x2 > this.twoEdgeWrappingGraph.links[i].x1
                  ? this.twoEdgeWrappingGraph.links[i].x1 + addOuterX
                  : this.twoEdgeWrappingGraph.links[i].x1 - addOuterX;
              let innerY =
                this.twoEdgeWrappingGraph.links[i].y2 > this.twoEdgeWrappingGraph.links[i].y1
                  ? this.twoEdgeWrappingGraph.links[i].y1 + addInnerY
                  : this.twoEdgeWrappingGraph.links[i].y1 - addInnerY;
              let outerY =
                this.twoEdgeWrappingGraph.links[i].y2 > this.twoEdgeWrappingGraph.links[i].y1
                  ? this.twoEdgeWrappingGraph.links[i].y1 + addOuterY
                  : this.twoEdgeWrappingGraph.links[i].y1 - addOuterY;
      
              this.outerlinks.links.push({
                visible: true,
                source: { x: innerX, y: innerY },
                target: { x: outerX, y: outerY }
              });
            }
      
            //add target node link
            if (
              this.twoEdgeWrappingGraph.links[i].x2 != this.oneThirdWidth &&
              this.twoEdgeWrappingGraph.links[i].x2 != this.twoThirdsWidth &&
              this.twoEdgeWrappingGraph.links[i].y2 != this.oneThirdHeight &&
              this.twoEdgeWrappingGraph.links[i].y2 != this.twoThirdsHeight
            ) {
                let innerX =
                    this.twoEdgeWrappingGraph.links[i].x2 > this.twoEdgeWrappingGraph.links[i].x1
                    ? this.twoEdgeWrappingGraph.links[i].x2 - addInnerX
                    : this.twoEdgeWrappingGraph.links[i].x2 + addInnerX;
                let outerX =
                    this.twoEdgeWrappingGraph.links[i].x2 > this.twoEdgeWrappingGraph.links[i].x1
                    ? this.twoEdgeWrappingGraph.links[i].x2 - addOuterX
                    : this.twoEdgeWrappingGraph.links[i].x2 + addOuterX;
                let innerY =
                    this.twoEdgeWrappingGraph.links[i].y2 > this.twoEdgeWrappingGraph.links[i].y1
                    ? this.twoEdgeWrappingGraph.links[i].y2 - addInnerY
                    : this.twoEdgeWrappingGraph.links[i].y2 + addInnerY;
                let outerY =
                    this.twoEdgeWrappingGraph.links[i].y2 > this.twoEdgeWrappingGraph.links[i].y1
                    ? this.twoEdgeWrappingGraph.links[i].y2 - addOuterY
                    : this.twoEdgeWrappingGraph.links[i].y2 + addOuterY;
        
                this.outerlinks.links.push({
                        visible: true,
                        source: { x: innerX, y: innerY },
                        target: { x: outerX, y: outerY }
                });
            }
        }
      
        for (let i = 0; i < this.threeEdgeWrappingGraph.links.length; i++) {
            let angle = this.getAngleInRadiansBetweenPointAndOrigin(
                Math.abs(
                this.threeEdgeWrappingGraph.links[i].x1 -
                    this.threeEdgeWrappingGraph.links[i].x2
                ),
                Math.abs(
                this.threeEdgeWrappingGraph.links[i].y1 -
                    this.threeEdgeWrappingGraph.links[i].y2
                )
            );
            let addInnerX = this.innerRadius * Math.cos(angle);
            let addOuterX = this.outerRadiusPlusStrokeWidth * Math.cos(angle);
            let addInnerY = this.innerRadius * Math.sin(angle);
            let addOuterY = this.outerRadiusPlusStrokeWidth * Math.sin(angle);
        
            //add source node link
            if (
                this.threeEdgeWrappingGraph.links[i].x1 != this.oneThirdWidth &&
                this.threeEdgeWrappingGraph.links[i].x1 != this.twoThirdsWidth &&
                this.threeEdgeWrappingGraph.links[i].y1 != this.oneThirdHeight &&
                this.threeEdgeWrappingGraph.links[i].y1 != this.twoThirdsHeight
            ) {
                let innerX =
                this.threeEdgeWrappingGraph.links[i].x2 >
                this.threeEdgeWrappingGraph.links[i].x1
                    ? this.threeEdgeWrappingGraph.links[i].x1 + addInnerX
                    : this.threeEdgeWrappingGraph.links[i].x1 - addInnerX;
                let outerX =
                this.threeEdgeWrappingGraph.links[i].x2 >
                this.threeEdgeWrappingGraph.links[i].x1
                    ? this.threeEdgeWrappingGraph.links[i].x1 + addOuterX
                    : this.threeEdgeWrappingGraph.links[i].x1 - addOuterX;
                let innerY =
                this.threeEdgeWrappingGraph.links[i].y2 >
                this.threeEdgeWrappingGraph.links[i].y1
                    ? this.threeEdgeWrappingGraph.links[i].y1 + addInnerY
                    : this.threeEdgeWrappingGraph.links[i].y1 - addInnerY;
                let outerY =
                this.threeEdgeWrappingGraph.links[i].y2 >
                this.threeEdgeWrappingGraph.links[i].y1
                    ? this.threeEdgeWrappingGraph.links[i].y1 + addOuterY
                    : this.threeEdgeWrappingGraph.links[i].y1 - addOuterY;
        
                this.outerlinks.links.push({
                visible: true,
                source: { x: innerX, y: innerY },
                target: { x: outerX, y: outerY }
                });
            }
      
            //add target node link
            if (
              this.threeEdgeWrappingGraph.links[i].x2 != this.oneThirdWidth &&
              this.threeEdgeWrappingGraph.links[i].x2 != this.twoThirdsWidth &&
              this.threeEdgeWrappingGraph.links[i].y2 != this.oneThirdHeight &&
              this.threeEdgeWrappingGraph.links[i].y2 != this.twoThirdsHeight
            ) {
                let innerX =
                    this.threeEdgeWrappingGraph.links[i].x2 >
                    this.threeEdgeWrappingGraph.links[i].x1
                    ? this.threeEdgeWrappingGraph.links[i].x2 - addInnerX
                    : this.threeEdgeWrappingGraph.links[i].x2 + addInnerX;
                let outerX =
                    this.threeEdgeWrappingGraph.links[i].x2 >
                    this.threeEdgeWrappingGraph.links[i].x1
                    ? this.threeEdgeWrappingGraph.links[i].x2 - addOuterX
                    : this.threeEdgeWrappingGraph.links[i].x2 + addOuterX;
                let innerY =
                    this.threeEdgeWrappingGraph.links[i].y2 >
                    this.threeEdgeWrappingGraph.links[i].y1
                    ? this.threeEdgeWrappingGraph.links[i].y2 - addInnerY
                    : this.threeEdgeWrappingGraph.links[i].y2 + addInnerY;
                let outerY =
                    this.threeEdgeWrappingGraph.links[i].y2 >
                    this.threeEdgeWrappingGraph.links[i].y1
                    ? this.threeEdgeWrappingGraph.links[i].y2 - addOuterY
                    : this.threeEdgeWrappingGraph.links[i].y2 + addOuterY;
        
                    this.outerlinks.links.push({
                    visible: true,
                    source: { x: innerX, y: innerY },
                    target: { x: outerX, y: outerY }
                });
            }
        }
        this.updateRender(0,0);
        this.updateEdgeWrappingRender(0, 0);
        if(!this.bLayoutStarted) {
            this.bLayoutStarted = true;
            this.initPanning();
        }        
      } 

      public updateEdgeWrappingRender (shiftX: number, shiftY: number) {
        let twoEdgeWrappingLink = this.svgs.selectAll(".twoEdgeWrappingLink" + this.areaClassName)
        .data(this.twoEdgeWrappingGraph.links);
        
        //update
        twoEdgeWrappingLink 
          .attr("x1", (d: any) => { return d.x1 + shiftX; })
          .attr("y1", (d: any) => { return d.y1 + shiftY; })
          .attr("x2", (d: any) => { return d.x2 + shiftX; })
          .attr("y2", (d: any) => { return d.y2 + shiftY; })
          .lower()
          .style("visibility", (d: any) => {
          return d.visible == true ? "visible" : "hidden";
        });
      
        //enter
        twoEdgeWrappingLink
          .enter().append("line")                
          .attr("class", "twoEdgeWrappingLink" + this.areaClassName +" cleanOnInit")
          .attr("x1", (d: any) => { return d.x1 + shiftX; })
          .attr("y1", (d: any) => { return d.y1 + shiftY; })
          .attr("x2", (d: any) => { return d.x2 + shiftX; })
          .attr("y2", (d: any) => { return d.y2 + shiftY; })
        .lower()
          .style("visibility", (d: any) => {
          return d.visible == true ? "visible" : "hidden";
        });
      
        //exit
        twoEdgeWrappingLink
          .exit().remove();
            
        let threeEdgeWrappingLink = this.svgs.selectAll(".threeEdgeWrappingLink" + this.areaClassName)
        .data(this.threeEdgeWrappingGraph.links);
      
        //update
        threeEdgeWrappingLink 
          .attr("x1", (d: any) => { return d.x1 + shiftX; })
          .attr("y1", (d: any) => { return d.y1 + shiftY; })
          .attr("x2", (d: any) => { return d.x2 + shiftX; })
          .attr("y2", (d: any) => { return d.y2 + shiftY; })
          .lower()
          .style("visibility", (d: any) => {
          return d.visible == true ? "visible" : "hidden";
        });
      
        //enter
        threeEdgeWrappingLink
          .enter().append("line")                
          .attr("class", "threeEdgeWrappingLink" + this.areaClassName +" cleanOnInit")
          .attr("x1", (d: any) => { return d.x1 + shiftX; })
          .attr("y1", (d: any) => { return d.y1 + shiftY; })
          .attr("x2", (d: any) => { return d.x2 + shiftX; })
          .attr("y2", (d: any) => { return d.y2 + shiftY; })
         .lower()
          .style("visibility", (d: any) => {
          return d.visible == true ? "visible" : "hidden";
        });
      
        //exit
        threeEdgeWrappingLink
          .exit().remove();
      }

    private transformGroup (offsetX: number, offsetY: number) {
        for (let node of this.graph.nodes){
          node.x += offsetX;
          node.y += offsetY;
        }
      }
}