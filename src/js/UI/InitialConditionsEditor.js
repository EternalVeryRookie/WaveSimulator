import React, {useState, useEffect, useRef} from "react";
import PropTypes from "prop-types";
import {AddableTab} from "./Tab";
import ParameterSlider from "./ParameterSlider";

import "./InitialConditionsEditor.css";

// カーネルの個数、分散、平均ベクトル（X, Y）、係数
export default function InitialConditionsEditor(props) {
    const createTabName = (currentTabNames) => {
        let name = `Kernel ${currentTabNames.length+1}`;
        let i = 1;
        while (currentTabNames.includes(name)) {
            name = `Kernel ${currentTabNames.length+1}(${i++})`
        }
        return name;
    }
    const tabNames = [...Array(props.initConditionParam.length).keys()].map(i => `Kernel ${i+1}`);
    const TabContent = p => 
        <EditGaussianParameterSliders  
            sigma={p.param!==undefined ? p.param.sigma : 5}
            u_x={p.param!==undefined ? p.param.u.x : 0}
            u_y={p.param!==undefined ? p.param.u.y: 0}
            coefficient={p.param!==undefined ? p.param.coefficient : 5}
            setSigma={(sigma) =>  props.setSigma(p.index, sigma)}
            setU={(u_x, u_y) =>  props.setU(p.index, u_x, u_y)}
            setCoefficient={(coeficieent) => props.setCoefficient(p.index, coeficieent)}
        />

    const tabContents = [...Array(props.initConditionParam.length).keys()].map(i => 
        <TabContent index={i} param={props.initConditionParam[i]}/>
    );

    return <AddableTab 
                selectCallback={(i) => console.log(i)} 
                defaultContent={TabContent} 
                newName={createTabName} 
                initSelectIndex={props.initSelectIndex} 
                contents={tabContents} 
                tabNames={tabNames}
                deleteCallback={props.deleteKernel}
                addCallback={props.addKernel}
            />
}

InitialConditionsEditor.propTypes = {
    initTabNum: PropTypes.number,
    initSelectIndex: PropTypes.number
}

function EditGaussianParameterSliders(props) {
    const u_xRef = useRef(null);
    const u_yRef = useRef(null);

    return (
        <table className="init-condition-parameter-sliders">
            <tbody>
                <ParameterSlider paramName="π" initValue={props.coefficient} min={1} max={100} callback={props.setCoefficient}/>
                <ParameterSlider paramName="σ" initValue={props.sigma}  min={0.00001} max={100} callback={props.setSigma}/>
                <ParameterSlider ref={u_xRef} paramName="μ_x" initValue={props.u_x}  min={-30} max={30} callback={(u_x) => props.setU(u_x, Number(u_yRef.current.value))}/>
                <ParameterSlider ref={u_yRef} paramName="μ_y" initValue={props.u_y}  min={-30} max={30} callback={(u_y) => props.setU(Number(u_xRef.current.value), u_y)}/>
            </tbody>
        </table>
    );
}