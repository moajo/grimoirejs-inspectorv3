import React from 'react';
import ReactDOM from 'react-dom';
import { ConnectionGateway } from "../common/ConnectionGateway";
import { PortGateway } from '../common/Gateway';
import { CONNECTION_BG_TO_DEV, CHANNEL_CONNECTION_ESTABLISHED, CHANNEL_NOTIFY_PORT_ID } from '../common/constants';
import { waitConnectionEstablished } from '../common/Util';
import { Header } from './Header';
import { Provider } from "react-redux";
import Store from "./redux/Store";
import { ContextNotFound } from './components/ContextNotFound';
import { GetFramesActionCreator } from './redux/common/flow/InitFlow';
import TreeSelector from './components/TreeSelector';


export function createView() {
  ReactDOM.render(
    <Provider store={Store}>
      <div style={{ width: "300px" }}>
        <TreeSelector />
      </div>
    </Provider>
    ,
    document.getElementById('gr-inspector')
    , () => {
      Store.dispatch(GetFramesActionCreator());
    }
  );
}