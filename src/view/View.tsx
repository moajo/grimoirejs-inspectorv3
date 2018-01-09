import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import Dock from './Dock';
import "./global.styl";
import { changeAdjustScreenMode, ConnectToServerActionCreator } from './redux/common/CommonActionCreator';
import { AdjustScreenMode } from './redux/common/CommonState';
import Store from './redux/Store';


export function createView() {
  ReactDOM.render(
    <Provider store={Store}>
      <Dock />
    </Provider>
    ,
    document.getElementById('gr-inspector')
    , () => {
      Store.dispatch(ConnectToServerActionCreator());
      Store.dispatch(changeAdjustScreenMode(AdjustScreenMode.BodyShrink));
    }
  );
}