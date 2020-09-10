import React from "react";

export default class UI extends React.Component {
    render() {
        return  (
            <div className="ui-frame">
                <button onClick={this.props.start}>start</button>
                <button onClick={this.props.stop}>stoo</button>
                <button onClick={this.props.reset}>reset</button>
            </div>
        )
    }
}