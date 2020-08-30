//nowXYZ[1][1]が現在時刻での注目している点の高さ
function solve(nowXYZ, preZ, dt, c, dx, dy) {
    const cSquare = c * c;
    const dtSquare = dt * dt;
    const dxSquare = dx * dx;
    const dySquare = dy * dy;

    const i = cSquare * (dtSquare / dxSquare) * (nowXYZ[1*3 + 2] + nowXYZ[1*3 + 0] - 2 * nowXYZ[1*3 + 1]);
    const j = cSquare * (dtSquare / dySquare) * (nowXYZ[2*3 + 1] + nowXYZ[0*3 + 1] - 2 * nowXYZ[1*3 + 1]);
    const k = 2 * nowXYZ[1*3 + 1] - preZ;

    return i + j + k;
}

function step(targetCoord, dt, c, dx, dy) {
    return targetCoord.map((coord) => {
            const x = coord.x;
            const y = coord.y;
            const nowHeight = coord.nowHeight;
            const preHeight = coord.preHeight;
            const localHeights = coord.localHeights;

            if (localHeights.length === 0) 
                return {
                    x: x,
                    y: y,
                    height: nowHeight
                }

            return {
                x: x,
                y: y,
                height: solve(localHeights, preHeight, dt, c, dx, dy)
            };
        });
}

self.addEventListener("message", function(message) {
    const dx = message.data.dx;
    const dy = message.data.dy;
    const dt = message.data.dt;
    const c = message.data.c;
    const target = message.data.target;
    
    const newHeights = step(target, dt, c, dx, dy);
    self.postMessage(newHeights);
});