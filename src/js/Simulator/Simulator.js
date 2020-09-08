import WaveEquationSolverOnGPU from "./WaveEquationSolverOnGPU";

export default class Simulator {
    constructor(init) {
        this.__IsSimulationing = false;
        this.__InitPoints = init.map((value) => value.map((data) => data));
        this.__NowPoints = init.map((value) => value.map((data) => data));
        this.__Solver = new WaveEquationSolverOnGPU();

        this.Start = this.Start.bind(this);
        this.Step = this.Step.bind(this);
        this.Stop = this.Stop.bind(this);
        this.Reset = this.Reset.bind(this);
    }

    get InitPoints() {
        return this.__InitPoints;
    }

    set InitPoints(points) {
        if (this.__IsSimulationing) return;

        this.__InitPoints = points;
    }

    get IsSimulationing() {
        return this.__IsSimulationing;
    }

    get NowPoints() {
        return this.__NowPoints;
    }

    Start(c, dt, dx, dy) {
        if (this.__IsSimulationing) return false;

        this.__IsSimulationing = true;
        const initVelocities = this.__InitPoints.map( (row) => row.map((height) => -0.5*height) );
        
        this.__NextStep = this.__Solver.start(this.__InitPoints, initVelocities, c, dt, dx, dy);;
        this.__NowPoints = this.__Solver.NowPoints;
        return true;
    }

    Step() {
        if (!this.__IsSimulationing) return;
        
        this.__NextStep = this.__NextStep();
        this.__NowPoints = this.__Solver.NowPoints;
    }

    Stop() {
        this.__IsSimulationing = false;
    }

    Reset() {
        if (this.__IsSimulationing) return;
        this.__NowPoints = this.__InitPoints;
    }
}