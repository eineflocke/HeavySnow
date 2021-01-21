'use strict';

//////////////////////////////////
// global constants for setting //
//////////////////////////////////

///////////////////
// table columns //
///////////////////

const header_sta = {
  区分: {
    key:     'cls',
    classes: 'td-cls',
  },
  標高: {
    key:     'alt',
    classes: 'td-alt',
  },
  府県: {
    key:     'prf',
    classes: 'td-prf',
  },
  市町村: { 
    key:     'ctv',
    classes: 'td-ctv',
  },
  情報発表名: {
    key:     'nam',
    classes: 'td-nam',
  }
};

const header_val = {
  積雪: {
    sub:     ['実況', 'あ厳', 'あ特'],
    key:     ['snc', 'atg', 'ats'],
    classes: ['td-snc leftline', 'td-atx td-atg leftline', 'td-atx td-ats'],
  },
  気温: {
    sub:     ['実況'],
    key:     ['tmp'],
    classes: ['td-tmp leftline'],
  },
  降雪深: {
    sub:     ['S1', 'S3', 'S6', 'S12', 'S24'],
    key:     ['s01', 's03', 's06', 's12', 's24'],
    classes: ['td-snn td-s01 leftline', 'td-snn td-s03', 'td-snn td-s06', 'td-snn td-s12', 'td-snn td-s24'],
  },
  差: {
    sub:     ['D24'],
    key:     ['d24'],
    classes: ['td-dnn td-d24 leftline'],
  },
  あと何cm: {
    sub:     ['注', '警', '短', '記'],
    key:     ['atc', 'atw', 'att', 'atk'],
    classes: ['td-atx td-atc leftline', 'td-atx td-atw', 'td-atx td-att', 'td-atx td-atk'],
  }
};

//////////
// area //
//////////

const arealist0 = {
  all: {
    name: '全県',
    pref: ['青森', '岩手', '新潟', '富山', '石川', '福井', '栃木', '群馬', '長野', '東京', '神奈川', '山梨'],
    latlon: [38.2, 138.5], zoom: 7
  },
  hok: {
    name: '北陸',
    pref: ['新潟', '富山', '石川', '福井'],
    latlon: [37.0, 137.6], zoom: 8
  },
  ngt: {
    name: '新潟',
    pref: ['新潟'],
    latlon: [37.6, 138.7], zoom: 9
  },
  tym: {
    name: '富山',
    pref: ['富山'],
    latlon: [36.7, 137.3], zoom: 10
  },
  isk: {
    name: '石川',
    pref: ['石川'],
    latlon: [36.8, 136.8], zoom: 9
  },
  fki: {
    name: '福井',
    pref: ['福井'],
    latlon: [35.8, 136.1], zoom: 9
  },
  aomiwt: {
    name: '青森・岩手',
    pref: ['青森', '岩手'],
    latlon: [40.2, 141.0], zoom: 8
  },
  aom: {
    name: '青森',
    pref: ['青森'],
    latlon: [40.9, 140.8], zoom: 9
  },
  iwt: {
    name: '岩手',
    pref: ['岩手'],
    latlon: [39.6, 141.4], zoom: 9
  },
  tcggnm: {
    name: '栃木・群馬',
    pref: ['栃木', '群馬'],
    latlon: [36.6, 139.3], zoom: 9
  },
  ngn: {
    name: '長野',
    pref: ['長野'],
    latlon: [36.1, 138.1], zoom: 9
  }
};

const defaultArea = {
  all:      'all',
  hokuriku: 'hok',
  tohoku:   'aomiwt',
};

const areaarray = {
  all:      ['all', 'hok', 'ngt', 'tym', 'isk', 'fki', 'aomiwt', 'aom', 'iwt', 'tcggnm', 'ngn'],
  hokuriku: ['hok', 'ngt', 'tym', 'isk', 'fki'],
  tohoku:   ['aomiwt', 'aom', 'iwt'],
};

const alertTarget = {
  all:      ['atw', 'att', 'atk'],
  hokuriku: ['att', 'atk'],
  tohoku:   ['atw'],
};

///////////////////
// organizations //
///////////////////

const orgalist = {
  general: {
    all:  '全機関',
    jma:  '気象庁',
    mlit: '整備局',
    ken:  '府県',
  },
  hokuriku: {
    info: '情報対象',
  },
  tohoku: {
    atom: '原子力',
  }
};

/////////////////////////////
// thresholds for coloring //
/////////////////////////////

const thresholds = {
  snc: [0, 1, 10, 20, 40, 60, 80, 100, 150, 200],
  s01: [0, 1, 2, 3, 4, 5, 6, 8, 10, 16],
  s03: [0, 1, 2, 5, 10, 15, 20, 25, 30, 40],
  s06: [0, 1, 2, 5, 10, 15, 20, 25, 30, 40],
  s12: [0, 1, 4, 10, 20, 30, 40, 50, 60, 80],
  s24: [0, 1, 4, 10, 20, 30, 40, 50, 60, 80],
  d03: [0, 1, 2, 5, 10, 15, 20, 25, 30, 40],
  d06: [0, 1, 2, 5, 10, 15, 20, 25, 30, 40],
  d12: [0, 1, 4, 10, 20, 30, 40, 50, 60, 80],
  d24: [0, 1, 4, 10, 20, 30, 40, 50, 60, 80],
  tmp: [-999, -16, -8, -4, -2, 0, 2, 4, 8, 16],
  atg: [-999, -100, -80, -60, -40, -20, -10, 0, 0, 0],
  ats: [-999, -100, -80, -60, -40, -20, -10, 0, 0, 0],
  atc: [-999, -10,  -8,  -6, -4, -2, 0, 0, 0, 0],
  atw: [-999, -20, -15, -10, -5, -3, 0, 0, 0, 0],
  att: [-999, -20, -15, -10, -5, -3, 0, 0, 0, 0],
  atk: [-999, -15, -10,  -7, -5, -3, 0, 0, 0, 0],
}

///////////////////////
// path to resources //
///////////////////////

const prefix_temp = location.href.split('').reverse().join('');
const prefix_here = prefix_temp.slice(prefix_temp.indexOf('/')).split('').reverse().join('');

const prefix = {
  all:      prefix_here,
  hokuriku: prefix_here,
  tohoku:   'http://172.27.64.62/~jmanhm/SnowView/',
};

const filepath = {
  list: {
    all:      'csv/_list.txt',
    hokuriku: 'csv/_list.txt',
    tohoku:   'csv/_list.txt',
  },
  stations: {
    all:      'csv/stationplus.csv',
    hokuriku: 'csv/stationplus.csv',
    tohoku:   'csv/stationplus.csv',
  },
  values: {
    all:      'csv/all_',
    hokuriku: 'csv/hokuriku_',
    tohoku:   'csv/tohoku_',
  },
};

