import * as d3 from 'd3';

export class BaseView {
    protected svgs: any;
    protected graph: any;
    protected outerlinks: any;
    protected areaClassName: string = "_center"; //draw only center square
    protected color: any;
    protected innerRadius: number;
    protected outerRadiusPlusStrokeWidth: number;

    constructor(element: any, graph: any){
      this.svgs = d3.select(element);
      this.graph = graph;
      this.outerlinks = ({
        "links":[                
       ]
     });
      this.color = d3.scaleOrdinal(d3.schemePaired);
      this.innerRadius = 3; 
      this.outerRadiusPlusStrokeWidth = 5.5; 
      this.initRender();
    }

    public initRender() {        

      let link = this.svgs
        .selectAll(".link" + this.areaClassName)
        .data(this.graph.links)
        .enter()
        .append("line")
        .attr("class", "link" + this.areaClassName + " cleanOnInit")
        .style("visibility", "visible");        

      let nodeGroup = this.svgs
        .selectAll(".draggableNodeGroup" + this.areaClassName)
        .data(this.graph.nodes)
        .enter()
        .append("g")
        .attr("class", "draggableNodeGroup" + this.areaClassName + " cleanOnInit")
        .style("visibility", (d: any) => {
          return d.visible == true ? "visible" : "hidden";
        })
        .attr("draggable", true);

      nodeGroup
        .append("circle")
        .attr("class", "outernode" + this.areaClassName + " cleanOnInit")
        .attr("r", (d: any) => {
          return 4;
        })
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("stroke", (d: any) => {
          return "white";
        })
        .style("fill", (d: any) => {
          return "#FFFFFF";
        });

      let outerlink = this.svgs
        .selectAll(".outerlink" + this.areaClassName)
        .data(this.outerlinks.links)
        .enter()
        .append("line")
        .attr("class", "outerlink" + this.areaClassName + " cleanOnInit")
        .style("visibility", (d: any) => {
          return "visible";
        });

      let node = nodeGroup
        .append("circle")
        .attr("class", "node" + this.areaClassName + " cleanOnInit")
        .attr("r", (d: any) => {
          if (d.name == "S" || d.name == "E" || d.id == 4) return 3;
          else return 3; 
        })
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("stroke", (d: any) => {
          return "white";
        });
    }
    
    public updateOuterlinks() {
      this.outerlinks.links = [];
      for (let i = 0; i < this.graph.links.length; i++) {
        if (this.graph.links[i].visible) {
          if (this.graph.links[i].target.x == this.graph.links[i].source.x) {
            //add source node link
            let innerY =
              this.graph.links[i].target.y > this.graph.links[i].source.y
                ? this.graph.links[i].source.y + this.innerRadius
                : this.graph.links[i].source.y - this.innerRadius;
            let outerY =
              this.graph.links[i].target.y > this.graph.links[i].source.y
                ? this.graph.links[i].source.y + this.outerRadiusPlusStrokeWidth
                : this.graph.links[i].source.y - this.outerRadiusPlusStrokeWidth;
                this.outerlinks.links.push({
              visible: true,
              source: { x: this.graph.links[i].target.x, y: innerY },
              target: { x: this.graph.links[i].target.x, y: outerY }
            });

            //add target node link
            innerY =
              this.graph.links[i].target.y > this.graph.links[i].source.y
                ? this.graph.links[i].target.y - this.innerRadius
                : this.graph.links[i].target.y + this.innerRadius;
            outerY =
              this.graph.links[i].target.y > this.graph.links[i].source.y
                ? this.graph.links[i].target.y - this.outerRadiusPlusStrokeWidth
                : this.graph.links[i].target.y + this.outerRadiusPlusStrokeWidth;
                this.outerlinks.links.push({
              visible: true,
              source: { x: this.graph.links[i].target.x, y: innerY },
              target: { x: this.graph.links[i].target.x, y: outerY }
            });
          } else if (this.graph.links[i].target.y == this.graph.links[i].source.y) {
            //add source node link
            let innerX =
              this.graph.links[i].target.x > this.graph.links[i].source.x
                ? this.graph.links[i].source.x + this.innerRadius
                : this.graph.links[i].source.x - this.innerRadius;
            let outerX =
              this.graph.links[i].target.x > this.graph.links[i].source.x
                ? this.graph.links[i].source.x + this.outerRadiusPlusStrokeWidth
                : this.graph.links[i].source.x - this.outerRadiusPlusStrokeWidth;
                this.outerlinks.links.push({
              visible: true,
              source: { x: innerX, y: this.graph.links[i].target.y },
              target: { x: outerX, y: this.graph.links[i].target.y }
            });

            //add target node link
            innerX =
              this.graph.links[i].target.x > this.graph.links[i].source.x
                ? this.graph.links[i].target.x - this.innerRadius
                : this.graph.links[i].target.x + this.innerRadius;
            outerX =
              this.graph.links[i].target.x > this.graph.links[i].source.x
                ? this.graph.links[i].target.x - this.outerRadiusPlusStrokeWidth
                : this.graph.links[i].target.x + this.outerRadiusPlusStrokeWidth;
                this.outerlinks.links.push({
              visible: true,
              source: { x: innerX, y: this.graph.links[i].target.y },
              target: { x: outerX, y: this.graph.links[i].target.y }
            });
          } else {
            let angle = this.getAngleInRadiansBetweenPointAndOrigin(
              Math.abs(this.graph.links[i].target.x - this.graph.links[i].source.x),
              Math.abs(this.graph.links[i].target.y - this.graph.links[i].source.y)
            );
            //add source node link
            let addInnerX = this.innerRadius * Math.cos(angle);
            let addOuterX = this.outerRadiusPlusStrokeWidth * Math.cos(angle);
            let addInnerY = this.innerRadius * Math.sin(angle);
            let addOuterY = this.outerRadiusPlusStrokeWidth * Math.sin(angle);

            let innerX =
              this.graph.links[i].target.x > this.graph.links[i].source.x
                ? this.graph.links[i].source.x + addInnerX
                : this.graph.links[i].source.x - addInnerX;
            let outerX =
              this.graph.links[i].target.x > this.graph.links[i].source.x
                ? this.graph.links[i].source.x + addOuterX
                : this.graph.links[i].source.x - addOuterX;
            let innerY =
              this.graph.links[i].target.y > this.graph.links[i].source.y
                ? this.graph.links[i].source.y + addInnerY
                : this.graph.links[i].source.y - addInnerY;
            let outerY =
              this.graph.links[i].target.y > this.graph.links[i].source.y
                ? this.graph.links[i].source.y + addOuterY
                : this.graph.links[i].source.y - addOuterY;

            this.outerlinks.links.push({
              visible: true,
              source: { x: innerX, y: innerY },
              target: { x: outerX, y: outerY }
            });

            //add target node link
            innerX =
              this.graph.links[i].target.x > this.graph.links[i].source.x
                ? this.graph.links[i].target.x - addInnerX
                : this.graph.links[i].target.x + addInnerX;
            outerX =
              this.graph.links[i].target.x > this.graph.links[i].source.x
                ? this.graph.links[i].target.x - addOuterX
                : this.graph.links[i].target.x + addOuterX;
            innerY =
              this.graph.links[i].target.y > this.graph.links[i].source.y
                ? this.graph.links[i].target.y - addInnerY
                : this.graph.links[i].target.y + addInnerY;
            outerY =
              this.graph.links[i].target.y > this.graph.links[i].source.y
                ? this.graph.links[i].target.y - addOuterY
                : this.graph.links[i].target.y + addOuterY;

                this.outerlinks.links.push({
              visible: true,
              source: { x: innerX, y: innerY },
              target: { x: outerX, y: outerY }
            });
          }
        }
      }
    }

