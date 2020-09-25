import React, {useState} from "react";
import PropTypes from "prop-types";

import "./ParameterSlider.css";


export default function ParameterSlider(props) {
    const [value, setValue] = useState(props.initValue);
    const callback = (evt) => {
        setValue(evt.target.value);
        if (props.callback)
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