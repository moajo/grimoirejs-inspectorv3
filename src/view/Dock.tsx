import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { AdjustScreenRegion } from './redux/common/CommonState';
import { IState } from './redux/State';
import styl from "./Dock.styl";
import TreeSelector from './components/TreeSelector';
import cx from "classnames";
import { MouseEvent } from 'react';
import { resizeAdjustScreen } from './redux/common/CommonActionCreator';
interface ResizablePaneProps {
    resizableEdge: "LEFT" | "RIGHT" | "BOTTOM" | "TOP";
    components: JSX.Element[];
    onGripMove(movementX: number, movementY: number): void;
}

export class ResizablePane extends React.PureComponent<ResizablePaneProps, any> {
    private isMousedown: boolean = false;
    render() {
        const isVertical = this.props.resizableEdge === "LEFT" || this.props.resizableEdge === "RIGHT";
        const isHorizontal = this.props.resizableEdge === "TOP" || this.props.resizableEdge === "BOTTOM";
        return (<div className={styl.resizablePane}>
            <div className={cx({
                [styl.verticalGrip]: isVertical,
                [styl.horizontalGrip]: isHorizontal
            })} style={{ gridArea: this.props.resizableEdge }} onMouseDown={() => {
                this.isMousedown = true;
                this._startResizeMonitor();
            }} />
            <div className={styl.resizableContent}>
                {this.props.components}
            </div>
        </div >);
    }

    private _startResizeMonitor(): void {
        const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
            this.props.onGripMove((e as any).movementX, (e as any).movementY);
        };
        const onRelease = () => {
            this.isMousedown = false;
            document.removeEventListener("mouseup", onRelease);
            document.removeEventListener("mousemove", onMove as any);
        };
        document.addEventListener("mouseup", onRelease);
        document.addEventListener("mousemove", onMove as any);
    }
}


interface DockProps extends DispatchProp<DockProps> {
    region: AdjustScreenRegion
}

const Dock: React.SFC<DockProps> = (props) => {
    const onResize = (size: number) => {

    };
    return (<div style={{
        gridTemplateColumns: `${props.region.left}px 1fr ${props.region.right}px`,
        gridTemplateRows: `${props.region.top}px 1fr ${props.region.bottom}px`
    }} className={styl.dockContainer}>
        <div style={{ gridArea: "LEFT", height: "100%" }}>
            <ResizablePane resizableEdge="RIGHT" components={[<TreeSelector />]} onGripMove={(x, y) => {
                props.dispatch!(resizeAdjustScreen("left", x))
            }} />
        </div>
        <div style={{ gridArea: "RIGHT", height: "100%" }}>

        </div>
    </div>);
};

export default connect((state: IState) => ({ region: state.common.adjustScreenRegion }))(Dock);