if (location.host == 'localhost' || location.host == '133.125.40.135') {
  const prefix_internet = 'http://133.125.40.135/SnowWS/';
  prefix.all      = prefix_internet;
  prefix.hokuriku = prefix_internet;
  prefix.tohoku   = prefix_internet;
}

/////////////////////
// other constants //
/////////////////////

const categoryName = {
  atc: '注意報',
  atw: '警報',
  att: '短時間',
  atk: '記録雪',
};

const className = {
  atg: ' bold',
  ats: ' tokkei',
  atc: ' chuiho',
  atw: ' keiho',
  att: ' joho',
  atk: ' joho',
};

const audio = document.querySelector('#audio');
audio.volume = 0.6;
audio.load();


//////////////////////
// global variables //
//////////////////////

let region;

let timelist;
let sta;
let val;
let ival = new Array();

let irowprev = -1;
let sortelemprev;
let isortupdown;
let alerttext;

let map;
let layerControl;
let jmatile;
let markerlayer;
let markers = new Array();
let legend;

let repeat;

const icols = {
  sta: {},
  val: {}
};


//////////////////////////
// some async functions //
//////////////////////////

const changeinit = async function(amount) {

  let ndest = timelist.indexOf(document.querySelector('#init').value) - amount;

  if (amount == 99) ndest = 0;

  if (ndest < 0 || timelist.length - 1 < ndest) {
    //alert('ﾅｲﾖｰ (available times: between ' + timelist[timelist.length - 1] + ' and ' + timelist[0] + ')');
    return false;
  }

  if (ndest == 0) {
    $('#renew').bootstrapToggle('on');
  } else {
    $('#renew').bootstrapToggle('off');
  }

  document.querySelector('#init').value = timelist[ndest];
  document.querySelector('#init_f').disabled = !!(ndest == 0);
  document.querySelector('#init_b').disabled = !!(ndest == timelist.length - 1);

  await get(prefix[region] + filepath.values[region] + document.querySelector('#init').value + '.csv', onload.values).catch(console.error);
  await redraw().catch(console.error);

}; // changeinit


const update = async function(islatest) {
  await get(prefix[region] + filepath.list[region], onload.list).catch(console.error);
  let amount = 0;
  if (islatest === undefined || islatest) amount = 99;
  await changeinit(amount);
}; // update


const redraw = async function(sortelem) {
  await draw_sheet(sortelem).catch(console.error);
  await draw_map()          .catch(console.error);
}; // redraw


//////////////
// get data //
//////////////

const onload = new Object();

onload.list = function(res) {
  timelist = res.trim().replace(/[\r\n]/g, '').split(',');
  if (document.querySelector('#init').value == '') document.querySelector('#init').value = timelist[0];
  autoload();
};

onload.stations = function(res) {
  const rows = res.trim().split('\r\n');
  sta = [];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i] == '') { break; }
    sta[i] = rows[i].split(',');
  }

  icols.sta.key = sta[0].indexOf('検索キー');
  icols.sta.prf = sta[0].indexOf('府県');
  icols.sta.org = sta[0].indexOf('所属');
  icols.sta.ctv = sta[0].indexOf('市町村');
  icols.sta.cls = sta[0].indexOf('区分');
  icols.sta.alt = sta[0].indexOf('標高');
  icols.sta.obs = sta[0].indexOf('観測所名');
  icols.sta.nam = sta[0].indexOf('情報発表名');
  icols.sta.yom = sta[0].indexOf('読み');
  icols.sta.lat = sta[0].indexOf('緯度');
  icols.sta.lon = sta[0].indexOf('経度');
  icols.sta.atg = sta[0].indexOf('積雪厳重');
  icols.sta.ats = sta[0].indexOf('積雪特警');
  icols.sta.atc = {
    hour: sta[0].indexOf('注意報期間'),
    val:  sta[0].indexOf('注意報基準')
  }
  icols.sta.atw = {
    hour: sta[0].indexOf('警報期間'),
    val:  sta[0].indexOf('警報基準')
  };
  icols.sta.att = {
    hour: sta[0].indexOf('短時間期間'),
    val:  sta[0].indexOf('短時間基準')
  };
  icols.sta.atk = {
    hour: sta[0].indexOf('記録雪期間'),
    val:  sta[0].indexOf('記録雪基準')
  };
};

onload.values = function(res) {
  const rows = res.trim().split('\r\n');
  val = [];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i] == '') { break; }
    val[i] = rows[i].split(',');
  }

  icols.val.prf = val[0].indexOf('府県');
  icols.val.nam = val[0].indexOf('情報発表名');
  icols.val.s03 = val[1].indexOf('S3');
  icols.val.s06 = val[1].indexOf('S6');
  icols.val.s12 = val[1].indexOf('S12');
  icols.val.s24 = val[1].indexOf('S24');
  icols.val.d03 = val[1].indexOf('D3');
  icols.val.d06 = val[1].indexOf('D6');
  icols.val.d12 = val[1].indexOf('D12');
  icols.val.d24 = val[1].indexOf('D24');
  icols.val.s01 = val[0].indexOf('S1') + 24;
  icols.val.snc = val[0].indexOf('積雪') + 24;
  icols.val.tmp = val[0].indexOf('気温') + 24;
  icols.val.ymd = val[0].indexOf('最新');
  icols.val.atg = val[0].length;
  icols.val.ats = val[0].length + 1;
  icols.val.atc = val[0].length + 2;
  icols.val.atw = val[0].length + 3;
  icols.val.att = val[0].length + 4;
  icols.val.atk = val[0].length + 5;

  let names_sta = new Array();
  let names_val = new Array();
  for (let i = 0; i < sta.length; i++) names_sta.push(sta[i][icols.sta.nam]);
  for (let i = 0; i < val.length; i++) names_val.push(val[i][icols.val.nam]);
  ival = [];
  for (let i = 0; i < sta.length; i++) ival[i] = names_val.indexOf(names_sta[i]);
};

const get = function(path, func) {
  return new Promise(function(resolve, reject) {
    document.querySelector('#initial').innerHTML += '<br />getting ' + path + ' ...';
    const path2 = 'sjisToUtf8.php?path=' + encodeURIComponent(path + '?_=' + new Date().getTime());
    const req = new XMLHttpRequest();
    req.open('get', path2, true);
    req.send(null);
    /*
    req.open('post', 'sjisToUtf8.php', true);
    req.setRequestHeader('Content-Type', 'application/json');
    const data = JSON.stringify({
      path: path + '?_=' + new Date().getTime()
    });
    console.log(data);
    req.send(data);
    */
    req.onload = function() {
      func(req.responseText);
      document.querySelector('#initial').innerHTML += ' done';
      resolve();
    }; // req.onload
    req.onerror = function() {
      document.querySelector('#initial').innerHTML += ' failed';
      reject(req.statusText);
    };
  });
};


////////////////////
// draw functions //
////////////////////

