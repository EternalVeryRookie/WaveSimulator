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

//keyと選択状態を表すインデックスは分ける
export function AddableTab(props) {
    const [selectIndex, setSelectIndex] = useState(props.initSelectIndex);
    const [contents, setContents] = useState(props.contents);
    const [tabNames, setTabNames] = useState(props.tabNames);
    const [keys, setKeys] = useState([...Array(contents.length).keys()]);

    const callback = (index) => {
        setSelectIndex(index);
        if (props.selectCallback)
            props.selectCallback(index);
    }

    const addCallback = () => {
        const genNewKey = () => {
            return [...Array(contents.length+1).keys()].reduce((previousValue, currentValue) => {
                if (previousValue >= 0) return previousValue;
                if (!keys.includes(currentValue)) 
                    return currentValue;
            }, -1);
        }

        const newKey = genNewKey();
        const newKeys = [...Array(keys.length + 1).keys()].map((value) => {
            if (value < keys.length) return keys[value];
            return newKey;
        });
        setKeys(newKeys);

        setSelectIndex(contents.length);
        const DefaultContent = props.defaultContent;
        const newContents = [...Array(contents.length+1).keys()].map(index => {
            if (index === contents.length) return <DefaultContent index={newKey}/>;
            return contents[index];
        });
        setContents(newContents);

        const newTabNames = [...Array(tabNames.length+1).keys()].map( index => {
            if (index===tabNames.length) return props.newName(tabNames);
            return tabNames[index];
        });
        setTabNames(newTabNames);

        if (props.addCallback) 
            props.addCallback();
    }

    const deleteCallback = () => {
        if (contents.length == 0) return;

        const newSelectIndex = selectIndex==contents.length-1 ? selectIndex-1 : selectIndex;
        const newContents = contents.reduce((previousValue, currentValue, currentIndex) => {
            if (currentIndex!==selectIndex)             
                previousValue.push(currentValue);

            return previousValue
        }, []);

        setContents(newContents);

        const newKeys = keys.reduce((previousValue, currentValue, currentIndex) => {
            if (currentIndex!==selectIndex)             
                previousValue.push(currentValue);

            return previousValue
        }, []);
        setKeys(newKeys);

        const newTabNames = tabNames.reduce((previousValue, currentValue, currentIndex) => {
            if (currentIndex!==selectIndex)             
                previousValue.push(currentValue);

            return previousValue
        }, []);        
        setTabNames(newTabNames);
        setSelectIndex(newSelectIndex);

        if (props.deleteCallback)
            props.deleteCallback(keys[selectIndex]);
    }
    
    return (
        <div className="tab">
            <div className="addable-header">
                <TabHeader selectIndex={selectIndex} names={tabNames} selectCallback={callback}/>
                <label className="add-header-btn" onClick={addCallback}>+</label>
            </div>
            <button className="delete-tab-content-btn" onClick={deleteCallback}>delete</button>
            { contents.map( (content, index) => (<div key={keys[index]} className="tab-content" isshow={(selectIndex===index).toString()}>{content}</div>)) }
        </div>
    );
}
