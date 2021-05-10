(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbGF5b3V0aGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0FDQUEsTUFBYSxZQUFZO0lBQ2hCLE1BQU0sQ0FBQyxZQUFZLENBQUUsS0FBVSxFQUFFLGFBQXFCLEVBQUUsY0FBc0IsRUFBRSxjQUFzQixFQUFFLGVBQXVCO1FBQ2xJLDhFQUE4RTtRQUM5RSxxREFBcUQ7UUFDckQsaURBQWlEO1FBRWpELEtBQUksSUFBSSxJQUFJLElBQUksS0FBSyxDQUFDLEtBQUssRUFBRTtZQUN6QixJQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsY0FBYyxFQUFFO2dCQUM1QixJQUFJLENBQUMsQ0FBQyxJQUFJLGFBQWEsQ0FBQztnQkFDeEIsT0FBTyxJQUFJLENBQUMsQ0FBQyxHQUFHLGNBQWM7b0JBQzFCLElBQUksQ0FBQyxDQUFDLElBQUksYUFBYSxDQUFDO2FBQzNCO2lCQUNJLElBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxhQUFhLEVBQUU7Z0JBQ2hDLElBQUksQ0FBQyxDQUFDLElBQUksYUFBYSxDQUFDO2dCQUN4QixPQUFPLElBQUksQ0FBQyxDQUFDLEdBQUcsYUFBYTtvQkFDekIsSUFBSSxDQUFDLENBQUMsSUFBSSxhQUFhLENBQUM7YUFDM0I7WUFFRCxJQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsZUFBZSxFQUFFO2dCQUM3QixJQUFJLENBQUMsQ0FBQyxJQUFJLGNBQWMsQ0FBQztnQkFDekIsT0FBTyxJQUFJLENBQUMsQ0FBQyxHQUFHLGVBQWU7b0JBQzNCLElBQUksQ0FBQyxDQUFDLElBQUksY0FBYyxDQUFDO2FBQzVCO2lCQUNJLElBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxjQUFjLEVBQUU7Z0JBQ2pDLElBQUksQ0FBQyxDQUFDLElBQUksY0FBYyxDQUFDO2dCQUN6QixPQUFPLElBQUksQ0FBQyxDQUFDLEdBQUcsY0FBYztvQkFDMUIsSUFBSSxDQUFDLENB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QUMsR0FBRyxDQUFDLEVBQUUsR0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7YUFDWDtZQUNILENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBQyxFQUFFLEdBQUMsQ0FBQyxHQUFDLEVBQUUsR0FBQyxFQUFFLEdBQUMsRUFBRSxHQUFDLENBQUMsR0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLEVBQUUsR0FBQyxFQUFFLENBQUMsQ0FBQztTQUNyQztRQUNELE9BQU8sQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUVNLE1BQU0sQ0FBQyw0QkFBNEIsQ0FBRSxFQUFVLEVBQUUsRUFBVSxFQUFFLEVBQVUsRUFBRSxFQUFVLEVBQUUsQ0FBUztRQUNuRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVixJQUFHLEVBQUUsSUFBSSxFQUFFO1lBQ1QsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQzthQUNYO1lBQ0gsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFDLEVBQUUsR0FBQyxFQUFFLEdBQUMsRUFBRSxHQUFDLEVBQUUsR0FBQyxDQUFDLEdBQUMsRUFBRSxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsRUFBRSxHQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3JDO1FBQ0QsT0FBTyxDQUFDLENBQUM7SUFDWCxDQUFDO0NBQ0Y7QUF0SEQsb0NBc0hDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiZXhwb3J0IGNsYXNzIExheW91dEhlbHBlciB7XHJcbiAgcHVibGljIHN0YXRpYyB3cmFwcGluZ05vZGUgKGdyYXBoOiBhbnksIG9uZVRoaXJkV2lkdGg6IG51bWJlciwgb25lVGhpcmRIZWlnaHQ6IG51bWJlciwgdHdvVGhpcmRzV2lkdGg6IG51bWJlciwgdHdvVGhpcmRzSGVpZ2h0OiBudW1iZXIpIHtcclxuICAgICAgLy9UbyB3cmFwIGEgbm9kZSBpZiBpdCdzIG5vdCB3aXRoaW4gYSBib3VuZGFyeSwgd2UgYXBwbHkgdGhlIGZvbGxvd2luZyAyIHN0ZXBzXHJcbiAgICAgIC8vMS4gY2hlY2sgd2hldGhlciB0aGUgaW5wdXQgbm9kZSBpcyB3aXRoaW4gYm91bmRhcnkgXHJcbiAgICAgIC8vMi4gd3JhcCBub2RlLngsIG5vZGUueSBpZiBpdCdzIG91dHNpZGUgYm91bmRhcnlcclxuICAgICBcclxuICAgICAgZm9yKGxldCBub2RlIG9mIGdyYXBoLm5vZGVzKSB7XHJcbiAgICAgICAgICBpZihub2RlLnggPiB0d29UaGlyZHNXaWR0aCkge1xyXG4gICAgICAgICAgbm9kZS54IC09IG9uZVRoaXJkV2lkdGg7XHJcbiAgICAgICAgICB3aGlsZSAobm9kZS54ID4gdHdvVGhpcmRzV2lkdGgpXHJcbiAgICAgICAgICAgICAgbm9kZS54IC09IG9uZVRoaXJkV2lkdGg7XHJcbiAgICAgICAgICB9ICAgICAgICAgICAgXHJcbiAgICAgICAgICBlbHNlIGlmKG5vZGUueCA8IG9uZVRoaXJkV2lkdGgpIHtcclxuICAgICAgICAgIG5vZGUueCArPSBvbmVUaGlyZFdpZHRoO1xyXG4gICAgICAgICAgd2hpbGUgKG5vZGUueCA8IG9uZVRoaXJkV2lkdGgpXHJcbiAgICAgICAgICAgICAgbm9kZS54ICs9IG9uZVRoaXJkV2lkdGg7XHJcbiAgICAgICAgICB9XHJcbiAgICAgIFxyXG4gICAgICAgICAgaWYobm9kZS55ID4gdHdvVGhpcmRzSGVpZ2h0KSB7XHJcbiAgICAgICAgICBub2RlLnkgLT0gb25lVGhpcmRIZWlnaHQ7XHJcbiAgICAgICAgICB3aGlsZSAobm9kZS55ID4gdHdvVGhpcmRzSGVpZ2h0KVxyXG4gICAgICAgICAgICAgIG5vZGUueSAtPSBvbmVUaGlyZEhlaWdodDsgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIGlmKG5vZGUueSA8IG9uZVRoaXJkSGVpZ2h0KSB7XHJcbiAgICAgICAgICBub2RlLnkgKz0gb25lVGhpcmRIZWlnaHQ7XHJcbiAgICAgICAgICB3aGlsZSAobm9kZS55IDwgb25lVGhpcmRIZWlnaHQpXHJcbiAgICAgICAgICAgICAgbm9kZS55ICs9IG9uZVRoaXJkSGVpZ2h0O1xyXG4gICAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljIGZpbmRNYXBwaW5nTm9kZXNGcm9tT3RoZXJTcXVhcmVzICh4OiBudW1iZXIsIHk6IG51bWJlciwgb25lVGhpcmRXaWR0aDogbnVtYmVyLCBvbmVUaGlyZEhlaWdodDogbnVtYmVyLFxyXG4gICAgICB0d29UaGlyZHNXaWR0aDogbnVtYmVyLCB0d29UaGlyZHNIZWlnaHQ6IG51bWJlcik6IEFycmF5PGFueT4ge1xyXG4gICAgICAvL2luaXRpYWxpc2UgbWFwcGluZyBhcnJheVxyXG4gICAgICBsZXQgbWFwcGluZ05vZGVzID0gbmV3IEFycmF5KCk7XHJcbiAgICBcclxuICAgICBcclxuICAgICAgaWYgKG1hcHBpbmdOb2RlcyAhPSBudWxsKSB7XHJcbiAgICAgICAgLy9jYWxjdWxhdGUgeCwgeSBwb3NpdGlvbiBvZiBub2RlcyBpbiB0aGUgNCBhZGphY2VudCBzcXVhcmVzXHJcbiAgICAgICAgLy9pbiB0aGUgb3JkZXIgb2YgW2xlZnQsIHVwLCByaWdodCwgYm90dG9tXVxyXG4gICAgICAgIG1hcHBpbmdOb2Rlcy5wdXNoKHtcclxuICAgICAgICAgIHg6IHggLSBvbmVUaGlyZFdpZHRoLFxyXG4gICAgICAgICAgeTogeSxcclxuICAgICAgICAgIGludGVyc2VjdGVkWDogb25lVGhpcmRXaWR0aCxcclxuICAgICAgICAgIGludGVyc2VjdGVkWTogMFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG1hcHBpbmdOb2Rlcy5wdXNoKHtcclxuICAgICAgICAgIHg6IHgsXHJcbiAgICAgICAgICB5OiB5IC0gb25lVGhpcmRIZWlnaHQsXHJcbiAgICAgICAgICBpbnRlcnNlY3RlZFg6IDAsXHJcbiAgICAgICAgICBpbnRlcnNlY3RlZFk6IG9uZVRoaXJkSGVpZ2h0XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbWFwcGluZ05vZGVzLnB1c2goe1xyXG4gICAgICAgICAgeDogeCArIG9uZVRoaXJkV2lkdGgsXHJcbiAgICAgICAgICB5OiB5LFxyXG4gICAgICAgICAgaW50ZXJzZWN0ZWRYOiB0d29UaGlyZHNXaWR0aCxcclxuICAgICAgICAgIGludGVyc2VjdGVkWTogMFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG1hcHBpbmdOb2Rlcy5wdXNoKHtcclxuICAgICAgICAgIHg6IHgsXHJcbiAgICAgICAgICB5OiB5ICsgb25lVGhpcmRIZWlnaHQsXHJcbiAgICAgICAgICBpbnRlcnNlY3RlZFg6IDAsXHJcbiAgICAgICAgICBpbnRlcnNlY3RlZFk6IHR3b1RoaXJkc0hlaWdodFxyXG4gICAgICAgIH0pO1xyXG4gICAgXHJcbiAgICAgICAgLy9jYWxjdWxhdGUgeCwgeSBwb3NpdGlvbiBvZiBub2RlcyBpbiB0aGUgNCBjb3JuZXIgc3F1YXJlc1xyXG4gICAgICAgIC8vaW4gdGhlIG9yZGVyIG9mIFt1cHBlci1sZWZ0LCB1cHBlci1yaWdodCwgYm90dG9tLXJpZ2h0IGJvdHRvbS1sZWZ0XVxyXG4gICAgICAgIG1hcHBpbmdOb2Rlcy5wdXNoKHtcclxuICAgICAgICAgIHg6IHggLSBvbmVUaGlyZFdpZHRoLFxyXG4gICAgICAgICAgeTogeSAtIG9uZVRoaXJkSGVpZ2h0LFxyXG4gICAgICAgICAgaW50ZXJzZWN0ZWRYOiBvbmVUaGlyZFdpZHRoLFxyXG4gICAgICAgICAgaW50ZXJzZWN0ZWRZOiBvbmVUaGlyZEhlaWdodFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG1hcHBpbmdOb2Rlcy5wdXNoKHtcclxuICAgICAgICAgIHg6IHggKyBvbmVUaGlyZFdpZHRoLFxyXG4gICAgICAgICAgeTogeSAtIG9uZVRoaXJkSGVpZ2h0LFxyXG4gICAgICAgICAgaW50ZXJzZWN0ZWRYOiB0d29UaGlyZHNXaWR0aCxcclxuICAgICAgICAgIGludGVyc2VjdGVkWTogb25lVGhpcmRIZWlnaHRcclxuICAgICAgICB9KTtcclxuICAgICAgICBtYXBwaW5nTm9kZXMucHVzaCh7XHJcbiAgICAgICAgICB4OiB4ICsgb25lVGhpcmRXaWR0aCxcclxuICAgICAgICAgIHk6IHkgKyBvbmVUaGlyZEhlaWdodCxcclxuICAgICAgICAgIGludGVyc2VjdGVkWDogdHdvVGhpcmRzV2lkdGgsXHJcbiAgICAgICAgICBpbnRlcnNlY3RlZFk6IHR3b1RoaXJkc0hlaWdodFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG1hcHBpbmdOb2Rlcy5wdXNoKHtcclxuICAgICAgICAgIHg6IHggLSBvbmVUaGlyZFdpZHRoLFxyXG4gICAgICAgICAgeTogeSArIG9uZVRoaXJkSGVpZ2h0LFxyXG4gICAgICAgICAgaW50ZXJzZWN0ZWRYOiBvbmVUaGlyZFdpZHRoLFxyXG4gICAgICAgICAgaW50ZXJzZWN0ZWRZOiB0d29UaGlyZHNIZWlnaHRcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbWFwcGluZ05vZGVzO1xyXG4gIH1cclxuICAgIFxyXG4gIHB1YmxpYyBzdGF0aWMgZmluZEV1Y2xpZGVhbkRpc3RhbmNlKHgxOiBudW1iZXIsIHkxOiBudW1iZXIsIHgyOiBudW1iZXIsIHkyOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyh4MS14MiwyKSArIE1hdGgucG93KHkxLXkyLDIpKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgZ2V0WUdpdmVuWEFuZFNyY01hcHBpbmdOb2RlcyAoeDE6IG51bWJlciwgeTE6IG51bWJlciwgeDI6IG51bWJlciwgeTI6IG51bWJlciwgeDogbnVtYmVyKSB7XHJcbiAgICBsZXQgeSA9IDA7XHJcbiAgICBpZih4MSA9PSB4MilcclxuICAgICAgeSA9ICh5MSt5MikvMjtcclxuICAgIGVsc2Uge1xyXG4gICAgICB5ID0gKHgyKnkxLXgqeTEteDEqeTIreCp5MikvKHgyLXgxKTtcclxuICAgIH1cclxuICAgIHJldHVybiB5O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXRpYyBnZXRYR2l2ZW5ZQW5kU3JjTWFwcGluZ05vZGVzICh4MTogbnVtYmVyLCB5MTogbnVtYmVyLCB4MjogbnVtYmVyLCB5MjogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgIGxldCB4ID0gMDtcclxuICAgIGlmKHkxID09IHkyKVxyXG4gICAgICB4ID0gKHgxK3gyKS8yO1xyXG4gICAgZWxzZSB7XHJcbiAgICAgIHggPSAoeDEqeTIteDIqeTEteDEqeSt4Mip5KS8oeTIteTEpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHg7XHJcbiAgfVxyXG59XHJcbiJdfQ==
