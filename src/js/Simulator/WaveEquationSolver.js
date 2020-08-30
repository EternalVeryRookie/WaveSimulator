
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
                         ]
    
    return localHeights;
}


function initShader(offscreenCtx) {
    const shader = offscreenCtx.createShader(offscreenCtx.COMPUTE_SHADER);
    const program = offscreenCtx.createProgram();

    offscreenCtx.shaderSource(shader, document.getElementById("compute-shader").textContent);
    offscreenCtx.compileShader(shader);

    if(!offscreenCtx.getShaderParameter(shader, offscreenCtx.COMPILE_STATUS)){
        alert(offscreenCtx.getShaderInfoLog(shader));
        throw new Error(offscreenCtx.getShaderInfoLog(shader));
    }

    offscreenCtx.attachShader(program, shader);
    offscreenCtx.linkProgram(program);

    if(!offscreenCtx.getProgramParameter(program, offscreenCtx.LINK_STATUS)){
        alert(offscreenCtx.getProgramInfoLog(program));
        throw new Error(offscreenCtx.getProgramInfoLog(program));
    }

    offscreenCtx.deleteShader(shader);
    //offscreenCtx.deleteProgram(program);

    return program;
}


function createShader(offscreenCtx, program, points, prePoints, c, dt, dx, dy, resoX, resoY) {
    offscreenCtx.useProgram(program);

    const pointsSSBO = offscreenCtx.createBuffer();

    offscreenCtx.bindBuffer(offscreenCtx.SHADER_STORAGE_BUFFER, pointsSSBO);
    offscreenCtx.bufferData(offscreenCtx.SHADER_STORAGE_BUFFER, points, offscreenCtx.STATIC_COPY);
    offscreenCtx.bindBuffer(offscreenCtx.SHADER_STORAGE_BUFFER, null);

    offscreenCtx.bindBufferBase(offscreenCtx.SHADER_STORAGE_BUFFER, 0, pointsSSBO);

    
    const prePointsSSBO = offscreenCtx.createBuffer();

    offscreenCtx.bindBuffer(offscreenCtx.SHADER_STORAGE_BUFFER, prePointsSSBO);
    offscreenCtx.bufferData(offscreenCtx.SHADER_STORAGE_BUFFER, prePoints, offscreenCtx.DYNAMIC_COPY);
    offscreenCtx.bindBuffer(offscreenCtx.SHADER_STORAGE_BUFFER, null);

    offscreenCtx.bindBufferBase(offscreenCtx.SHADER_STORAGE_BUFFER, 1, prePointsSSBO);


    const params = new Float32Array(4);
    params[0] = c;
    params[1] = dt;
    params[2] = dx;
    params[3] = dy;
    const paramsSSBO = offscreenCtx.createBuffer();

    offscreenCtx.bindBuffer(offscreenCtx.SHADER_STORAGE_BUFFER, paramsSSBO);
    offscreenCtx.bufferData(offscreenCtx.SHADER_STORAGE_BUFFER, params, offscreenCtx.STATIC_COPY);
    offscreenCtx.bindBuffer(offscreenCtx.SHADER_STORAGE_BUFFER, null);

    offscreenCtx.bindBufferBase(offscreenCtx.SHADER_STORAGE_BUFFER, 2, paramsSSBO);


    offscreenCtx.dispatchCompute(resoX, resoY, 1);

    
    const result = new Float32Array(prePoints.length);

    offscreenCtx.bindBuffer(offscreenCtx.SHADER_STORAGE_BUFFER, prePointsSSBO);
    offscreenCtx.getBufferSubData(offscreenCtx.SHADER_STORAGE_BUFFER, 0, result);
    offscreenCtx.bindBuffer(offscreenCtx.SHADER_STORAGE_BUFFER, null)

    return result;
}

function step(offscreen, program, points, prePoints, c, dt, dx, dy, resoX, resoY) {
    const result = createShader(offscreen, program, points, prePoints, c, dt, dx, dy, resoX, resoY);

    const nextStep = () => step(offscreen, program, result, points, c, dt, dx, dy, resoX, resoY);
    return {nextStep, result};
}

//ディリクレ条件  入力はスカラーの二次元配列を前提とする。
//初回更新と二回目以降の更新で微妙に式が異なるため処理を分ける。
//初回更新でもGPGPUを利用しても良いが、効果は薄いと思われるためCPU実装のまま。
export default function startSimulation(initPoints, initPointVelocities, c, dt, dx, dy) {
    const nextPoints = new Float32Array(initPoints.length * initPoints[0].length);
    for (let y = 0; y < initPoints.length; y++)
    for (let x = 0; x < initPoints[y].length; x++) {
        const localHeights = getLocalHeights(initPoints, x, y);
        const index = x + y * initPoints[y].length;
        
        if (localHeights === null) {
            // 境界なので現時刻の値をコピー（ディリクレ条件）
            nextPoints[index] = initPoints[y][x];
            continue;
        }

        nextPoints[index] = solveFirstStep(localHeights, initPointVelocities[y][x], dt, c, dx, dy);
    }

    const initPoints1D = initPoints.reduce( (pre, current) => { pre.push(...current); return pre; },[] );
    const inintPointsFloatArray = new Float32Array(initPoints1D);
    const offscreen = new OffscreenCanvas(1, 1).getContext("webgl2-compute");
    const program = initShader(offscreen)
    const nextStep = () => step(offscreen, program, nextPoints, inintPointsFloatArray, c, dt, dx, dy, initPoints[0].length, initPoints.length);
    return {nextStep, nextPoints};    
}