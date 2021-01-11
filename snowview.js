'use strict';

//////////////////////
// global variables //
//////////////////////

let timelist;
let sta;
let val;
let ival = new Array();

let irowprev = -1;
let sortelem;
let sortelemprev;
let isortupdown;

let alerttext;
let map;
let legend;
let markerlayer;
let markers = new Array();
let layerControl;
let jmatile;

let repeat;

const icols = new Object();
icols.sta = new Object();
icols.val = new Object();

const thresholds = new Object();
thresholds.snc = [0,9,19,39,59,79,99,149,199];
thresholds.s1  = [0,1,2,3,4,5,7,9,15];
thresholds.s3  = [0,1,4,9,14,19,24,29,39];
thresholds.s6  = [0,1,4,9,14,19,24,29,39];
thresholds.s12 = [0,3,9,19,29,39,49,59,79];
thresholds.s24 = [0,3,9,19,29,39,49,59,79];
thresholds.d3  = thresholds.s3;
thresholds.d6  = thresholds.s6;
thresholds.d12 = thresholds.s12;
thresholds.d24 = thresholds.s24;
thresholds.tmp = [-16.1,-8.1,-4.1,-2.1,-0.1,1.9,3.9,7.9,15.9];

const audio = document.getElementById('audio');
audio.volume = 0.6;
audio.load();

let urlpre = '';
if (location.host == 'localhost') urlpre = 'http://133.125.40.135/SnowWS/';


////////////////////
// initialization //
////////////////////

const initialize = function() {
  const urlParam = location.search.substring(1);
  let paramArray = [];
  if (urlParam) {
    const param = urlParam.split('&');
    for (let i = 0; i < param.length; i++) {
      const paramItem = param[i].split('=');
      paramArray[paramItem[0]] = paramItem[1];
    }
    if (paramArray['a'] !== undefined) document.getElementById('area').value = paramArray['a'];
    if (paramArray['o'] !== undefined) document.getElementById('orga').value = paramArray['o'];
    if (paramArray['e'] !== undefined) document.getElementById('elem').value = paramArray['e'];
    if (paramArray['i'] !== undefined) document.getElementById('init').value = paramArray['i'];
    //if (paramArray['l'] == '1') $('#oto'              ).bootstrapToggle('on' );
    if (paramArray['c'] == '0') $('#toggle_chohyo'    ).bootstrapToggle('off');
    if (paramArray['g'] == '1') $('#toggle_minicharts').bootstrapToggle('on' );
    if (paramArray['m'] == '0') $('#toggle_map'       ).bootstrapToggle('off');
  }

  get_stations()
    .then(get_list)
    .then(function() {
      changeinit(0);
    })
    .catch(function(error) { console.log(error); })
}; // initialize


///////////////////////////////
// process when init changes //
///////////////////////////////

const changeinit = function(amount) {

  /* amount = 
    98: move toward textbox value
    else: move back or forward
  */

  let ndest = 0;
  if (-90 <= amount && amount <= 90) {
    ndest = timelist.indexOf(document.getElementById('init').value) - amount;
    if (ndest < 0                  ) { return false; }
    if (ndest > timelist.length - 1) { return false; }
  }
  else if (amount == 98) {
    ndest = timelist.indexOf(document.getElementById('init').value);
  }

  if (ndest < 0 || timelist.length - 1 < ndest) {
    alert('ﾅｲﾖｰ (available times: between ' + timelist[timelist.length - 1] + ' and ' + timelist[0] + ')');
    return false;
  }

  if (ndest == 0) {
    $('#renew').bootstrapToggle('on');
  } else {
    $('#renew').bootstrapToggle('off');
  }

  document.getElementById('init').value = timelist[ndest];
  document.getElementById('init_f').disabled = !!(ndest == 0);
  document.getElementById('init_b').disabled = !!(ndest == timelist.length - 1);

  get_values()
    .then(redraw)
    .catch(function(error) { console.log(error); });

}; // changeinit


const update = function() {
  get_list()
    .then(function() {
      document.getElementById('init').value = timelist[0];
      changeinit(0);
    })
    .catch(function(error) { console.log(error); })
}; // update


const redraw = function(sortelem) {
  draw_sheet(sortelem)
    .then(draw_map)
    .catch(function(error) { console.log(error); })
}; // redraw


const change4redraw = function() {
  set_point(-1);

  draw_sheet()
    .then(draw_map)
    .catch(function(error) { console.log(error); })
}; // change4redraw


const get_list = function() {
  return new Promise(function(resolve, reject) {
    const req = new XMLHttpRequest();
    const path = urlpre + 'csv/_list.txt?_=' + new Date().getTime();
    req.open('get', path, true);
    req.send(null);
    req.onload = function() {
      timelist = req.responseText.replace(/[\r\n]/g, '').split(',');
      if (document.getElementById('init').value == '') document.getElementById('init').value = timelist[0];
      //console.log('done: get_list');
      autoload();
      resolve();
    }; // req.onload
    req.onerror = function() { reject(req.statusText); };
  });
}; // get_list


