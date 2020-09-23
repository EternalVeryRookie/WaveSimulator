import * as THREE from "./lib/three.module";
import React, {useState, useEffect, useRef} from "react";


function Cavnas(props) {
    const [renderer, setRenderer] = useState(null);
    const ref = useRef(null);

    const adjustCanvasAspect = (renderer) => {
        if (!renderer) return;
        const setRenderCanvasSize = (width, height) => {
            renderer.setSize(width, height);
            props.setCameraAspect(width, height);
            setRenderer(renderer);
        };

        const canvas = ref.current;
        const frame = props.simulationFrameRef.current;
        const canvasSize = frame.clientWidth > frame.clientHeight ? frame.clientWidth : frame.clientHeight;
        canvas.width = canvas.height = canvasSize;
        setRenderCanvasSize(canvas.width, canvas.height);
    }
    window.addEventListener("resize", () => adjustCanvasAspect(renderer));

    const restoreContext = (WEBGL_lose_context) => {
        if (ref.current.getContext("webgl").isContextLost()) {
            WEBGL_lose_context.restoreContext();
            //1回restoreを呼び出しただけでは復帰しない場合があるため、復帰するまで複数回呼び出す
            setInterval(restoreContext, 10);
        }
    }

    const initRenderer = () => {
        const height = ref.current.clientHeight;
        const width = ref.current.clientWidth;

        const WEBGL_lose_context = ref.current.getContext("webgl").getExtension("WEBGL_lose_context");
        ref.current.addEventListener("webglcontextlost", () => restoreContext(WEBGL_lose_context), false);    
    
        const renderer = new THREE.WebGLRenderer({canvas: ref.current});
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);
        renderer.setClearColor(0xdddddd);
        ref.current.addEventListener("webglcontextrestored", () => setRenderer(renderer), false);
        adjustCanvasAspect(renderer);
    }

    useEffect(initRenderer, [setRenderer]); //canvasがマウントされた直後でのみ呼び出したい

    if (renderer) renderer.render(props.scene, props.camera);

    return <canvas id="main-canvas" ref={ref}/>
}



export default class SimulationScene {
    constructor(canvasContainerRef) {
        this.__canvasContainerRef = canvasContainerRef;

        this.init = this.init.bind(this);
        this.setVertices = this.setVertices.bind(this);
        this.setFaceIndex = this.setFaceIndex.bind(this);
        this.setCameraAspect = this.setCameraAspect.bind(this);
        this.render = this.render.bind(this);

        this.init();
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
        const face = [];
        for (let y = 0; y < resoY-1; y++)
        for (let x = 0; x < resoX-1; x++) {
            const index = x + y * resoX;
            face.push(index + 1);
            face.push(index);
            face.push(index + resoX);

            face.push(index + 1 + resoX);
            face.push(index + 1);
            face.push(index + resoX);
        }

        geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(face), 1));
    }    

    render() {
        return <Cavnas scene={this.scene} camera={this.camera} setCameraAspect={this.setCameraAspect} simulationFrameRef={this.__canvasContainerRef}/>
    }
}