    public updateRender(
      shiftX: number,
      shiftY: number      
    ) {
      let nodeGroup = this.svgs.selectAll(".draggableNodeGroup" + this.areaClassName);
      let node = this.svgs.selectAll(".node" + this.areaClassName);
      let link = this.svgs.selectAll(".link" + this.areaClassName);
      let outerlink = this.svgs
        .selectAll(".outerlink" + this.areaClassName)
        .data(this.outerlinks.links);
      let outernode = this.svgs.selectAll(".outernode" + this.areaClassName);
    
      outernode.attr("stroke", (d: any) => {
        
        return "white";
      });
    
      node.style("fill", (d: any) => {
        let colorGroup = 0;
        if (d.group != undefined) {         
          return this.color(d.group);         
        }
        return this.color(colorGroup);        
      });
    
      link
        .attr("x1", (d: any) => {
          return d.source.x + shiftX;
        })
        .attr("y1", (d: any) => {
          return d.source.y + shiftY;
        })
        .attr("x2", (d: any) => {
          return d.target.x + shiftX;
        })
        .attr("y2", (d: any) => {
          return d.target.y + shiftY;
        })
        .style("visibility", (d: any) => {
          return d.visible == true ? "visible" : "hidden";
        });
    
      //update
      outerlink
        .attr("x1", (d: any) => {
          return d.source.x + shiftX;
        })
        .attr("y1", (d: any) => {
          return d.source.y + shiftY;
        })
        .attr("x2", (d: any) => {
          return d.target.x + shiftX;
        })
        .attr("y2", (d: any) => {
          return d.target.y + shiftY;
        })
        .style("visibility", (d: any) => {
          return d.visible == true ? "visible" : "hidden";
        });
    
      //enter
      outerlink
        .enter()
        .append("line")
        .attr("class", "outerlink" + this.areaClassName + " cleanOnInit")
        .attr("x1", (d: any) => {
          return d.source.x + shiftX;
        })
        .attr("y1", (d: any) => {
          return d.source.y + shiftY;
        })
        .attr("x2", (d: any) => {
          return d.target.x + shiftX;
        })
        .attr("y2", (d: any) => {
          return d.target.y + shiftY;
        })
        .style("visibility", (d: any) => {
          return "visible";
        });
    
      //exit
      outerlink.exit().remove();
    
      //update
      nodeGroup.raise().attr("transform", (d: any) => {
        return "translate(" + (d.x + shiftX) + "," + (d.y + shiftY) + ")";
      });
    
      outerlink.raise();
    }

    protected getAngleInRadiansBetweenPointAndOrigin (x: number, y: number) {
      return Math.atan2(y, x);
    }
}