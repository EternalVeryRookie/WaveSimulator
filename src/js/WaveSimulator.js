import SimulationController from "./UI/SimulationController";
import SimulationParameterEditor from "./UI/SimulationParameterEditor";
import Simulator from "./Simulator/Simulator";
import VisSimulation from "./VisSimulation"
import GaussianMixture from "./Functions/GaussianMixture";
import Sampling from "./Sampler/Sampler";
import Parameter from "./lib/Parameter";

import React from "react";
import * as THREE from "./lib/three.module";

import style from "./WaveSimulator.css";

export default class WaveSimulator extends React.Component {
    constructor(props) {
        super(props);
        const minXY = props.minXY;
        const maxXY = props.maxXY;
        const dx = new Parameter(0.5, 0.01, (maxXY[0] - minXY[0]) / 10);
        const dy = new Parameter(0.5, 0.01, (maxXY[0] - minXY[0]) / 10);
        const elapsedTime = 0;
        const isPause = false;
        const dt = new Parameter(0.01, 0.001, 0.1);
        const c = new Parameter(1.0, 0.00001, 30);
        this.state = {minXY, maxXY, c, dt, dx, dy, elapsedTime, isPause};
        this.__mainCanvasRef = React.createRef();
        this.__simulationFrameRef = React.createRef();
        this.__Simulator = new Simulator([[]]);
        this.__initSimulation();
        
        this.__bindFunctions();
    }

    ////////////////////  初期化系関数  ////////////////////////////

    // DOMがマウントされてから呼び出す必要がある。
    __initSimulation() {
        // 混合ガウス生成、サンプリング、Visualiserに点群をセット
        const pai = Array(5).fill(5.0);
        pai[3] = 7
        const sigma = Array(5).fill(1.0);
        sigma[4] = 6;
        sigma[3] = 15;
        sigma[2] = 5;
        sigma[1] = 10;

        const u = [ 
            new THREE.Vector2(0.0, 0.0),
            new THREE.Vector2(this.state.minXY[0]/2, this.state.minXY[1]/2),
            new THREE.Vector2(this.state.maxXY[0]/2, this.state.maxXY[1]/2),
            new THREE.Vector2(this.state.maxXY[0]/3, this.state.minXY[1]/4),
            new THREE.Vector2(this.state.maxXY[0]/3, -this.state.minXY[1]/6),
        ];
        
        const gaussianMix = GaussianMixture(pai, u, sigma);
        this.state.initCondition = gaussianMix;
        this.__setInitConditionPoints();
    }

    __initVisualiser() {
        this.__VisSimulation = new VisSimulation(this.__mainCanvasRef);
        this.__setInitConditionPoints();
    }

    __bindFunctions() {
        this.forwardTime = this.forwardTime.bind(this);
        this.handleStart = this.handleStart.bind(this);
        this.handlePause = this.handlePause.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.onChangeC = this.onChangeC.bind(this);
        this.onChangeDt = this.onChangeDt.bind(this);
        this.onChangeDx = this.onChangeDx.bind(this);
        this.onChangeDy = this.onChangeDy.bind(this);
        this.__adjustCanvasAspect = this.__adjustCanvasAspect.bind(this);
        this.__setInitConditionPoints = this.__setInitConditionPoints.bind(this);
        this.__updatePoints = this.__updatePoints.bind(this);
        this.__initVisualiser = this.__initVisualiser.bind(this);
    }
    //////////////////////////////////////////////////////////////

    __setInitConditionPoints() {
        //this.__VisSimulationにインスタンスをセットする前に呼んではいけない
        if (this.__Simulator !== undefined && this.__Simulator.IsSimulationing) return false;

        const points = Sampling(this.state.initCondition, this.state.minXY, this.state.maxXY, this.state.dx.value, this.state.dy.value);
        this.__resoX = points[0].length;
        this.__resoY = points.length;

        this.__Simulator.InitPoints = points;

        const pointsArray = new Float32Array(points.length * points[0].length * 3);
        for (let y = 0; y < this.__resoY; y++)
        for (let x = 0; x < this.__resoX; x++)
        {
            const idx = x * 3 + y * 3 * this.__resoX;
            pointsArray[0 + idx] = this.state.minXY[0] + this.state.dx.value*x;
            pointsArray[1 + idx] = points[y][x];
            pointsArray[2 + idx] = this.state.minXY[1] + this.state.dy.value*y;
        }

        if (this.__VisSimulation)   
            this.__VisSimulation.setVertices(pointsArray, this.__resoX, this.__resoY);
    }

