const lanIP = `${window.location.hostname}:5000`;
const socketio = io(lanIP);
let currentDeviceId;

// #region ***  DOM references                           ***********
// #endregion

// #region ***  Callback-Visualisation - show___         ***********
const showError = function () {
  console.error('Oeps er ging iets mis');
};

const showDevices = function (jsonObject) {
  const btnsHtml = document.querySelector('.js-btns');
  let html = '';
  for (const device of jsonObject.devices) {
    html += `<button class='js-btn' data-device_id="${device.device_id}">${device.description}</button>`;
  }
  btnsHtml.innerHTML = html;
  listenToBtns();
};

const showHistory = function (jsonObject) {
  console.info(jsonObject);
  const dataHtml = document.querySelector('.js-data');
  let html = '';
  for (const history of jsonObject.history) {
    html += `<tr>
    <td>${history.datetime}</td>
    <td>${history.value}</td>
  </tr>`;
  }
  dataHtml.innerHTML = html;
};

const showNewestHistory = function (jsonObject) {
  console.info(jsonObject);
  const dataHtml = document.querySelector('.js-data');
  const html = `<tr>
    <td>${jsonObject.history.datetime}</td>
    <td>${jsonObject.history.value}</td>
  </tr>`;
  dataHtml.innerHTML += html;
};
// #endregion

// #region ***  Callback-No Visualisation - callback___  ***********
// #endregion

// #region ***  Data Access - get___                     ***********
const getDevices = function () {
  const url = 'http://' + lanIP + `/api/v1/devices/`;
  handleData(url, showDevices, showError);
};

const getHistory = function (device_id) {
  const url = 'http://' + lanIP + `/api/v1/history/${device_id}/`;
  handleData(url, showHistory, showError);
};
// #endregion

// #region ***  Event Listeners - listenTo___            ***********
const listenToBtns = function () {
  const htmlSensorName = document.querySelector('.js-sensor_name');
  const btns = document.querySelectorAll('.js-btn');
  for (const btn of btns) {
    btn.addEventListener('click', function () {
      console.info('klik');
      currentDeviceId = btn.getAttribute('data-device_id');
      socketio.emit('F2B_current_device', { device_id: currentDeviceId });
      getHistory(currentDeviceId);
      htmlSensorName.innerHTML = btn.innerHTML;
    });
  }
};

const listenToSocket = function () {
  socketio.on('connect', function () {
    console.info('Verbonden met socket webserver');
  });

  socketio.on('B2F_data_changed', function (jsonObject) {
    if (jsonObject.device_id == currentDeviceId) {
      getHistory(currentDeviceId);
    }
  });
};
// #endregion

// #region ***  Init / DOMContentLoaded                  ***********
const init = function () {
  console.info('DOM geladen');
  getDevices();
  listenToSocket();
};

document.addEventListener('DOMContentLoaded', init);
// #endregion
