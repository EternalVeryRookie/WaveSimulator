import ComputeShader from "../lib/ComputeShader";
import ShaderSource from "./WaveEquationSolverOnGPU.compute"
import startSimulation from "./WaveEquationSolver";

export default class WaveEquationSolverOnGPU {
    constructor() {
        this.__ComputeShader = new ComputeShader(ShaderSource);
        this.__ComputeShader.createBuffer("points", 0);
        this.__ComputeShader.createBuffer("prePoints", 1);
        this.__ComputeShader.createBuffer("params", 2);

        this.setParams = this.__setParams.bind(this);
        this.__setPoints = this.__setPoints.bind(this);
        this.start = this.start.bind(this);
        this.__step = this.__step.bind(this);
    }

    __setParams(c, dt, dx, dy) {
        const params = new Float32Array(4);
        params[0] = c;
        params[1] = dt;
        params[2] = dx;
        params[3] = dy;

        this.__ComputeShader.sendDataToGPU(params, this.__ComputeShader.OffscreenCtx.STATIC_COPY, "params");
    }

    __setPoints(points, prePoints) {
        this.__NowPoints = points;
        this.__PrePoints = prePoints;

        this.__ComputeShader.sendDataToGPU(points, this.__ComputeShader.OffscreenCtx.STATIC_COPY, "points");
        this.__ComputeShader.sendDataToGPU(prePoints, this.__ComputeShader.OffscreenCtx.DYNAMIC_COPY, "prePoints");
        this.__PointsLength = points.length;
    }

    //initPointsとinitPointVelocitiesは二次元配列
    start(initPoints, initPointVelocities, c, dt, dx, dy) {
        this.__setParams(c, dt, dx, dy);
        const nextPoints = startSimulation(initPoints, initPointVelocities, c, dt, dx, dy);
        const initPoints1D = initPoints.reduce( (pre, current) => { pre.push(...current); return pre; },[] );
        const initPointsFloatArray = new Float32Array(initPoints1D);
        this.__setPoints(nextPoints, initPointsFloatArray);

        return () => this.__step(initPoints[0].length, initPoints.length);
    }

    __step(resoX, resoY) {
        this.__ComputeShader.dispatch(resoX-2, resoY-2, 1);

        const result = new Float32Array(this.__PointsLength);
        this.__ComputeShader.readDataFromGPU(result, "prePoints");
        
        this.__PrePoints = this.__NowPoints;
        this.__NowPoints = result;
        this.__ComputeShader.sendDataToGPU(this.__NowPoints, this.__ComputeShader.OffscreenCtx.STATIC_COPY, "points");
        this.__ComputeShader.sendDataToGPU(this.__PrePoints, this.__ComputeShader.OffscreenCtx.DYNAMIC_COPY, "prePoints");
        
        return () => this.__step(resoX, resoY);
    }

    get NowPoints() {
        return this.__NowPoints;
    }
}