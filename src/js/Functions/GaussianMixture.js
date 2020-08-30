import Gaussian2D from "./Gaussian";

export default function GaussianMixture(pai, u, sigma) {
    const pai_copy = pai.map(value => value);
    const u_copy = u.map(value => value.clone());
    const sigma_copy = sigma.map(value => value);

    return (x) => pai_copy.reduce( (prev, current, i) => prev + current*Gaussian2D(u_copy[i], sigma_copy[i])(x),0);
}