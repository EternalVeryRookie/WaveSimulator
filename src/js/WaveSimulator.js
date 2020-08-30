import UI from "./UI/UI";
import Simulator from "./Simulator/Simulator";
import VisSimulation from "./VisSimulation"
import GaussianMixture from "./Functions/GaussianMixture";
import Sampling from "./Sampler/Sampler";

import React from "react";
import * as THREE from "./lib/three.module";


export default class WaveSimulator extends React.Component {
    constructor(props) {
        super(props);
        const minXY = props.minXY;
        const maxXY = props.maxXY;
        const dx = props.dx, dy = props.dy;
        const kernelNum = 4;
        const elapsedTime = 0;
        this.state = {minXY, maxXY, dx, dy, kernelNum, elapsedTime};
        this.__dt = 0.05;
        
        this.__bindFunctions();
    }

    ////////////////////  初期化系関数  ////////////////////////////

    // DOMがマウントされてから呼び出す必要がある。constructorの中で呼び出すのはおそらくNG。
    __initSimulation() {
        
        // 混合ガウス生成、サンプリング、Visualiserに点群をセット
        const pai = Array(this.state.kernelNum).fill(5.0);
        pai[3] = 7
        const sigma = Array(this.state.kernelNum).fill(1.0);
        sigma[3] = 15;
        sigma[2] = 5;
        sigma[1] = 10;
        //const u = Array(this.state.kernelNum).fill(new THREE.Vector2(0.0, 0.0));
        const u = [ 
            new THREE.Vector2(0.0, 0.0),
            new THREE.Vector2(this.state.minXY[0]/2, this.state.minXY[1]/2),
            new THREE.Vector2(this.state.maxXY[0]/2, this.state.maxXY[1]/2),
            new THREE.Vector2(this.state.maxXY[0]/3, this.state.minXY[1]/2),
        ];
        
        const gaussianMix = GaussianMixture(pai, u, sigma);
        
        const points = Sampling(gaussianMix, this.state.minXY, this.state.maxXY, this.state.dx, this.state.dy);
        this.__resoX = points[0].length;
        this.__resoY = points.length;

        this.__Simulator = new Simulator(points);

        this.__VisSimulation = new VisSimulation("main-canvas");

        const pointsArray = new Float32Array(points.length * points[0].length * 3);
        for (let y = 0; y < this.__resoY; y++)
        for (let x = 0; x < this.__resoX; x++)
        {
            const idx = x * 3 + y * 3 * this.__resoX;
            pointsArray[0 + idx] = this.state.minXY[0] + this.state.dx*x;
            pointsArray[1 + idx] = points[y][x];
            pointsArray[2 + idx] = this.state.minXY[1] + this.state.dy*y;
        }

        this.__VisSimulation.setVertices(pointsArray, this.__resoX, this.__resoY);
    }

    __bindFunctions() {
        this.forwardTime = this.forwardTime.bind(this);
        this.handleStartSimulation = this.handleStartSimulation.bind(this);
        this.handleStopSimulation = this.handleStopSimulation.bind(this);
        this.handleResetSimulation = this.handleResetSimulation.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
    }
    //////////////////////////////////////////////////////////////

    /////////////////////  ライフサイクルメソッド  /////////////////////////////
    componentDidMount() {
        this.__initSimulation();
        this.__VisSimulation.render();
    }
    ////////////////////////////////////////////////////////////////////////////

    forwardTime() {
        this.__Simulator.Step();
        const nowPoints = this.__Simulator.NowPoints;
        const vectors = new Float32Array(this.__resoY * this.__resoX * 3);
        for (let y = 0; y < this.__resoY; y++)
        for (let x = 0; x < this.__resoX; x++) {
            const index = x + y * this.__resoX;
            const vectorsIdx = x * 3 + y * 3 * this.__resoX;
            vectors[0 + vectorsIdx] = (this.state.minXY[0] + x*this.state.dx);
            vectors[1 + vectorsIdx] = (nowPoints[index]);
            vectors[2 + vectorsIdx] = (this.state.minXY[1] + y*this.state.dy);
        }

        this.__VisSimulation.setVertices(vectors, this.__resoX, this.__resoY)
        
        requestAnimationFrame( () => this.forwardTime() ); 
    }

    ///////////////  イベントハンドラ  ////////////////////
    handleStartSimulation() {
        const isStarting = this.__Simulator.Start(1.0, this.__dt, this.state.dx, this.state.dy);
        if (!isStarting) return;

        const nowPoints = this.__Simulator.NowPoints;
        // シミュレーターは高さ情報しかもっていないため、レンダリング用にxy情報を生成する
        const vectors = new Float32Array(this.__resoY * this.__resoX * 3);
        for (let y = 0; y < this.__resoY; y++)
        for (let x = 0; x < this.__resoX; x++) {
            const index = x + y * this.__resoX;
            const vectorsIdx = x * 3 + y * 3 * this.__resoX;
            vectors[0 + vectorsIdx] = (this.state.minXY[0] + x*this.state.dx);
            vectors[1 + vectorsIdx] = (nowPoints[index]); //高さはy座標に相当することに注意（zではない）
            vectors[2 + vectorsIdx] = (this.state.minXY[1] + y*this.state.dy);
        }

        this.__VisSimulation.setVertices(vectors, this.__resoX, this.__resoY)
        
        requestAnimationFrame( () => this.forwardTime() ); 
    }

    handleStopSimulation() {
        this.__Simulator.Stop();
    }

    handleResetSimulation() {
        this.__Simulator.Reset();
    }
    //////////////////////////////////////////////////////

    render() {
        if (this.__VisSimulation)
            this.__VisSimulation.render();

        return (
            <React.Fragment>
                <canvas id="main-canvas"/>
                <UI startSimulation={this.handleStartSimulation} stopSimulation={this.stopSimulation} resetSimulation={this.resetSimulation}/>
            </React.Fragment>
        )
    }
}