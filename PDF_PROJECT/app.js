


// function edit(pageno){
    // pdfjsLib.GlobalWorkerOptions.workerSrc =
    //         '//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.1.266/pdf.worker.js';
    // var loadingTask = pdfjsLib.getDocument(url);
    //     loadingTask.promise.then(function(pdf){
    //         pageno = pdf.pageNum;
    //     })


class Point{
    constructor(x,y){
    this.x = x;
    this.y = y;
    }
}

function getMouseCoordsOnCanvas(e,canvas){
    let rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    return new Point(x,y)
}


function calcHypotenuse(startPos, endPos){
        return Math.sqrt( Math.pow(endPos.x - startPos.x, 2) + Math.pow(endPos.y - startPos.y, 2));
    }

    function hexToRgba(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
          255
         ] : null;
      }

      function getPixel(context, x, y) {

        let imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
        if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height) {
          return [-1, -1, -1, -1];  // impossible color
        } else {
          const offset = (y * imageData.width + x) * 4;
          
          return [imageData.data[offset + 0],
                  imageData.data[offset + 1],
                  imageData.data[offset + 2],
                  imageData.data[offset + 3]
                ]
        }
      }
      
      function setPixel(context, x, y, color) {
        let imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);

        const offset = (y * imageData.width + x) * 4;
        imageData.data[offset + 0] = color[0];
        imageData.data[offset + 1] = color[1];
        imageData.data[offset + 2] = color[2];
        imageData.data[offset + 3] = color[0];

        context.putImageData(imageData, 0, 0);
      }
      
      function colorsMatch(a, b) {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
      }


// function relativePos(event, element) {
//   var rect = element.getBoundingClientRect();
//   return {x: Math.floor(event.clientX - rect.left),
//           y: Math.floor(event.clientY - rect.top)};
// }
    class Fill {
    constructor(canvas, mousexpos, mouseypos, color) {
        
        this.context = canvas.getContext('2d');
        this.context.lineCap = 'round';
        this.context.lineJoin = 'round';
      
        this.fillStack = [];

        // read the pixels in the canvas
        this.imageData = this.context.getImageData(0, 0, this.context.canvas.width, this.context.canvas.height);

        console.log(this.imageData);
        
        this.floodFill(mousexpos, mouseypos,hexToRgba(color));

        
    }

    getPixel(x, y) {
        
        if (x < 0 || y < 0 || x >= this.imageData.width || y >= this.imageData.height) {
            return [-1, -1, -1, -1];  // impossible color
        } else {
            
            const offset = (y * this.imageData.width + x) * 4;

            return [this.imageData.data[offset + 0],
            this.imageData.data[offset + 1],
            this.imageData.data[offset + 2],
            this.imageData.data[offset + 3]
            ]
        }
    }

    setPixel(x, y, color) {
        
        const offset = (y * this.imageData.width + x) * 4;
        this.imageData.data[offset + 0] = color[0];
        this.imageData.data[offset + 1] = color[1];
        this.imageData.data[offset + 2] = color[2];
        this.imageData.data[offset + 3] = color[3];

        
        
    }

    colorsMatch(a, b) {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
    }

    floodFill(x, y, fillColor) {
        // get the color we're filling
        const targetColor = this.getPixel(x, y);

        console.log(targetColor);
        console.log(fillColor);
       
        // check we are actually filling a different color
        if (!this.colorsMatch(targetColor, fillColor)) {
            //console.log(targetColor);
            //console.log(fillColor);

            console.log("In");

            
            this.fillPixel(x, y, targetColor, fillColor);
            this.fillCol();
            // put the data back
            
        }
    }

    fillPixel(x, y, targetColor, fillColor) {
        const currentColor = this.getPixel(x, y);
        if (this.colorsMatch(currentColor, targetColor)) {
            this.setPixel(x, y, fillColor);
            this.fillStack.push([x + 1, y, targetColor, fillColor]);
            this.fillStack.push([x - 1, y, targetColor, fillColor]);
            this.fillStack.push([x, y + 1, targetColor, fillColor]);
            this.fillStack.push([x, y - 1, targetColor, fillColor]);            
        }   
    }


    fillCol() {

        if (this.fillStack.length) {

            let range = this.fillStack.length;

            
            for (let i = 0; i < range; i++) {

                this.fillPixel(this.fillStack[i][0], this.fillStack[i][1], this.fillStack[i][2], this.fillStack[i][3]);

            }

            
            this.fillStack.splice(0, range);

            this.fillCol();
        }else{
            console.log(this.imageData);
            this.context.putImageData(this.imageData, 0, 0);
            this.fillStack = [];
        }
    }
}   

