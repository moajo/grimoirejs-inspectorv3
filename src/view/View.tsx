import React from 'react';
import ReactDOM from 'react-dom';
import { ConnectionGateway } from "../common/ConnectionGateway";
import { PortGateway } from '../common/Gateway';
import { CONNECTION_BG_TO_DEV, CHANNEL_CONNECTION_ESTABLISHED } from '../common/constants';
import { Header } from './Header';
import { Provider } from "react-redux";
import Store from "./redux/Store";
import { ContextNotFound } from './components/ContextNotFound';
import { ConnectToServerActionCreator, changeAdjustScreenMode } from './redux/common/CommonActionCreator';
import TreeSelector from './components/TreeSelector';
import { AdjustScreenMode } from './redux/common/CommonState';
import Dock from './Dock';
import "./global.styl";


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