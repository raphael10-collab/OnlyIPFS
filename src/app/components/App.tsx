import React, { useState, useEffect } from 'react';
import { hot } from 'react-hot-loader';

// https://github.com/ipfs/js-ipfs/blob/master/examples/browser-webpack/src/components/app.js
const IPFS = require('ipfs');
const uint8ArrayConcat = require('uint8arrays/concat');
const uint8ArrayToString = require('uint8arrays/to-string');

const items = [
    <div key={0}>first</div>,
    <div key={1}>second</div>
];

declare interface Window {
  api: {
    send: (channel: string, ...arg: any) => void;
    receive: (channel: string, func: (event: any, ...arg: any) => void) => void;
    // https://github.com/frederiksen/angular-electron-boilerplate/blob/master/src/preload/preload.ts
    // https://www.electronjs.org/docs/all#ipcrenderersendtowebcontentsid-channel-args
    electronIpcSendTo: (window_id: string, channel: string, ...arg: any) => void;
    electronIpcSend: (channel: string, ...arg: any) => void;
    electronIpcOn: (channel: string, listener: (event: any, ...arg: any) => void) => void;
    electronIpcSendSync: (channel: string, ...arg: any) => void;
    electronIpcOnce: (channel: string, listener: (event: any, ...arg: any) => void) => void;
    electronIpcRemoveListener:  (channel: string, listener: (event: any, ...arg: any) => void) => void;
    electronIpcRemoveAllListeners: (channel: string) => void;
  }
}

// https://github.com/electron/electron/issues/21437#issuecomment-573522360


const getFileExtension = (filepath: string): string => {
  let baseName = filepath.split(/[\\/]/).pop(); // extracts file name from full path
  let pos = baseName.lastIndexOf("."); // gets the last position of `.`
  if (baseName === "" || pos < 1) { // if the file name is empty or ...
    return ""; // the dot not found (-1) or comes first (0)
  }
  else {
    return baseName.slice(pos + 1); // extracts extension ignoring "."
  }
}

function App() {  
  const [win, setWin] = useState("A-Type");

  const [ipfsState, setIpfsState] = useState({
    _id: null,
    _agentVersion: null,
    _protocolVersion: null,
    _addedFileHash: null,
    _addedFileContents: null
  });


  const ops = async() => {
    const node = await IPFS.create({ repo: String(Math.random() + Date.now()) });

    console.log('IPFS node is ready');

    const { id, agentVersion, protocolVersion } = await node.id();

    const stringToUse = 'hello world from webpacked IPFS';
    const { cid } = await node.add(stringToUse);

    setIpfsState({
      _id: id,
      _agentVersion: agentVersion,
      _protocolVersion: protocolVersion,
      _addedFileHash: cid.toString(),
      _addedFileContents: null 
    });

    let bufs = [];
    for await (const buf of node.cat(cid)) {
      bufs.push(buf);
    }
    const data = uint8ArrayConcat(bufs);
    setIpfsState({
      _id: id,
      _agentVersion: agentVersion,
      _protocolVersion: protocolVersion,
      _addedFileHash: cid.toString(),
      _addedFileContents: uint8ArrayToString(data) });
  }

  let filePath_1 = '/home/marco/Downloads/Art21Costituzione.jpg';
  let filePath_2 = '/home/marco/Downloads/VitaminaCAlimenti.pdf';
  let filePaths = ['/home/marco/Downloads/Art21Costituzione.jpg', '/home/marco/Downloads/VitaminaCAlimenti.pdf'];

  // https://github.com/electron/electron/issues/7193

  // https://medium.com/jspoint/working-with-files-i-o-in-an-electron-application-b4d2de403f54

  // IMPORTANT: 
  // https://www.electronjs.org/docs/api/file-object
  // https://github.com/feross/drag-drop

  // https://medium.com/@650egor/simple-drag-and-drop-file-upload-in-react-2cb409d88929

  // https://github.com/react-dnd/react-dnd


  function handleSecondWindowType (fp: string) {
    let fileExtens = getFileExtension(fp);
    if (fileExtens.includes('jpg')) {
      setWin("A-Type");
      // https://stackoverflow.com/questions/53753181/webcontents-send-and-ipcrenderer-on-not-working
      //window.api.send('open-type-A-window', '');
      //window.api.electronIpcOn('window-A-opened', (event, args) => {
        //console.log("Window ID Just Opened: ", args);
        //if (args === 'ok') {
          //console.log("I can now send the filepath to the second window");
          //window.api.electronIpcSend('window-A-channel', filePath_1);
        //}
      //});
    }
  }

  useEffect(() => {
    //handleSecondWindowType(filePath_1);
  },[]);

  const sendFilePathFunct = () => {

    // https://stackoverflow.com/questions/53753181/webcontents-send-and-ipcrenderer-on-not-working

    if (win === "A-Type") {
      window.api.send('open-type-A-window', '');
      // https://stackoverflow.com/questions/53753181/webcontents-send-and-ipcrenderer-on-not-working
      window.api.electronIpcOn('window-A-opened', (event, args) => {
        console.log("Window ID Just Opened: ", args);
        if (args === 'ok') {
          console.log("I can now send the filepath to the second window");
          window.api.electronIpcSend('window-A-channel', filePath_1);
        }
      });

      window.api.electronIpcOn('window-A-channel', (event, args) => {
        console.log("App.tsx-Message from main.ts: ", args);
      });
    }
  }

    return (
      <div className='container'>
        <h2 className='heading'>
            Multiple Selective Windows Communication
        </h2>

              <div style={{ textAlign: 'center' }}>
                <p>Your ID is <strong>{ipfsState._id}</strong></p>
              </div>

              <p>
                <button id="sendFilePath" onClick={() => {
                  sendFilePathFunct();
                }}>Send File Path to the Second Window</button>
              </p>



      </div>
    );
}

export default hot(module)(App);
