import React from 'react';
import ReactDOM from 'react-dom';
import { ConnectionGateway } from "../common/ConnectionGateway";
import { PortGateway } from '../common/Gateway';
import { CONNECTION_BG_TO_DEV, CHANNEL_CONNECTION_ESTABLISHED, CHANNEL_NOTIFY_PORT_ID } from '../common/constants';
import { waitConnectionEstablished } from '../common/Util';
import { Header } from './view/Header';

export function createView() {
  ReactDOM.render(
    <div>
      <Header/>
      <div>Hello React Workd!!</div>
    </div>
    ,
    document.getElementById('content')
  );
}