import SimulationController from "./UI/SimulationController";
import SliderTable from "./UI/SimulationParameterEditor";
import Simulator from "./Simulator/Simulator";
import SimulationScene from "./VisSimulation"
import GaussianMixture from "./Functions/GaussianMixture";
import Sampling from "./Sampler/Sampler";
import Parameter from "./lib/Parameter";

import React from "react";
import * as THREE from "./lib/three.module";

import style from "./WaveSimulator.css";

//To Do stateを末端のコンポーネントに移動する
export default class WaveSimulator extends React.Component {
    constructor(props) {
        super(props);
        this.__bindFunctions();
        
        const minXY = props.minXY;
        const maxXY = props.maxXY;
        const elapsedTime = 0;
        const isPause = false;
        this.state = {minXY, maxXY, elapsedTime, isPause};
        
        
        this.__dx = new Parameter(0.5, 0.01, (maxXY[0] - minXY[0]) / 10);
        this.__dx.callback = this.onChangeDx;
        this.__dy = new Parameter(0.5, 0.01, (maxXY[0] - minXY[0]) / 10);
        this.__dy.callback = this.onChangeDy;
        this.__dt = new Parameter(0.01, 0.001, 0.1);
        this.__dt.callback = this.onChangeDt;
        this.__c = new Parameter(1.0, 0.00001, 30);
        this.__c.callback = this.onChangeC;
        this.__mainCanvasRef = React.createRef();
        this.__simulationSceneContainerRef = React.createRef();
        this.__Simulator = new Simulator([[]]);
        this.SimulationScene = new SimulationScene(this.__simulationSceneContainerRef);
        
        this.__initSimulation();
    }

    ////////////////////  初期化系関数  ////////////////////////////

    __initSimulation() {
        // 混合ガウス生成、サンプリング
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

    __bindFunctions() {
        this.forwardTime = this.forwardTime.bind(this);
        this.handleStart = this.handleStart.bind(this);
        this.handlePause = this.handlePause.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.onChangeC = this.onChangeC.bind(this);
        this.onChangeDt = this.onChangeDt.bind(this);
        this.onChangeDx = this.onChangeDx.bind(this);
        this.onChangeDy = this.onChangeDy.bind(this);
        this.__setInitConditionPoints = this.__setInitConditionPoints.bind(this);
        this.__updatePoints = this.__updatePoints.bind(this);
    }
    //////////////////////////////////////////////////////////////

    __setInitConditionPoints() {
        if (this.__Simulator.IsSimulationing) return false;

        const points = Sampling(this.state.initCondition, this.state.minXY, this.state.maxXY, this.__dx.value, this.__dy.value);
        this.__resoX = points[0].length;
        this.__resoY = points.length;

        this.__Simulator.InitPoints = points;

        const pointsArray = new Float32Array(points.length * points[0].length * 3);

        [...Array(this.__resoY).keys()].forEach(y =>
            [...Array(this.__resoX).keys()].forEach(x => {
                const idx = x * 3 + y * 3 * this.__resoX;
                pointsArray[0 + idx] = this.state.minXY[0] + this.__dx.value*x;
                pointsArray[1 + idx] = points[y][x];
                pointsArray[2 + idx] = this.state.minXY[1] + this.__dy.value*y;
            })    
        );

        this.SimulationScene.setVertices(pointsArray, this.__resoX, this.__resoY);
    }

    __updatePoints() {
        const nowPoints = this.__Simulator.NowPoints;
        // シミュレーターは高さ情報しかもっていないため、レンダリング用にxy情報を生成する
        const vectors = new Float32Array(this.__resoY * this.__resoX * 3);

        [...Array(this.__resoY).keys()].forEach(y =>
            [...Array(this.__resoX).keys()].forEach(x => {
                const idx = x + y * this.__resoX;
                const vectorsIdx = x * 3 + y * 3 * this.__resoX;
                vectors[0 + vectorsIdx] = this.state.minXY[0] + this.__dx.value*x;
                vectors[1 + vectorsIdx] = nowPoints[idx]; //高さはy座標に相当することに注意（zではない）
                vectors[2 + vectorsIdx] = this.state.minXY[1] + this.__dy.value*y;
            })    
        );
        
        this.SimulationScene.setVertices(vectors, this.__resoX, this.__resoY);
    }

    forwardTime() {
        if (!this.__Simulator.IsSimulationing) return;

        this.__Simulator.step();
        this.__updatePoints();
        this.setState({elapsedTime: this.state.elapsedTime+this.__dt.value});

        requestAnimationFrame(this.forwardTime); 
    }

    ///////////////  イベントハンドラ  ////////////////////
    handleStart() {
        const isStarting = this.state.isPause ? this.__Simulator.restart() : this.__Simulator.start(this.__c.value, this.__dt.value, this.__dx.value, this.__dy.value);
        if (!isStarting) return;

        this.__updatePoints();
        this.setState({isPause: false, elapsedTime: this.state.elapsedTime+this.__dt.value});

        requestAnimationFrame(this.forwardTime); 
    }

    handlePause() {
        if (!this.__Simulator.IsSimulationing) return;
        
        this.__Simulator.pause();
        this.setState({isPause: true});
    }

    handleReset() {
        if (!this.__Simulator.reset()) return;

        this.setState({isPause: false, elapsedTime: 0});
        this.__setInitConditionPoints();
    }

    onChangeC(value) {
        this.__c.value = Number(value);
    }

    onChangeDt(value) {
        this.__dt.value = Number(value);
    }

    onChangeDx(value) {
        this.__dx.value = Number(value);
        this.__setInitConditionPoints();
    }

    onChangeDy(value) {
        this.__dy.value = Number(value);
        this.__setInitConditionPoints();
    }
    //////////////////////////////////////////////////////

    get isRejectParamChange() {
        return this.state.isPause || this.__Simulator.IsSimulationing;
    }

    render() {
        return (
            <div className="main-frame" ref={this.__simulationSceneContainerRef}>
                <p>{this.state.elapsedTime}</p>
                <div className="simulation-frame">
                    {this.SimulationScene.render()}
                    <SimulationController start={this.handleStart} pause={this.handlePause} reset={this.handleReset}/>
                    <SliderTable disabled={this.isRejectParamChange} c={this.__c} dt={this.__dt} dx={this.__dx} dy={this.__dy}/>
                </div>

                <div className="edit-init-condition-frame">
                </div>
            </div>
        )
    }
}