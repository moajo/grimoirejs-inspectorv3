import * as React from 'react';
import styl from "./IconButton.styl";
import cx from "classnames";
interface IconButtonProps {
    icon: JSX.Element;
    label?: string;
    gridArea?: string;
    isToggle?: boolean;
    selected?: boolean;
    enabled?: boolean;
    onClick?(state?: boolean): void;
}

const IconButton: React.SFC<IconButtonProps> = (props) => {
    const clicked = () => {
        if (!props.onClick || props.enabled === false) return;
        if (props.isToggle) {
            props.onClick(!props.selected);
        } else {
            props.onClick(props.selected);
        }
    };
    return (<div className={cx(styl.iconButton, {
        [styl.selected]: props.selected,
        [styl.disabled]: props.enabled === false,
        [styl.enabled]: props.enabled || props.enabled === undefined
    })} style={{ gridArea: props.gridArea }} onClick={clicked}>
        {props.icon}{props.label ? <p>{props.label}</p> : null}<p></p>
    </div>);
};

export default IconButton;