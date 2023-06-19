const lanIP = `${window.location.hostname}:5000`;
const socketio = io(lanIP);
let currentDeviceId;
let current_color;
let chart;

// #region ***  DOM references                           ***********
// #endregion

// #region ***  Callback-Visualisation - show___         ***********
const showError = function () {
  console.error('Oeps er ging iets mis');
};

const showUserNames = function (jsonObject) {
  console.info(jsonObject);
  const dataHtml = document.querySelector('.js-users');
  let html = '';
  for (const user of jsonObject.users) {
    html += `
    <div class='c-user o-layout o-layout--justify-space-between o-layout--align-center'>
        <div class='c-user__name'>${user.first_name} ${user.last_name}</div>
        <button class='c-user__edit o-button-reset js-edit-btn' data-userid='${user.user_id}'>edit user</button>
    </div>
    `;
  }
  dataHtml.innerHTML = html;
  listenToUsers();
  document.querySelector('.js-add-user').addEventListener('click', function () {
    console.info('klik');
    document.body.innerHTML = `
    <div class="o-row--np">
        <div class="o-container">
            <div class="c-popup o-layout o-layout--align-center o-layout--justify-center">
                <section class="o-row c-popup__body c-card u-mb-clear">
                    <h2>Woops this page is still under construction</h2>
                        <button class="u-btn-fill o-button-reset js-cancel">
                            Return to Users page
                        </button>
                </section>
            </div>
        </div>
    </div>
    `;
  });
};

const showUserDetails = function (jsonObject) {
  console.info(jsonObject);
  let html = `
  <button class="c-return o-button-reset js-return">
        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
            <path d="M19 11H7.14l3.63-4.36a1 1 0 1 0-1.54-1.28l-5 6a1.19 1.19 0 0 0-.09.15c0 .05 0 .08-.07.13A1 1 0 0 0 4 12a1 1 0 0 0 .07.36c0 .05 0 .08.07.13a1.19 1.19 0 0 0 .09.15l5 6A1 1 0 0 0 10 19a1 1 0 0 0 .64-.23 1 1 0 0 0 .13-1.41L7.14 13H19a1 1 0 0 0 0-2z" />
        </svg>
    </button>
    <div class="c-input">
        <label for="firstName">First Name</label>
        <input type="text" id="firstName" class="c-input__field" value="${jsonObject[0].first_name}" disabled>
    </div>
    <div class="c-input">
        <label for="lastName">Last Name</label>
        <input type="text" id="lastName" class="c-input__field" value="${jsonObject[0].last_name}" disabled>
    </div>
    <div class="c-input">
        <label for="email">Email Address</label>
        <input type="email" id="email" class="c-input__field" value="${jsonObject[0].email}" disabled>
    </div>
    <div class="c-input u-pb-m">
        <label for="password">Password</label>
        <input type="password" id="password" class="c-input__field" value="                " disabled>
    </div>
  `;
  document.querySelector('.js-card').innerHTML = html;
  document.querySelector('.js-return').addEventListener('click', function () {
    location.reload();
  });
};

const wipeData = function () {
  if (chart) {
    chart.destroy();
  }
  document.querySelector('.js-chart').classList.add('hidden');
  document.querySelector('.js-chart__title').innerHTML = ``;
  document.querySelector('.js-history-table').innerHTML = ``;
};

