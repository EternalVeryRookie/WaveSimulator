import * as THREE from "./lib/three.module";

export default class VisSimulation {
    constructor(canvasRef) {
        this.__canvas = canvasRef.current;
        this.__WEBGL_lose_context = this.__canvas.getContext("webgl").getExtension('WEBGL_lose_context');
        
        this.render = this.render.bind(this);
        this.__restoreContext = this.__restoreContext.bind(this);
        this.__canvas.addEventListener("webglcontextrestored", this.render, false);
        this.__canvas.addEventListener("webglcontextlost", this.__restoreContext, false);
        
        this.init();
    }

    __restoreContext() {
        if (this.__canvas.getContext("webgl").isContextLost()) {
            this.__WEBGL_lose_context.restoreContext();
            //1回restoreを呼び出しただけでは復帰しない場合があるため、復帰するまで複数回呼び出す
            setInterval(this.__restoreContext, 10);
        }
    }

    initRenderer() {
        const height = this.__canvas.clientHeight;
        const width = this.__canvas.clientWidth;

        this.__renderer = new THREE.WebGLRenderer({canvas: this.__canvas});
        this.__renderer.setPixelRatio(window.devicePixelRatio);
        this.__renderer.setSize(width, height);
        this.__renderer.setClearColor(0xdddddd);
    }

    init() {
        this.initRenderer();
        const height = this.__canvas.clientHeight;
        const width = this.__canvas.clientWidth;

        /////////   カメラ初期化   /////////////
        this.camera = new THREE.PerspectiveCamera(45, width/height);
        this.camera.position.set(60,65,0);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));

        /////////  シーン初期化  //////////
        this.scene = new THREE.Scene();
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array([]), 3));

        this.mesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
        this.scene.add(this.mesh);
    }

    setRenderCanvasSize(width, height) {
        this.__renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    set camPos(pos) {
        this.camera.position.set(pos.x, pos.y, pos.z);
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
        this.__renderer.render(this.scene, this.camera);
    }
}