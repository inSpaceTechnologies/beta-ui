/*
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/
class ModalBackground {
  constructor() {
    this._element = null;
    // number of active dialogs
    this._count = 0;
  }

  createElement() {
    this._element = document.createElement('div');
    this._element.setAttribute('id', 'modal-background');
    this._element.style.display = 'none';

    document.body.appendChild(this._element);
  }

  show() {
    if (!this._element) {
      this.createElement();
    }
    this._element.style.display = 'flex';
    this._count += 1;
  }

  hide() {
    this._count -= 1;
    // remove backdrop if there are no more dialogs
    if (this._count === 0) {
      this._element.style.display = 'none';
    }
  }
}

export default new ModalBackground();
