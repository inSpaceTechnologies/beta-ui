/*
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/
/* eslint no-console: 0 */ // --> OFF
import Noty from 'noty';

const debug = (process.env.NODE_ENV !== 'production');
const nonPermanentNotifications = [];

Noty.setMaxVisible(10);

function log(message) {
  if (debug) {
    console.log(message);
  }
}

function error(message) {
  if (debug) {
    console.error(message);
  }
}

// types: alert, success, warning, error, info/information
function notify({
  title,
  text,
  type,
  permanent,
  sticky,
  buttons,
}) {
  let fullText;

  if (title) {
    fullText = `<span class=noty-title>${title}</span><p>${text}</p>`;
  } else {
    fullText = `<p>${text}</p>`;
  }

  let timeout = false;
  if (!sticky) {
    timeout = 5000;
  }

  const noty = new Noty({
    text: fullText,
    buttons,
    type,
    timeout,
    closeWith: ['click'],
    layout: 'topRight',
    theme: 'relax',
    container: '#noty-container',
  });
  if (!permanent) {
    nonPermanentNotifications.push(noty);
  }
  noty.show();
  return noty;
}

function notifyError(err) {
  if (!err.message) {
    return;
  }
  notify({
    title: 'Error',
    text: err.message,
    type: 'error',
    permanent: false,
    sticky: true,
    buttons: [],
  });
}

// does not remove permanent ones
function removeAll() {
  nonPermanentNotifications.forEach((noty) => {
    noty.close();
  });
  // empty array
  nonPermanentNotifications.length = 0;
}

function remove(noty) {
  const index = nonPermanentNotifications.indexOf(noty);
  if (index >= 0) {
    nonPermanentNotifications.splice(index, 1);
  }
  noty.close();
}

export default {
  log, error, notify, notifyError, removeAll, remove,
};
