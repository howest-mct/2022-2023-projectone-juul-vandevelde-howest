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

const showLogin = function () {
  console.info('login succesvol :)');
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

  socketio.on('B2F_new_data', function (jsonObject) {
    if (jsonObject.device_id == currentDeviceId) {
      getHistory(currentDeviceId);
    }
  });
};

const listenToLogin = function () {
  console.info('login');
  document.querySelector('.js-login-btn').addEventListener('click', function () {
    const body = JSON.stringify({
      username: document.querySelector('.js-username').value,
      password: document.querySelector('.js-password').value,
    });
    const url = 'http://' + lanIP + `/api/v1/login/`;
    handleData(url, showLogin, showError, 'POST', body);
  });
};
// #endregion

// #region ***  Init / DOMContentLoaded                  ***********
const init = function () {
  console.info('DOM geladen');
  const htmlLogin = document.querySelector('.js-html-login');
  const htmlHistory = document.querySelector('.js-html-history');
  if (htmlLogin) {
    listenToLogin();
  } else if (htmlHistory) {
    getDevices();
  }
  listenToSocket();
};

document.addEventListener('DOMContentLoaded', init);
// #endregion
