import React from 'react';
import ReactDOM from 'react-dom';
import { ConnectionGateway } from "./common/ConnectionGateway";

ReactDOM.render(
  <div>Hello React Workd!!</div>,
  document.getElementById('content')
);

chrome.tabs.executeScript(chrome.devtools.inspectedWindow.tabId, {
  file: "./dist/content_script.js"
}, () => {
  const gateway = new ConnectionGateway("devtool", chrome.runtime.connect({
      name: `devtool:${chrome.devtools.inspectedWindow.tabId}`
  }))

  gateway.addListener(function (message) {
      console.log("recieve", message)
  });

  gateway.postMessage({
      tabId: chrome.devtools.inspectedWindow.tabId
  });
});