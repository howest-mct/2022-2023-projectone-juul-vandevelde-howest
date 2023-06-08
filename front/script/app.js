const lanIP = `${window.location.hostname}:5000`;
const socketio = io(lanIP);
let currentDeviceId;

// #region ***  DOM references                           ***********
// #endregion

// #region ***  Callback-Visualisation - show___         ***********
const showError = function () {
  console.error('Oeps er ging iets mis');
};

const showUsers = function (jsonObject) {
  const dataHtml = document.querySelector('.js-data');
  let html = '';
  for (const user of jsonObject.users) {
    html += `
    <tr>
        <td>${user.first_name}</td>
        <td>${user.last_name}</td>
        <td>${user.email}</td>
        <td>${user.password}</td>
        <td>${user.admin}</td>
        <td>${user.rfid_id}</td>
    </tr>
    `;
  }
  dataHtml.innerHTML = html;
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

const showLogin = function (jsonObject) {
  console.info(jsonObject);
  if (jsonObject.login_status == 1) {
    console.info('login succes');
    localStorage.setItem('login', 1);
    window.location.href = 'index.html';
  } else if (jsonObject.login_status == 0) {
    console.info('login failed');
  }
};

const showDoorStatus = function (jsonObject) {
  const mailBtn = document.querySelector('.js-mail-btn');
  if (+jsonObject.recent_history.value == 1) {
    console.info('door is opened');
    mailBtn.disabled = true;
    mailBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
    <path d="M17 8h-7V6a2 2 0 0 1 4 0 1 1 0 0 0 2 0 4 4 0 0 0-8 0v2H7a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3zm1 11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1z" />
    <path d="M12 12a3 3 0 1 0 3 3 3 3 0 0 0-3-3zm0 4a1 1 0 1 1 1-1 1 1 0 0 1-1 1z" />
    </svg>
    Door unlocked`;
  } else if (+jsonObject.recent_history.value == 0) {
    console.info('door is closed');
    mailBtn.disabled = false;
    mailBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><rect width="24" height="24" opacity="0"/><path d="M17 8h-1V6.11a4 4 0 1 0-8 0V8H7a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3zm-7-1.89A2.06 2.06 0 0 1 12 4a2.06 2.06 0 0 1 2 2.11V8h-4zM18 19a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1z"/><path d="M12 12a3 3 0 1 0 3 3 3 3 0 0 0-3-3zm0 4a1 1 0 1 1 1-1 1 1 0 0 1-1 1z"/></svg>
    Unlock door`;
  }
};
// #endregion

// #region ***  Callback-No Visualisation - callback___  ***********
// #endregion

// #region ***  Data Access - get___                     ***********
const getUsers = function () {
  const url = 'http://' + lanIP + `/api/v1/users/`;
  handleData(url, showUsers, showError);
};

const getDevices = function () {
  const url = 'http://' + lanIP + `/api/v1/devices/`;
  handleData(url, showDevices, showError);
};

const getHistory = function (device_id) {
  const url = 'http://' + lanIP + `/api/v1/history/${device_id}/`;
  handleData(url, showHistory, showError);
};

const getDoorStatus = function () {
  const url = 'http://' + lanIP + `/api/v1/history/recent/6/`;
  handleData(url, showDoorStatus, showError);
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

  socketio.on('B2F_door_changed', function () {
    getDoorStatus();
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

const listenToLogout = function () {
  document.querySelector('.js-logout-btn').addEventListener('click', function () {
    localStorage.removeItem('login');
    location.reload();
  });
};

const listenToMobileMenu = function () {
  document.querySelectorAll('.js-toggle-menu').forEach(function (el) {
    el.addEventListener('click', function () {
      document.body.classList.toggle('has-mobile-nav');
    });
  });
};

const listenToUnlock = function () {
  const mailBtn = document.querySelector('.js-mail-btn');
  mailBtn.addEventListener('click', function () {
    console.info('opening door');
    socketio.emit('F2B_open_door');
    getDoorStatus();
  });
};
// #endregion

// #region ***  Init / DOMContentLoaded                  ***********
const init = function () {
  console.info('DOM geladen');
  const htmlLogin = document.querySelector('.js-html-login');
  const htmlDashboard = document.querySelector('.js-html-dashboard');
  const htmlHistory = document.querySelector('.js-html-history');
  const htmlUsers = document.querySelector('.js-html-users');
  if (htmlLogin) {
    if (localStorage.getItem('login') == 1) {
      window.location.href = 'index.html';
    }
    listenToLogin();
  } else if (htmlDashboard) {
    if (localStorage.getItem('login') == 1) {
      htmlDashboard.classList.remove('hidden');
    } else if (localStorage.getItem('login') != 1) {
      window.location.href = 'login.html';
      htmlDashboard.classList.add('hidden');
    }
    listenToLogout();
    listenToMobileMenu();
    getDoorStatus();
    listenToUnlock();
  } else if (htmlHistory) {
    if (localStorage.getItem('login') == 1) {
      htmlHistory.classList.remove('hidden');
    } else if (localStorage.getItem('login') != 1) {
      window.location.href = 'login.html';
      htmlHistory.classList.add('hidden');
    }
    listenToLogout();
    listenToMobileMenu();
    getDevices();
  } else if (htmlUsers) {
    if (localStorage.getItem('login') == 1) {
      htmlUsers.classList.remove('hidden');
    } else if (localStorage.getItem('login') != 1) {
      window.location.href = 'login.html';
      htmlUsers.classList.add('hidden');
    }
    listenToLogout();
    listenToMobileMenu();
    getUsers();
  }
  listenToSocket();
};

document.addEventListener('DOMContentLoaded', init);
// #endregion
