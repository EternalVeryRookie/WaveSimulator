import React, {useState} from "react";
import PropTypes from "prop-types";

import "./ParameterSlider.css";

const ParameterSlider = React.forwardRef( (props, ref) => {
    const [value, setValue] = useState(props.initValue);
    const callback = (evt) => {
        setValue(Number(evt.target.value));
        if (props.callback)
            props.callback(evt.target.value);
    }

    return (
        <tr>
            <th className="parameter-name-label">{props.paramName}</th>
            <th className="parameter-name-label">{value.toFixed(2)}</th>
            <th className="parameter-sliders-th">
                <input ref={ref} disabled={props.disabled} type="range" value={value} className="parameter-slider" min={props.min} max={props.max} step="any" onChange={callback}/>
            </th>
        </tr>
    );
} );

export default ParameterSlider;

ParameterSlider.propTypes = {
    initValue: PropTypes.number,
    paramName: PropTypes.string,
    min      : PropTypes.number,
    max      : PropTypes.number,
    callback : PropTypes.func
}