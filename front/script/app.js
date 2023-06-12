const lanIP = `${window.location.hostname}:5000`;
const socketio = io(lanIP);
let currentDeviceId;
let current_color;

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

// const showNewestHistory = function (jsonObject) {
//   console.info(jsonObject);
//   const dataHtml = document.querySelector('.js-data');
//   const html = `<tr>
//     <td>${jsonObject.history.datetime}</td>
//     <td>${jsonObject.history.value}</td>
//   </tr>`;
//   dataHtml.innerHTML += html;
// };

const showLogin = function (jsonObject) {
  // console.info(jsonObject);
  if (jsonObject.login_status == 1) {
    // console.info('login succes');
    localStorage.setItem('login', 1);
    window.location.href = 'index.html';
  } else if (jsonObject.login_status == 0) {
    console.info('login failed');
    const fields = document.querySelectorAll('.js-login-field');
    for (const field of fields) {
      field.classList.add('wrong-password');
      document.querySelector('.js-wrong-password').classList.remove('hidden');
    }
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
const setCurrentColor = function (jsonObject) {
  current_color = jsonObject.current_color.value;
};

const callbackSetColor = function () {
  console.info("Color added :)")
  socketio.emit('F2B_color_changed');
}
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

const getCurrentColor = function () {
  const url = 'http://' + lanIP + `/api/v1/current-color/`;
  handleData(url, setCurrentColor, showError);
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
  const fields = document.querySelectorAll('.js-login-field');
  for (const field of fields) {
    field.onkeypress = function (e) {
      if (!e) e = window.event;
      var keyCode = e.code || e.key;
      if (keyCode == 'Enter') {
        document.querySelector('.js-login-btn').click();
      }
    };
  }
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
    document.body.innerHTML = `
    <div class="o-row--np">
        <div class="o-container">
            <div class="c-popup o-layout o-layout--align-center o-layout--justify-center">
                <section class="o-row c-popup__body c-card u-mb-clear">
                    <h2>Are you sure you want to log out?</h2>
                    <div class="c-popup__btns o-layout">
                        <button class="u-btn-outline o-button-reset js-cancel">Cancel</button>
                        <button class="u-btn-fill o-button-reset js-logout-confirm">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><rect width="24" height="24" transform="rotate(90 12 12)" opacity="0"/><path d="M7 6a1 1 0 0 0 0-2H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h2a1 1 0 0 0 0-2H6V6z"/><path d="M20.82 11.42l-2.82-4a1 1 0 0 0-1.39-.24 1 1 0 0 0-.24 1.4L18.09 11H10a1 1 0 0 0 0 2h8l-1.8 2.4a1 1 0 0 0 .2 1.4 1 1 0 0 0 .6.2 1 1 0 0 0 .8-.4l3-4a1 1 0 0 0 .02-1.18z"/></svg>
                            Log out
                        </button>
                    </div>
                </section>
            </div>
        </div>
    </div>
    `;
  });
};

