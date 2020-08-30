import * as THREE from "../lib/three.module";

export default function Sampling(func, minXY, maxXY, dx, dy) {
    const points = [];
    for (let y = minXY[1]; y <= maxXY[1]; y += dy) {
        const tmp = [];
        for (let x = minXY[0]; x <= maxXY[0]; x += dx) {
            tmp.push(func(new THREE.Vector2(x, y)));
        }
        points.push(tmp);
    }

    return points;
}