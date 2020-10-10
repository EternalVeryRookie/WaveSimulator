import Gaussian2D from "./Gaussian";

export default function GaussianMixture(gaussianParams) {
    const not_null_params = gaussianParams.filter(value => value !== null);
    const pai_copy = not_null_params.map(param => param.coefficient);
    const u_copy = not_null_params.map(param => param.u.clone());
    const sigma_copy = not_null_params.map(param => param.sigma);

    return (x) => pai_copy.reduce( (prev, current, i) => prev + current*Gaussian2D(u_copy[i], sigma_copy[i])(x), 0);
}