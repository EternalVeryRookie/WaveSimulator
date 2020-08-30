function normSquare(p) {
    return p.x*p.x + p.y*p.y;
}

export default function Gaussian2D(u, sigma) {
    return (x) => {
        const vector =x.clone();
        vector.sub(u);
        return Math.exp(-normSquare(vector) / sigma)
    }
}