const showHistory = function (jsonObject) {
  console.info(jsonObject);
  const historyTable = document.querySelector('.js-history-table');
  if (jsonObject.history[0].device_id == 3) {
    chartTitle = 'Mailbox inside temperature (today)';
    showLineGraph(jsonObject, chartTitle);
    let html = `<table class='o-row u-pb-m'>
    <tr>
      <th class='c-table__header'>When</th>
      <th class='c-table__header'>Temperature</th>
    </tr>`;
    for (const history of jsonObject.history.slice(0, 15)) {
      html += `<tr class='c-table__record'>
      <td class='c-table__data'>${formatDate(history.datetime)}</td>
      <td class='c-table__data u-pr-clear'>${parseFloat(history.value).toFixed(1)} °C</td>
    </tr>`;
    }
    html += `</table>`;
    historyTable.innerHTML = html;
  } else if (jsonObject.history[0].device_id == 4 || jsonObject.history[0].device_id == 5) {
    chartTitle = 'Deliveries per Day';
    showBarGraph_1(jsonObject, chartTitle);
    let html = `<table class='o-row u-pb-m'>
    <tr>
      <th class='c-table__header'>Day</th>
      <th class='c-table__header'>Delivery Amount</th>
    </tr>`;
    for (const history of jsonObject.history.reverse()) {
      html += `<tr class='c-table__record'>
      <td class='c-table__data'>${formatDate(history.date).split(',')[0].trim()}</td>
      <td class='c-table__data u-pr-clear'>${history.deliveries}</td>
    </tr>`;
    }
    html += `</table>`;
    historyTable.innerHTML = html;
  } else if (jsonObject.history[0].device_id == 10) {
    let html = `<table class='o-row u-pb-m'>
    <tr>
      <th class='c-table__header'>When</th>
      <th class='c-table__header'>Color</th>
    </tr>`;
    for (const history of jsonObject.history) {
      const color = history.value;
      history.value = `<div class='o-layout o-layout--align-center'><div class="c-table__data--color js-table__data--color-card" data-color="${color}"></div><div class='c-table__data--color-hex js-table__data--color-hex'>${color}</div></div>`;

      html += `<tr class='c-table__record'>
      <td class='c-table__data'>${formatDate(history.datetime)}</td>
      <td class='c-table__data u-pr-clear'>${history.value}</td>
    </tr>`;
    }

    html += `</table>`;
    historyTable.innerHTML = html;

    const colorCards = document.querySelectorAll('.js-table__data--color-card');
    if (colorCards) {
      for (const colorCard of colorCards) {
        colorCard.style.backgroundColor = `${colorCard.getAttribute('data-color')}`;
      }
    }
  } else {
    chartTitle = 'Unlock frequency by user';
    showBarGraph_2(jsonObject, chartTitle);
    let html = `<table class='o-row u-pb-m'>
    <tr>
      <th class='c-table__header'>User</th>
      <th class='c-table__header'>Total Unlock Amount</th>
    </tr>`;
    for (const history of jsonObject.history) {
      html += `<tr class='c-table__record'>
      <td class='c-table__data'>${history.first_name}</td>
      <td class='c-table__data u-pr-clear'>${history.counter}</td>
    </tr>`;
    }
    html += `</table>`;
    historyTable.innerHTML = html;
  }
};

