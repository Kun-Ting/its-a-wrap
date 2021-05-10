export class LayoutHelper {
  public static wrappingNode (graph: any, oneThirdWidth: number, oneThirdHeight: number, twoThirdsWidth: number, twoThirdsHeight: number) {
      //To wrap a node if it's not within a boundary, we apply the following 2 steps
      //1. check whether the input node is within boundary 
      //2. wrap node.x, node.y if it's outside boundary
     
      for(let node of graph.nodes) {
          if(node.x > twoThirdsWidth) {
          node.x -= oneThirdWidth;
          while (node.x > twoThirdsWidth)
              node.x -= oneThirdWidth;
          }            
          else if(node.x < oneThirdWidth) {
          node.x += oneThirdWidth;
          while (node.x < oneThirdWidth)
              node.x += oneThirdWidth;
          }
      
          if(node.y > twoThirdsHeight) {
          node.y -= oneThirdHeight;
          while (node.y > twoThirdsHeight)
              node.y -= oneThirdHeight;                
          }
          else if(node.y < oneThirdHeight) {
          node.y += oneThirdHeight;
          while (node.y < oneThirdHeight)
              node.y += oneThirdHeight;
          }
      }
  }

  public static findMappingNodesFromOtherSquares (x: number, y: number, oneThirdWidth: number, oneThirdHeight: number,
      twoThirdsWidth: number, twoThirdsHeight: number): Array<any> {
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
    
  public static findEuclideanDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x1-x2,2) + Math.pow(y1-y2,2));
  }

  public static getYGivenXAndSrcMappingNodes (x1: number, y1: number, x2: number, y2: number, x: number) {
    let y = 0;
    if(x1 == x2)
      y = (y1+y2)/2;
    else {
      y = (x2*y1-x*y1-x1*y2+x*y2)/(x2-x1);
    }
    return y;
  }

  public static getXGivenYAndSrcMappingNodes (x1: number, y1: number, x2: number, y2: number, y: number) {
    let x = 0;
    if(y1 == y2)
      x = (x1+x2)/2;
    else {
      x = (x1*y2-x2*y1-x1*y+x2*y)/(y2-y1);
    }
    return x;
  }
}
