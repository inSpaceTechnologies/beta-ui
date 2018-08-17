/*
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/
// add this as a Vue directive, and add v-focus to a component to automatically receive focus
export default {
  inserted: (el) => {
    el.focus();
  },
};
