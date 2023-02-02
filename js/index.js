window.onload = () => {
    let canvas = document.querySelector("#test");
    let ctx = canvas.getContext("2d", { willReadFrequently: true });
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    canvas.onmousedown = (e) => {
        let startX = e.clientX;
        let startY = e.clientY;
        canvas.onmousemove = (e) => {
            let endX = e.clientX;
            let endY = e.clientY;
            let coords = getLineCoords(startX, startY, endX, endY);
            for (let i = 0; i < coords.length; i++) {
                ctx.beginPath();
                ctx.fillRect(coords[i].x, coords[i].y, 1, 1);
                ctx.closePath();
            }
            startX = endX;
            startY = endY;
        };
    };
    canvas.onmouseup = () => {
        canvas.onmousemove = null;
    };
};
;
function getLineCoords(startX, startY, endX, endY) {
    let coords = [];
    if (endX === startX) {
        if (endY > startY)
            for (let i = startY; i < endY; i++)
                coords.push({ x: startX, y: i });
        else
            for (let i = startY; i > endY; i--)
                coords.push({ x: startX, y: i });
    }
    else {
        let increment = -1;
        let a = (endY - startY) / (endX - startX);
        let b = (endX * startY - startX * endY) / (endX - startX);
        let loop = true, lastLoop = true, x = startX, lastY = startY;
        if (endX > startX)
            increment = 1;
        while (loop || lastLoop) {
            let y = Math.floor(a * x + b);
            if (Math.abs(y - lastY) > 1) {
                if (y > lastY)
                    for (let i = lastY + 1; i < y; i++)
                        coords.push({ x: x, y: i });
                else
                    for (let i = lastY - 1; i > y; i--)
                        coords.push({ x: x, y: i });
            }
            lastY = y;
            coords.push({ x: x, y: y });
            x += increment;
            if (!loop)
                lastLoop = false;
            if (loop && x === endX)
                loop = false;
        }
    }
    return coords;
}
