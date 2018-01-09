import * as React from 'react';
import TreeSelector from './components/TreeSelector';
import Hierarchy from './components/Hierarchy';
import styl from "./LeftControl.styl"
import ControlHeader from './components/ControlHeader';
interface LeftControlProps {
}

const LeftControl: React.SFC<LeftControlProps> = (props) => {
    return (<div className={styl.leftControlContainer}>
        <ControlHeader header="Context" />
        <TreeSelector />
        <ControlHeader header="Hierarchy" />
        <Hierarchy />
    </div>)
};

export default LeftControl;