// **********************************************************************
class Paint{

    constructor(canvasId) {
        this.canvas = document.querySelector(canvasId);
        this.context = canvas.getContext('2d');
        this.context.lineCap = 'round';
        this.context.lineJoin = 'round';
        this.context.canvas.height  = (window.innerHeight);
        this.context.canvas.width = (window.innerWidth);
     //...drawing code...

        this.undoStack = [];
        this.undoLimit = 100;
    }

    set activeTool(tool){
        this.tool = tool;
        // console.log(this.tool);
    }

    set selectedColor(color) {
        this.color = color;
        this.context.fillStyle = this.color;
        this.context.strokeStyle = this.color;
    }

     set lineWidth(lineWidth) {
        this._lineWidth = lineWidth;

    }

    // To set brush stroke size
    set brushSize(brushSize) {
        this._brushSize = brushSize;
    }

    init() {
        
        this.canvas.onmousedown = (e) => this.onMouseDown(e);
    }

    onMouseDown(e){
        this.savedImage = this.context.getImageData(0, 0, this.context.canvas.width, this.context.canvas.height);
         if(this.undoStack.length >= this.undoLimit) this.undoStack.shift();
        this.undoStack.push(this.savedImage);
               
        this.canvas.onmousemove = (e) => this.onMouseMove(e);
        document.onmouseup = (e) => this.onMouseUp(e);
        this.startPos = getMouseCoordsOnCanvas(e,this.canvas);

        if (this.tool == 'pencil' || this.tool == 'brush') {
            this.context.beginPath();
            this.context.moveTo(this.startPos.x, this.startPos.y);
        }else if(this.tool == 'paint-bucket'){
            new Fill(this.canvas, Math.round(this.startPos.x), Math.round(this.startPos.y), this.color);
        }else if(this.tool== 'eraser'){
            this.context.clearRect(this.startPos.x,this.startPos.y,this._brushSize,this._brushSize)
            this.context.lineCap = 'round';
            this.context.lineJoin = 'round';
        }
    }

    onMouseMove(e){
        this.currentPos = getMouseCoordsOnCanvas(e,this.canvas);

        switch (this.tool) {
            case 'Line':
            case 'Rectangle':
            case 'circle':
            case 'triangle':
                this.drawShape();
                this.context.lineCap = "round"
                break;
            case 'pencil':
                this.drawFreeLine(this._lineWidth);
                this.context.lineCap = "round"
                break;
            case 'brush':
                this.drawFreeLine(this._brushSize);
                this.context.lineCap = "round"
                break;
            case 'eraser':
                this.context.clearRect(this.currentPos.x,this.currentPos.y,this._brushSize,this._brushSize);
                this.context.lineCap = "round"
                break;
            default:
                break;
        }
    }

    onMouseUp(e){
        this.canvas.onmousemove = null;
        document.onmouseup = null;
    }

    drawShape(e){
        this.context.putImageData(this.savedImage, 0, 0);
        this.context.lineCap = "round"
        this.context.beginPath();
        this.context.lineWidth = this._lineWidth;

        if ('Line' == this.tool) {

            this.context.moveTo(this.startPos.x, this.startPos.y);
            this.context.lineTo(this.currentPos.x, this.currentPos.y);
            this.context.lineCap = 'round';
            this.context.lineJoin = 'round';

        } else if ('Rectangle' == this.tool) {

            this.context.rect(this.startPos.x, this.startPos.y, this.currentPos.x - this.startPos.x, this.currentPos.y - this.startPos.y);
            this.context.lineCap = "round"

        } else if ('circle' == this.tool) {

            let distance = calcHypotenuse(this.startPos, this.currentPos);
            this.context.arc(this.startPos.x, this.startPos.y, distance, 0, 2 * Math.PI, false);
            this.context.lineCap = "round"

        } else if ('triangle' == this.tool) {

            this.context.moveTo(this.startPos.x + (this.currentPos.x - this.startPos.x) / 2, this.startPos.y);
            this.context.lineTo(this.startPos.x, this.currentPos.y);
            this.context.lineTo(this.currentPos.x, this.currentPos.y);
            this.context.lineCap = "round"
            this.context.closePath();

        }
        this.context.stroke();
    }

