'use strict';

const elems  = ['snc', 's24'];
const prefs  = ['54', '55', '56', '57'];
const months = ['11', '12', '01', '02', '03'];
const years  = ['2021', '2020', '2019'];

let sta = {};
let val = { snc: {}, s24: {}, acc: {} };
let avg = { snc: {}, s24: {}, acc: {} };

let markers = {};

let yval;

const today = new Date(new Date() - 24*60*60*1000);
const y4today = today.getFullYear() + '';
let m2today = (today.getMonth() + 1) + '';
m2today = (m2today.length == 1 ? '0' : '') + m2today;
let d2today = today.getDate() + '';
d2today = (d2today.length == 1 ? '0' : '') + d2today;
const ymdtoday = '' + y4today + m2today + d2today;


const get = function(path, func) {
  return new Promise(function(resolve, reject) {
    const req = new XMLHttpRequest();
    req.open('get', path, true);
    req.onloadend = function() {
      if (req.status == 404) { resolve(); }
      func(req.responseText, path);
      resolve();
    }; // req.onload
    req.onerror = function() {
      console.error(req.statusText);
      resolve();
    };
    req.send(null);
  });
};


const parseSta = function(res, path) {
  const rows = res.trim().split('\r\n');
  const tmp = [];

  for (let i = 0; i < rows.length; i++) {
    if (rows[i] == '') { break; }
    tmp[i] = rows[i].split(',');
  }

  for (let j = 1; j < tmp[0].length; j++) {
    sta[tmp[0][j]] = {
      pref: tmp[1][j],
      jma:  tmp[2][j],
      amd:  tmp[3][j],
      lat:  tmp[4][j] - 0,
      lon:  tmp[5][j] - 0
    };
    avg.s24[tmp[0][j]] = {};
    avg.snc[tmp[0][j]] = {};
    avg.acc[tmp[0][j]] = {};
  }
};


const parseAvg = function(res, path) {
  const elem = path.split('.')[1].split('_')[1];

  const rows = res.trim().split('\r\n');
  const tmp = [];

  for (let i = 0; i < rows.length; i++) {
    if (rows[i] == '') { break; }
    tmp[i] = rows[i].split(',');
    if (i == 0) continue;
    const ymd = tmp[i][0];
    for (let j = 1; j < tmp[0].length; j++) {
      const staname = tmp[0][j];
      avg[elem][staname][ymd] = tmp[i][j] - 0;
    }
  }

  if (elem == 's24') {
    for (let j = 1; j < tmp[0].length; j++) {
      const staname = tmp[0][j];
      let ymdprev;
      for (let i = 1; i < tmp.length; i++) {
        const ymd = tmp[i][0];
        avg['acc'][staname][ymd] = (avg['acc'][staname][ymdprev] - 0 || 0) + (tmp[i][j] - 0 || 0);
        ymdprev = ymd;
      }
    }
  }
};


