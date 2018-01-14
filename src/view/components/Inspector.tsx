import * as React from 'react';
import ControlHeader from './ControlHeader';
import { GomlNodeInfo, ComponentInfo } from '../../common/schema';
import { connect, DispatchProp } from 'react-redux';
import NameConverter from '../NameConverter';
import { IState } from '../redux/State';
import styl from "./Inspector.styl";
import cx from "classnames";
import IconButton from './IconButton';

interface SearchBoxProps {
}

const SearchBox: React.SFC<SearchBoxProps> = (props) => {
    return (<div className={styl.searchBox}>
        <p><i className="fas fa-search"></i></p>
        <input type="text" />
    </div>);
};

interface ToolBoxProps {
}

const ToolBox: React.SFC<ToolBoxProps> = (props) => {
    return (<div className={styl.toolboxContainer}>
        <SearchBox />
    </div>);
};

interface ComponentElementProps {
    component: ComponentInfo;
}

const ComponentElement: React.SFC<ComponentElementProps> = (props) => {
    const enabled = props.component.enabled;
    return (<div>
        <div className={styl.componentHeaderContainer}>
            <p className={styl.checkbox}><i className={cx({ "far fa-square": !enabled, "fas fa-check-square": enabled })} ></i></p>
            <p className={styl.iconbox}><i className="fas fa-cube"></i></p>
            <p className={styl.componentName} > {NameConverter.fqnToShortName(props.component.fqn)}</p>
            <p className={styl.menu}><i className="fas fa-bars"></i></p>
        </div>
        <div style={{ height: "120px" }}></div>
    </div>);
};
interface InspectorHeaderProps {
    node: GomlNodeInfo;
}

const InspectorHeader: React.SFC<InspectorHeaderProps> = (props) => {
    return (
        <p className={styl.inspectorHeaderContainer}><span className={styl.bracket}>&lt;</span><span className={styl.nodeName}>{NameConverter.fqnToShortName(props.node.fqn)}</span><span className={styl.bracket}>&gt;</span></p>);
};

interface InspectorProps extends DispatchProp<InspectorProps> {
    node: GomlNodeInfo;
}

const Inspector: React.SFC<InspectorProps> = (props) => {
    return (<div>
        <ControlHeader header="Node" />
        <InspectorHeader node={props.node} />
        <ControlHeader header="Components" />
        <ToolBox />
        {props.node.components.map(c => (<ComponentElement component={c} />))}
        <IconButton label="Add component" icon={<i className="fas fa-puzzle-piece"></i>} />
    </div>);
};

export default connect(
    (state: IState) => ({
        node: {
            fqn: "fundamental.render-scene",
            uniqueId: "saidjisa",
            components: [{
                fqn: "grimoiejs.Grimoire",
                uniqueId: "ANUDSAUDH",
                attributes: {},
                enabled: false
            }, {
                fqn: "fundamental.Transform",
                uniqueId: "sajias",
                attributes: {},
                enabled: true
            }] as ComponentInfo[]
        }
    })
)(Inspector);