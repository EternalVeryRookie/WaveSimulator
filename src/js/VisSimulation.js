import * as THREE from "./lib/three.module";
import React, {useEffect, useRef} from "react";


function createWebGLCanvasComponent() {
    const renderer = new THREE.WebGLRenderer();
    renderer.domElement.id = "main-canvas";

    return function(props) {
        const ref = useRef(null);

        //アスペクト比を維持しつつ親要素に合わせてcavnasをリサイズする
        const adjustCanvasAspect = () => {
            const canvas = renderer.domElement;
            const frame = props.simulationFrameRef.current;
            const canvasSize = frame.clientWidth > frame.clientHeight ? frame.clientWidth : frame.clientHeight;
            canvas.width = canvas.height = canvasSize;

            renderer.setSize(canvas.width, canvas.height);
            props.setCameraAspect(canvas.width, canvas.height);
            renderer.render(props.scene, props.camera);
        }
        window.addEventListener("resize", () => adjustCanvasAspect(renderer));

        const initRenderer = () => {
            /*
            const restoreContext = (WEBGL_lose_context) => {
                console.log("lost");
                if (renderer.getContext().isContextLost()) {
                    WEBGL_lose_context.restoreContext();
                    //1回restoreを呼び出しただけでは復帰しない場合があるため、復帰するまで複数回呼び出す
                    setInterval(restoreContext, 10);
                }
            }
            */
            //const WEBGL_lose_context = renderer.extensions.get("WEBGL_lose_context");
            //renderer.domElement.addEventListener("webglcontextlost", () => restoreContext(WEBGL_lose_context), false);
            ref.current.appendChild(renderer.domElement);

            const height = renderer.domElement.clientHeight;
            const width = renderer.domElement.clientWidth;

            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(width, height);
            renderer.setClearColor(0xdddddd);
            renderer.domElement.addEventListener("webglcontextrestored", () => renderer.render(props.scene, props.camera), false);
            adjustCanvasAspect(renderer);
        }
        useEffect(initRenderer, []);

        renderer.render(props.scene, props.camera);
        return <div ref={ref}></div>
    }
}


const WebGLCanvas = createWebGLCanvasComponent();


export default class SimulationScene {
    constructor(canvasContainerRef) {
        this.__canvasContainerRef = canvasContainerRef;
        this.bindFunctions();
        this.init();
    }

    bindFunctions() {
        this.init = this.init.bind(this);
        this.setVertices = this.setVertices.bind(this);
        this.setFaceIndex = this.setFaceIndex.bind(this);
        this.setCameraAspect = this.setCameraAspect.bind(this);
        this.render = this.render.bind(this);
    }

    init() {
        /////////   カメラ初期化   /////////////
        this.camera = new THREE.PerspectiveCamera(45);
        this.camera.position.set(60,65,0);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));

        /////////  シーン初期化  //////////
        this.scene = new THREE.Scene();
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array([]), 3));
        this.mesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
        this.scene.add(this.mesh);
    }

    //vertsは1次元配列
    setVertices(verts, resoX, resoY) {
        if (verts.length == 0) return;

        const oldVertsNum = this.mesh.geometry.attributes.position.itemSize * this.mesh.geometry.attributes.position.count;
        const isUpdateFaceIndex = (oldVertsNum != verts.length);

        if (isUpdateFaceIndex){
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute("position", new THREE.BufferAttribute(verts, 3));
            this.setFaceIndex(resoX, resoY, geometry);
            geometry.computeFaceNormals();  
            geometry.computeVertexNormals();
            this.mesh.geometry.dispose();
            this.mesh.geometry = geometry;
        }else {
            this.mesh.geometry.setAttribute("position", new THREE.BufferAttribute(verts, 3));
            this.mesh.geometry.computeFaceNormals();  
            this.mesh.geometry.computeVertexNormals();
        }
    }

    setCameraAspect(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    setFaceIndex(resoX, resoY, geometry) {
        const face = new Uint32Array( 6 * (resoX-1) * (resoY-1) );
        let i = 0;
        [...Array(resoY-1).keys()].forEach(y => 
            [...Array(resoX-1).keys()].forEach(x => {
                const index = x + y * resoX;
                face[i++] = index + 1;
                face[i++] = index;
                face[i++] = index + resoX;
    
                face[i++] = index + 1 + resoX;
                face[i++] = index + 1;
                face[i++] = index + resoX;
            })
        );

        geometry.setIndex(new THREE.BufferAttribute(face, 1));
    }    

    render() {
        return <WebGLCanvas scene={this.scene} camera={this.camera} setCameraAspect={this.setCameraAspect} simulationFrameRef={this.__canvasContainerRef}/>
    }
}