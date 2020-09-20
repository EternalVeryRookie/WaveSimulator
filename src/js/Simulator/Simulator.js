import WaveEquationSolverOnGPU from "./WaveEquationSolverOnGPU";

export default class Simulator {
    constructor(init) {
        this.__IsSimulationing = false;
        this.__InitPoints = init.map((value) => value.map((data) => data));
        this.__NowPoints = init.map((value) => value.map((data) => data));
        this.__Solver = new WaveEquationSolverOnGPU();
        this.__NextStep = null;

        this.start = this.start.bind(this);
        this.step = this.step.bind(this);
        this.stop = this.pause.bind(this);
        this.reset = this.reset.bind(this);
    }

    set InitPoints(points) {
        if (this.__IsSimulationing) return;

        this.__InitPoints = points;
    }

    get InitPoints() {
        return this.__InitPoints;
    }

    get IsSimulationing() {
        return this.__IsSimulationing;
    }

    get NowPoints() {
        return this.__NowPoints;
    }

    start(c, dt, dx, dy) {
        if (this.__IsSimulationing) return false;

        this.__IsSimulationing = true;
        const initVelocities = this.__InitPoints.map( (row) => row.map((height) => 0.5*height) );
        
        this.__NextStep = this.__Solver.start(this.__InitPoints, initVelocities, c, dt, dx, dy);;
        this.__NowPoints = this.__Solver.NowPoints;

        return true;
    }

    step() {
        if (!this.__IsSimulationing) return false;
        
        this.__NextStep = this.__NextStep();
        this.__NowPoints = this.__Solver.NowPoints;

        return true;
    }

    restart() {
        if (this.__NextStep === null || this.__IsSimulationing) return false;

        this.__IsSimulationing = true;
        this.__NextStep = this.__NextStep();
        this.__NowPoints = this.__Solver.NowPoints;
    
        return true;
    }

    pause() {
        this.__IsSimulationing = false;
    }

    reset() {
        if (this.__IsSimulationing) return false;

        this.__NowPoints = this.__InitPoints;
        this.__NextStep = null;

        return true;
    }
}