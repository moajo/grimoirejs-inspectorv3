import React from 'react';
import ReactDOM from 'react-dom';
import { ConnectionGateway } from "../common/ConnectionGateway";
import { PortGateway } from '../common/Gateway';
import { STANDBY_ID_BACKGROUND_FOR_DEV, CHANNEL_CONNECTION_ESTABLISHED, CHANNEL_NOTIFY_PORT_ID } from '../common/constants';

ReactDOM.render(
  <div>Hello React Workd!!</div>,
  document.getElementById('content')
);

chrome.tabs.executeScript(chrome.devtools.inspectedWindow.tabId, {
  file: "./dist/content_script.js"
}, () => {
  const gateway = new PortGateway("dev");
  const connection = gateway.connect(STANDBY_ID_BACKGROUND_FOR_DEV);
  // connection.post(CHANNEL_CONNECTION_ESTABLISHED, "hello")
  connection.post(CHANNEL_NOTIFY_PORT_ID,chrome.devtools.inspectedWindow.tabId);
  //TODO Grimoireチャンネルをタブ通知する。
});