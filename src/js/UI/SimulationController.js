import React from "react";
import "./SimulationController.css";

export default class SimulationController extends React.Component {
    render() {
        return  (
            <div className="simulation-controller-frame">
                <button className="control-button" onClick={this.props.start}>start</button>
                <button className="control-button" onClick={this.props.pause}>pause</button>
                <button className="control-button" onClick={this.props.reset}>reset</button>
            </div>
        )
    }
}