const get_stations = function() {
  return new Promise(function(resolve, reject) {
    const req = new XMLHttpRequest();
    const path = urlpre + 'sjisToUtf8.php?path=csv/stationplus.csv';
    req.open('get', path, true);
    req.send(null);
    req.onload = function() {
      const rows = req.responseText.trim().split('\r\n');
      sta = [];
      for (let i = 0; i < rows.length; i++) {
        if (rows[i] == '') { break; }
        sta[i] = rows[i].split(',');
      }
      icols.sta.prf = sta[0].indexOf('府県');
      icols.sta.org = sta[0].indexOf('所属');
      icols.sta.ctv = sta[0].indexOf('市町村');
      icols.sta.cls = sta[0].indexOf('区分');
      icols.sta.alt = sta[0].indexOf('標高');
      icols.sta.obs = sta[0].indexOf('観測所名');
      icols.sta.nam = sta[0].indexOf('情報発表名');
      icols.sta.yom = sta[0].indexOf('読み');
      icols.sta.jma = sta[0].indexOf('JMA番号');
      icols.sta.qc  = sta[0].indexOf('気温JMA番号');
      icols.sta.lat = sta[0].indexOf('緯度');
      icols.sta.lon = sta[0].indexOf('経度');
      icols.sta.url = sta[0].indexOf('URL');
      icols.sta.warningHour  = sta[0].indexOf('警報期間');
      icols.sta.warningVal   = sta[0].indexOf('警報基準');
      icols.sta.kirokuHour   = sta[0].indexOf('記録雪期間');
      icols.sta.kirokuVal    = sta[0].indexOf('記録雪基準');
      icols.sta.tanjikanHour = sta[0].indexOf('短時間期間');
      icols.sta.tanjikanVal  = sta[0].indexOf('短時間基準');
      icols.sta.sdVal        = sta[0].indexOf('積雪基準');
      icols.sta.sdLimit      = sta[0].indexOf('積雪余裕');
      //console.log('done: get_stations');
      resolve();
    };
    req.onerror = function() { reject(req.statusText); };
  });
}; // get_stations


const get_values = function() {
  return new Promise(function(resolve, reject) {
    const req = new XMLHttpRequest();
    const path = urlpre + 'sjisToUtf8.php?path=csv/Details_' + document.getElementById('init').value + '.csv';
    req.open('get', path, true);
    req.send(null);
    req.onload = function() {
      const rows = req.responseText.trim().split('\r\n');
      val = [];
      for (let i = 0; i < rows.length; i++) {
        if (rows[i] == '') { break; }
        val[i] = rows[i].split(',');
      }
      icols.val.nam = val[0].indexOf('情報発表名');
      icols.val.s3  = val[1].indexOf('S3');
      icols.val.s6  = val[1].indexOf('S6');
      icols.val.s12 = val[1].indexOf('S12');
      icols.val.s24 = val[1].indexOf('S24');
      icols.val.d3  = val[1].indexOf('D3');
      icols.val.d6  = val[1].indexOf('D6');
      icols.val.d12 = val[1].indexOf('D12');
      icols.val.d24 = val[1].indexOf('D24');
      icols.val.s1  = val[0].indexOf('S1') + 24;
      icols.val.snc = val[0].indexOf('積雪') + 24;
      icols.val.tmp = val[0].indexOf('気温') + 24;
      icols.val.ymd = val[0].indexOf('最新');

      let names_sta = new Array();
      let names_val = new Array();
      for (let i = 0; i < sta.length; i++) names_sta.push(sta[i][icols.sta.nam]);
      for (let i = 0; i < val.length; i++) names_val.push(val[i][icols.val.nam]);

      for (let i = 0; i < sta.length; i++) ival[i] = names_val.indexOf(names_sta[i]);

      //console.log('done: get_values');
      resolve();
    };
    req.onerror = function() { reject(req.statusText); };
  });
}; // get_values


