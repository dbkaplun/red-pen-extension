import browser from 'webextension-polyfill';
import writeGood from 'write-good';

class RedPenExtension {
  constructor() {
    this.onContextMenuClick = this.onContextMenuClick.bind(this);
    this.onContentScriptMessage = this.onContentScriptMessage.bind(this);
    this.onPortDisconnect = this.onPortDisconnect.bind(this);
    this.lintEvt = null;
    this.ports = {};
  }

  start() {
    this.createContextMenu();
    this.handlePorts();
  }

  createContextMenu() {
    browser.contextMenus.onClicked.addListener(this.onContextMenuClick);
    browser.contextMenus.create({
      id: 'lintThisText',
      title: browser.i18n.getMessage('contextMenuLintThisText'),
      contexts: ['editable'], // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/menus/ContextType
    });
  }

  onContextMenuClick(info, tab) {
    this.contextMenuClickData = { info, tab };
    switch (info.menuItemId) {
      case 'lintThisText':
        browser.browserAction.openPopup()
          .catch(console.error); // eslint-disable-line no-console
        break;
      default:
        throw new Error(`unexpected context menu item '${info.menuItemId}'`);
    }
  }

  handlePorts() {
    browser.runtime.onConnect.addListener((port) => {
      this.ports[port.name] = port;
      switch (port.name) {
        case 'content_script':
          port.onMessage.addListener(this.onContentScriptMessage);
          break;
        case 'popup':
          this.sendLint();
          break;
        default:
          throw new Error(`unexpected port name '${port.name}'`);
      }
      port.onDisconnect.addListener(this.onPortDisconnect);
    });
  }

  onPortDisconnect(port) {
    this.ports[port.name] = null;
    if (port.error) {
      throw port.error;
    }
  }

  onContentScriptMessage(evt) {
    switch (evt.type) {
      case 'text':
        this.onText(evt);
        break;
      default:
        throw new Error(`unexpected evt type '${evt.type}'`);
    }
  }

  sendLint() {
    if (this.ports.popup) {
      this.ports.popup.postMessage(this.lintEvt);
    }
  }

  onText({ text }) {
    this.lintEvt = this.constructor.createLintEvt(text);
    this.sendLint();
    this.updateBadge();
    return null;
  }

  updateBadge() {
    const {
      lints = [],
    } = this.lintEvt || {};

    browser.tabs.query({ active: true, currentWindow: true })
      .then(([activeTab]) => {
        if (!activeTab) {
          return;
        }
        browser.browserAction.setBadgeText({
          tabId: activeTab.id,
          text: lints.length.toString(),
        });
        browser.browserAction.setBadgeBackgroundColor({
          tabId: activeTab.id,
          color: !lints.length ? 'green' : 'red',
        });
      })
      .catch(console.error); // eslint-disable-line no-console
  }

  static createLintEvt(text) {
    return {
      type: 'lint',
      text,
      lints: writeGood(text),
    };
  }
}

new RedPenExtension().start();
