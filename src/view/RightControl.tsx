import * as React from 'react';
import Inspector from './components/Inspector';

interface RightControlProps {
}

const RightControl: React.SFC<RightControlProps> = (props) => {
    return (
        <div>
            <Inspector />
        </div>
    );
};

export default RightControl;