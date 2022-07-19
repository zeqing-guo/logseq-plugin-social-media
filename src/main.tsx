import '@logseq/libs';
import { App } from './App';
import React from "react";
import ReactDOM from "react-dom";
import { BlockCommandCallback, BlockEntity } from '@logseq/libs/dist/LSPlugin.user';
import { settings } from './settings';

const sendBox: BlockCommandCallback = async (block) => {
  const blockContent = await logseq.Editor.getBlock(block.uuid, { includeChildren: true });
  if (blockContent !== null) {
    renderApp(blockContent);
    logseq.showMainUI();
    handleClosePopup();
  }
}

function renderApp(blockContent: BlockEntity) {
  ReactDOM.render(
    <React.StrictMode>
      <App {...blockContent} />
    </React.StrictMode>,
    document.getElementById('app')
  );
}

async function main() {
  logseq.Editor.registerBlockContextMenuItem(
    "Send to social media",
    sendBox,
  )
}

// from https://github.com/sawhney17/logseq-pdf-export/blob/dd835fdcc0aad38218dd85c9ab0d412a6186df7b/src/handleClosePopup.ts#L1
const handleClosePopup = () => {
  //ESC
  document.addEventListener(
    'keydown',
    function (e) {
      if (e.key === 'Escape') {
        logseq.hideMainUI({ restoreEditingCursor: true });
      }
      e.stopPropagation();
    },
    false
  );
};

logseq.useSettingsSchema(settings);

logseq.ready(main).catch(console.error);
