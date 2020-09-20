
function solveFirstStep(nowXYZ, velocity, dt, c, dx, dy) {
    const cSquare = c * c;
    const dtSquare = dt * dt;
    const dxSquare = dx * dx;
    const dySquare = dy * dy;

    const i = cSquare * (dtSquare / dxSquare) * (nowXYZ[1][2] + nowXYZ[1][0] - 2 * nowXYZ[1][1]);
    const j = cSquare * (dtSquare / dySquare) * (nowXYZ[2][1] + nowXYZ[0][1] - 2 * nowXYZ[1][1]);
    const k = nowXYZ[1][1] + velocity * dt;

    return i + j + k;
}

function getLocalHeights(points, x, y) {
    if (y == 0 ){
        return null;
    }else if (y == points.length-1){
        return null;
    }else if (x == 0){
        return null;
    }else if (x == points[y].length-1){
        return null;
    }

    const localHeights = [
                            [points[y-1][x-1], points[y-1][x], points[y-1][x+1]], 
                            [points[y][x-1]  , points[y][x]  , points[y][x+1]  ],
                            [points[y+1][x-1], points[y+1][x], points[y+1][x+1]]
                         ];
    
    return localHeights;
}

//初回更新と二回目以降の更新で微妙に式が異なるため処理を分ける。
//初回更新でもGPGPUを利用しても良いが、効果は薄いと思われるためCPU実装のまま。
export default function startSimulation(initPoints, initPointVelocities, c, dt, dx, dy) {
    const nextPoints = new Float32Array(initPoints.length * initPoints[0].length);
    for (let y = 0; y < initPoints.length; y++)
    for (let x = 0; x < initPoints[y].length; x++) {
        const localHeights = getLocalHeights(initPoints, x, y);
        const index = x + y * initPoints[y].length;
        
        if (localHeights === null) {
            // 境界なので現時刻の値をコピー
            nextPoints[index] = initPoints[y][x];
            continue;
        }

        nextPoints[index] = solveFirstStep(localHeights, initPointVelocities[y][x], dt, c, dx, dy);
    }

    return nextPoints;    
}