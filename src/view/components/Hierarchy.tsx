
import * as React from 'react';
import { GomlNodeInfo } from '../../common/schema';
import { connect, DispatchProp } from 'react-redux';
import { IState } from '../redux/State';
import SelectionFilter from '../SelectionFilter';
import { ContextNotFound } from './ContextNotFound';

interface TreeElementProps {
    node?: GomlNodeInfo;
}

const TreeElement: React.SFC<TreeElementProps> = (props) => {
    return (<div>

    </div>);
};

interface HierarchyProps extends DispatchProp<HierarchyProps> {
    rootNode?: GomlNodeInfo;
}

const Hierarchy: React.SFC<HierarchyProps> = (props) => {
    if (!props.rootNode) {
        return (<ContextNotFound />);
    }
    return (<TreeElement node={props.rootNode} />);
};

export default connect((store: IState): HierarchyProps => ({
    rootNode: SelectionFilter.getCurrentRootNode(store)
}))(Hierarchy);