import * as React from 'react';
import { TreeSelection } from '../redux/common/CommonState';
import styl from "./TreeSelector.styl";
import { TreeInfo, FrameStructure } from '../../common/Schema';
import _ from "lodash";
import cx from "classnames";
import SelectionFilter from '../SelectionFilter';
import { IState } from '../redux/State';
import { connect, DispatchProp } from 'react-redux';
import { switchTreeSelector } from '../redux/tree/selector/Selector';
import { window } from 'rxjs/operators/window';
import { SelectTreeActionCreator } from '../redux/common/CommonActionCreator';

interface IdClassLabelProps {
    id?: string;
    classNames?: string[];
    idClass: string;
    classNameClass: string;
    emptyLabel?: string;
}

const IdClassLabel: React.SFC<IdClassLabelProps> = (props) => {
    let id = null;
    let className = null;
    if (props.id) {
        id = `#${props.id}`;
    }
    if (props.classNames && !_.isEmpty(props.classNames)) {
        className = `.${props.classNames.join(".")}`;
    }
    if (!id && !className) {
        return (<span>{props.emptyLabel}</span>)
    }
    return (<span><span className={props.idClass}>{id}</span><span className={props.classNameClass}>{className}</span></span>);
};
interface TreeElementProps extends DispatchProp<TreeElementProps> {
    tree: TreeInfo;
    frameUUID: string;
}

const TreeElementOriginal: React.SFC<TreeElementProps> = (props) => {
    const id = props.tree.scriptTag ? props.tree.scriptTag.scriptTagId : undefined;
    const className = props.tree.scriptTag ? props.tree.scriptTag.scriptTagClass : undefined;
    const selectTree = () => {
        props.dispatch!(SelectTreeActionCreator({
            rootNodeId: props.tree.rootNodeId,
            frameUUID: props.frameUUID
        }));
    }
    return (<div className={styl.treeElementContainer} onMouseDown={selectTree}>
        <p>
            {<IdClassLabel id={id} classNames={className} idClass={styl.idLabel} classNameClass={styl.classLabel} emptyLabel={`No NAME(${props.tree.rootNodeId})`} />}
        </p>
        <p>{props.tree.scriptTag ? props.tree.scriptTag.scriptTagSrc : null}</p>
    </div>);
};

const TreeElement = connect()(TreeElementOriginal);

interface FrameElementProps {
    frame: FrameStructure;
}

const hasChildContext = (n: FrameStructure): boolean => {
    return !_.isEmpty(n.trees) || !_.isEmpty(_.find(n.children, v => hasChildContext(v)));
};

const FrameElement: React.SFC<FrameElementProps> = (props) => {
    return (<div className={styl.frameElementContainer}>
        <p className={styl.iconContainer}><i className="far fa-window-maximize"></i></p>
        <p className={styl.urlContainer}>{props.frame.url}</p>
        <div className={styl.canvasListContainer}>
            {_.map(props.frame.trees, v => (<TreeElement key={v.rootNodeId} tree={v} frameUUID={props.frame.UUID} />))}
        </div>
        <div className={styl.framesListContainer}>
            {_.flatMap(_.filter(props.frame.children, (v) => v && hasChildContext(v)), (value, key) => (<FrameElement key={value.UUID} frame={value!} />))}
        </div>
    </div>)
};


const TreeSelectorExpander: React.SFC<TreeSelectorProps> = (props) => {
    return (
        <div className={styl.expanderContainer}>
            {_.flatMap(_.filter(props.frames, (v) => v && hasChildContext(v)), (value, key) => (<FrameElement key={value!.UUID} frame={value!} />))}
        </div>
    );
};

interface IndicatorLabelProps {
    selectedTree: TreeInfo;
}

const IndicatorLabel: React.SFC<IndicatorLabelProps> = (props) => {
    let idClass = props.selectedTree.scriptTag;
    return (
        <div className={styl.indicatorLabelContainer}>
            <p className={styl.indicatorLabelIconContainer}>
                <i className="fas fa-eye"></i>
            </p>
            <p className={styl.indicatorLabelLabelContainer}>
                {idClass ? (<IdClassLabel id={idClass.scriptTagId} classNames={idClass.scriptTagClass} idClass={styl.idLabel} classNameClass={styl.classLabel} emptyLabel={`No NAME(${props.selectedTree.rootNodeId})`} />) : null}
            </p>
        </div>);
}

interface TreeSelectorProps extends DispatchProp<TreeSelectorProps> {
    selectedTree?: TreeInfo;
    frames: { [key: string]: FrameStructure | undefined; }
    open: boolean;
}

const TreeSelector: React.SFC<TreeSelectorProps> = (props) => {
    const initialized = !_.isEmpty(props.frames);
    const indicator = initialized && props.selectedTree ? (<IndicatorLabel selectedTree={props.selectedTree} />) :
        (<p className={cx(styl.labelContainer, styl.disabledLabel)}>
            No context found
        </p >);
    const toggleOpen = () => {
        if (!props.open) {
            const closeByWindow = () => {
                props.dispatch!(switchTreeSelector(false));
                document.removeEventListener("mousedown", closeByWindow);
            }
            document.addEventListener("mousedown", closeByWindow);
        }
        props.dispatch!(switchTreeSelector(!props.open));
    };
    return (<div className={styl.indicatorContainer} onClick={toggleOpen}>
        {indicator}
        <p className={cx(styl.spinnerContainer, { [styl.disabledIcon]: !initialized })}>
            <i className="fas fa-caret-down" />
        </p>
        <div className={styl.expanderOrigin}>{props.open ? (<TreeSelectorExpander {...props} />) : null}</div>
    </div >);
};

export default connect((state: IState): TreeSelectorProps => ({
    selectedTree: SelectionFilter.getCurrentTree(state),
    frames: state.common.frames,
    open: state.tree.treeSelector.openSelector
}))(TreeSelector);