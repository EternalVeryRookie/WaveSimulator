import React, {useState, useEffect} from "react";
import {AddableTab} from "./Tab";
import ParameterSlider from "./ParameterSlider";

import "./InitialConditionsEditor.css";

// カーネルの個数、分散、平均ベクトル（X, Y）、係数
export default function InitialConditionsEditor(props) {
    const tabContents = [...Array(props.initTabNum).keys()].map(i => 
        <EditGaussianParameterSliders key={i}/>
    );

    const createTabName = (i) => `Kernel ${i+1}`;
    const tabNames = [...Array(props.initTabNum).keys()].map(i => createTabName(i));

    return <AddableTab 
                selectCallback={(i) => console.log(i)} 
                defaultContent={EditGaussianParameterSliders} 
                newName={createTabName} 
                initSelectIndex={props.initSelectIndex} 
                contents={tabContents} 
                tabNames={tabNames}
            />
}

function EditGaussianParameterSliders(props) {
    return (
        <table className="init-condition-parameter-sliders">
            <tbody>
                <ParameterSlider paramName="π" initValue={1.0} min={1} max={100} callback={(value) => console.log(value)}/>
                <ParameterSlider paramName="σ" initValue={1.0}  min={0.00001} max={100} callback={(value) => console.log(value)}/>
                <ParameterSlider paramName="μ_x" initValue={1.0}  min={0.00001} max={100} callback={(value) => console.log(value)}/>
                <ParameterSlider paramName="μ_y" initValue={1.0}  min={0.00001} max={100} callback={(value) => console.log(value)}/>
            </tbody>
        </table>
    );
}