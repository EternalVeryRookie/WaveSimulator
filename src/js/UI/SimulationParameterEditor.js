import React from "react";
import style from "./SimulationParameterEditor.css";

export default function SimulationParameterEditor(props) {
    return (
        <table className="parameter-sliders">
            <tbody>
                { parameterSlider({disabled: props.disabled, paramName: "c",  value: props.c.value,  min: props.c.min,  max: props.c.max,  onChange: props.onChangeC }) }
                { parameterSlider({disabled: props.disabled, paramName: "dt", value: props.dt.value, min: props.dt.min, max: props.dt.max, onChange: props.onChangeDt}) }
                { parameterSlider({disabled: props.disabled, paramName: "dx", value: props.dx.value, min: props.dx.min, max: props.dx.max, onChange: props.onChangeDx}) }
                { parameterSlider({disabled: props.disabled, paramName: "dy", value: props.dy.value, min: props.dy.min, max: props.dy.max, onChange: props.onChangeDy}) }
            </tbody>
        </table>
    );
}

function parameterSlider(props) {
    return (
        <tr>
            <th className="parameter-name-label">{props.paramName}</th>
            <th className="parameter-sliders-th">
                <input disabled={props.disabled} type="range" value={props.value} className="parameter-slider" min={props.min} max={props.max} step="any" onChange={props.onChange}/>
            </th>
        </tr>
    );
}