const draw_sheet = function(sortelem) {

  return new Promise(function(resolve, reject) {

    const init = document.getElementById('init').value;
    const area = document.getElementById('area').value;
    const orga = document.getElementById('orga').value;

    //////////////////////////
    // define table columns //
    //////////////////////////

    const header_sta = [
      {
        name: '区分',
          icol: icols.sta.cls,
          classes: 'td-cls'
      }, {
        name: '標高',
          icol: icols.sta.alt,
          classes: 'td-alt'
      }, {
        name: '府県',
          icol: icols.sta.prf,
          classes: 'td-prf'
      }, { 
        name: '市町村',
          icol: icols.sta.ctv,
          classes: 'td-ctv'
      }, {
        name: '情報発表名',
          icol: icols.sta.nam,
          classes: 'td-nam',
          sortelem: 'nam'
      }
    ];

    const header_val = [
      {
        name: '積雪',
          sub:  ['実況', 'あと'],
          icol: [icols.val.snc, icols.val.snc],
          classes: ['td-snc leftline', 'td-sns'],
          sortelem: ['snc', 'sns'],
      }, {
        name: '気温', 
          sub:  ['実況'],
          icol: [icols.val.tmp],
          classes: ['td-tmp leftline'],
          sortelem: ['tmp'],
      }, {
        name: '降雪深', 
          sub:  ['S3', 'S6', 'S12', 'S24'],
          icol: [icols.val.s3, icols.val.s6, icols.val.s12, icols.val.s24],
          classes: ['td-snn td-s3 leftline', 'td-snn td-s6', 'td-snn td-s12', 'td-snn td-s24'],
          sortelem: ['s3', 's6', 's12', 's24'],
      }, {
        name: '積雪深差', 
          sub:  ['D3', 'D6', 'D12', 'D24'],
          icol: [icols.val.d3, icols.val.d6, icols.val.d12, icols.val.d24],
          classes: ['td-dnn td-d3 leftline', 'td-dnn td-d6', 'td-dnn td-d12', 'td-dnn td-d24'],
          sortelem: ['d3', 'd6', 'd12', 'd24'],
      }
    ];

    ///////////////////////////
    // generate table header //
    ///////////////////////////

    let insert = '';

    insert += '<tr>';

    header_sta.forEach(function(h) {
      let solo = h.name;
      let thattr = ' rowspan="2" class="' + h.classes + '"';
      if (h.sortelem !== undefined) solo += '<span class="up">▲</span><span class="down">▼</span>';
      if (h.name == '情報発表名') {
        solo += '</th><th rowspan="2" class="td-ico"><span>地点詳細</span>';
        solo += '</th><th rowspan="2" class="td-ico"><span>取得元</span>';
      }
      insert += '<th' + thattr + '>' + solo + '</th>';
    });

    header_val.forEach(function(h) {
      let solo = h.name;
      let thattr = ' colspan="' + h.sub.length + '"';
      insert += '<th' + thattr + '>' + solo + '</th>';
    });

    if (document.querySelector('#toggle_minicharts').checked) {
      insert += '<th rowspan="2" class="td-cht leftline">24h推移<br /><span class="col-snc">―: 積雪深</span> <span class="col-s01">■: S1</span></th>';
    }

    insert += '</tr>';
    insert += '<tr>';

    header_val.forEach(function(h) {
      for (let i = 0; i < h.sub.length; i++) {
        let solo = h.sub[i];
        let thattr = '';
        thattr += ' class="' + h.classes[i] + '"';
        solo += '<span class="up">▲</span><span class="down">▼</span>';
        insert += '<th' + thattr + '>' + solo + '</th>';
      }
    });

    insert += '</tr>';

    document.querySelector('#fixheader').innerHTML = insert;

    // add event for sort
    header_sta.forEach(function(h) {
      if (h.sortelem !== undefined) {
        document.querySelector('#fixheader th.td-' + h.sortelem).addEventListener('mouseup', function() {
          redraw(h.sortelem);
        });
      }
    });

    header_val.forEach(function(h) {
      if (h.sortelem !== undefined) {
        h.sortelem.forEach(function(hh) {
          document.querySelector('#fixheader th.td-' + hh).addEventListener('mouseup', function() {
            redraw(hh);
          });
        });
      }
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
        // reset to default when 3rd sort
        sortelem = undefined;
        isortupdown = 0;
      }
    } else {
      // first sort for this elem
      isortupdown = 1;
    }

    const sortupdown = [0, -1, 1].map(x => x * ((sortelem == 'nam') ? -1 : 1))[isortupdown];

    ////////////////////
    // generate table //
    ////////////////////

    let insert_rows = new Array(sta.length - 2);

    let s3k = [], s6k = [], s6t = [], s12t = [];

    // generate value rows
    for (let irow = 2; irow < sta.length; irow++) {

      if (!judge_row(irow)) continue;

      let insert_row = '';
      insert_row += '<tr id="no' + irow + '">';

      header_sta.forEach(function(h) {
        let solo = sta[irow][h.icol];

        let tdclasses = h.classes;

        tdclasses += ' set_point';

        if (h.name == '区分') {
          const tdappend = (
            (solo.indexOf('平') >= 0) ? 'colG' :
            (solo.indexOf('山') >= 0) ? 'colR' :
            (solo.indexOf('m未満') >= 0) ? 'colGlight' :
            (solo.indexOf('m以上') >= 0) ? 'colRlight' : 'colK'
          );
          tdclasses += ' ' + tdappend;
        } else if (h.name == '標高') {
          tdclasses += ' alignright';
          solo = solo + '<span class="td-alt-unit">m</span>';
        } else if (h.name == '情報発表名') {
          const solo1 = solo.replace(/\(.+/g, '');
          //const solo2 = solo.substring(solo.indexOf('('));
          solo = '<span class="td-nam-main">' + solo1 + '</span>';
          let imgfile = '';
          if        (sta[irow][icols.sta.org] ==   '1') {
            imgfile = 'lib/img/logo_jma.png';
          } else if (sta[irow][icols.sta.org] ==   '3') {
            imgfile = 'lib/img/logo_mlit.png';
          } else if (sta[irow][icols.sta.org] ==  '10') {
            imgfile = 'lib/img/logo_pref_' + prefEnJa(sta[irow][icols.sta.prf]) + '.png';
          } else if (sta[irow][icols.sta.org] == '100') {
            imgfile = 'lib/img/logo_atom.png';
          }
          solo += '<img src="' + imgfile + '" class="td-nam-sub" />';
          if (sta[irow][icols.sta.prf] == '石川' && sta[irow][icols.sta.org] == '10') solo += '<br /><span class="td-nam-obs">（' + sta[irow][icols.sta.obs] + '）</span>';
          solo += '</td><td class="td-ico set_point">&#x1f4cd;';
          solo += '</td><td class="td-ico"><a href="' + sta[irow][icols.sta.url] + '" target="_blank">&#x1f310;</a>';
        }

        insert_row += '<td class="' + tdclasses + '">' + solo + '</td>';
      });

      header_val.forEach(function(h) {
        for (let i = 0; i < h.sub.length; i++) {
          let solo = val[ival[irow]][h.icol[i]];

          let solonum  = split_flag(solo)[0];
          let soloflag = split_flag(solo)[1];

          const w_limit_hour = sta[irow][icols.sta.warningHour ];
          const w_limit_val  = sta[irow][icols.sta.warningVal  ] - 0;
          const k_limit_hour = sta[irow][icols.sta.kirokuHour  ];
          const k_limit_val  = sta[irow][icols.sta.kirokuVal   ] - 0;
          const t_limit_hour = sta[irow][icols.sta.tanjikanHour];
          const t_limit_val  = sta[irow][icols.sta.tanjikanVal ] - 0;
          const s_val        = sta[irow][icols.sta.sdVal  ] - 0;
          //const s_limit      = sta[irow][icols.sta.sdLimit] - 0;

          let tdclasses = h.classes[i];

          if (h.sub[i] == 'あと') {
            if (judge_joho(irow) && !isNaN(s_val)) {
              solonum = s_val - solonum;
            } else {
              solo = '-';
              solonum = NaN;
            }
          }

          if        (solo == 'X' || solo == '-') {
            tdclasses += ' lvX';
          } else if (h.sub[i] == 'あと') {
            if (solonum <= 0) {
              tdclasses += ' joho';
            } else {
              tdclasses += ' lv0';
            }
          } else if (h.sub[i] == 'S3'  && k_limit_hour ==  '3' && k_limit_val <= solonum) {
            tdclasses += ' joho';
            s3k.push(irow);
          } else if (h.sub[i] == 'S6'  && k_limit_hour ==  '6' && k_limit_val <= solonum) {
            tdclasses += ' joho';
            s6k.push(irow);
          } else if (h.sub[i] == 'S6'  && t_limit_hour ==  '6' && t_limit_val <= solonum) {
            tdclasses += ' joho';
            s6t.push(irow);
          } else if (h.sub[i] == 'S12' && t_limit_hour == '12' && t_limit_val <= solonum) {
            tdclasses += ' joho';
            s12t.push(irow);
          } else if (h.sub[i] == '最新') {
            tdclasses += ' lv0';
          } else {
            let thin = '';
            if (h.name == '気温') thin = 't';
            tdclasses += (' ' + thin + return_level(solonum, thresholds[h.sortelem[i]]));
          }
  
          if (!isNaN(solonum)) solo = solonum + '<span class="soloflag">' + soloflag + '</span>';

          insert_row += '<td class="' + tdclasses + '">' + solo + '</td>';
        }
      });

      if (document.querySelector('#toggle_minicharts').checked) {
        insert_row += '<td class="chart_container leftline set_point"><div id="chart1_' + ival[irow] + '"></div><div id="chart2_' + ival[irow] + '"></div></td>';
      }

      insert_row += '</tr>';

      let sortval = ival[irow];

      if (sortelem !== undefined) {
        if        (sortelem == 'nam') {
          sortval = sta[irow][icols.sta.yom] || 'ﾝ';
        } else if (sortelem == 'sns') {
          sortval = sta[irow][icols.sta.sdVal] - split_flag(val[ival[irow]][icols.val.snc])[0];
          if (sortval === '' || isNaN(sortval) || !judge_joho(irow)) sortval = 999 * sortupdown;
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

    const makealert = function(attr, hour, attrary) {
      let alertstr = '';
      if (attrary.length !== 0) {
        const attrcol = icols.val[hour.toLowerCase()];

        for (let i = 0; i < attrary.length; i++) {
          alertstr += '<tr>';
          alertstr += '<td>' + attr + hour + '</td>';
          alertstr += '<td>' + sta[attrary[i]][icols.sta.prf] + '-' + sta[attrary[i]][icols.sta.ctv] + '-' + sta[attrary[i]][icols.sta.cls] + '</td>';
          alertstr += '<td>' + sta[attrary[i]][icols.sta.nam] + '</td>';
          alertstr += '<td>' + hour + '実況&nbsp;&nbsp;' + val[ival[attrary[i]]][attrcol] + 'cm</td>';
          alertstr += '</tr>';
        }
      }
      return alertstr;
    }

    alerttext = '';
    alerttext += makealert('記録雪', 'S3' , s3k );
    alerttext += makealert('記録雪', 'S6' , s6k );
    alerttext += makealert('短時間', 'S6' , s6t );
    alerttext += makealert('短時間', 'S12', s12t);

    document.querySelector('#choka').innerHTML = alerttext;

    if (alerttext != '' && init == timelist[0]) {
      document.querySelector('#alerttitle').classList.add('alertanim');
      document.querySelector('#alerttitle').setAttribute('title', '報知基準を満たしている地点があります。');
    } else {
      document.querySelector('#alerttitle').classList.remove('alertanim');
      document.querySelector('#alerttitle').removeAttribute('title');
    }

    if (alerttext != '' && document.querySelector('#oto').checked && init == timelist[0]) {
      button1();
    }

    if (alerttext == '') { button3(); }

    /////////////////////
    // draw minicharts //
    /////////////////////

    if (document.querySelector('#toggle_minicharts').checked) {
      for (let irow = 2; irow < sta.length; irow++) {

        if (!judge_row(irow)) continue;

        const labelarray = val[0].slice(icols.val.s1 - 23, icols.val.s1 + 1);

        const data1 = make_chartist_data('chart-snc', val[ival[irow]].slice(icols.val.snc - 23, icols.val.snc + 1), labelarray);
        const data2 = make_chartist_data('chart-s01', val[ival[irow]].slice(icols.val.s1  - 23, icols.val.s1  + 1), labelarray);

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

    const sheetWidth = document.querySelector('#sheet').clientWidth;
    document.querySelector('#fixheader').style.width = sheetWidth + 'px';

    set_window();

    resolve();

  });

}; // draw_sheet


const draw_map = function() {
  return new Promise(function(resolve, reject) {

    const init = document.getElementById('init').value;
    const area = document.getElementById('area').value;
    const elem = document.getElementById('elem').value;
    const orga = document.getElementById('orga').value;

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
        maxWidth:200,
        position:'bottomright',
        imperial:false
      }).addTo(map);

      const gsiurl = "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>";

      const gsishiro = L.tileLayer('http://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png', 
        {attribution: gsiurl});
      const gsi = L.tileLayer('http://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', 
        {attribution: gsiurl, opacity: 0.4});
      const gsipale = L.tileLayer('http://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
        {attribution: gsiurl, opacity: 0.4});
      const hyokou = L.tileLayer('http://cyberjapandata.gsi.go.jp/xyz/relief/{z}/{x}/{y}.png',
        {attribution: gsiurl, opacity: 0.4});
      const foto = L.tileLayer('http://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg',
        {attribution: gsiurl});

      const baseMaps = {
        "白地図": gsishiro,
        "地理院地図": gsi,
        "淡色地図": gsipale,
        "色別標高図": hyokou,
        "全国最新写真": foto
      };

      layerControl = L.control.layers(baseMaps).addTo(map);
      gsishiro.addTo(map);
    }

    if (irowprev == -1) {
      let latlon;
      let zoom;
      switch (area) {
        case 'all': latlon = [38.2, 138.5]; zoom = 7; break;
        case 'ngt': latlon = [37.5, 138.8]; zoom = 8; break;
        case 'tym': latlon = [36.7, 137.3]; zoom = 9; break;
        case 'isk': latlon = [36.8, 136.8]; zoom = 9; break;
        case 'fki': latlon = [35.8, 136.1]; zoom = 9; break;
        case 'tcggnm': latlon = [36.6, 139.3]; zoom = 8; break;
        case 'ngn': latlon = [36.2, 138.1]; zoom = 8; break;
        case 'aom': latlon = [40.9, 140.8]; zoom = 8; break;
        case 'hok': latlon = [36.5, 137.5]; zoom = 7; break;
        case 'ngtgnmngn': latlon = [37.0, 138.6]; zoom = 8; break;
      }
      map.setView(latlon, zoom);
    }

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
      (elem == 's3' ) ? 'snowf03h' :
      (elem == 's6' ) ? 'snowf06h' :
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
    let si = 'cm';
    if (elem == 'tmp') {
      thin = 't';
      si = '℃';
    }

    markerlayer = new L.LayerGroup();

    for (let irow = 2; irow < sta.length; irow++) {
      if (!judge_row(irow)) continue;

      const solo = val[irow][icols.val[elem]];

      const className = 'M' + thin + return_level(solo, thresholds[elem]);
      if (['MtlvX', 'Mtlv-'].indexOf(className) >= 0) continue;

      markers[irow] = new L.marker(
        [sta[irow][icols.sta.lat], sta[irow][icols.sta.lon]], 
        { icon: L.divIcon({
          html: '<span class="' + thin + 'M' + return_level(solo, thresholds[elem]) + '">' + split_flag(solo)[0] + '</span>'
        })
        }
      ).bindTooltip(
        '<strong>' + sta[irow][icols.sta.nam] + '</strong><br />',
        { direction: 'top' }
      ).bindPopup((
        '<strong>' + sta[irow][icols.sta.nam] + '</strong>'
        + '<br /><span class="tooltiptext-small">積雪深</span> <strong>' + val[ival[irow]][icols.val.snc] + '</strong> <span class="tooltiptext-small">cm</span>'
        + '<br /><span class="tooltiptext-small">気温</span> <strong>'   + val[ival[irow]][icols.val.tmp] + '</strong> <span class="tooltiptext-small">℃</span>'
      )).addTo(markerlayer).on('click', function(e) { set_point(e.target.irow, true); });

      markers[irow].irow = irow;
    } // for irow

    markerlayer.addTo(map);

    ////////////////
    // add legend //
    ////////////////

    const bararray = ['snc', 's3s6d3d6', 's12s24d12d24', 's1d1', 'tmp'];
    let bar;
    bararray.forEach(function(b) { if (b.indexOf(elem) >= 0) bar = b; });

    legend = L.control({ position: 'bottomright' });
    legend.onAdd = function() {
      let img = L.DomUtil.create('img');
      img.src = 'lib/img/bar_' + bar + '.png';
      return img;
    };
    legend.addTo(map);

    ////////////////////
    // postprocessing //
    ////////////////////

    if (irowprev == -1) irowprev = 0;

    if (irowprev > 0) set_point(irowprev, false);

    makeurl();

    map.invalidateSize();

    map.on('click', function() { set_point(0); });

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
  markers.forEach(function(m) { m.closeTooltip(); });

  if (irow <= 0) return true;

  document.querySelector('#sheet tr#no' + irow).classList.add('point_selected_tr');
  Array.prototype.slice.call(document.querySelectorAll('#sheet tr#no' + irow + ' td')).forEach(function(e) {
    e.classList.add('point_selected_td');
  });

  let lat = sta[irow][icols.sta.lat];
  let lon = sta[irow][icols.sta.lon];

  if (ismove) map.setView([lat, lon]);

  markers[irow].openPopup();

  const label24 = val[1].slice(10, 34);
  const label25 = val[1].slice( 9, 34);

  const datasd   = make_chartist_data('chartbig-snc', val[irow].slice(34, 59), label25);
  const datas1   = make_chartist_data('chartbig-s01', val[irow].slice(10, 34), label24);
  const datatemp = make_chartist_data('chartbig-tmp', val[irow].slice(59, 84), label25);

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

  let configsd   = JSON.parse(JSON.stringify(config_common));
  let configs1   = JSON.parse(JSON.stringify(config_common));
  let configtemp = JSON.parse(JSON.stringify(config_common));

  configsd  .plugins.push(Chartist.plugins.ctPointLabels());
  configs1  .plugins.push(Chartist.plugins.ctPointLabels());
  configtemp.plugins.push(Chartist.plugins.ctPointLabels());

  configsd  .plugins.push(Chartist.plugins.ctAxisTitle({
    axisY: { offset: { x: 0, y: 15 }, flipTitle: true, axisTitle: '積雪深 [cm]' },
  }));
  configs1  .plugins.push(Chartist.plugins.ctAxisTitle({
    axisY: { offset: { x: 0, y: 15 }, flipTitle: true, axisTitle: 'S1 [cm]' },
  }));
  configtemp.plugins.push(Chartist.plugins.ctAxisTitle({
    axisY: { offset: { x: 0, y: 15 }, flipTitle: true, axisTitle: '気温 [℃]' },
  }));

  configsd.high   = Math.max( 8, 1.2 * search_chartist_maxmin(datasd  )[0]);
  configs1.high   = Math.max( 8, 1.2 * search_chartist_maxmin(datas1  )[0]);
  configtemp.high = Math.max( 0, 1.2 * search_chartist_maxmin(datatemp)[0]);
  configtemp.low  = Math.min( 0, 1.2 * search_chartist_maxmin(datatemp)[1]);

  configsd  .axisX.labelOffset = { x: -7, y: 0 };
  configtemp.axisX.labelOffset = { x: -7, y: 0 };

  new Chartist.Line('#chartbig-snc', datasd  , configsd  );
  new Chartist.Bar ('#chartbig-s01', datas1  , configs1  );
  new Chartist.Line('#chartbig-tmp', datatemp, configtemp);

  const init = document.getElementById('init').value;
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
  if (bool === undefined) bool = document.getElementById("renew").checked || false;

  if        ( bool && repeat === undefined) {
    repeat = setInterval(function() { update(); }, 300000);
  } else if (!bool && repeat !== undefined) {
    clearInterval(repeat);
    repeat = undefined;
  }
};


const button1 = function(bool) {
  if (bool === undefined) bool = document.getElementById('oto').checked || false;

  if (alerttext != '' && bool) {
    audio.play();
    document.getElementById('button1wrap').style.display = 'block';
  }
};


const button2 = function() {
  audio.pause();
  audio.currentTime = 0;
};


const button3 = function() {
  button2();
  document.getElementById('button1wrap').style.display = 'none';
};


const set_window = function() {

  makeurl();

  let navbarHeight = document.querySelector('#tabs').clientHeight + 'px';
  document.body.style['padding-top'] = navbarHeight;
  document.querySelector('#chohyo'    ).style['top'] = navbarHeight;
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


const prefEnJa = function(str) {
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
    case 'aomori'   : return '青森';
    case 'iwate'    : return '岩手';
    case 'miyagi'   : return '宮城';
    case 'akita'    : return '秋田';
    case 'yamagata' : return '山形';
    case 'fukushima': return '福島';
    case 'ibaraki'  : return '茨城';
    case 'tochigi'  : return '栃木';
    case 'gumma'    : return '群馬';
    case 'saitama'  : return '埼玉';
    case 'chiba'    : return '千葉';
    case 'tokyo'    : return '東京';
    case 'kanagawa' : return '神奈川';
    case 'niigata'  : return '新潟';
    case 'toyama'   : return '富山';
    case 'ishikawa' : return '石川';
    case 'fukui'    : return '福井';
    case 'yamanashi': return '山梨';
    case 'nagano'   : return '長野';
    case 'gifu'     : return '岐阜';
    case 'shizuoka' : return '静岡';
    case 'aichi'    : return '愛知';
  }
}; // prefEnJa


const make_prefarray = function(area) {
  let prefarray = new Array();
  switch (area) {
    case 'all' : prefarray = ['青森', '新潟', '富山', '石川', '福井', '栃木', '群馬', '長野', '東京', '千葉', '神奈川', '山梨', '埼玉']; break;
    case 'hok' : prefarray = ['新潟', '富山', '石川', '福井']; break;
    case 'ngtgnmngn' : prefarray = ['新潟', '群馬', '長野']; break;
    case 'ngt' : prefarray = ['新潟']; break;
    case 'tym' : prefarray = ['富山']; break;
    case 'isk' : prefarray = ['石川']; break;
    case 'fki' : prefarray = ['福井']; break;
    case 'tcggnm' : prefarray = ['栃木', '群馬']; break;
    case 'ngn' : prefarray = ['長野']; break;
    case 'aom' : prefarray = ['青森']; break;
    default: prefarray = [];
  }
  return prefarray;
}; // make_prefarray


const split_flag = function(v) {
  let vnum  = v.replace(/[F\)\]#]+/g  , '');
  let vflag = v.replace(/[X0-9\.\-]+/g, '');
  return [vnum, vflag];
}; // split_flag


const remove_flag_4array = function(array) {
  let ret = new Array();
  array.forEach(function(e) {
    ret.push(split_flag(e)[0]);
  });
  return ret;
}; // remove_flag_4array


const return_level = function(v, thr) {
  v = split_flag(v)[0];
  if (v != 0 && isNaN(v)) return 'lvX';
  for (let t = thr.length - 1; t >= 0; t--) {
    if (thr[t] < v) return 'lv' + (t + 1);
  }
  if (v == thr[0]) {
    return 'lv0';
  } else {
    return 'lv-';
  }
}; // return_level


const judge_joho = function(irow) {
  switch (sta[irow][icols.sta.cls]) {
    case '平地':
    case '山沿い':
    case '山間部':
    case '山地': return true;
    default: return false;
  }
}; // judge_joho


const judge_row = function(irow) {
  const area = document.getElementById('area').value;
  const orga = document.getElementById('orga').value;

  if (!make_prefarray(area).some(function(e){ return e == sta[irow][icols.sta.prf]; })) return false;

  if (ival[irow] === undefined || ival[irow] < 0) return false;

  if (
    (orga == 'all') ||
    (orga == 'info' && judge_joho(irow)) ||
    (orga == 'jma'  && sta[irow][icols.sta.org] ==  '1') ||
    (orga == 'ken'  && sta[irow][icols.sta.org] == '10') ||
    (orga == 'mlit' && sta[irow][icols.sta.org] ==  '3') ||
    (orga == 'atom' && sta[irow][icols.sta.org] =='100')
  ) {
    return true;
  }

  return false;
}; // judge_row


const make_chartist_data = function(className, array, labelarray) {
  let obj = {
    labels: labelarray,
    series: [{
      className: className,
      data: remove_flag_4array(array)
    }]
  };
  return obj;
}; // make_chartist_data


const search_chartist_maxmin = function(obj) {
  let max = obj.series[0].data.reduce(function(a, b){ return Math.max((a - 0) || 0, (b - 0) || 0); });
  let min = obj.series[0].data.reduce(function(a, b){ return Math.min((a - 0) || 0, (b - 0) || 0); });
  return [max, min];
}; // search_chartist_maxmin


const makeurl = function() {

  const init = document.getElementById('init').value;
  const area = document.getElementById('area').value;
  const orga = document.getElementById('orga').value;
  const elem = document.getElementById('elem').value;

  let urlstates = new Array();
  if (!!area && area != 'all') urlstates.push('a=' + area);
  if (!!orga && orga != 'all') urlstates.push('o=' + orga);
  if (!!elem && elem != 'snc') urlstates.push('e=' + elem);
  //if ( document.querySelector('#oto'              ).checked) urlstates.push('l=1');
  if (!document.querySelector('#toggle_chohyo'    ).checked) urlstates.push('c=0');
  if ( document.querySelector('#toggle_minicharts').checked) urlstates.push('g=1');
  if (!document.querySelector('#toggle_map'       ).checked) urlstates.push('m=0');

  let urlstate = urlstates.join('&');
  if (urlstate.length > 0) urlstate = '?' + urlstate;
  //urlstate = 'SnowView.html' + urlstate;
  urlstate = location.href.split('/').slice(-1)[0].split('?')[0] + urlstate;
  history.replaceState(null, null, urlstate);
  return urlstate;

}; //function makeurl


const setOpacity = function() { jmatile.setOpacity(document.querySelector('#opacity').value); };


// show usage dialog
const usage = function() { document.querySelector('#usagewrap').style.display = 'block'; };


// generic dialog closer
const cancel = function(id) { document.querySelector(id).style.display = 'none'; };


window.onload = function() {

  initialize();

  document.querySelector('#init_n').addEventListener('mouseup', function() { update();       });
  document.querySelector('#init_b').addEventListener('mouseup', function() { changeinit(-1); });
  document.querySelector('#init_f').addEventListener('mouseup', function() { changeinit( 1); });
  document.querySelector('#init_e').addEventListener('mouseup', function() { changeinit( 0); });

  document.querySelector('#area').addEventListener('change', function() { change4redraw(); });
  document.querySelector('#orga').addEventListener('change', function() { change4redraw(); });

  $('#oto'  ).change(function() { button1();  });
  $('#renew').change(function() { autoload(); });

  $('#toggle_chohyo'    ).change(function() { set_window(); });
  $('#toggle_map'       ).change(function() { set_window(); });
  $('#toggle_minicharts').change(function() { redraw(); });

  document.querySelector('#elem').addEventListener('change', function() { draw_map(); });

  document.querySelector('#graph_close').addEventListener('mouseup', function() { set_point(0); });

  document.querySelector('#button2').addEventListener('mouseup', function() { button2(); });
  document.querySelector('#button3').addEventListener('mouseup', function() { button3(); });

  document.querySelector('#usage'      ).addEventListener('mouseup', function() { usage(); });
  document.querySelector('#usage_close').addEventListener('mouseup', function() { cancel('#usagewrap'); });

  document.querySelector('#opacity').addEventListener('input' , function() { setOpacity(); });
  document.querySelector('#opacity').addEventListener('change', function() { setOpacity(); });

  window.addEventListener('resize', function() { set_window(); });

  document.querySelector('#init').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') { changeinit(98); }
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

    if (e.key.indexOf('Left' ) >= 0 ) { changeinit(-1); }
    if (e.key.indexOf('Right') >= 0 ) { changeinit( 1); }
    if (e.ctrlKey && e.key.indexOf('Left' ) >= 0 ) { changeinit(-24); }
    if (e.ctrlKey && e.key.indexOf('Right') >= 0 ) { changeinit( 24); }

    if (e.key == ' ' || e.key == 'Spacebar') { update(); }

    let areas = new Array();
    let orgas = new Array();
    let elems = new Array();

    document.querySelectorAll('#area option').forEach(function(o){ areas.push(o.value); });
    document.querySelectorAll('#orga option').forEach(function(o){ orgas.push(o.value); });
    document.querySelectorAll('#elem option').forEach(function(o){ elems.push(o.value); });

    const iareacurrent = areas.indexOf(document.getElementById('area').value);
    if (e.shiftKey && e.key.indexOf('Up'  ) >= 0) {
      document.getElementById('area').value = areas[Math.max(0, iareacurrent - 1)];
      redraw();
    }
    if (e.shiftKey && e.key.indexOf('Down') >= 0) {
      document.getElementById('area').value = areas[Math.min(areas.length - 1, iareacurrent + 1)];
      redraw();
    }
    
    const iorgacurrent = orgas.indexOf(document.getElementById('orga').value);
    if (e.altKey && e.key.indexOf('Up'  ) >= 0) {
      document.getElementById('orga').value = orgas[Math.max(0, iorgacurrent - 1)];
      redraw();
    }
    if (e.altKey && e.key.indexOf('Down') >= 0) {
      document.getElementById('orga').value = orgas[Math.min(orgas.length - 1, iorgacurrent + 1)];
      redraw();
    }

    const ielemcurrent = elems.indexOf(document.getElementById('elem').value);
    if (e.ctrlKey && e.key.indexOf('Up'  ) >= 0) {
      document.getElementById('elem').value = elems[Math.max(0, ielemcurrent - 1)];
      draw_map();
    }
    if (e.ctrlKey && e.key.indexOf('Down') >= 0) {
      document.getElementById('elem').value = elems[Math.min(elems.length - 1, ielemcurrent + 1)];
      draw_map();
    }

  });

};
