const lanIP = `${window.location.hostname}:5000`;
const socketio = io(lanIP);

// #region ***  DOM references                           ***********
// #endregion

// #region ***  Callback-Visualisation - show___         ***********
const showError = function () {
  console.error('Oeps er ging iets mis');
};

const showHistory = function (jsonObject) {
  console.info(jsonObject);
  const testHtml = document.querySelector('.js-test');
  let html = '';
  for (const history of jsonObject.history) {
    console.info(history.datetime);
    html += `<div>${history.datetime}</div>
    <div>${history.value}</div>
    <br>`
  }
  testHtml.innerHTML = html;
};
// #endregion

// #region ***  Callback-No Visualisation - callback___  ***********
// #endregion

// #region ***  Data Access - get___                     ***********
const getHistory = function (device_id) {
  console.info(device_id);
  const url = 'http://' + lanIP + `/api/v1/history/${device_id}/`;
  handleData(url, showHistory, showError);
};
// #endregion

// #region ***  Event Listeners - listenTo___            ***********
const listenToUI = function () {};

const listenToSocket = function () {};
// #endregion

// #region ***  Init / DOMContentLoaded                  ***********
const init = function () {
  console.info('DOM geladen');
  // listenToUI();
  // listenToSocket();
  getHistory(3);
};

document.addEventListener('DOMContentLoaded', init);
// #endregion