const draw_sheet = function(sortelem) {

  return new Promise(function(resolve, reject) {
    document.querySelector('#initial').innerHTML += '<br />drawing sheet...';

    const init = document.querySelector('#init').value;
    const area = document.querySelector('#area').value;
    const orga = document.querySelector('#orga').value;

    ///////////////////////////
    // generate table header //
    ///////////////////////////

    let insert = '';

    insert += '<tr>';

    Object.keys(header_sta).forEach(function(key) {
      const h = header_sta[key];
      let solo = key;
      if (h.key == 'nam') {
        solo += '<span class="up">▲</span><span class="down">▼</span>';
        solo += '</th><th rowspan="2" class="td-ico"><span>取得元</span>';
      }
      insert += '<th rowspan="2" class="' + h.classes + '">' + solo + '</th>';
    });

    Object.keys(header_val).forEach(function(key) {
      const h = header_val[key];
      let solo = key;
      insert += '<th colspan="' + h.sub.length + '">' + solo + '</th>';
    });

    if (document.querySelector('#toggle_minicharts').checked) {
      insert += '<th rowspan="2" class="td-cht leftline">24h推移<br /><span class="col-snc">―: 積雪深</span> <span class="col-s01">■: S1</span></th>';
    }

    insert += '</tr>';
    insert += '<tr>';

    Object.keys(header_val).forEach(function(key) {
      const h = header_val[key];
      for (let i = 0; i < h.sub.length; i++) {
        let solo = h.sub[i];
        solo += '<span class="up">▲</span><span class="down">▼</span>';
        insert += '<th class="' + h.classes[i] + '">' + solo + '</th>';
      }
    });

    insert += '</tr>';

    document.querySelector('#fixheader').innerHTML = insert;

    // add event for sort
    document.querySelector('#fixheader th.td-nam').addEventListener('mouseup', function() { redraw('nam'); });

    Object.keys(header_val).forEach(function(key) {
      const h = header_val[key];
      h.key.forEach(function(hh) {
        const query = document.querySelector('#fixheader th.td-' + hh);
        if (query === null) return true;
        query.addEventListener('mouseup', function() { redraw(hh); });
      });
    });

    //////////////////////
    // sort preparation //
    //////////////////////

    if        (sortelem === undefined && sortelemprev === undefined) {
      // default
      isortupdown = 0;
    } else if (sortelem === undefined && sortelemprev !== undefined) {
      // same as previous sort
      sortelem = sortelemprev;
    } else if (sortelem !== undefined && sortelemprev == sortelem) {
      // same elem, inverted order
      sortelem = sortelemprev;
      isortupdown += 1;
      if (isortupdown >= 3) {
        // reset to default when 3rd change
        sortelem = undefined;
        isortupdown = 0;
      }
    } else {
      // first sort for this elem
      isortupdown = 1;
    }

    const issortdownfirst = (
      sortelem == 'nam' ||
      (sortelem || '').indexOf('at') == 0 ||
      sortelem == 'tmp'
    );
    const sortupdown = [0, -1, 1].map(x => x * (issortdownfirst ? -1 : 1))[isortupdown];

    ////////////////////
    // generate table //
    ////////////////////

    let insert_rows = new Array(sta.length - 2);

    let johoobjs = new Array();

    // generate value rows
    for (let irow = 2; irow < sta.length; irow++) {

      if (!judge_row(irow)) continue;

      let insert_row = '';
      insert_row += '<tr id="no' + irow + '">';

      Object.keys(header_sta).forEach(function(key) {
        const h = header_sta[key];
        let solo = sta[irow][icols.sta[h.key]];

        let tdclasses = h.classes;
        tdclasses += ' set_point';

        if (key == '区分') {
          const judge = judge_joho(irow);
          tdclasses += (
            (judge == 4) ? ' colR' :
            (judge == 3) ? ' colG' :
            (judge == 2) ? ' colRlight' :
            (judge == 1) ? ' colGlight' : ' colK'
          );
        } else if (key == '標高') {
          solo += '<span class="td-alt-unit">m</span>';
        } else if (key == '情報発表名') {
          const solo1 = solo.replace(/\(.+/g, '');
          solo = '<span class="td-nam-main">' + solo1 + '</span>';
          let imgfile = '';
          if        (sta[irow][icols.sta.org] ==   '1') {
            imgfile = 'lib/img/logo_jma.png';
          } else if (sta[irow][icols.sta.org] ==   '3') {
            imgfile = 'lib/img/logo_mlit.png';
          } else if (sta[irow][icols.sta.org] ==  '10') {
            imgfile = 'lib/img/logo_pref_' + prefJa2En(sta[irow][icols.sta.prf]) + '.png';
          } else if (sta[irow][icols.sta.org] == '100') {
            imgfile = 'lib/img/logo_atom.png';
          }
          solo += '<img src="' + imgfile + '" class="td-nam-sub" />';
          if (sta[irow][icols.sta.obs] !== '') solo += '<br /><span class="td-nam-obs">（' + sta[irow][icols.sta.obs] + '）</span>';
          solo += '</td><td class="td-ico"><a href="' + return_url(irow) + '" target="_blank">&#x1f310;</a>';
        }

        insert_row += '<td class="' + tdclasses + '">' + solo + '</td>';
      });

      Object.keys(header_val).forEach(function(key) {
        const h = header_val[key];
        for (let i = 0; i < h.sub.length; i++) {
          let solo = val[ival[irow]][icols.val[h.key[i]]];

          let tdclassplus = '';

          if (h.sub[i].indexOf('あ') == 0) {

            solo = val[ival[irow]][icols.val['snc']];
            let solonum  = split_flag(solo)[0];
            const s_val = sta[irow][icols.sta[h.key[i]]];
            if (s_val === '') {
              solonum = '-';
            } else if (isNaN(solonum)) {
              solonum = 'X';
            } else {
              solonum = s_val - solonum;
              if (solonum <= 0) {
                tdclassplus = className[h.key[i]];
              } else {
                tdclassplus = ' lv0';
              }
            }
            solo = solonum;
            val[ival[irow]][icols.val[h.key[i]]] = solonum;

          } else if (key == 'あと何cm') {

            let solonum  = '';
            let soloflag = '';
            const s_val = sta[irow][icols.sta[h.key[i]].val];
            if (s_val === '') {
              solonum = '-';
            } else {
              const hour = sta[irow][icols.sta[h.key[i]].hour] + '';
              const key = 's' + (hour.length == 1 ? '0' : '') + hour;
              solo = val[ival[irow]][icols.val[key]];
              solonum = split_flag(solo)[0];
              if (isNaN(solonum)) {
                solonum = 'X';
              } else {
                solonum = s_val - solonum;
                if (solonum <= 0) {
                  tdclassplus = className[h.key[i]];
                } else {
                  //tdclassplus = ' ' + return_level(solonum, h.key[i]);
                  tdclassplus = ' lv0';
                }
                soloflag = '<span class="td-atx-sub"><br />/' + hour + 'h</span>';
              }
            }
            solo = solonum + soloflag;
            val[ival[irow]][icols.val[h.key[i]]] = solonum;
          } else {

            const atx = ['atk', 'att', 'atw', 'atc'];

            for (let j = 0; j < 4; j++) {
              if (tdclassplus != '') break;
              if (!judge_limit(irow, h.sub[i], solo, atx[j])) continue;
              tdclassplus = className[atx[j]];
              if (alertTarget[region].indexOf(atx[j]) < 0) continue;
              const johoobj = {
                row: irow,
                val: solo,
                category: categoryName[atx[j]],
                hour:  sta[irow][icols.sta[atx[j]].hour],
                limit: sta[irow][icols.sta[atx[j]].val]
              };
              johoobjs.push(johoobj);
              break;
            }

          }

          if (tdclassplus == '') tdclassplus = ' ' + (key == '気温' ? 't' : '') + return_level(solo, h.key[i]);

          insert_row += '<td class="' + h.classes[i] + tdclassplus + '">' + solo + '</td>';
        }
      });

      if (document.querySelector('#toggle_minicharts').checked) {
        insert_row += '<td class="chart_container leftline set_point"><div id="chart1_' + ival[irow] + '"></div><div id="chart2_' + ival[irow] + '"></div></td>';
      }

      insert_row += '</tr>';

      let sortval = ival[irow];

      if (sortelem !== undefined) {
        if        (sortelem == 'nam') {
          sortval = sta[irow][icols.sta.yom] || (sortupdown == 1 ? 'ﾝ' : 'ｱ');
        } else if (sortelem.indexOf('at') == 0) {
          sortval = val[ival[irow]][icols.val[sortelem]];
          if (isNaN(sortval)) sortval = 999 * sortupdown;
        } else {
          sortval = split_flag(val[ival[irow]][icols.val[sortelem]])[0];
          if (sortval === '' || isNaN(sortval)) sortval = 999 * sortupdown;
        }
      }

      insert_rows[ival[irow] - 2] = new Object();
      insert_rows[ival[irow] - 2].str     = insert_row;
      insert_rows[ival[irow] - 2].sortval = sortval;

    } // for irow

    //////////////////
    // execute sort //
    //////////////////

    document.querySelectorAll('.up, .down').forEach(function(e) {
      e.classList.remove('updown-selected');
    });

    if        (sortupdown ==  1) {
      document.querySelector('th.td-' + sortelem + ' .up').classList.add('updown-selected');
    } else if (sortupdown == -1) {
      document.querySelector('th.td-' + sortelem + ' .down').classList.add('updown-selected');
    }

    if        (sortelem == 'nam') {
      insert_rows.sort(function(a, b) {
        return sortupdown * ((a.sortval > b.sortval) ? 1 : -1);
      });
    } else if (sortelem !== undefined) {
      insert_rows.sort(function(a, b) {
        return sortupdown * (a.sortval - b.sortval);
      });
    }

    sortelemprev = sortelem;

    /////////////////
    // write table //
    /////////////////

    let irow2 = -1;

    while (irow2 < sta.length) {
      irow2++;
      if (insert_rows[irow2] === undefined) continue;
      insert += insert_rows[irow2].str;
    }

    document.querySelector('#sheet').innerHTML = insert;

    /////////////////////
    // make alert text //
    /////////////////////

    alerttext = '';
    for (let i = 0; i < johoobjs.length; i++) {
      const irow = johoobjs[i]['row'];
      alerttext += '<tr>';
      alerttext += '<td>' + johoobjs[i]['category'] + ' S' + johoobjs[i]['hour'] + '</td>';
      alerttext += '<td>' + sta[irow][icols.sta.prf] + ' ' + sta[irow][icols.sta.cls] + '</td>';
      alerttext += '<td>' + sta[irow][icols.sta.nam] + '</td>';
      alerttext += '<td>S' + johoobjs[i]['hour'] + '実況 ' + johoobjs[i]['val'] + 'cm</td>';
      alerttext += '</tr>';
    }

    document.querySelector('#choka').innerHTML = alerttext;

    if (alerttext !== '' && init == timelist[0]) {
      button1();
      document.querySelector('#alerttitle').classList.add('alertanim');
      document.querySelector('#alerttitle').setAttribute('title', '報知基準を満たしている地点があります。');
    } else {
      document.querySelector('#alerttitle').classList.remove('alertanim');
      document.querySelector('#alerttitle').removeAttribute('title');
    }

    if (alerttext === '') button3();

    /////////////////////
    // draw minicharts //
    /////////////////////

    if (document.querySelector('#toggle_minicharts').checked) {
      for (let irow = 2; irow < sta.length; irow++) {

        if (!judge_row(irow)) continue;

        const labelarray24 = val[0].slice(icols.val.s01 - 23, icols.val.s01 + 1);
        const labelarray25 = val[0].slice(icols.val.s01 - 24, icols.val.s01 + 1);

        const data1 = make_chartist_data('chart-snc', val[ival[irow]].slice(icols.val.snc - 24, icols.val.snc + 1), labelarray25);
        const data2 = make_chartist_data('chart-s01', val[ival[irow]].slice(icols.val.s01 - 23, icols.val.s01 + 1), labelarray24);

        const config_common = {
          low: 0,
          axisX: {
            offset: 0,
            showGrid: false,
            showLabel: false,
          }, axisY: {
            offset: 0,
            showGrid: false,
            showLabel: false,
          },
          chartPadding: {
            top: 6,
            bottom: 2,
            left: 0,
            right: 0
          },
          fullWidth: true,
          showPoint: false,
          lineSmooth: false,
          showArea: true,
        };

        let config1 = JSON.parse(JSON.stringify(config_common));
        let config2 = JSON.parse(JSON.stringify(config_common));

        const data1max = search_chartist_maxmin(data1)[0];
        const data2max = search_chartist_maxmin(data2)[0];
        config1.high = Math.max( 8, data1max);
        config2.high = Math.max( 8, data2max);

        new Chartist.Line('#chart1_' + ival[irow], data1, config1);
        new Chartist.Bar ('#chart2_' + ival[irow], data2, config2);
      }
    }

    ////////////////////
    // postprocessing //
    ////////////////////

    //$('[data-toggle="tooltip"]').tooltip();

    for (let irow = 2; irow < sta.length; irow++) {
      if (!judge_row(irow)) continue;
      document.querySelectorAll('tr#no' + irow + ' .set_point').forEach(function(e){
        e.addEventListener('mouseup', function() {
          set_point(irow, true);
        });
      });
    }

    window.addEventListener('scroll', function() {
      document.querySelector('#fixheader').style.left = (-1 * window.scrollX) + 'px';
    }, false);

    document.querySelector('#fixheader').style.width = document.querySelector('#sheet').clientWidth + 'px';

    set_window();

    document.querySelector('#initial').innerHTML += ' done';

    resolve();

  });

}; // draw_sheet


const draw_map = function() {
  return new Promise(function(resolve, reject) {
    if (document.querySelector('#right_pane').style.display == 'none') resolve();

    document.querySelector('#initial').innerHTML += '<br />drawing map...';

    const init = document.querySelector('#init').value;
    const area = document.querySelector('#area').value;
    const elem = document.querySelector('#elem').value;
    const orga = document.querySelector('#orga').value;

    if (map === undefined) {
      map = L.map('map_container', {
        center: [37, 138],
        maxBounds: [[50, 130],[30, 150]],
        zoom:     7,
        minZoom:  6,
        maxZoom: 16,
        keyboard: false,
      });

      L.control.scale({
        maxWidth: 200,
        position: 'bottomright',
        imperial: false,
      }).addTo(map);

      const gsiurl = "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>";

      const gsishiro = L.tileLayer(
        'http://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png',
        { attribution: gsiurl }
      );
      const gsi = L.tileLayer(
        'http://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
        { attribution: gsiurl, opacity: 0.4 }
      );
      const gsipale = L.tileLayer(
        'http://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
        { attribution: gsiurl, opacity: 0.4 }
      );
      const hyokou = L.tileLayer(
        'http://cyberjapandata.gsi.go.jp/xyz/relief/{z}/{x}/{y}.png',
        { attribution: gsiurl, opacity: 0.4 }
      );
      const foto = L.tileLayer(
        'http://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg',
        { attribution: gsiurl }
      );

      const baseMaps = {
        "白地図": gsishiro,
        "地理院地図": gsi,
        "淡色地図": gsipale,
        "色別標高図": hyokou,
        "全国最新写真": foto
      };

      layerControl = L.control.layers(baseMaps).addTo(map);
      gsishiro.addTo(map);

      map.on('click', function() { set_point(0); });
    }

    if (irowprev == -1) map.setView(arealist0[area].latlon, arealist0[area].zoom);

    ///////////////////////////////////
    // remove elements before adding //
    ///////////////////////////////////

    if (jmatile !== undefined) {
      jmatile.removeFrom(layerControl);
      jmatile.removeFrom(map);
      jmatile = undefined;
    }

    if (markerlayer !== undefined) {
      map.removeLayer(markerlayer);
      markerlayer = undefined;
    }

    if (legend !== undefined) {
      map.removeControl(legend);
      legend = undefined;
    }

    /////////////////
    // add jmatile //
    /////////////////

    const jmaelem = (
      (elem == 'snc') ? 'snowd' :
      (elem == 's03') ? 'snowf03h' :
      (elem == 's06') ? 'snowf06h' :
      (elem == 's12') ? 'snowf12h' :
      (elem == 's24') ? 'snowf24h' : null
    );

    const initnow_date = new Date();
    const initjst_date = Time.timeJST(init + '00');

    if (jmaelem !== null && initnow_date - initjst_date < 1000 * 60 * 60 * 24) {

      const initutc = Time.strUTC(initjst_date, '%Y%m%d%H%M') + '00';
      jmatile = L.tileLayer(
        'http://www.data.jma.go.jp/fcd/yoho/snow/jp/data/snow/' + initutc + '/none/' + initutc + '/surf/' + jmaelem + '/{z}/{x}/{y}.png',
        { opacity: document.querySelector('#opacity').value }
      );
      layerControl.addOverlay(jmatile, '雪タイル');
      map.addLayer(jmatile);

      const insert = '<br /><img src="http://www.data.jma.go.jp/fcd/yoho/snow/jp/images/legend_normal_' + jmaelem + '.png" />';
      document.querySelector('#tile_legend').innerHTML = insert;

      document.querySelector('#opacity_control').style.display = 'inline';
      document.querySelector('#tile_legend'    ).style.display = 'block';

    } else {

      document.querySelector('#opacity_control').style.display = 'none';
      document.querySelector('#tile_legend'    ).style.display = 'none';

    }

    /////////////////////
    // add markerlayer //
    /////////////////////

    let thin = '';
    let unit = 'cm';
    if (elem == 'tmp') {
      thin = 't';
      unit = '℃';
    }

    const elemQuery = document.querySelector('#elem');
    const elemIndex = elemQuery.selectedIndex;
    const elemText = elemQuery.options[elemIndex].text;

    markerlayer = new L.LayerGroup();

    for (let irow = 2; irow < sta.length; irow++) {
      if (!judge_row(irow)) continue;

      let solo = val[ival[irow]][icols.val[elem]];
      if (solo === undefined || solo === '-' || (elem == 'tmp' && solo == 'X')) continue;

      markers[irow] = new L.marker(
        [sta[irow][icols.sta.lat], sta[irow][icols.sta.lon]], 
        { icon: L.divIcon({
          html: '<span class="' + thin + 'M' + return_level(solo, elem) + '">' + solo + '</span>'
        })
        }
      ).bindTooltip(
        '<strong>' + sta[irow][icols.sta.nam] + '</strong>',
        { direction: 'top' }
      ).bindPopup((
        '<strong>' + sta[irow][icols.sta.nam] + '</strong>'
        + '<br /><span class="tooltiptext-small">積雪深</span> <strong>' + val[ival[irow]][icols.val.snc] + '</strong> <span class="tooltiptext-small">cm</span>'
        + (
          elem == 'snc' ?
          '' : 
          '<br /><span class="tooltiptext-small">' + elemText + '</span> <strong>' + val[ival[irow]][icols.val[elem]] + '</strong> <span class="tooltiptext-small">' + unit + '</span>'
        )
      )).addTo(markerlayer).on('click', function(e) { set_point(e.target.irow, true); });

      markers[irow].irow = irow;
    } // for irow

    markerlayer.addTo(map);

    ////////////////
    // add legend //
    ////////////////

    const bararray = ['snc', 's01', 's03s06d03d06', 's12s24d12d24', 'tmp'];
    let bar;
    bararray.forEach(function(b) { if (b.indexOf(elem) >= 0) bar = b; });

    if (bar !== undefined) {
      legend = L.control({ position: 'bottomright' });
      legend.onAdd = function() {
        let img = L.DomUtil.create('img');
        img.src = 'lib/img/bar_' + bar + '.png';
        return img;
      };
      legend.addTo(map);
    }

    ////////////////////
    // postprocessing //
    ////////////////////

    if (irowprev == -1) irowprev = 0;

    if (irowprev > 0) set_point(irowprev, false);

    makeurl();

    map.invalidateSize();

    document.querySelector('#initial').innerHTML += ' done';

    resolve();

  });

}; // draw_map


const set_point = function(irow, ismove) {

  if (ismove === undefined) ismove = false;

  if (document.querySelector('#sheet tr#no' + irow) === null) irow = Math.min(0, irow);

  if (document.querySelector('#right_pane').style.display != 'block') irow = Math.min(0, irow);

  irowprev = irow;

  Array.prototype.slice.call(document.querySelectorAll('#sheet tr')).forEach(function(e) {
    e.classList.remove('point_selected_tr');
  });
  Array.prototype.slice.call(document.querySelectorAll('#sheet tr td')).forEach(function(e) {
    e.classList.remove('point_selected_td');
  });

  if (irow <= 0) {
    document.querySelector('#map_container'  ).style.height  = '100%';
    document.querySelector('#graph_container').style.height  = '0';
    document.querySelector('#graph_container').style.display = 'none';
  } else {
    document.querySelector('#map_container'  ).style.height  = '50%';
    document.querySelector('#graph_container').style.height  = '50%';
    document.querySelector('#graph_container').style.display = 'block';
  }

  map.invalidateSize();

  if (irow <= 0) return true;

  document.querySelector('#sheet tr#no' + irow).classList.add('point_selected_tr');
  Array.prototype.slice.call(document.querySelectorAll('#sheet tr#no' + irow + ' td')).forEach(function(e) {
    e.classList.add('point_selected_td');
  });

  if (ismove) map.setView([sta[irow][icols.sta.lat], sta[irow][icols.sta.lon]]);

  if (markers[irow] !== undefined) markers[irow].openPopup();

  const label24 = val[1].slice(icols.val.snc - 23, icols.val.snc + 1);
  const label25 = val[1].slice(icols.val.snc - 24, icols.val.snc + 1);

  const datasnc = make_chartist_data('chartbig-snc', val[ival[irow]].slice(icols.val.snc - 24, icols.val.snc + 1), label25);
  const datas01 = make_chartist_data('chartbig-s01', val[ival[irow]].slice(icols.val.s01 - 23, icols.val.s01 + 1), label24);
  const datatmp = make_chartist_data('chartbig-tmp', val[ival[irow]].slice(icols.val.tmp - 24, icols.val.tmp + 1), label25);

  const config_common = {
    low: 0,
    axisX: {},
    axisY: {},
    fullWidth: true,
    showPoint: true,
    lineSmooth: false,
    showArea: true,
    chartPadding: {
      top:    30,
      bottom:  0,
      left:   10,
      right:  30
    },
    plugins: [],
  };

  let configsnc = JSON.parse(JSON.stringify(config_common));
  let configs01 = JSON.parse(JSON.stringify(config_common));
  let configtmp = JSON.parse(JSON.stringify(config_common));

  configsnc.plugins.push(Chartist.plugins.ctPointLabels());
  configs01.plugins.push(Chartist.plugins.ctPointLabels());
  configtmp.plugins.push(Chartist.plugins.ctPointLabels());

  configsnc.plugins.push(Chartist.plugins.ctAxisTitle({
    axisY: { offset: { x: 0, y: 15 }, flipTitle: true, axisTitle: '積雪深 [cm]' },
  }));
  configs01.plugins.push(Chartist.plugins.ctAxisTitle({
    axisY: { offset: { x: 0, y: 15 }, flipTitle: true, axisTitle: 'S1 [cm]' },
  }));
  configtmp.plugins.push(Chartist.plugins.ctAxisTitle({
    axisY: { offset: { x: 0, y: 15 }, flipTitle: true, axisTitle: '気温 [℃]' },
  }));

  configsnc.high = Math.max( 8, 1.2 * search_chartist_maxmin(datasnc)[0]);
  configs01.high = Math.max( 8, 1.2 * search_chartist_maxmin(datas01)[0]);
  configtmp.high = Math.max( 0, 1.2 * search_chartist_maxmin(datatmp)[0]);
  configtmp.low  = Math.min( 0, 1.2 * search_chartist_maxmin(datatmp)[1]);

  configsnc.axisX.labelOffset = { x: -7, y: 0 };
  configtmp.axisX.labelOffset = { x: -7, y: 0 };

  new Chartist.Line('#chartbig-snc', datasnc, configsnc);
  new Chartist.Bar ('#chartbig-s01', datas01, configs01);
  new Chartist.Line('#chartbig-tmp', datatmp, configtmp);

  const init = document.querySelector('#init').value;
  const behind_header = sta[irow][icols.sta.prf] + ' ' + sta[irow][icols.sta.nam] + ' ';
  const behind_footer = ' ～' + init.substring(4, 6) + '/' + init.substring(6, 8) + ' ' + init.substring(8, 10) + ':00';

  document.querySelector('#behind-chartbig-snc').innerHTML = behind_header + '積雪深' + behind_footer;
  document.querySelector('#behind-chartbig-s01').innerHTML = behind_header + 'S1'     + behind_footer;
  document.querySelector('#behind-chartbig-tmp').innerHTML = behind_header + '気温'   + behind_footer;

}; // set_point


////////////////////
// misc functions //
////////////////////

const autoload = function(bool) {
  if (bool === undefined) bool = document.querySelector('#renew').checked || false;

  if        ( bool && repeat === undefined) {
    repeat = setInterval(function() { update(); }, 300000);
  } else if (!bool && repeat !== undefined) {
    clearInterval(repeat);
    repeat = undefined;
  }
}; // autoload


const button1 = function(bool) {
  if (bool === undefined) bool = document.querySelector('#oto').checked || false;

  const init = document.querySelector('#init').value;

  if (alerttext != '' && init == timelist[0] && bool) {
    audio.play();
    document.querySelector('#button1wrap').style.display = 'block';
  }
}; // button1


const button2 = function() {
  audio.pause();
  audio.currentTime = 0;
}; // button2


const button3 = function() {
  button2();
  document.querySelector('#button1wrap').style.display = 'none';
}; // button3


const set_window = function() {

  makeurl();

  let navbarHeight = document.querySelector('#tabs').clientHeight + 'px';
  document.body.style['padding-top'] = navbarHeight;
  //document.querySelector('#chohyo'    ).style['top'] = navbarHeight;
  document.querySelector('#right_pane').style['top'] = navbarHeight;

  if (document.querySelector('#toggle_chohyo').checked) {
    document.querySelector('#chohyo').style.display = 'block';
  } else {
    document.querySelector('#chohyo').style.display = 'none';
  }

  document.querySelector('#collapse_control').style.display = 'block';
  document.querySelector('#collapse_control').style.left = document.querySelector('#sheet').clientWidth + 'px';

  let rightroom = document.body.clientWidth - document.querySelector('#sheet').clientWidth;
  if (document.querySelector('#toggle_map').checked && rightroom >= 500) {
    document.querySelector('#right_pane').style.display = 'block';
    document.querySelector('#right_pane').style.width = rightroom + 'px';
  } else {
    document.querySelector('#right_pane').style.display = 'none';
  }

  if (map !== undefined) map.invalidateSize();

}; // set_window


const prefJa2En = function(str) {
  switch (str) {
    case '青森'  : return 'aomori';
    case '岩手'  : return 'iwate';
    case '宮城'  : return 'miyagi';
    case '秋田'  : return 'akita';
    case '山形'  : return 'yamagata';
    case '福島'  : return 'fukushima';
    case '茨城'  : return 'ibaraki';
    case '栃木'  : return 'tochigi';
    case '群馬'  : return 'gumma';
    case '埼玉'  : return 'saitama';
    case '千葉'  : return 'chiba';
    case '東京'  : return 'tokyo';
    case '神奈川': return 'kanagawa';
    case '新潟'  : return 'niigata';
    case '富山'  : return 'toyama';
    case '石川'  : return 'ishikawa';
    case '福井'  : return 'fukui';
    case '山梨'  : return 'yamanashi';
    case '長野'  : return 'nagano';
    case '岐阜'  : return 'gifu';
    case '静岡'  : return 'shizuoka';
    case '愛知'  : return 'aichi';
  }
}; // prefJa2En


const return_url = function(irow) {
  switch (sta[irow][icols.sta.org]) {
    case '1':
      return 'https://www.jma.go.jp/jp/amedas_h/today-' + sta[irow][icols.sta.key] + '.html';
    case '3':
      switch (sta[irow][icols.sta.prf]) {
        case '新潟':
        case '富山':
        case '石川':
          return 'https://its.hrr.mlit.go.jp/list.php?t=snow';
        case '福井':
          return 'http://road.kkr.mlit.go.jp/road/list.php?t=snow';
        case '群馬':
          return 'https://www.ktr.mlit.go.jp/takasaki/road/xml01.html';
        case '栃木':
        case '東京':
        case '神奈川':
        case '山梨':
          return 'http://www.road.ktr.mlit.go.jp/php/snow_list.php';
        case '長野':
          return 'https://www.ktr.mlit.go.jp/nagano/douroinfo/road/html/list/snowList.html';
        default:
          return null;
      }
    case '10':
      switch (sta[irow][icols.sta.prf]) {
        case '新潟':
          return 'http://doboku-bousai.pref.niigata.jp/douro/servlet/bousaiweb.servletBousaiTableDetail?sy=gra_snow&rg=2&sn=' + sta[irow][icols.sta.key];
        case '富山':
          return 'https://www.toyama-douro.toyama.toyama.jp/sensor_detail.html?snow_' + sta[irow][icols.sta.key];
        case '石川':
          return 'https://douro.pref.ishikawa.lg.jp';
        case '福井':
          return 'https://info.pref.fukui.lg.jp/hozen/yuki/weather.html?id=' + sta[irow][icols.sta.key];
        case '栃木':
          return 'http://www.kendo.pref.tochigi.lg.jp/roadinfo/WeatherDetailInfo.aspx?validateSensors=NaturalSnow_&bordID=' + sta[irow][icols.sta.key];
        case '青森':
          return 'http://www.koutsu-aomori.com/Road/' + sta[irow][icols.sta.key];
        case '岩手':
          return 'http://www.josetu.jp/iwate/public/DetailObs.aspx?A=' + sta[irow][icols.sta.key];
        default:
          return null;
      }
    case '100':
      return 'http://gensiryoku2.pref.aomori.lg.jp/atom1/index.html';
    default:
      return null;
  }
}; // return_url


const judge_joho = function(irow) {
  const cls = sta[irow][icols.sta.cls];
  const joho = (
    (cls.indexOf('山'   ) == 0) ? 4 :
    (cls.indexOf('平'   ) == 0) ? 3 :
    (cls.indexOf('山'   ) >= 1) ? 2 :
    (cls.indexOf('m以上') >= 0) ? 2 :
    (cls.indexOf('平'   ) >= 1) ? 1 :
    (cls.indexOf('m未満') >= 0) ? 1 : 0
  );
  return joho;
}; // judge_joho


const judge_row = function(irow) {
  const area = document.querySelector('#area').value;
  const orga = document.querySelector('#orga').value;

  if (arealist0[area].pref.indexOf(sta[irow][icols.sta.prf]) < 0) return false;

  if (ival[irow] === undefined || ival[irow] < 0) return false;

  if (
    (orga == 'all') ||
    (orga == 'info' && judge_joho(irow) >= 3) ||
    (orga == 'jma'  && sta[irow][icols.sta.org] ==   '1') ||
    (orga == 'mlit' && sta[irow][icols.sta.org] ==   '3') ||
    (orga == 'ken'  && sta[irow][icols.sta.org] ==  '10') ||
    (orga == 'atom' && sta[irow][icols.sta.org] == '100')
  ) {
    return true;
  }

  return false;
}; // judge_row


const judge_limit = function(irow, sub, solo, sortelem) {
  const solonum = split_flag(solo)[0];
  const hour = sta[irow][icols.sta[sortelem].hour];
  const val  = sta[irow][icols.sta[sortelem].val] - 0;
  if (hour != '' && sub == ('S' + hour) && val <= solonum) return true;
  return false;
}; // judge_limit


const split_flag = function(v) {
  const vnum  = v.replace(/[F\)\]#]+/g, '');
  const vflag = v.replace(/[X0-9\.\-]+/g, '');
  return [vnum, vflag];
}; // split_flag


const remove_flag_4array = function(array) {
  let ret = new Array();
  array.forEach(function(e) {
    ret.push(split_flag(e)[0]);
  });
  return ret;
}; // remove_flag_4array


const return_level = function(v, elem) {
  v = split_flag(v + '')[0];
  if (v != 0 && isNaN(v)) return 'lvX';
  const thr = thresholds[elem];
  if (elem.indexOf('at') == 0) v *= -1;
  for (let t = thr.length - 1; t >= 0; t--) {
    if (thr[t] <= v) return 'lv' + t;
  }
    return 'lv-';
}; // return_level


const make_chartist_data = function(className, array, labelarray) {
  return {
    labels: labelarray,
    series: [{
      className: className,
      data: remove_flag_4array(array)
    }]
  };
}; // make_chartist_data


const search_chartist_maxmin = function(obj) {
  const max = obj.series[0].data.reduce(function(a, b){ return Math.max((a - 0) || 0, (b - 0) || 0); });
  const min = obj.series[0].data.reduce(function(a, b){ return Math.min((a - 0) || 0, (b - 0) || 0); });
  return [max, min];
}; // search_chartist_maxmin


const makeurl = function() {

  const init = document.querySelector('#init').value;
  const area = document.querySelector('#area').value;
  const orga = document.querySelector('#orga').value;
  const elem = document.querySelector('#elem').value;

  let urlstates = new Array();
  if (region != 'all') urlstates.push('r=' + region);
  if (!!area && area != defaultArea[region]) urlstates.push('a=' + area);
  if (!!orga && orga != 'all') urlstates.push('o=' + orga);
  if (!!elem && elem != 'snc') urlstates.push('e=' + elem);
  if (!document.querySelector('#toggle_chohyo'    ).checked) urlstates.push('c=0');
  if ( document.querySelector('#toggle_minicharts').checked) urlstates.push('g=1');
  if (!document.querySelector('#toggle_map'       ).checked) urlstates.push('m=0');

  let urlstate = urlstates.join('&');
  if (urlstate.length > 0) urlstate = '?' + urlstate;
  urlstate = location.href.split('/').slice(-1)[0].split('?')[0] + urlstate;
  history.replaceState(null, null, urlstate);
  return urlstate;

}; // makeurl


// change tile opacity
const setOpacity = function() { jmatile.setOpacity(document.querySelector('#opacity').value); };


// show usage dialog
const usage = function() { document.querySelector('#usagewrap').style.display = 'block'; };


// generic dialog closer
const cancel = function(id) { document.querySelector(id).style.display = 'none'; };


window.onload = function() {

  (async function() {
    const urlParam = location.search.substring(1) || '';
    let paramArray = [];
    const param = urlParam.split('&');
    for (let i = 0; i < param.length; i++) {
      const paramItem = param[i].split('=');
      paramArray[paramItem[0]] = paramItem[1];
    }

    if (paramArray['r'] !== undefined) region = paramArray['r'];

    let areas = {};
    let orgas = {};

    if (region == 'hokuriku') {
      document.title += ' 北陸版';
      orgas = { ...orgalist.general, ...orgalist.hokuriku };
    } else if (region == 'tohoku') {
      document.title += ' 東北版';
      orgas = { ...orgalist.general, ...orgalist.tohoku };
    } else {
      region = 'all';
      orgas = { ...orgalist.general, ...orgalist.hokuriku, ...orgalist.tohoku };
    }

    areaarray[region].forEach(function(area) {
      areas[area] = arealist0[area].name;
    });

    const set_options = function(id, obj) {
      Object.keys(obj).forEach(function(key) {
        let opt = document.createElement('option');
        opt.value = key;
        opt.text  = obj[key];
        document.querySelector(id).appendChild(opt);
      });
    };

    set_options('#area', areas);
    set_options('#orga', orgas);

    if (paramArray['a'] === undefined) document.querySelector('#area').value = defaultArea[region];

    if (paramArray['a'] !== undefined) document.querySelector('#area').value = paramArray['a'];
    if (paramArray['o'] !== undefined) document.querySelector('#orga').value = paramArray['o'];
    if (paramArray['e'] !== undefined) document.querySelector('#elem').value = paramArray['e'];
    if (paramArray['i'] !== undefined) document.querySelector('#init').value = paramArray['i'];
    if (paramArray['c'] == '0') $('#toggle_chohyo'    ).bootstrapToggle('off');
    if (paramArray['g'] == '1') $('#toggle_minicharts').bootstrapToggle('on' );
    if (paramArray['m'] == '0') $('#toggle_map'       ).bootstrapToggle('off');

    await get(prefix[region] + filepath.stations[region], onload.stations).catch(console.error);
    await update(false);
    document.querySelector('#initial').style.display = 'none';
  })();

  window.addEventListener('resize', function() { set_window(); });

  document.querySelector('#init_n').addEventListener('mouseup', function() { update(); });
  document.querySelector('#init_b').addEventListener('mouseup', function() { changeinit(-1); });
  document.querySelector('#init_f').addEventListener('mouseup', function() { changeinit( 1); });
  document.querySelector('#init_e').addEventListener('mouseup', function() { changeinit( 0); });

  document.querySelector('#area').addEventListener('change', function() { set_point(-1); redraw(); });
  document.querySelector('#orga').addEventListener('change', function() { redraw(); });
  document.querySelector('#elem').addEventListener('change', function() { draw_map(); });

  $('#oto'  ).change(function() { button1();  });
  $('#renew').change(function() { autoload(); });

  $('#toggle_chohyo'    ).change(function() { set_window(); });
  $('#toggle_map'       ).change(function() { set_window(); });
  $('#toggle_minicharts').change(function() { redraw();     });

  document.querySelector('#graph_close').addEventListener('mouseup', function() { set_point(0); });

  document.querySelector('#button2').addEventListener('mouseup', function() { button2(); });
  document.querySelector('#button3').addEventListener('mouseup', function() { button3(); });

  document.querySelector('#usage'      ).addEventListener('mouseup', function() { usage(); });
  document.querySelector('#usage_close').addEventListener('mouseup', function() { cancel('#usagewrap'); });

  document.querySelector('#opacity').addEventListener('input' , function() { setOpacity(); });
  document.querySelector('#opacity').addEventListener('change', function() { setOpacity(); });

  document.querySelector('#init').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') changeinit(0);
    e.stopPropagation();
  });

  // click outside of dialogs to close them
  document.querySelectorAll('.popwrap').forEach(function(e) {
    const id = '#' + e.getAttribute('id');
    document.querySelector(id).addEventListener('click', function(e) {
      button3();
      document.querySelector(id).style.display = 'none';
    });
  });

  document.querySelectorAll('.poparea').forEach(function(e) {
    e.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  });

  document.body.addEventListener('keydown', function(e) {

    if (e.key.indexOf('Left' ) >= 0) { changeinit(-1); }
    if (e.key.indexOf('Right') >= 0) { changeinit( 1); }
    if (e.ctrlKey && e.key.indexOf('Left' ) >= 0) { changeinit(-24); }
    if (e.ctrlKey && e.key.indexOf('Right') >= 0) { changeinit( 24); }

    if (e.key == ' ' || e.key == 'Spacebar') { update(); }

    let areas = new Array();
    let orgas = new Array();
    let elems = new Array();

    document.querySelectorAll('#area option').forEach(function(o){ if (!o.disabled) areas.push(o.value); });
    document.querySelectorAll('#orga option').forEach(function(o){ orgas.push(o.value); });
    document.querySelectorAll('#elem option').forEach(function(o){ elems.push(o.value); });

    const iareacurrent = areas.indexOf(document.querySelector('#area').value);
    if (e.shiftKey && e.key.indexOf('Up'  ) >= 0) {
      document.querySelector('#area').value = areas[Math.max(0, iareacurrent - 1)];
      redraw();
    }
    if (e.shiftKey && e.key.indexOf('Down') >= 0) {
      document.querySelector('#area').value = areas[Math.min(areas.length - 1, iareacurrent + 1)];
      redraw();
    }
    
    const iorgacurrent = orgas.indexOf(document.querySelector('#orga').value);
    if (e.altKey && e.key.indexOf('Up'  ) >= 0) {
      document.querySelector('#orga').value = orgas[Math.max(0, iorgacurrent - 1)];
      redraw();
    }
    if (e.altKey && e.key.indexOf('Down') >= 0) {
      document.querySelector('#orga').value = orgas[Math.min(orgas.length - 1, iorgacurrent + 1)];
      redraw();
    }

    const ielemcurrent = elems.indexOf(document.querySelector('#elem').value);
    if (e.ctrlKey && e.key.indexOf('Up'  ) >= 0) {
      document.querySelector('#elem').value = elems[Math.max(0, ielemcurrent - 1)];
      draw_map();
    }
    if (e.ctrlKey && e.key.indexOf('Down') >= 0) {
      document.querySelector('#elem').value = elems[Math.min(elems.length - 1, ielemcurrent + 1)];
      draw_map();
    }

  });

}; // window.onload
