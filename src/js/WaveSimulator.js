import SimulationController from "./UI/SimulationController";
import SliderTable from "./UI/SimulationParameterEditor";
import InitialConditionsEditor from "./UI/InitialConditionsEditor";
import Simulator from "./Simulator/Simulator";
import SimulationScene from "./VisSimulation"
import GaussianMixture from "./Functions/GaussianMixture";
import GaussianParam from "./Functions/GaussianParam";
import Sampling from "./Sampler/Sampler";
import Parameter from "./lib/Parameter";
import setting from "./Resource/initParams.json";

import React from "react";
import * as THREE from "./lib/three.module";

import "./WaveSimulator.css";

const INIT_KERNEL_NUM = setting["kernelNum"];
const INIT_C = setting["c"];
const INIT_DT = setting["dt"];
const INIT_DX = setting["dx"];
const INIT_DY = setting["dy"];

//todo 初期パラメータをjsonファイルから読み込む。
export default class WaveSimulator extends React.Component {
    constructor(props) {
        super(props);
        this.__bindFunctions();
        const elapsedTime = 0;
        const isPause = false;
        const renderSwitch = true; //レンダリング発火用のフラグ
        this.state = {elapsedTime, isPause, renderSwitch};
        
        
        this.minXY = [setting["minX"], setting["minY"]];
        this.maxXY = [setting["maxX"], setting["maxY"]];
        this.__dx = new Parameter(INIT_DX, 0.01, (this.maxXY[0] - this.minXY[0]) / 10);
        this.__dx.callback = this.onChangeDx;
        this.__dy = new Parameter(INIT_DY, 0.01, (this.maxXY[0] - this.minXY[0]) / 10);
        this.__dy.callback = this.onChangeDy;
        this.__dt = new Parameter(INIT_DT, 0.001, 0.1);
        this.__dt.callback = this.onChangeDt;
        this.__c = new Parameter(INIT_C, 0.00001, 30);
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
        const param = [...Array(INIT_KERNEL_NUM).keys()].map(_ => new GaussianParam(1, new THREE.Vector2(0, 0), 5.0))
        
        param[4].sigma = 6;
        param[3].sigma = 15;
        param[2].sigma = 5;
        param[1].sigma = 10;
        
        param[0].u = new THREE.Vector2(this.minXY[0]/2, this.minXY[1]/2);
        param[1].u = new THREE.Vector2(this.maxXY[0]/2, this.maxXY[1]/2);
        param[2].u = new THREE.Vector2(this.maxXY[0]/3, this.minXY[1]/4);
        param[3].u = new THREE.Vector2(this.maxXY[0]/3, -this.minXY[1]/6);
        
        this.initConditionParam = param;
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
        this.setInitCondition_sigma = this.setInitCondition_sigma.bind(this);
        this.setInitCondition_u = this.setInitCondition_u.bind(this);
        this.setInitCondition_coefficient = this.setInitCondition_coefficient.bind(this);
        this.deleteGaussianKernel = this.deleteGaussianKernel.bind(this);
        this.addGaussianKernel = this.addGaussianKernel.bind(this);
    }
    //////////////////////////////////////////////////////////////

    setInitCondition_sigma(index, sigma) {
        if (this.initConditionParam.length <= index) return;

        this.initConditionParam[index].sigma = sigma;
        this.__setInitConditionPoints();
        this.setState({renderSwitch: !this.state.renderSwitch});
    }

    setInitCondition_u(index, u_x, u_y) {
        if (this.initConditionParam.length <= index) return;

        this.initConditionParam[index].u.x = u_x;
        this.initConditionParam[index].u.y = u_y;
        this.__setInitConditionPoints();
        this.setState({renderSwitch: !this.state.renderSwitch});
    }

    setInitCondition_coefficient(index, coefficient) {
        if (this.initConditionParam.length <= index) return;

        this.initConditionParam[index].coefficient = coefficient;
        this.__setInitConditionPoints();
        this.setState({renderSwitch: !this.state.renderSwitch});
    }

