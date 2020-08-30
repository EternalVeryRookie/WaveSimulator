import WaveSimulator from "./WaveSimulator";

import React from "react";
import ReactDOM from "react-dom";


const app = document.getElementById("app");
ReactDOM.render(<WaveSimulator minXY={[-10.0, -10.0]} maxXY={[10.0, 10.0]} dx={0.1} dy={0.1}/>, app);