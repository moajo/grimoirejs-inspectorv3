import * as React from 'react';
import styl from "./ControlHeader.styl";
interface ControlHeaderProps {
    header: string;
}

const ControlHeader: React.SFC<ControlHeaderProps> = (props) => {
    return (
        <div className={styl.container}>
            <p>{props.header}</p>
        </div>
    );
};

export default ControlHeader;