    drawFreeLine(lineWidth) {
        this.context.lineWidth = lineWidth;
        this.context.lineTo(this.currentPos.x, this.currentPos.y);
        this.context.lineCap = 'round';
        this.context.lineJoin = 'round';
        this.context.stroke();
    }

     undoPaint(){
        if(this.undoStack.length > 0){
            this.context.putImageData(this.undoStack[this.undoStack.length - 1], 0, 0);
            this.undoStack.pop();
        }else{
            alert("No undo available");
        }
    }
}

// for(var i=1;i<10;i++){
    var paint = new Paint("canvas");
// }
paint.activeTool = 'Line';
paint.lineWidth = '1';
paint.brushSize = '4';
paint.selectedColor = '#000000';
paint.init();

// document.querySelectorAll("[data-command").forEach(

//      item => {
//          item.addEventListener("click", e =>{
//              console.log(item.getAttribute("data-command"));
//          })
//      }

//  )

document.querySelectorAll("[data-command]").forEach(
    (el) => {
        el.addEventListener("click", (e) => {
            let command = el.getAttribute('data-command');
            
            if(command == 'undo'){
                paint.undoPaint();
            }else if(command == 'download'){
                document.getElementById("download").addEventListener("click",() =>{
                    
                    // for(var i=1;i<14;i++){
                    //     var canvas = this.document.getElementById("canvas"+i);
                    //     // canvas.addPage();
                    // }
                    var canvas = document.getElementById("canvas")
                    html2pdf().from(canvas).save();
                })
                // var canvas = document.getElementById("canvas");
                // var image = canvas.toDataURL("image/png", 1.0).replace("image/png", "image/octet-stream");
                // var link = document.createElement('a');
                // link.download = "my-image.png";
                // link.href = image;
                // link.click();
            }
        });
    }
);

    document.querySelectorAll("[data-tool]").forEach(
    (el) => {
        el.addEventListener("click", (e) => {
            document.querySelector("[data-tool].active").classList.toggle("active");
            el.classList.toggle("active");
            let selectedTool = el.getAttribute("data-tool");
            paint.activeTool = selectedTool;

            switch(selectedTool){
                case 'Line':
                case 'Rectangle':
                case 'circle':
                case 'triangle':
                case 'pencil':
                    document.querySelector(".group.for-shapes").style.display = "block";
                    document.querySelector(".group.for-brush").style.display = "none";
                    break;
                case 'brush':
                case 'eraser':
                    document.querySelector(".group.for-shapes").style.display = "none";
                    document.querySelector(".group.for-brush").style.display = "block";
                    break;
                default:
                    document.querySelector(".group.for-shapes").style.display = "none";
                    document.querySelector(".group.for-brush").style.display = "none";
            }

        });
    }
);

document.querySelectorAll("[data-line-width]").forEach(
    (el) => {
        el.addEventListener("click", (e) =>{
            document.querySelector("[data-line-width].active").classList.toggle("active");
            el.classList.toggle("active");

            paint.lineWidth = el.getAttribute("data-line-width");
        });
    }
);

document.querySelectorAll("[data-brush-size]").forEach(
    (el) => {
        el.addEventListener("click", (e) =>{
            document.querySelector("[data-brush-size].active").classList.toggle("active");
            el.classList.toggle("active");

            paint.brushSize = el.getAttribute("data-brush-size");
        });
    }
);

document.querySelectorAll("[data-color]").forEach(
    (el) => {
        el.addEventListener("click", (e) =>{
            document.querySelector("[data-color].active").classList.toggle("active");
            el.classList.toggle("active");

            paint.selectedColor = el.getAttribute("data-color");
        });
    }
);


// }