    deleteGaussianKernel(index) {
        if (this.initConditionParam.length <= index) {
            console.log(`warnning\nindex:${index}のカーネルを削除しようとしました。カーネルの個数は${this.initConditionParam.length}しかありません。`);
            return ;
        }

        this.initConditionParam[index] = null;
        this.__setInitConditionPoints();
        this.setState({renderSwitch: !this.state.renderSwitch});
    }
    
    addGaussianKernel() {
        const index = this.initConditionParam.indexOf(null);
        if (index >= 0)
            this.initConditionParam[index] = new GaussianParam(1, new THREE.Vector2(0, 0), 5);
        else
            this.initConditionParam.push(new GaussianParam(1, new THREE.Vector2(0, 0), 5));    

        this.__setInitConditionPoints();
        this.setState({renderSwitch: !this.state.renderSwitch});
    }

    __setInitConditionPoints() {
        if (this.__Simulator.IsSimulationing) return false;

        const points = Sampling(GaussianMixture(this.initConditionParam), this.minXY, this.maxXY, this.__dx.value, this.__dy.value);
        this.__resoX = points[0].length;
        this.__resoY = points.length;

        this.__Simulator.InitPoints = points;

        const pointsArray = new Float32Array(points.length * points[0].length * 3);

        [...Array(this.__resoY).keys()].forEach(y =>
            [...Array(this.__resoX).keys()].forEach(x => {
                const idx = x * 3 + y * 3 * this.__resoX;
                pointsArray[0 + idx] = this.minXY[0] + this.__dx.value*x;
                pointsArray[1 + idx] = points[y][x];
                pointsArray[2 + idx] = this.minXY[1] + this.__dy.value*y;
            })    
        );

        this.SimulationScene.setVertices(pointsArray, this.__resoX, this.__resoY);
        return true;
    }

    __updatePoints() {
        const nowPoints = this.__Simulator.NowPoints;
        // シミュレーターは高さ情報しかもっていないため、レンダリング用にxy情報を生成する
        //この処理もGPUでやれば高速化できるかも
        const vectors = new Float32Array(this.__resoY * this.__resoX * 3);

        [...Array(this.__resoY).keys()].forEach(y =>
            [...Array(this.__resoX).keys()].forEach(x => {
                const idx = x + y * this.__resoX;
                const vectorsIdx = x * 3 + y * 3 * this.__resoX;
                vectors[0 + vectorsIdx] = this.minXY[0] + this.__dx.value*x;
                vectors[1 + vectorsIdx] = nowPoints[idx]; //高さはy座標に相当することに注意（zではない）
                vectors[2 + vectorsIdx] = this.minXY[1] + this.__dy.value*y;
            })    
        );
        
        this.SimulationScene.setVertices(vectors, this.__resoX, this.__resoY);
        this.setState({renderSwitch: !this.state.renderSwitch});
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
        this.setState({renderSwitch: !this.state.renderSwitch});
    }

    onChangeDy(value) {
        this.__dy.value = Number(value);
        this.__setInitConditionPoints();
        this.setState({renderSwitch: !this.state.renderSwitch});
    }
    //////////////////////////////////////////////////////

    get isRejectParamChange() {
        return this.state.isPause || this.__Simulator.IsSimulationing;
    }

    render() {
        return (
            <div className="main-frame">
                <div className="simulation-frame" ref={this.__simulationSceneContainerRef}>
                    <p>{this.state.elapsedTime}</p>
                    {this.SimulationScene.render()}
                    <SimulationController start={this.handleStart} pause={this.handlePause} reset={this.handleReset}/>
                    <SliderTable disabled={this.isRejectParamChange} c={this.__c} dt={this.__dt} dx={this.__dx} dy={this.__dy}/>
                </div>

                <div className="edit-init-condition-frame">
                    <InitialConditionsEditor 
                        initSelectIndex={0} 
                        setSigma={this.setInitCondition_sigma}
                        setU={this.setInitCondition_u}
                        setCoefficient={this.setInitCondition_coefficient}
                        deleteKernel={this.deleteGaussianKernel}
                        addKernel={this.addGaussianKernel}
                        initConditionParam={this.initConditionParam}
                    />
                </div>
            </div>
        )
    }
}