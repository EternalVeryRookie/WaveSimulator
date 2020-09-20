import React from "react";
import style from "./SimulationController.css";

export default class SimulationController extends React.Component {
    render() {
        return  (
            <div className="simulation-controller-frame">
                <button onClick={this.props.start}>start</button>
                <button onClick={this.props.pause}>pause</button>
                <button onClick={this.props.reset}>reset</button>
            </div>
        )
    }
}