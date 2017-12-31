import React from 'react';
import ReactDOM from 'react-dom';
import { ConnectionGateway } from "../common/ConnectionGateway";
import { PortGateway } from '../common/Gateway';
import { CONNECTION_BG_TO_DEV, CHANNEL_CONNECTION_ESTABLISHED, CHANNEL_NOTIFY_PORT_ID } from '../common/constants';
import { waitConnectionEstablished } from '../common/Util';

ReactDOM.render(
  <div>Hello React Workd!!</div>,
  document.getElementById('content')
);

chrome.tabs.executeScript(chrome.devtools.inspectedWindow.tabId, {
  file: "./dist/content_script.js"
}, async () => {
  const gateway = new PortGateway("dev");
  const connection = gateway.connect(CONNECTION_BG_TO_DEV.create(chrome.devtools.inspectedWindow.tabId));
  //TODO Grimoireチャンネルをタブ通知する。

  connection.open("hoge").subscribe((a: any) => {
    connection.post("hoge2", a + a)
  })

  const establishWaiter = waitConnectionEstablished(connection);
  connection.post(CHANNEL_CONNECTION_ESTABLISHED, "dev is ready!");
  const msg = await establishWaiter
  console.log("bg is ready:", msg);
  connection.post("hoge2", "hogehoge")
});