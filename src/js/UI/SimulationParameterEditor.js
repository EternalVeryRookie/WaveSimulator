import React, { useState } from "react";
import PropTypes from "prop-types";
import Parameter from "../lib/Parameter";

import "./SimulationParameterEditor.css";

export default function SliderTable(props) {
    return (
        <SimulationParameterEditor>
            <ParameterSlider disabled={props.disabled} paramName="c"  initValue={props.c.value}  min={props.c.min}  max={props.c.max}  callback={props.c.callback}/>
            <ParameterSlider disabled={props.disabled} paramName="dt" initValue={props.dt.value} min={props.dt.min} max={props.dt.max} callback={props.dt.callback}/>
            <ParameterSlider disabled={props.disabled} paramName="dx" initValue={props.dx.value} min={props.dx.min} max={props.dx.max} callback={props.dx.callback}/>
            <ParameterSlider disabled={props.disabled} paramName="dy" initValue={props.dy.value} min={props.dy.min} max={props.dy.max} callback={props.dy.callback}/>
        </SimulationParameterEditor>
    )
}

function SimulationParameterEditor(props) {
    return (
        <table className="parameter-sliders">
            <tbody>
                {props.children}
            </tbody>
        </table>
    );
}

function ParameterSlider(props) {
    const [value, setValue] = useState(props.initValue);
    const callback = (evt) => {
        setValue(evt.target.value);
        props.callback(evt.target.value);
    }

    return (
        <tr>
            <th className="parameter-name-label">{props.paramName}</th>
            <th className="parameter-sliders-th">
                <input disabled={props.disabled} type="range" value={value} className="parameter-slider" min={props.min} max={props.max} step="any" onChange={callback}/>
            </th>
        </tr>
    );
}

ParameterSlider.propTypes = {
    initValue: PropTypes.number,
    paramName: PropTypes.string,
    min      : PropTypes.number,
    max      : PropTypes.number,
    callback : PropTypes.func
}