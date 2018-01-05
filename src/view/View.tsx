import React from 'react';
import ReactDOM from 'react-dom';
import { ConnectionGateway } from "../common/ConnectionGateway";
import { PortGateway } from '../common/Gateway';
import { CONNECTION_BG_TO_DEV, CHANNEL_CONNECTION_ESTABLISHED, CHANNEL_NOTIFY_PORT_ID } from '../common/constants';
import { waitConnectionEstablished } from '../common/Util';
import { Header } from './Header';
import { Provider } from "react-redux";
import Store from "./redux/Store";
import Epic from './redux/Epic';
import { ContextNotFound } from './components/ContextNotFound';


export function createView() {
  ReactDOM.render(
    <Provider store={Store}>
      <div>
        <ContextNotFound />
      </div>
    </Provider>
    ,
    document.getElementById('gr-inspector')
    , () => {
      Epic
      console.log("aaaaaaaaaaa@@@@@@@@@@@@@@@@@@@")
    }
  );
}