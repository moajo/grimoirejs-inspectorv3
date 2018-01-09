
import * as React from 'react';
import { NodeStructureInfo } from '../../common/schema';
import { connect, DispatchProp } from 'react-redux';
import { IState } from '../redux/State';
import SelectionFilter from '../SelectionFilter';
import { ContextNotFound } from './ContextNotFound';
import styl from "./Hierarchy.styl";
import NameConverter from '../NameConverter';
import * as _ from 'lodash';
import cx from "classnames";
import { changeNodeExpandState } from '../redux/tree/TreeStateActionCreator';

interface TreeElementLabelProps {
    node: NodeStructureInfo;
    isOpen: boolean;
}

const TreeElementLabel: React.SFC<TreeElementLabelProps> = (props) => {
    const showExpander = !_.isEmpty(props.node.children);
    return (<div className={styl.treeElementLabelContainer}>
        {showExpander ? <p className={cx(styl.treeElementExpander, {
            [styl.expandedIcon]: props.isOpen,
            [styl.shrinkedIcon]: !props.isOpen
        })}><i className={cx("fas fa-caret-down")} ></i></p> : null
        }
        <p className={styl.treeElementLabel}><span className={styl.bracket}>&lt;</span><span className={styl.nodeName}>{NameConverter.fqnToShortName(props.node.fqn)}</span><span className={styl.bracket}>&gt;</span></p>
    </div >);
};

interface TreeElementProps extends DispatchProp<TreeElementProps> {
    node: NodeStructureInfo;
    layer: number;
    isOpen: boolean;
}

const TreeElementOriginal: React.SFC<TreeElementProps> = (props) => {
    const toggleExpand = () => {
        props.dispatch!(changeNodeExpandState(props.node.uniqueId, !props.isOpen));
    };
    return (<div>
        <div className={styl.currentElementLabelContainer} style={{ paddingLeft: `${props.layer * 10}px` }} onClick={toggleExpand}>
            <TreeElementLabel node={props.node} isOpen={props.isOpen} />
        </div>
        {
            <div className={cx(styl.treeElementChildrenContainer, {
                [styl.expanded]: props.isOpen,
                [styl.shrinked]: !props.isOpen
            })}>
                {props.node.children.map((c) => (<TreeElement key={c.uniqueId} node={c} layer={props.layer + 1} />))}
            </div>
        }
    </div>);
};

const TreeElement = connect((state: IState, ownProps: any) => {
    const isOpenOriginal = state.tree.hierarchy.isOpen[ownProps.node.uniqueId];
    return {
        isOpen: isOpenOriginal === undefined || isOpenOriginal
    }
})(TreeElementOriginal);

interface HierarchyProps extends DispatchProp<HierarchyProps> {
    rootNode?: NodeStructureInfo;
}

const Hierarchy: React.SFC<HierarchyProps> = (props) => {
    if (!props.rootNode) {
        return (<ContextNotFound />);
    }
    return (
        <div className={styl.hierarchyContainer}>
            <TreeElement node={props.rootNode} layer={0} />
        </div>);
};

export default connect((store: IState): HierarchyProps => ({
    rootNode: {
        fqn: "fundamental.goml",
        uniqueId: "abc",
        components: [],
        children: [{
            fqn: "fundamental.renderer",
            uniqueId: "def",
            components: [],
            children: [{
                fqn: "fundamental.render-scene",
                uniqueId: "sjisa",
                components: [],
                children: []
            }]
        },
        {
            fqn: "fundamental.scene",
            uniqueId: "ghq",
            components: [],
            children: [{
                fqn: "fundamental.mesh",
                uniqueId: "ijk",
                components: [],
                children: []
            }, {
                fqn: "fundamental.camera",
                uniqueId: "lmn",
                components: [],
                children: []
            }]
        }
        ]
    }
}))(Hierarchy);