const showLogin = function (jsonObject) {
  // console.info(jsonObject);
  if (jsonObject.login_status == 1) {
    // console.info('login succes');
    localStorage.setItem('login', 1);
    localStorage.setItem('user', jsonObject.user_id);
    if (jsonObject.admin == 1) {
      localStorage.setItem('admin', 1);
    }
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

const showTimeline = function (jsonObject) {
  let html = '';
  for (const notification of jsonObject.timeline) {
    if (notification.device_id == 3) {
      html += `
      <li class="c-timeline__item">
      <div class="c-timeline__icon c-timeline__icon--warning">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
              <path d="M12 22a5 5 0 0 1-3-9V5a3 3 0 0 1 3-3 3 3 0 0 1 3 3v8a5 5 0 0 1-3 9zm0-18a1 1 0 0 0-1 1v8.54a1 1 0 0 1-.5.87A3 3 0 0 0 9 17a3 3 0 0 0 6 0 3 3 0 0 0-1.5-2.59 1 1 0 0 1-.5-.87V5a.93.93 0 0 0-.29-.69A1 1 0 0 0 12 4z" />
          </svg>
      </div>
      <div class="c-timeline__body">
          <time class="c-timeline__time u-color-text-lighter">${formatDate(notification.datetime)}</time>
          <p class="c-timeline__action">High temperature! <strong>Avoid heat-sensitive</strong> items in mailbox.</p>
      </div>
  </li>
    `;
    } else if (notification.device_id == 4) {
      html += `
    <li class="c-timeline__item">
        <div class="c-timeline__icon c-timeline__icon--colored">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                <path d="M20.66 7.26c0-.07-.1-.14-.15-.21l-.09-.1a2.5 2.5 0 0 0-.86-.68l-6.4-3a2.7 2.7 0 0 0-2.26 0l-6.4 3a2.6 2.6 0 0 0-.86.68L3.52 7a1 1 0 0 0-.15.2A2.39 2.39 0 0 0 3 8.46v7.06a2.49 2.49 0 0 0 1.46 2.26l6.4 3a2.7 2.7 0 0 0 2.27 0l6.4-3A2.49 2.49 0 0 0 21 15.54V8.46a2.39 2.39 0 0 0-.34-1.2zm-8.95-2.2a.73.73 0 0 1 .58 0l5.33 2.48L12 10.15 6.38 7.54zM5.3 16a.47.47 0 0 1-.3-.43V9.1l6 2.79v6.72zm13.39 0L13 18.61v-6.72l6-2.79v6.44a.48.48 0 0 1-.31.46z" />
            </svg>
        </div>
        <div class="c-timeline__body">
            <time class="c-timeline__time u-color-text-lighter">${formatDate(notification.datetime)}</time>
            <p class="c-timeline__action">You have received <strong>a parcel</strong></p>
        </div>
    </li>
    `;
    } else if (notification.device_id == 5) {
      html += `
      <li class="c-timeline__item">
      <div class="c-timeline__icon c-timeline__icon--colored">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
              <path d="M19 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-.67 2L12 10.75 5.67 6zM19 18H5a1 1 0 0 1-1-1V7.25l7.4 5.55a1 1 0 0 0 .6.2 1 1 0 0 0 .6-.2L20 7.25V17a1 1 0 0 1-1 1z" />
          </svg>
      </div>
      <div class="c-timeline__body">
          <time class="c-timeline__time u-color-text-lighter">${formatDate(notification.datetime)}</time>
          <p class="c-timeline__action">You have received <strong>a letter</strong></p>
      </div>
  </li>
    `;
    } else if (notification.device_id == 9) {
      html += `
      <li class="c-timeline__item">
      <div class="c-timeline__icon c-timeline__icon--colored">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
              <path d="M17 8h-7V6a2 2 0 0 1 4 0 1 1 0 0 0 2 0 4 4 0 0 0-8 0v2H7a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3zm1 11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1z" />
              <path d="M12 12a3 3 0 1 0 3 3 3 3 0 0 0-3-3zm0 4a1 1 0 1 1 1-1 1 1 0 0 1-1 1z" />
          </svg>
      </div>
      <div class="c-timeline__body">
          <time class="c-timeline__time u-color-text-lighter">${formatDate(notification.datetime)}</time>
          <p class="c-timeline__action">Mailbox was opened by <strong>${notification.value}</strong></p>
      </div>
  </li>
    `;
    }
  }
  document.querySelector('.js-timeline').innerHTML = html;
};

const showData = function (graph) {
  const historyBody = document.querySelector('.js-history-text');
  historyBody.innerHTML = ``;
  wipeData();

  if (graph == 'unlock') {
    getUnlockHistory();
  } else if (graph == 'mail') {
    getMailHistory();
  } else if (graph == 'temp') {
    getHistoryToday(3);
  } else if (graph == 'color') {
    getHistory(10);
  }
};

const showLineGraph = function (jsonObject, chartTitle) {
  let converted_labels = [];
  let converted_data = [];
  for (const history of jsonObject.history) {
    converted_labels.push(formatDate(history.datetime).replace('Today, ', ''));
    converted_data.push(parseFloat(history.value).toFixed(2));
  }
  console.info(converted_data, converted_labels);
  document.querySelector('.js-chart__title').innerHTML = `<h3 class="o-row--xs">${chartTitle}</h3>`;
  drawLineChart(converted_labels, converted_data);
};

const showBarGraph_1 = function (jsonObject, chartTitle) {
  let converted_labels = [];
  let converted_data = [];
  for (const history of jsonObject.history) {
    converted_labels.push(formatDate(history.date).split(',')[0].trim());
    converted_data.push(parseInt(history.deliveries));
  }
  console.info(converted_data, converted_labels);
  document.querySelector('.js-chart__title').innerHTML = `<h3 class="o-row--xs">${chartTitle}</h3>`;
  drawBarChart(converted_labels, converted_data);
};

const showBarGraph_2 = function (jsonObject, chartTitle) {
  let converted_labels = [];
  let converted_data = [];
  for (const history of jsonObject.history) {
    converted_labels.push(history.first_name);
    converted_data.push(parseInt(history.counter));
  }
  console.info(converted_data, converted_labels);
  document.querySelector('.js-chart__title').innerHTML = `<h3 class="o-row--xs">${chartTitle}</h3>`;
  drawBarChart(converted_labels, converted_data);
};

const showMailStatus = function (jsonObject) {
  if (jsonObject.mail_status == 1) {
    document.querySelector('.js-mail-status').innerHTML = "You've got Mail!";
    document.querySelector('.js-mail-status-text').innerHTML = 'Knock-knock 👀! Your mailbox has a surprise waiting for you!';
  } else if (jsonObject.mail_status == 0) {
    document.querySelector('.js-mail-status').innerHTML = 'No mail today!';
    document.querySelector('.js-mail-status-text').innerHTML = 'No mail, no worries! Relax and enjoy the day. 🤗';
  }
};

// #region ***  Callback-No Visualisation - callback___  ***********
const setCurrentColor = function (jsonObject) {
  current_color = jsonObject.current_color.value;
  console.info(current_color);
};

const formatDate = function (inputDate) {
  const today = new Date();
  const date = new Date(inputDate);

  const isToday = today.getUTCFullYear() === date.getUTCFullYear() && today.getUTCMonth() === date.getUTCMonth() && today.getUTCDate() === date.getUTCDate();

  if (isToday) {
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();

    const isNow = hours === today.getUTCHours() + 2 && minutes === today.getUTCMinutes();

    if (isNow) {
      return 'Now';
    } else {
      return `Today, ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  }

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const isYesterday = yesterday.getUTCFullYear() === date.getUTCFullYear() && yesterday.getUTCMonth() === date.getUTCMonth() && yesterday.getUTCDate() === date.getUTCDate();

  if (isYesterday) {
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    return `Yesterday, ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const month = monthNames[date.getUTCMonth()];
  const day = date.getUTCDate();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();

  const formattedDate = `${month} ${day}, ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  return formattedDate;
};

const callbackSetColor = function () {
  console.info('Color added :)');
  socketio.emit('F2B_color_changed');
};

const drawLineChart = function (labels, data) {
  document.querySelector('.js-chart').classList.remove('hidden');
  console.info(data);
  var options = {
    series: [
      {
        name: 'Inside Temperature',
        data: data.reverse(),
      },
    ],
    chart: {
      type: 'line',
      height: 350,
    },
    stroke: {
      curve: 'smooth',
      colors: ['#7950F2'],
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      hover: {
        sizeOffset: 4,
      },
    },
    xaxis: {
      categories: labels.reverse(),
      style: {
        fontSize: '10px',
      },
      tickAmount: 8,
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return value.toFixed(2) + '°C';
        },
      },
    },
  };

  chart = new ApexCharts(document.querySelector('#chart'), options);
  chart.render();
};

const drawBarChart = function (labels, data) {
  document.querySelector('.js-chart').classList.remove('hidden');
  console.info(data);
  var options = {
    series: [
      {
        name: 'Items Delivered',
        data: data,
      },
    ],
    chart: {
      type: 'bar',
      height: 350,
    },
    colors: ['#7950F2'],
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: labels,
    },
    yaxis: {
      categories: labels,
      title: {
        text: 'Amount',
        style: {
          fontSize: '14px',
          fontWeight: 'bold',
        },
      },
    },
  };

  chart = new ApexCharts(document.querySelector('#chart'), options);
  chart.render();
};
// #endregion

// #region ***  Data Access - get___                     ***********
const getUsers = function () {
  const url = 'http://' + lanIP + `/api/v1/user-names/`;
  handleData(url, showUserNames, showError);
};

const getUserDetails = function (user_id) {
  console.info(user_id);
  const url = 'http://' + lanIP + `/api/v1/user-names/${user_id}/`;
  handleData(url, showUserDetails, showError);
};

const getDevices = function () {
  const url = 'http://' + lanIP + `/api/v1/devices/`;
  handleData(url, showDevices, showError);
};

const getHistory = function (device_id) {
  const url = 'http://' + lanIP + `/api/v1/history/${device_id}/`;
  handleData(url, showHistory, showError);
};

const getHistoryToday = function (device_id) {
  const url = 'http://' + lanIP + `/api/v1/history/today/${device_id}/`;
  handleData(url, showHistory, showError);
};

const getUnlockHistory = function () {
  const url = 'http://' + lanIP + `/api/v1/unlock-history/`;
  handleData(url, showHistory, showError);
};

const getMailHistory = function () {
  const url = 'http://' + lanIP + `/api/v1/mail-history/`;
  handleData(url, showHistory, showError);
};

const getMailStatus = function () {
  const url = 'http://' + lanIP + `/api/v1/mail-contents/`;
  handleData(url, showMailStatus, showError);
};

const getDoorStatus = function () {
  const url = 'http://' + lanIP + `/api/v1/history/recent/6/`;
  handleData(url, showDoorStatus, showError);
};

const getCurrentColor = function () {
  const url = 'http://' + lanIP + `/api/v1/current-color/`;
  handleData(url, setCurrentColor, showError);
};

const getTimeline = function () {
  const url = 'http://' + lanIP + `/api/v1/timeline/`;
  handleData(url, showTimeline, showError);
};
// #endregion

// #region ***  Event Listeners - listenTo___            ***********
const listenToSelector = function () {
  const selector = document.querySelector('.js-selector');
  selector.addEventListener('change', function () {
    const graph = selector.value;
    showData(graph);
  });
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
    if (document.querySelector('.js-html-dashboard')) {
      getDoorStatus();
      getTimeline();
    }
  });

  socketio.on('B2F_mail_status_changed', function () {
    if (document.querySelector('.js-html-dashboard')) {
      getMailStatus();
      getTimeline();
    }
  });
};

const listenToUsers = function () {
  const editBtns = document.querySelectorAll('.js-edit-btn');
  for (const editBtn of editBtns) {
    editBtn.addEventListener('click', function () {
      getUserDetails(editBtn.getAttribute('data-userid'));
    });
  }
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
  document.querySelector('.js-shutdown-btn').addEventListener('click', function () {
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
  document.querySelector('.js-change-lighting-btn').addEventListener('click', function () {
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
    if (localStorage.getItem('admin') == 1) {
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
    } else {
      location.reload();
    }
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
      if (localStorage.getItem('admin') == 1) {
        document.body.innerHTML = `
      <div class='c-shutdown'>
      <svg class='spin-animation' xmlns="http://www.w3.org/2000/svg" height="64" viewBox="0 0 24 24" width="64"><rect width="24" height="24" transform="rotate(180 12 12)" opacity="0"/><path d="M12 2a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0V3a1 1 0 0 0-1-1z"/><path d="M21 11h-2a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2z"/><path d="M6 12a1 1 0 0 0-1-1H3a1 1 0 0 0 0 2h2a1 1 0 0 0 1-1z"/><path d="M6.22 5a1 1 0 0 0-1.39 1.47l1.44 1.39a1 1 0 0 0 .73.28 1 1 0 0 0 .72-.31 1 1 0 0 0 0-1.41z"/><path d="M17 8.14a1 1 0 0 0 .69-.28l1.44-1.39A1 1 0 0 0 17.78 5l-1.44 1.42a1 1 0 0 0 0 1.41 1 1 0 0 0 .66.31z"/><path d="M12 18a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0v-2a1 1 0 0 0-1-1z"/><path d="M17.73 16.14a1 1 0 0 0-1.39 1.44L17.78 19a1 1 0 0 0 .69.28 1 1 0 0 0 .72-.3 1 1 0 0 0 0-1.42z"/><path d="M6.27 16.14l-1.44 1.39a1 1 0 0 0 0 1.42 1 1 0 0 0 .72.3 1 1 0 0 0 .67-.25l1.44-1.39a1 1 0 0 0-1.39-1.44z"/></svg>
      <h2 class='u-mb-clear'>Shutting down</h2>
      </div>`;
      }
      if (localStorage.getItem('admin') == 1) {
        socketio.emit('F2B_shutdown');
        setTimeout(function () {
          location.reload();
        }, 5000);
      } else {
        location.reload();
      }
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
      localStorage.removeItem('user');
      localStorage.removeItem('admin');
      location.reload();
    }
  });
};

const listenToUnlock = function () {
  const mailBtn = document.querySelector('.js-mail-btn');
  mailBtn.addEventListener('click', function () {
    console.info('opening door');
    socketio.emit('F2B_open_door', { user_id: localStorage.getItem('user') });
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
    if (localStorage.getItem('admin') == 1) {
      document.querySelector('.js-user-page').classList.remove('hidden');
      const shutdowns = document.querySelectorAll('.js-shutdown');
      for (const shutdown of shutdowns) {
        shutdown.classList.remove('hidden');
      }
    } else if (localStorage.getItem('admin') != 1) {
      document.querySelector('.js-user-page').classList.add('hidden');
      const shutdowns = document.querySelectorAll('.js-shutdown');
      for (const shutdown of shutdowns) {
        shutdown.classList.add('hidden');
      }
      document.querySelector('.c-nav__action--logout').style.bottom = '1.5rem';
      document.querySelector('.c-nav__action--color').style.bottom = '4.5rem';
    }
    listenToLogout();
    listenToMobileMenu();
    getMailStatus();
    getDoorStatus();
    getTimeline();
    listenToUnlock();
  } else if (htmlHistory) {
    if (localStorage.getItem('login') == 1) {
      htmlHistory.classList.remove('hidden');
    } else if (localStorage.getItem('login') != 1) {
      window.location.href = 'login.html';
      htmlHistory.classList.add('hidden');
    }
    if (localStorage.getItem('admin') == 1) {
      document.querySelector('.js-user-page').classList.remove('hidden');
      const shutdowns = document.querySelectorAll('.js-shutdown');
      for (const shutdown of shutdowns) {
        shutdown.classList.remove('hidden');
      }
    } else if (localStorage.getItem('admin') != 1) {
      document.querySelector('.js-user-page').classList.add('hidden');
      const shutdowns = document.querySelectorAll('.js-shutdown');
      for (const shutdown of shutdowns) {
        shutdown.classList.add('hidden');
      }
      document.querySelector('.c-nav__action--logout').style.bottom = '1.5rem';
      document.querySelector('.c-nav__action--color').style.bottom = '4.5rem';
    }
    listenToLogout();
    listenToMobileMenu();
    listenToSelector();
    // getDevices();
  } else if (htmlUsers) {
    if (localStorage.getItem('login') == 1) {
      htmlUsers.classList.remove('hidden');
    } else if (localStorage.getItem('login') != 1) {
      window.location.href = 'login.html';
      htmlUsers.classList.add('hidden');
    }
    if (localStorage.getItem('admin') == 1) {
      const shutdowns = document.querySelectorAll('.js-shutdown');
      for (const shutdown of shutdowns) {
        shutdown.classList.remove('hidden');
      }
      htmlUsers.classList.remove('hidden');
    } else if (localStorage.getItem('admin') != 1) {
      const shutdowns = document.querySelectorAll('.js-shutdown');
      for (const shutdown of shutdowns) {
        shutdown.classList.add('hidden');
      }
      window.location.href = 'index.html';
      document.querySelector('.c-nav__action--logout').style.bottom = '1.5rem';
      document.querySelector('.c-nav__action--color').style.bottom = '4.5rem';
    }
    listenToLogout();
    listenToMobileMenu();
    getUsers();
  }
  listenToSocket();
};

document.addEventListener('DOMContentLoaded', init);
// #endregion
