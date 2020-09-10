import * as THREE from "./lib/three.module";

export default class VisSimulation {
    constructor(canvasId) {
        this.init(canvasId);
    }

    init(canvasId) {
        const canvas = document.getElementById(canvasId);
        const height = canvas.clientHeight;
        const width = canvas.clientWidth;
        const canvasSize = height > width ? height : width;

        //////////  レンダラー初期化  ///////////
        this.__renderer = new THREE.WebGLRenderer({canvas: canvas});
        this.__renderer.setPixelRatio(window.devicePixelRatio);
        this.__renderer.setSize(canvasSize, canvasSize);
        this.__renderer.setClearColor(0xdddddd);

        /////////   カメラ初期化   /////////////
        this.camera = new THREE.PerspectiveCamera(45, 1);
        this.camera.position.set(60,65,0);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));

        /////////  シーン初期化  //////////
        this.scene = new THREE.Scene();
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array([]), 3));

        this.mesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
        this.scene.add(this.mesh);
    }

    set camPos(pos) {
        this.camera.position.set(pos.x, pos.y, pos.z);
    }

    setVertices(verts, resoX, resoY) {
        if (verts.length == 0) return;

        const geometry = this.mesh.geometry;
        const oldVertsNum = geometry.attributes.position.itemSize * geometry.attributes.position.count;
        const isUpdateFaceIndex = (oldVertsNum != verts.length);
        geometry.setAttribute("position", new THREE.BufferAttribute(verts, 3));
        
        if (isUpdateFaceIndex)
            this.setFaceIndex(resoX, resoY, geometry);
        
        geometry.computeFaceNormals();  
        geometry.computeVertexNormals();

        this.__renderer.render(this.scene, this.camera);
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

        geometry.index = new THREE.BufferAttribute(new Uint32Array(face), 1);
    }    

    render() {
        this.__renderer.render(this.scene, this.camera);
    }
}