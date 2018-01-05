import * as React from 'react';
import { TreeSelection } from '../redux/common/CommonState';
import styl from "./TreeSelector.styl";
import { FrameInfo, TreeInfo } from '../../common/schema';
import _ from "lodash";
import cx from "classnames";
import SelectionFilter from '../SelectionFilter';
import { IState } from '../redux/State';
import { connect, DispatchProp } from 'react-redux';
import { switchTreeSelector } from '../redux/tree/selector/Selector';

interface IndicatorLabelProps {
    selectedTree: TreeInfo;
}

const IndicatorLabel: React.SFC<IndicatorLabelProps> = (props) => {
    let idClass = props.selectedTree.scriptTag;
    let id = "";
    let className = "";
    if (idClass && idClass.scriptTagId) {
        id = `#${idClass.scriptTagId}`;
    }
    if (idClass && idClass.scriptTagClass) {
        className = `.${idClass.scriptTagClass.join(".")}`;
    }
    return (
        <div className={styl.indicatorLabelContainer}>
            <p className={styl.indicatorLabelIconContainer}>
                <i className="fas fa-eye"></i>
            </p>
            <p className={styl.indicatorLabelLabelContainer}>
                <span className={styl.idLabel}>{id}</span><span className={styl.classLabel}>{className}</span>
            </p>
        </div>);
}

interface TreeSelectorProps extends DispatchProp<TreeSelectorProps> {
    selectedTree?: TreeInfo;
    frames: { [key: string]: FrameInfo | undefined; }
    open: boolean;
}

const TreeSelector: React.SFC<TreeSelectorProps> = (props) => {
    const initialized = !_.isEmpty(props.frames);
    const indicator = initialized && props.selectedTree ? (<IndicatorLabel selectedTree={props.selectedTree} />) :
        (<p className={cx(styl.labelContainer, styl.disabledLabel)}>
            No context found
        </p >);
    const toggleOpen = () => {
        props.dispatch!(switchTreeSelector(!props.open));
    };
    return (<div className={styl.indicatorContainer} onClick={toggleOpen}>
        {indicator}
        <p className={cx(styl.spinnerContainer, { [styl.disabledIcon]: !initialized })}>
            <i className="fas fa-caret-down" />
        </p>

    </div >);
};

export default connect((state: IState): TreeSelectorProps => ({
    selectedTree: SelectionFilter.getCurrentTree(state),
    frames: state.common.frames,
    open: state.tree.treeSelector.openSelector
}))(TreeSelector);