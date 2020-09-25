import React, {useState} from "react";

import "./Tab.css";

function TabHeader(props) {
    const selectCallback = (index) => {
        if (props.selectCallback)
            props.selectCallback(index);
    };

    return (
        <div className="tab-header">
            { props.names.map( (name, index) => {
                const checked = (index === props.selectIndex);
                return <label className="tab-header-content" key={index} isfocus={checked.toString()} onClick={ () => selectCallback(index) }>{name}</label>
            })}
        </div>
    );
}

function Tab(props) {
    const [selectIndex, setSelectIndex] = useState(props.initSelectIndex);
    
    const callback = (index) => {
        setSelectIndex(index);
        if (props.selectCallback)
            props.selectCallback(index);
    }

    return (
        <div className="tab">
            <TabHeader selectIndex={selectIndex} names={props.tabNames} selectCallback={callback}/>
            { props.contents.map( (content, index) => (<div key={index} className="tab-content" isshow={(selectIndex===index).toString()}>{content}</div>)) }
        </div>
    );
}

export function AddableTab(props) {
    const [selectIndex, setSelectIndex] = useState(props.initSelectIndex);
    const [contents, setContents] = useState(props.contents);
    const [tabNames, setTabNames] = useState(props.tabNames);

    const callback = (index) => {
        setSelectIndex(index);
        if (props.selectCallback)
            props.selectCallback(index);
    }

    const addCallback = () => {
        console.log("add");
        const DefaultContent = props.defaultContent;
        const newContents = [...Array(contents.length+1).keys()].map(index => {
            if (index === contents.length) return <DefaultContent/>;
            return contents[index];
        });
        setContents(newContents);

        const newTabNames = [...Array(tabNames.length+1).keys()].map( index => {
            if (index===tabNames.length) return props.newName(index);
            return tabNames[index];
        });
        setTabNames(newTabNames);

        if (props.addCallback) 
            props.addCallback();
    }
    

    return (
        <div className="tab">
            <div className="addable-header">
                <TabHeader selectIndex={selectIndex} names={tabNames} selectCallback={callback}/>
                <label className="add-header-btn" onClick={addCallback}>+</label>
            </div>
            { contents.map( (content, index) => (<div key={index} className="tab-content" isshow={(selectIndex===index).toString()}>{content}</div>)) }
        </div>
    );
}
