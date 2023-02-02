window.onload = ()=>{
    let bCanvas = <HTMLCanvasElement> document.querySelector("#brush");
    let canvas = <HTMLCanvasElement> document.querySelector("#test");
    
    let ctx = canvas.getContext("2d", {willReadFrequently:true});
    canvas.height = window.innerHeight - 70;
    canvas.width = window.innerWidth - 12;

    let eraser = <HTMLElement> document.querySelector(".eraser");
    eraser.dataset.active = "false";
    eraser.onclick = ()=>{
        let currValue = JSON.parse(eraser.dataset.active);
        if(currValue){
            eraser.style.backgroundColor = "rgb(200,0,0)";
            eraser.dataset.active = "false";
        }
        else{
            eraser.style.backgroundColor = "rgb(0,200,0)";
            eraser.dataset.active = "true";
        }
    }

    let colorSelect = <HTMLInputElement> document.querySelector("#color-select");
    let brushSize = <HTMLInputElement> document.querySelector("#brush-size");
    colorSelect.onchange = updateBrush;
    brushSize.oninput = updateBrush;
    colorSelect.value = "#000000";
    brushSize.value = "25";
    updateBrush();

    canvas.onmousedown = (e)=>{
        let eraser = <HTMLElement> document.querySelector(".eraser");
        let erase = JSON.parse(eraser.dataset.active);

        let startX = e.offsetX;
        let startY = e.offsetY;
        canvas.onmousemove = (e)=>{
            let endX = e.offsetX;
            let endY = e.offsetY;
            let coords = getLineCoords(startX, startY, endX, endY);
            for(let i = 0; i < coords.length; i++){
                ctx.beginPath();
                if(!erase) ctx.globalCompositeOperation = "source-over";
                else ctx.globalCompositeOperation = "destination-out";
                ctx.drawImage(
                    bCanvas, 
                    coords[i].x-Math.floor(bCanvas.width/2), 
                    coords[i].y-Math.floor(bCanvas.height/2)
                );
                ctx.closePath();
            }
            startX = endX;
            startY = endY;
        }
    }
    canvas.onmouseup = ()=>{
        canvas.onmousemove = null;
    }
}







function updateBrush():void{
    let colorSelect = <HTMLInputElement> document.querySelector("#color-select");
    let brushSize = <HTMLInputElement> document.querySelector("#brush-size");
    let bCanvas = <HTMLCanvasElement> document.querySelector("#brush");
    let ctxb = bCanvas.getContext("2d", {willReadFrequently:true});
    let radius = parseInt(brushSize.value);

    bCanvas.height = radius*2;
    bCanvas.width = radius*2;
    
    ctxb.beginPath();
    ctxb.fillStyle = colorSelect.value;
    ctxb.arc(radius,radius,radius,0,2*Math.PI);
    ctxb.fill();
    ctxb.closePath();

    let imgData = ctxb.getImageData(0,0,bCanvas.width,bCanvas.height);
    for(let i = 0; i < imgData.data.length; i+=4) if(imgData.data[i+3] > 0) imgData.data[i+3] = 255;
    ctxb.putImageData(imgData,0,0);
}






interface Coords {x:number, y:number};
function getLineCoords(startX:number, startY:number, endX:number, endY:number): Coords[] {
    let coords: Coords[] = [];
    if(endX === startX){
        if(endY > startY) for(let i = startY; i < endY; i++) coords.push({x:startX,y:i});
        else for(let i = startY; i > endY; i--) coords.push({x:startX,y:i});
    }
    else{
        let increment = -1;
        let a = (endY - startY) / (endX - startX);
        let b = (endX * startY - startX * endY) / (endX - startX);
        let loop = true, lastLoop = true, x = startX, lastY = startY;

        if(endX > startX) increment = 1;
        while(loop || lastLoop){
            let y = Math.floor(a * x + b);
            if(Math.abs(y - lastY) > 1){
                if(y > lastY) for(let i = lastY+1; i < y; i++) coords.push({x:x,y:i});
                else for(let i = lastY-1; i > y; i--) coords.push({x:x,y:i});
            }
            lastY = y;
            coords.push({x:x,y:y});
            x += increment;
            if(!loop) lastLoop = false;
            if(loop && x === endX) loop = false;
        }
    }
    return coords;
}