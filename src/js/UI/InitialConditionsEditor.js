import React from "react";

class InitialConditionsEditor extends React.Component {
    constructor(props) {

    }

    render() {
        return <input type="range" min="0" max="10000" step="any"/>
    }
}