const parseHtml = function(res, path) {
  const elem = path.split('.')[0].split('_')[1];

  const doc = new DOMParser().parseFromString(res, 'text/html');
  const ths = doc.querySelectorAll('#tablefix1 th');
  const trs = doc.querySelectorAll('#tablefix1 tr');

  if (val[elem][yval] === undefined) val[elem][yval] = {};
  
  for (let j = 1; j < trs.length; j++) {
    const tds = trs[j].querySelectorAll('td');

    const y4 = path.split('.')[0].slice(-6, -2);
    const m2 = path.split('.')[0].slice(-2);
    const d2 = (tds[0].innerHTML.length == 1 ? '0' : '') + tds[0].innerHTML;
    const ymdhtml = y4 + m2 + d2;

    if (ymdtoday - 0 < ymdhtml - 0) break;

    const y4obj = (m2 - 0) > 10 ? '2019' : '2020';
    const ymdobj = y4obj + m2 + d2;

    for (let i = 1; i < tds.length; i++) {
      const sstation = ths[i].innerHTML.replace(/\*/, '');
      if (val[elem][yval][sstation] === undefined) val[elem][yval][sstation] = {};

      const td = tds[i].innerHTML.replace(/[\s\*\)\]#]+/, '');
      let solo = 'X';

      if (td === '--') {
        solo = 0;
      } else if (!isNaN(td) && td !== '') {
        solo = td - 0;
      }

      const ymdprev = Object.keys(val[elem][yval][sstation]).slice(-1)[0] || '00000000';
      if (ymdprev.substring(4) == '0228' && ymdobj.substring(4) == '0301') val[elem][yval][sstation]['20200229'] = null;

      val[elem][yval][sstation][ymdobj] = solo;

      if (elem == 's24') {
        if (val['acc'][yval] === undefined) val['acc'][yval] = {};
        if (val['acc'][yval][sstation] === undefined) val['acc'][yval][sstation] = {};
        const ymdprev = Object.keys(val['acc'][yval][sstation]).slice(-1)[0] || '00000000';

        val['acc'][yval][sstation][ymdobj] = (val['acc'][yval][sstation][ymdprev] || 0) + (solo - 0 || 0);
        if (ymdprev.substring(4) == '0228' && ymdobj.substring(4) == '0301') val['acc'][yval][sstation]['20200229'] = null;
      }
    }
  }
};


const set_point = function(point) {

  ['snc', 's24', 'acc'].forEach(function(elem) {

    const title = (
      elem == 's24' ? '日降雪' :
      elem == 'snc' ? '日最深積雪' :
      elem == 'acc' ? '累積降雪' : ''
    );
    
    const dates = ['x'].concat(Object.keys(avg[elem]['新潟']));
    const avgs = ['平年値'].concat(Object.values(avg[elem][point]));
    const c3data = [dates, avgs];

    const y4titles = [];
    Object.keys(val[elem]).forEach(function(y4) {
      y4titles.push(y4);
      c3data.push([y4].concat(Object.values(val[elem][y4][point])));
    });

    const datelabel = dates.filter(function(x) { return x.slice(-2) == '01'; });
    const datemin = dates[1];
    const datemax = dates.slice(-1)[0];

    const c3obj = {
      bindto: '#chart_' + elem,
      data: {
        x: 'x',
        type: 'line',
        xFormat: '%Y%m%d',
        columns: c3data,
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: '%m/%d',
            values: datelabel
          },
          min: datemin,
          max: datemax,
          padding: { top: 0, bottom: 0 }
        },
        y: {
          min: 0,
          padding: { top: 15, bottom: 0 }
        }
      },
      legend: {
        position: 'inset',
        inset: {
          anchor: 'top-left',
          x: 10,
          y: 40,
          step: 5
        }
      },
      grid: {
        y: { show: true },
      },
      tooltip: {
        format: {
          value: function (value, ratio, id, index) { return value + ' cm' + (elem == 's24' ? '/24h' : ''); }
        }
      }
    };
    
    const return_colorobj = function(hue) {
      const obj = { '平年値': 'hsla(0, 0%, 0%, 0.1)' };
      for (let y = 0; y < y4titles.length; y++) {
        obj[y4titles[y]] = 'hsla(' + (hue + 10 * y) + ', 100%, ' + (60 + 10 * y) + '%, ' + (1.0 - 0.2 * y) + ')';
      }
      return obj;
    };
    
    const hue = (
      elem == 's24' ? 240 :
      elem == 'snc' ? 200 :
      elem == 'acc' ? 240 : ''
    );
    c3obj.data.colors = return_colorobj(hue);

    if (elem == 's24') {
      //c3obj.data.columns.splice(1, 1);
      c3obj.data.type = 'bar';
      c3obj.bar = { width: 2 };
    }

    const chart = c3.generate(c3obj);

    document.querySelector('#subtext_' + elem).innerHTML = '<span style="color: hsl(' + hue + ', 100%, 60%)">' + point + ' ' + title + '</span>';

  });

  document.querySelector('#pointname').innerHTML = ('<strong>' + point + '</strong>'
    + ' <a href="https://www.jma.go.jp/bosai/amedas/#area_type=offices&format=table1h&area_code=' + prefJa2Jis(sta[point].pref) + '0000&amdno=' + sta[point].jma + '" target="_blank">&#x1f310;アメダス最新</a>'
    + ' <a href="http://www.data.jma.go.jp/obd/stats/etrn/view/daily_' + (sta[point].amd.length == 5 ? 's' : 'a') + '1.php?prec_no=' + prefJa2Jma(sta[point].pref) + '&block_no=' + sta[point].amd + '&year=' + y4today + '&month=' + m2today + '&day=&view=p1" target="_blank">&#x1f310;アメダス過去</a>'
  );

  Object.keys(sta).forEach(function(key) {
    markers[key]._icon.classList.remove('active');
  });
  markers[point]._icon.classList.add('active');

};


