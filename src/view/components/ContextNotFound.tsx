import * as React from 'react';
import Logo from "../../../resources/small-logo.png";
import styl from "./ContextNotFound.styl";
export const ContextNotFound: React.SFC = () => {
    return (
        <div className={styl.notFoundContainer}>
            <p><img src={Logo} className={styl.logo} /></p>
            <p className={styl.message}>Context not found</p>
        </div>
    );
};