    __adjustCanvasAspect(){
        const canvas = this.__mainCanvasRef.current;
        const frame = this.__simulationFrameRef.current;
        const canvasSize = frame.clientWidth > frame.clientHeight ? frame.clientWidth : frame.clientHeight;
        canvas.width = canvas.height = canvasSize;
        this.__VisSimulation.setRenderCanvasSize(canvas.width, canvas.height);
    }

    /////////////////////  ライフサイクルメソッド  /////////////////////////////
    componentDidMount() {
        this.__initVisualiser();
        this.__adjustCanvasAspect();
        window.addEventListener("resize", this.__adjustCanvasAspect);
        this.__VisSimulation.render();
    }

    ////////////////////////////////////////////////////////////////////////////

    __updatePoints() {
        const nowPoints = this.__Simulator.NowPoints;
        // シミュレーターは高さ情報しかもっていないため、レンダリング用にxy情報を生成する
        const vectors = new Float32Array(this.__resoY * this.__resoX * 3);
        for (let y = 0; y < this.__resoY; y++)
        for (let x = 0; x < this.__resoX; x++) {
            const index = x + y * this.__resoX;
            const vectorsIdx = x * 3 + y * 3 * this.__resoX;
            vectors[0 + vectorsIdx] = (this.state.minXY[0] + x*this.state.dx.value);
            vectors[1 + vectorsIdx] = (nowPoints[index]); //高さはy座標に相当することに注意（zではない）
            vectors[2 + vectorsIdx] = (this.state.minXY[1] + y*this.state.dy.value);
        }

        this.__VisSimulation.setVertices(vectors, this.__resoX, this.__resoY);
    }

    forwardTime() {
        if (!this.__Simulator.IsSimulationing) return;

        this.__Simulator.step();
        this.__updatePoints();
        this.setState({elapsedTime: this.state.elapsedTime+this.state.dt.value});

        requestAnimationFrame(this.forwardTime); 
    }

    ///////////////  イベントハンドラ  ////////////////////
    handleStart() {
        const isStarting = this.state.isPause ? this.__Simulator.restart() : this.__Simulator.start(this.state.c.value, this.state.dt.value, this.state.dx.value, this.state.dy.value);
        if (!isStarting) return;

        this.__updatePoints();
        this.setState({isPause: false, elapsedTime: this.state.elapsedTime+this.state.dt.value});

        requestAnimationFrame(this.forwardTime); 
    }

    handlePause() {
        this.__Simulator.pause();
        this.setState({isPause: true});
    }

    handleReset() {
        if (!this.__Simulator.reset()) return;

        this.setState({isPause: false, elapsedTime: 0});
        this.__setInitConditionPoints();
    }

    onChangeC(evt) {
        const c = this.state.c;
        c.value = Number(evt.target.value);
        this.setState({c: c});
    }

    onChangeDt(evt) {
        const dt = this.state.dt;
        dt.value = Number(evt.target.value);
        this.setState({dt: dt});
    }

    onChangeDx(evt) {
        const dx = this.state.dx;
        dx.value = Number(evt.target.value);
        this.setState({dx: dx});
        this.__setInitConditionPoints();
    }

    onChangeDy(evt) {
        const dy = this.state.dy;
        dy.value = Number(evt.target.value);
        this.setState({dy: dy});
        this.__setInitConditionPoints();
    }
    //////////////////////////////////////////////////////

    get isAcceptParamChange() {
        return this.state.isPause || this.__Simulator.IsSimulationing;
    }

    render() {
        if (this.__VisSimulation) {
            this.__VisSimulation.render();
        }

        return (
            <div className="main-frame" ref={this.__simulationFrameRef}>
                <p>{this.state.elapsedTime}</p>
                <div className="simulation-frame">
                    <canvas id="main-canvas" ref={this.__mainCanvasRef}/>
                    <SimulationController start={this.handleStart} pause={this.handlePause} reset={this.handleReset}/>
                    <SimulationParameterEditor 
                        dx={this.state.dx} 
                        dy={this.state.dy} 
                        dt={this.state.dt} 
                        c={this.state.c} 
                        onChangeC ={this.onChangeC}
                        onChangeDt={this.onChangeDt}
                        onChangeDx={this.onChangeDx}
                        onChangeDy={this.onChangeDy}
                        disabled={this.isAcceptParamChange}
                    />
                </div>

                <div className="init-condition-frame">

                </div>
            </div>
        )
    }
}