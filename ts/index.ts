window.onload = ()=>{
    let bCanvas = <HTMLCanvasElement> document.querySelector("#brush");
    let canvas = <HTMLCanvasElement> document.querySelector("#test");
    
    let root = document.querySelector(":root");
    let canvasH = parseInt(getComputedStyle(root).getPropertyValue("--project-height"));
    let canvasW = parseInt(getComputedStyle(root).getPropertyValue("--project-width"));
    let ctx = canvas.getContext("2d", {willReadFrequently:true});
    canvas.height = canvasH;
    canvas.width = canvasW;

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
    brushSize.value = "1";
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
window.onwheel = (e:WheelEvent)=>{
    let root = document.querySelector(":root");
    let zoom = JSON.parse(getComputedStyle(root).getPropertyValue("--project-zoom"));

    if(e.deltaY > 0){
        zoom--;
        if(zoom < 1) zoom = 1;
    }
    else{
        zoom++;
        if(zoom > 50) zoom = 50;
    }
    console.clear();
    console.log("Current Zoom: ",zoom);
    document.documentElement.style.setProperty("--project-zoom",zoom);
}






function updateBrush():void{
    let colorSelect = <HTMLInputElement> document.querySelector("#color-select");
    let brushSize = <HTMLInputElement> document.querySelector("#brush-size");
    let bCanvas = <HTMLCanvasElement> document.querySelector("#brush");
    let ctxb = bCanvas.getContext("2d", {willReadFrequently:true});
    let radius = parseInt(brushSize.value);

    bCanvas.height = radius;
    bCanvas.width = radius;
    
    ctxb.beginPath();
    ctxb.fillStyle = colorSelect.value;
    ctxb.arc(radius/2,radius/2,radius/2,0,2*Math.PI);
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