const listenToMobileMenu = function () {
  document.querySelectorAll('.js-toggle-menu').forEach(function (el) {
    el.addEventListener('click', function () {
      document.body.classList.toggle('has-mobile-nav');
      getCurrentColor();
    });
  });

  document.querySelector('.js-shutdown').addEventListener('click', function () {
    document.body.innerHTML = `
    <div class="o-row--np">
        <div class="o-container">
            <div class="c-popup o-layout o-layout--align-center o-layout--justify-center">
                <section class="o-row c-popup__body c-card u-mb-clear">
                    <h2>Are you sure you want to shut down the device?</h2>
                    <div class="c-popup__btns o-layout">
                        <button class="u-btn-outline o-button-reset js-cancel">Cancel</button>
                        <button class="u-btn-fill o-button-reset js-shutdown-confirm">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                                <rect width="24" height="24" opacity="0" />
                                <path d="M12 13a1 1 0 0 0 1-1V2a1 1 0 0 0-2 0v10a1 1 0 0 0 1 1z" />
                                <path d="M16.59 3.11a1 1 0 0 0-.92 1.78 8 8 0 1 1-7.34 0 1 1 0 1 0-.92-1.78 10 10 0 1 0 9.18 0z" />
                            </svg>
                            Shut down
                        </button>
                    </div>
                </section>
            </div>
        </div>
    </div>
    `;
  });

  document.querySelector('.js-change-lighting').addEventListener('click', function () {
    document.body.innerHTML = `
    <div class="o-row--np">
        <div class="o-container">
            <div class="c-popup o-layout o-layout--align-center o-layout--justify-center">
                <section class="o-row c-popup__body c-card u-mb-clear">
                    <h2>Select a lighting color:</h2>
                    <div class="o-layout">
                        <input type="color" value="${current_color}" class="c-color-picker js-color-picker">
                    </div>
                    <div class="c-popup__btns o-layout">
                        <button class="u-btn-outline o-button-reset js-cancel">Cancel</button>
                        <button class="u-btn-fill o-button-reset js-color-confirm">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><rect width="24" height="24" opacity="0"/><path d="M19.54 5.08A10.61 10.61 0 0 0 11.91 2a10 10 0 0 0-.05 20 2.58 2.58 0 0 0 2.53-1.89 2.52 2.52 0 0 0-.57-2.28.5.5 0 0 1 .37-.83h1.65A6.15 6.15 0 0 0 22 11.33a8.48 8.48 0 0 0-2.46-6.25zM15.88 15h-1.65a2.49 2.49 0 0 0-1.87 4.15.49.49 0 0 1 .12.49c-.05.21-.28.34-.59.36a8 8 0 0 1-7.82-9.11A8.1 8.1 0 0 1 11.92 4H12a8.47 8.47 0 0 1 6.1 2.48 6.5 6.5 0 0 1 1.9 4.77A4.17 4.17 0 0 1 15.88 15z"/><circle cx="12" cy="6.5" r="1.5"/><path d="M15.25 7.2a1.5 1.5 0 1 0 2.05.55 1.5 1.5 0 0 0-2.05-.55z"/><path d="M8.75 7.2a1.5 1.5 0 1 0 .55 2.05 1.5 1.5 0 0 0-.55-2.05z"/><path d="M6.16 11.26a1.5 1.5 0 1 0 2.08.4 1.49 1.49 0 0 0-2.08-.4z"/></svg>
                            Pick Color
                        </button>
                    </div>
                </section>
            </div>
        </div>
    </div>
    `;
  });

  document.querySelector('.js-logout').addEventListener('click', function () {
    document.body.innerHTML = `
    <div class="o-row--np">
        <div class="o-container">
            <div class="c-popup o-layout o-layout--align-center o-layout--justify-center">
                <section class="o-row c-popup__body c-card u-mb-clear">
                    <h2>Are you sure you want to log out?</h2>
                    <div class="c-popup__btns o-layout">
                        <button class="u-btn-outline o-button-reset js-cancel">Cancel</button>
                        <button class="u-btn-fill o-button-reset js-logout-confirm">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><rect width="24" height="24" transform="rotate(90 12 12)" opacity="0"/><path d="M7 6a1 1 0 0 0 0-2H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h2a1 1 0 0 0 0-2H6V6z"/><path d="M20.82 11.42l-2.82-4a1 1 0 0 0-1.39-.24 1 1 0 0 0-.24 1.4L18.09 11H10a1 1 0 0 0 0 2h8l-1.8 2.4a1 1 0 0 0 .2 1.4 1 1 0 0 0 .6.2 1 1 0 0 0 .8-.4l3-4a1 1 0 0 0 .02-1.18z"/></svg>
                            Log out
                        </button>
                    </div>
                </section>
            </div>
        </div>
    </div>
    `;
  });

  document.body.addEventListener('click', function (event) {
    if (event.target.matches('.js-shutdown-confirm')) {
      document.body.innerHTML = `
    <div class='c-shutdown'>
    <svg class='spin-animation' xmlns="http://www.w3.org/2000/svg" height="64" viewBox="0 0 24 24" width="64"><rect width="24" height="24" transform="rotate(180 12 12)" opacity="0"/><path d="M12 2a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0V3a1 1 0 0 0-1-1z"/><path d="M21 11h-2a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2z"/><path d="M6 12a1 1 0 0 0-1-1H3a1 1 0 0 0 0 2h2a1 1 0 0 0 1-1z"/><path d="M6.22 5a1 1 0 0 0-1.39 1.47l1.44 1.39a1 1 0 0 0 .73.28 1 1 0 0 0 .72-.31 1 1 0 0 0 0-1.41z"/><path d="M17 8.14a1 1 0 0 0 .69-.28l1.44-1.39A1 1 0 0 0 17.78 5l-1.44 1.42a1 1 0 0 0 0 1.41 1 1 0 0 0 .66.31z"/><path d="M12 18a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0v-2a1 1 0 0 0-1-1z"/><path d="M17.73 16.14a1 1 0 0 0-1.39 1.44L17.78 19a1 1 0 0 0 .69.28 1 1 0 0 0 .72-.3 1 1 0 0 0 0-1.42z"/><path d="M6.27 16.14l-1.44 1.39a1 1 0 0 0 0 1.42 1 1 0 0 0 .72.3 1 1 0 0 0 .67-.25l1.44-1.39a1 1 0 0 0-1.39-1.44z"/></svg>
    <h2 class='u-mb-clear'>Shutting down</h2>
    </div>`;
      socketio.emit('F2B_shutdown');
      setTimeout(function () {
        location.reload();
      }, 5000);
    } else if (event.target.matches('.js-cancel')) {
      location.reload();
    } else if (event.target.matches('.js-color-confirm')) {
      current_color = document.querySelector('.js-color-picker').value;
      const url = 'http://' + lanIP + `/api/v1/change-color/`;
      const body = JSON.stringify({
        color_hex: current_color,
      });
      handleData(
        url,
        callbackSetColor,
        function () {
          console.error('Woops there went something wrong :(');
        },
        'PUT',
        body
      );
      document.body.innerHTML = `
      <div class="o-row--np">
      <div class="o-container">
      <div class="c-popup o-layout o-layout--align-center o-layout--justify-center">
      <section class="o-row c-popup__body c-card u-mb-clear">
      <h2>Congratulations! You've successfully set a new color.</h2>
      <div class="c-picked-color js-picked-color"></div>
      <div class="c-popup__btns o-layout">
      <button class="u-btn-fill o-button-reset js-return-to-dashboard">
      Return to Dashboard
      </button>
      </div>
      </section>
      </div>
      </div>
      </div>
      `;
      document.querySelector('.js-picked-color').style.backgroundColor = current_color;
    } else if (event.target.matches('.js-return-to-dashboard')) {
      location.reload();
    } else if (event.target.matches('.js-logout-confirm')) {
      localStorage.removeItem('login');
      location.reload();
    }
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
