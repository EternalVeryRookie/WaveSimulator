import WaveSimulator from "./WaveSimulator";

import React from "react";
import ReactDOM from "react-dom";


const app = document.getElementById("app");
ReactDOM.render(<WaveSimulator minXY={[-30.0, -30.0]} maxXY={[30.0, 30.0]} dx={0.5} dy={0.5}/>, app);