const prefJa2Jis = function(str) {
  switch (str) {
    case '新潟'  : return '15';
    case '富山'  : return '16';
    case '石川'  : return '17';
    case '福井'  : return '18';
  }
}; // prefJa2Jis


const prefJa2Jma = function(str) {
  switch (str) {
    case '新潟'  : return '54';
    case '富山'  : return '55';
    case '石川'  : return '56';
    case '福井'  : return '57';
  }
}; // prefJa2Jma


// show usage dialog
const usage = function() { document.querySelector('#usagewrap').style.display = 'block'; };


// generic dialog closer
const cancel = function(id) { document.querySelector(id).style.display = 'none'; };


window.onload = async function() {

  const map = L.map('map_container', {
    center: [37.0, 137.6],
    maxBounds: [[50, 130],[30, 150]],
    zoom:     8,
    minZoom:  7,
    maxZoom:  9,
    keyboard: false,
  });

  new L.control.scale({
    maxWidth: 200,
    position: 'bottomright',
    imperial: false,
  }).addTo(map);

  const gsiurl = "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>";

  const gsishiro = L.tileLayer(
    'http://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png',
    { attribution: gsiurl }
  );

  gsishiro.addTo(map);

  const path = 'sjisToUtf8.php?path=csv/daily/sta.csv';
  await get(path, parseSta);

  for (let e = 0; e < elems.length; e++) {

    const elem = elems[e];
    const path = 'sjisToUtf8.php?path=csv/daily/average_' + elem + '.csv';
    await get(path, parseAvg);

    const markerlayer = new L.LayerGroup();

    Object.keys(sta).forEach(function(key) {
      markers[key] = new L.marker(
        [sta[key].lat, sta[key].lon],
        { icon: L.divIcon({ html: '<span class="icon">' + key + '</span>' }) }
      ).addTo(markerlayer).on('click', function(e) { set_point(e.target.point);
    });
      markers[key].point = key;
    });

    markerlayer.addTo(map);

  } // elem

  for (let e = 0; e < elems.length; e++) {

    const elem = elems[e];

    for (let y = 0; y < years.length; y++) {

      for (let p = 0; p < prefs.length; p++) {

        const pref = prefs[p];

        for (let m = 0; m < months.length; m++) {

          let y4 = years[y];
          let m2 = months[m];
          if (m2 - 0 > 10) y4 = (years[y] - 1) + '';

          //yval = years[y];
          yval = (years[y] - 1) + '-' + years[y].substring(2);

          const path = 'csv/daily/jmadaily_' + elem + '_' + pref + '_' + y4 + m2 + '.html?' + new Date().getTime();
          await get(path, parseHtml);

        } // month

      } // pref

    } // year

  } // elems

  document.querySelector('#usage'      ).addEventListener('mouseup', function() { usage(); });
  document.querySelector('#usage_close').addEventListener('mouseup', function() { cancel('#usagewrap'); });

  // click outside of dialogs to close them
  document.querySelectorAll('.popwrap').forEach(function(e) {
    const id = '#' + e.getAttribute('id');
    document.querySelector(id).addEventListener('click', function(e) {
      document.querySelector(id).style.display = 'none';
    });
  });

  document.querySelectorAll('.poparea').forEach(function(e) {
    e.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  });

  set_point('新潟');
  document.querySelector('#load').style.display = 'none';

};
