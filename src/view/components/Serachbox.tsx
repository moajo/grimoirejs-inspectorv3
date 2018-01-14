import * as React from 'react';
import styl from "./Searchbox.styl";
interface SearchBoxProps {
    onInput(value: string): void;
    value: string;
}

const SearchBox: React.SFC<SearchBoxProps> = (props) => {
    return (<div className={styl.searchBox}>
        <p><i className="fas fa-search"></i></p>
        <input type="text" value={props.value} onInput={(e) => props.onInput(e.currentTarget.value)} />
    </div>);
};

export default SearchBox;