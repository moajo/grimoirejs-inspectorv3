import * as React from "react";
import ReactDOM from 'react-dom';
import styl from "./Test.styl";
console.log(styl);
const options = [
    { value: 'one', label: 'One' },
    { value: 'two', label: 'Two' },
    {
        type: 'group', name: 'group1', items: [
            { value: 'three', label: 'Three' },
            { value: 'four', label: 'Four' }
        ]
    },
    {
        type: 'group', name: 'group2', items: [
            { value: 'five', label: 'Five' },
            { value: 'six', label: 'Six' }
        ]
    }
]

export class Header extends React.Component<any, any> {
    render() {
        return (
            <header className="panel panel-success" >
                <div className="container">
                    <div className="row panel-body well">
                        <div className="title col-lg-2">
                            <img src="small-logo.png" width="64" height="64" />
                            <p>Grimoire.js</p>
                        </div>
                        <div className="btn-group col-lg-10">
                            <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                デフォルト <span className="caret"></span>
                            </button>
                            <ul className="dropdown-menu">
                                <li><a href="#">メニュー1</a></li>
                                <li><a href="#">メニュー2</a></li>
                                <li><a href="#">メニュー3</a></li>
                                <li role="separator" className="divider"></li>
                                <li><a href="#">メニュー4</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </header>
        );
    }
}
