//グローバルな定義
let timelist;
let sta;
let val;

let map;
let legend;
let markerlayer;
let markers = new Array();

let irow_point = 0;

let thresholds = new Object();

thresholds.snc  = [0,9,19,39,59,79,99,149,199];
thresholds.s1h  = [0,1,2,3,4,5,7,9,15];
thresholds.s3h  = [0,1,4,9,14,19,24,29,39];
thresholds.s6h  = [0,1,4,9,14,19,24,29,39];
thresholds.s12h = [0,3,9,19,29,39,49,59,79];
thresholds.s24h = [0,3,9,19,29,39,49,59,79];
thresholds.d1h  = thresholds.s1h;
thresholds.d3h  = thresholds.s3h;
thresholds.d6h  = thresholds.s6h;
thresholds.d12h = thresholds.s12h;
thresholds.d24h = thresholds.s24h;
thresholds.tmp  = [-16.1,-8.1,-4.1,-2.1,-0.1,1.9,3.9,7.9,15.9];

//自動更新
let repeat;

//報知音準備
let audio = document.getElementById('audio');
audio.volume = 0.4;
audio.load();


//時刻設定
function changeinit(amount) {

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

  document.getElementById('init').value = timelist[ndest];
  document.getElementById('init_f').disabled = !!(ndest == 0);
  document.getElementById('init_b').disabled = !!(ndest == timelist.length - 1);

  get_values()
    .then(redraw)
    .catch(function(error) { console.log(error); });

} //function changeinit


let initialize = function() {
  let urlParam = location.search.substring(1);
  let paramArray = [];
  if (urlParam) {
    let param = urlParam.split('&');
    for (let i = 0; i < param.length; i++) {
      let paramItem = param[i].split('=');
      paramArray[paramItem[0]] = paramItem[1];
    }
    if (paramArray['i'] !== undefined) { document.getElementById('init').value = paramArray['i']; }
    if (paramArray['a'] !== undefined) { document.getElementById('area').value = paramArray['a']; }
    if (paramArray['e'] !== undefined) { document.getElementById('elem').value = paramArray['e']; }
    if (paramArray['o'] !== undefined) { document.getElementById('orga').value = paramArray['o']; }
  }
  get_stations()
    .then(get_list)
    .then(function() {
      changeinit(0);
    })
    .catch(function(error) { console.log(error); })
}


let update = function() {
  get_list()
    .then(function() {
      document.getElementById('init').value = timelist[0];
      changeinit(0);
    })
    .catch(function(error) { console.log(error); })
}


let redraw = function() {
  makeurl();
  draw_sheet()
    .then(draw_map)
    .catch(function(error) { console.log(error); })
}


/*
get_list()
  .then(function() { return get_stations(); })
  .then(function() { return get_values();   })
  .then(function() { return draw_sheet();   })
  .then(function() { return draw_map();     })
  .then(function() {
    return Promise.all([
      function() { return get_stations(); },
      function() { return get_values();   }
    ])
  })

get_list()
  .then(draw_sheet)
  .then(draw_map)
  .catch(function(error) { console.log(error); })
  .then(function() { makeurl(); });
*/


let get_list = function() {
  return new Promise(function(resolve, reject) {
    let req = new XMLHttpRequest();
    req.open('get', 'csv/_list.txt', true);
    req.send(null);
    req.onload = function() {
      timelist = req.responseText.replace(/[\r\n]/g, '').split(',');
      if (document.getElementById('init').value == '') document.getElementById('init').value = timelist[0];
      //console.log('done: get_list');
      resolve();
    }; // req.onload
    req.onerror = function() { reject(); };
  });
}; //function get_list


let get_stations = function() {
  return new Promise(function(resolve, reject) {
    let req = new XMLHttpRequest();
    req.open('get', 'csv/stationplus.csv', true);
    req.send(null);
    req.onload = function() {
      let rows = req.responseText.split('\r\n');
      sta = [];
      for (let i = 0; i < rows.length; i++) {
        if (rows[i] == '') { break; }
        sta[i] = rows[i].split(',');
      }
      //console.log('done: get_stations');
      resolve();
    };
    req.onerror = function() { reject(); };
  });
};


let get_values = function() {
  return new Promise(function(resolve, reject) {
    let req = new XMLHttpRequest();
    req.open('get', 'csv/Details_' + document.getElementById('init').value + '.csv', true);
    req.send(null);
    req.onload = function() {
      let rows = req.responseText.split('\r\n');
      val = [];
      for (let i = 0; i < rows.length; i++) {
        if (rows[i] == '') { break; }
        val[i] = rows[i].split(',');
      }
      //console.log('done: get_values');
      resolve();
    };
    req.onerror = function() { reject(); };
  });
};


//データ取得出力本体
let draw_sheet = function() {
  return new Promise(function(resolve, reject) {

    let init = document.getElementById('init').value;
    let area = document.getElementById('area').value;
    let orga = document.getElementById('orga').value;

    let s3k = [], s6k = [], s6t = [], s12t = [];

    let header_sta = [{
        name: '府県',
          icol: sta[0].indexOf('府県'),
          classes: ['td-prf']
      }, { 
        name: '市町村',
          icol: sta[0].indexOf('市町村'),
          classes: ['td-ctv']
      }, {
        name: '区分',
          icol: sta[0].indexOf('区分'),
          classes: ['td-cls']
      }, {
        name: '標高',
          icol: sta[0].indexOf('標高'),
          classes: ['td-alt']
      }, {
        name: '情報発表名',
          icol: sta[0].indexOf('情報発表名'),
          classes: ['td-nam']
    }];
    
    let header_val = [{
        name: '積雪',
          sub:  ['実況', 'あと'],
          icol: [val[0].indexOf('積雪') + 24, val[0].indexOf('積雪') + 24],
          classes: [['td-snc', 'leftline'], ['td-sns']]
      }, {
        name: '気温', 
          sub:  ['実況'],
          icol: [val[0].indexOf('気温') + 24],
          classes: [['td-tmp', 'leftline']]
      }, {
        name: '降雪深', 
          sub:  ['S3', 'S6', 'S12', 'S24'],
          icol: [val[1].indexOf('S3'), val[1].indexOf('S6'), val[1].indexOf('S12'), val[1].indexOf('S24')],
          classes: [['td-snn', 'leftline'], ['td-snn'], ['td-snn'], ['td-snn']]
      }, {
        name: '積雪深差', 
          sub:  ['D3', 'D6', 'D12', 'D24'],
          icol: [val[1].indexOf('D3'), val[1].indexOf('D6'), val[1].indexOf('D12'), val[1].indexOf('D24')],
          classes: [['td-dnn', 'leftline'], ['td-dnn'], ['td-dnn'], ['td-dnn']]
    }];

    let insert = '';

    //データ出力。上端固定部分
    insert += '<tr>';

    header_sta.forEach(function(h) {
      let solo = h.name;
      let thattr = '';
      thattr += ' class="' + h.classes.join(' ') + '"';
      thattr += ' rowspan="2"';
      if (h.name == '情報発表名') solo += '</th><th rowspan="2" class="td-ico"><span>地点詳細</span></th><th rowspan="2" class="td-ico"><span>取得元</span>';
      insert += '<th' + thattr + '>' + solo + '</th>';
    });

    header_val.forEach(function(h) {
      let solo = h.name;
      let thattr = '';
      if (h.sub === undefined) {
        thattr += ' rowspan="2"';
      } else {
        thattr += ' colspan="' + h.sub.length + '"';
      }
      insert += '<th' + thattr + '>' + solo + '</th>';
    });

    if (document.querySelector('#graph').checked) {
      insert += '<th rowspan="2" class="td-cht leftline">24h推移<br /><span class="col-snc">―: 積雪深</span> <span class="col-s01">■: S1</span></th>';
    }

    insert += '</tr>';
    insert += '<tr>';

    header_val.forEach(function(h) {
      for (let i = 0; i < h.sub.length; i++) {
        let solo = h.sub[i];
        let thattr = '';
        thattr += ' class="' + h.classes[i].join(' ') + '"';
      if (h.classes.indexOf('td-s01') >= 0) solo += '<sup>h</sup>';
        insert += '<th' + thattr + '>' + solo + '</th>';
      }
    });

    insert += '</tr>';

    document.querySelector('#fixheader').innerHTML = insert;

    for (let irow = 2; irow < sta.length; irow++) {

      if (!judge_row(irow, area, orga)) continue;

      insert += '<tr id="no' + irow+ '">';

      //stationシートから（左側定数部）
      header_sta.forEach(function(h) {
        let solo = sta[irow][h.icol];

        let tdclasses = h.classes.concat();

        let onclick = ' onclick="set_point(' + irow + ');"';
        tdclasses.push('set_point');

        if (h.name == '区分') {
          let tdappend = (
            (solo == '平地'    ) ? 'colG' :
            (solo == '平地以外') ? 'colR' :
            (solo == '200m未満') ? 'colGlight' :
            (solo == '200m以上') ? 'colRlight' : 'colK'
          );
          tdclasses.push(tdappend);
        } else if (h.name == '標高') {
          tdclasses.push('alignright');
          solo = solo + '<span class="td-alt-unit">m</span>';
        } else if (h.name == '情報発表名') {
          let solo1 = solo.replace(/\(.+/g, '');
          let solo2 = solo.substring(solo.indexOf('('));
          solo = '<span class="td-nam-main">' + solo1 + '</span>';
          if (solo1 != solo2) solo += '<span class="td-nam-sub">' + solo2 + '</span>';
          solo += '</td><td class="td-ico set_point"' + onclick + '>&#x1f4cd;</td><td class="td-ico"><a href="' + sta[irow][sta[0].indexOf('URL')] + '" target="_blank">&#x1f310;</a>';
        }

        insert += '<td class="' + tdclasses.join(' ') + '"' + onclick + '>' + solo + '</td>';
      });

      //if (sta[irow][] != val[irow][0]) continue;

      //So_シートから（右側変数部）
      header_val.forEach(function(h) {
        for (let i = 0; i < h.sub.length; i++) {
          let solo = val[irow][h.icol[i]];

          let solonum  = split_flag(solo)[0];
          let soloflag = split_flag(solo)[1];

          let k_limit_hour = sta[irow][17];
          let k_limit_val  = sta[irow][18] - 0 || 0;
          let t_limit_hour = sta[irow][19];
          let t_limit_val  = sta[irow][20] - 0 || 0;
          let s_val        = sta[irow][21];
          let s_limit      = sta[irow][22];

          if (h.sub[i] == 'あと') {
            if (sta[irow][ 8].indexOf('平地') < 0 || isNaN(s_val) || isNaN(s_limit)) {
              solo = '-';
              solonum = NaN;
            } else {
              solonum = s_val - solonum;
            }
          }
  
          let tdclasses = h.classes[i].concat();
  
          if        (solo == 'X' || solo == '-') {
            tdclasses.push('sX');
          } else if (h.sub[i] == 'あと') {
            if (solonum <= s_limit) {
              tdclasses.push('joho');
            } else {
              tdclasses.push('lv0');
            }
          } else if (h.sub[i] == 'S3'  && t_limit_hour ==  3 && t_limit_val <= solonum) {
            tdclasses.push('joho');
            s3k.push(irow);
          } else if (h.sub[i] == 'S6'  && t_limit_hour ==  6 && t_limit_val <= solonum) {
            tdclasses.push('joho');
            s6k.push(irow);
          } else if (h.sub[i] == 'S6'  && k_limit_hour ==  6 && k_limit_val <= solonum) {
            tdclasses.push('joho');
            s6t.push(irow);
          } else if (h.sub[i] == 'S12' && k_limit_hour == 12 && k_limit_val <= solonum) {
            tdclasses.push('joho');
            s12t.push(irow);
          } else if (h.sub[i] == '最新') {
            tdclasses.push('lv0');
          } else {
            let iki = (
              (h.name == '気温') ? thresholds.tmp :
              (h.name == '積雪' && h.sub[i] == '実況') ? thresholds.snc  :
              (h.sub[i].substring(1) == '24') ? thresholds.s24h :
              (h.sub[i].substring(1) == '12') ? thresholds.s12h :
              (h.sub[i].substring(1) ==  '6') ? thresholds.s6h  :
              (h.sub[i].substring(1) ==  '3') ? thresholds.s3h  : thresholds.s1h
            );
  
            let thin = '';
            if (h.name == '気温') thin = 't';
            tdclasses.push(thin + return_level(solonum, iki));
          }
  
          if (!isNaN(solonum)) solo = solonum + '<span class="soloflag">' + soloflag + '</span>';
          insert += '<td class="' + tdclasses.join(' ') + '">' + solo + '</td>';
        }
      });

      if (document.querySelector('#graph').checked) {
        insert += '<td class="chart_container leftline set_point" onclick="set_point(' + irow + ');"><div id="chart1_' + irow + '"></div><div id="chart2_' + irow + '"></div><div id="chart3_' + irow + '"></div></td>';
      }

      insert += '</tr>';
    } // for irow

    document.querySelector('#sheet').innerHTML = insert;

    if (document.querySelector('#graph').checked) {
      for (let irow = 2; irow < sta.length; irow++) {

        if (!judge_row(irow, area, orga)) continue;

        let data1 = make_chartist_data('chart-snc', val[irow].slice(34, 59), val[0].slice( 9, 34));
        let data2 = make_chartist_data('chart-s01', val[irow].slice(10, 34), val[0].slice(10, 34));

        let config_common = {
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
          showPoint: false
        };

        let config1 = JSON.parse(JSON.stringify(config_common));
        let config2 = JSON.parse(JSON.stringify(config_common));

        config1.showArea = true;
        config1.lineSmooth = false;

        let data1max = search_chartist_maxmin(data1)[0];
        let data2max = search_chartist_maxmin(data2)[0];
        config1.high = Math.max( 8, data1max);
        config2.high = Math.max( 8, data2max);

        new Chartist.Line('#chart1_' + irow, data1, config1);
        if (data2max > 0) new Chartist.Bar ('#chart2_' + irow, data2, config2);
      }
    }

    //報知文作成
    let makealert = function(attr, hour, attrary) {
      let alertstr = '';
      if (attrary.length !== 0) {
        let attrcol = (
          hour == 'S3'  ? 3 :
          hour == 'S6'  ? 4 :
          hour == 'S12' ? 5 : null
        );
        for (let i = 0; i < attrary.length; i++) {
          alertstr += '<tr>';
          alertstr += '<td>' + attr + hour + '</td>';
          alertstr += '<td>' + sta[attrary[i]][4] + '-' + sta[attrary[i]][5] + '-' + sta[attrary[i]][8] + '</td>';
          alertstr += '<td>' + sta[attrary[i]][11] + '</td>';
          alertstr += '<td>' + hour + '実況&nbsp;&nbsp;' + val[attrary[i]][attrcol] + 'cm</td>';
          alertstr += '</tr>';
        }
      }
      return alertstr;
    }

    let alerttext = '';
    alerttext += makealert('記録雪', 'S3' , s3k );
    alerttext += makealert('記録雪', 'S6' , s6k );
    alerttext += makealert('短時間', 'S6' , s6t );
    alerttext += makealert('短時間', 'S12', s12t);

    document.querySelector('#choka').innerHTML = alerttext;

    if (document.getElementById("oto").checked && init == timelist[0]) {
      if (alerttext !== '') {
        audio.play();
        document.getElementById('button1wrap').style.display = 'block';
      }
    }

    if (alerttext == '' && !audio.paused) { button3(); }

    window.addEventListener('scroll', function() {
      document.getElementById("fixheader").style.left = (-1 * window.scrollX) + "px";
    }, false);

    $('#fixheader').width($('#sheet').width());

    set_window();
    //if (rightroom >= 500) callback();

    resolve();

  });

}; //function draw_sheet


let draw_map = function() {
  return new Promise(function(resolve, reject) {

    let init = document.getElementById('init').value;
    let area = document.getElementById('area').value;
    let elem = document.getElementById('elem').value;
    let orga = document.getElementById('orga').value;

    if (map === undefined) {
      map = L.map('map_container', {
        center: [37, 138],
        zoom: 7,
        minZoom: 7,
        maxZoom: 16
      });

      L.control.scale({maxWidth:200,position:'bottomright',imperial:false}).addTo(map);
      map.setMaxBounds([[40, 132],[34, 144]]);

      //地理院地図の白地図タイル
      var gsishiro =L.tileLayer('http://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png', 
        {attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"});
      //地理院地図の標準地図タイル
      var gsi =L.tileLayer('http://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', 
        {attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>", opacity: 0.4});
      //地理院地図の淡色地図タイル
      var gsipale = L.tileLayer('http://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
        {attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"});
      //色別標高図
      var hyokou = L.tileLayer('http://cyberjapandata.gsi.go.jp/xyz/relief/{z}/{x}/{y}.png',
        {attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"});
      //全国最新写真
      var foto = L.tileLayer('http://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg',
        {attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"});

      //baseMapsオブジェクトのプロパティに5つのタイルを設定
      var baseMaps = {
        "白地図" : gsishiro,
        "地理院地図" : gsi,
        "淡色地図" : gsipale,
        "色別標高図"  : hyokou,
        "全国最新写真" : foto
      };

      //layersコントロールにbaseMapsオブジェクトを設定して地図に追加
      L.control.layers(baseMaps).addTo(map);
      gsi.addTo(map);
    }

    let iki = thresholds[elem];

    let bararray = ['snc', '1h', '3h_6h', '12h_24h', 'tmp'];
    let bar;
    bararray.forEach(function(b) { if (b.indexOf(elem.substring(1)) >= 0) bar = b; });

    let elemnums = (
      (elem == 'snc' ) ? val[0].indexOf('積雪') + 24 :
      (elem == 's1h' ) ? val[0].indexOf('S1'  ) + 24 :
      (elem == 'tmp' ) ? val[0].indexOf('気温') + 24 :
      (elem == 's3h' ) ? val[1].indexOf('S3' ) :
      (elem == 's6h' ) ? val[1].indexOf('S6' ) :
      (elem == 's12h') ? val[1].indexOf('S12') :
      (elem == 's24h') ? val[1].indexOf('S24') :
      (elem == 'd3h' ) ? val[1].indexOf('D3' ) :
      (elem == 'd6h' ) ? val[1].indexOf('D6' ) :
      (elem == 'd12h') ? val[1].indexOf('D12') :
      (elem == 'd24h') ? val[1].indexOf('D24') : null
    );

    let thin = '';
    let si = 'cm';
    if (elem == 'tmp') {
      thin = 't';
      si = '℃';
    }

    //プロット点と凡例の削除
    if (markerlayer !== undefined) {
      map.removeLayer(markerlayer);
      markerlayer = undefined;
    }
    if (legend !== undefined) {
      map.removeControl(legend);
      legend = undefined;
    }

    //プロット点の再定義
    let ilat = sta[0].indexOf('緯度');
    let ilon = sta[0].indexOf('経度');
    let iinf = sta[0].indexOf('情報発表名');
    let ialt = sta[0].indexOf('標高');

    markerlayer = new L.LayerGroup();
    for (let irow = 2; irow < sta.length; irow++) {
      if (!judge_row(irow, area, orga)) continue;

      let solo = val[irow][elemnums];

      let className = 'M' + thin + return_level(solo, iki);
      if (['MtlvX', 'Mtlv-'].indexOf(className) >= 0) continue;

      let mpoint = [sta[irow][ilat], sta[irow][ilon]];
      let ten = L.divIcon({
        title: sta[irow][iinf],
        className: className,
        iconAnchor: [6, 6]
      });
      markers[irow] = new L.marker(
        mpoint, 
        { icon: ten }
      ).bindTooltip(
        sta[irow][iinf] + '<br />' + 
        '<strong>' + split_flag(solo)[0] + si + '</strong>', 
        {
          offset: [-9, 0], 
          direction: 'left'
        }
      ).addTo(markerlayer).on('click', function(e) { set_point(e.target.irow); });
      markers[irow].irow = irow;
    }
    markerlayer.addTo(map);

    legend = L.control({ position: 'bottomright' });
    legend.onAdd = function() {
      var img = L.DomUtil.create('img');
      img.src = "lib/img/" + bar + ".png";
      return img;
    };
    legend.addTo(map);

    if (irow_point > 0) set_point(irow_point);

    makeurl();

    resolve();

  });

}; // function draw_map


/* misc functions */

//自動更新スイッチ
function autoload() {
  if        ( document.getElementById("renew").checked && repeat === undefined) {
    repeat = setInterval(function() { update(); }, 300000);
  } else if (!document.getElementById("renew").checked && repeat !== undefined) {
    clearInterval(repeat);
    repeat = undefined;
  }
}

//報知停止ボタン
function button2() {
  audio.pause();
  audio.currentTime = 0;
}

function button3() {
  button2();
  document.getElementById('button1wrap').style.display = 'none';
}

let set_window = function() {
  $('body'       ).css('padding-top', $('#tabs').height() - 0);
  $('#fixheader' ).css('top'        , $('#tabs').height() - 0);
  $('#right_pane').css('top'        , $('#tabs').height() - 0);

  let rightroom = document.body.clientWidth - document.querySelector('#sheet').clientWidth;
  if (rightroom < 500) {
    document.querySelector('#right_pane').style.display = 'none';
  } else {
    document.querySelector('#right_pane').style.display = 'block';
    document.querySelector('#right_pane').style.left = document.querySelector('#sheet').clientWidth + 'px';
    document.querySelector('#right_pane').style.width = rightroom + 'px';
    //document.querySelector('body').style.width = document.body.clientWidth + 'px';
  }
  return rightroom;
};

let make_prefarray = function(area) {
  let prefarray = new Array();
  switch (area) {
    case 'all' : prefarray = ['新潟','富山','石川','福井','栃木','群馬','長野']; break;
    case 'ngt' : prefarray = ['新潟']; break;
    case 'tym' : prefarray = ['富山']; break;
    case 'isk' : prefarray = ['石川']; break;
    case 'fki' : prefarray = ['福井']; break;
    case 'gnm' : prefarray = ['群馬']; break;
    case 'tcg' : prefarray = ['栃木']; break;
    case 'ngn' : prefarray = ['長野']; break;
    case 'hok' : prefarray = ['新潟','富山','石川','福井']; break;
    case 'ngtgnmngn' : prefarray = ['新潟','群馬','長野']; break;
    default: prefarray = [];
  }
  return prefarray;
}

let split_flag = function(v) {
  let vnum  = v.replace(/[F\)\]#]+/g  , '');
  let vflag = v.replace(/[X0-9\.\-]+/g, '');
  return [vnum, vflag];
};

let remove_flag_4array = function(array) {
  let ret = new Array();
  array.forEach(function(e) {
    ret.push(split_flag(e)[0]);
  });
  return ret;
};

let return_level = function(v, thr) {
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
};

let judge_row = function(irow, area, orga) {
  let iprf = sta[0].indexOf('府県');
  if (!make_prefarray(area).some(function(e){ return e == sta[irow][iprf]; })) return false;

  let iorg = sta[0].indexOf('所属');
  let icls = sta[0].indexOf('区分');
  if (
    !(
      (orga == 'all') ||
      (orga == 'jma'  && sta[irow][iorg] ==  '1') ||
      (orga == 'info' && sta[irow][icls].indexOf('平地') >= 0) ||
      (orga == 'ken'  && sta[irow][iorg] == '10') ||
      (orga == 'mlit' && sta[irow][iorg] ==  '3')
    )
  ) {
    return false;
  }

  return true;
};

let make_chartist_data = function(className, array, labelarray) {
  let obj = {
    labels: labelarray,
    series: [{
      className: className,
      data: remove_flag_4array(array)
    }]
  };
  return obj;
};

let search_chartist_maxmin = function(obj) {
  let max = obj.series[0].data.reduce(function(a, b){ return Math.max((a - 0) || 0, (b - 0) || 0); });
  let min = obj.series[0].data.reduce(function(a, b){ return Math.min((a - 0) || 0, (b - 0) || 0); });
  return [max, min];
};

let set_point = function(irow) {

  irow_point = irow;

  let init = document.getElementById('init').value;

  Array.prototype.slice.call(document.querySelectorAll('#sheet tr')).forEach(function(e) {
    e.classList.remove('point_selected_tr');
  });
  Array.prototype.slice.call(document.querySelectorAll('#sheet tr td')).forEach(function(e) {
    e.classList.remove('point_selected_td');
  });

  if (document.querySelector('#right_pane').style.display != 'block') irow = 0;

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

  let row = sta[irow];

  let lat = sta[irow][26];
  let lon = sta[irow][27];

  map.setView([lat, lon], 11);

  let label24 = val[1].slice(10, 34);
  let label25 = val[1].slice( 9, 34);

  let datas1   = make_chartist_data('chartbig-s01', val[irow].slice(10, 34), label24);
  let datasd   = make_chartist_data('chartbig-snc', val[irow].slice(34, 59), label25);
  let datatemp = make_chartist_data('chartbig-tmp', val[irow].slice(59, 84), label25);

  let config_common = {
    low: 0,
    axisX: {},
    axisY: {},
    fullWidth: true,
    showPoint: true,
    lineSmooth: false,
    showArea: true,
    chartPadding: {
      top:   30,
      bottom: 0,
      left:  10,
      right: 30
    },
    plugins: [],
  };

  let configs1   = JSON.parse(JSON.stringify(config_common));
  let configsd   = JSON.parse(JSON.stringify(config_common));
  let configtemp = JSON.parse(JSON.stringify(config_common));

  configs1  .plugins.push(Chartist.plugins.ctPointLabels());
  configsd  .plugins.push(Chartist.plugins.ctPointLabels());
  configtemp.plugins.push(Chartist.plugins.ctPointLabels());

  configs1  .plugins.push(Chartist.plugins.ctAxisTitle({
    axisY: { offset: { x: 0, y: 15 },flipTitle: true, axisTitle: 'S1 [cm]' },
  }));
  configsd  .plugins.push(Chartist.plugins.ctAxisTitle({
    axisY: { offset: { x: 0, y: 15 },flipTitle: true, axisTitle: '積雪深 [cm]' },
  }));
  configtemp.plugins.push(Chartist.plugins.ctAxisTitle({
    axisY: { offset: { x: 0, y: 15 },flipTitle: true, axisTitle: '気温 [℃]' },
  }));

  configs1.high   = Math.max( 8, 1.2 * search_chartist_maxmin(datas1  )[0]);
  configsd.high   = Math.max( 8, 1.2 * search_chartist_maxmin(datasd  )[0]);
  configtemp.high = Math.max( 2, 1.2 * search_chartist_maxmin(datatemp)[0]);
  configtemp.low  = Math.min(-2, 1.2 * search_chartist_maxmin(datatemp)[1]);

  configsd  .axisX.labelOffset = { x: -7, y: 0 };
  configtemp.axisX.labelOffset = { x: -7, y: 0 };

  configsd.showArea = true;
  configsd.lineSmooth = false;

  new Chartist.Line('#chartbig-snc', datasd  , configsd  );
  new Chartist.Bar ('#chartbig-s01', datas1  , configs1  );
  new Chartist.Line('#chartbig-tmp', datatemp, configtemp);

  let behind_header = row[4] + ' ' + row[11] + ' ';
  let behind_footer = ' ～' + init.substring(4, 6) + '/' + init.substring(6, 8) + ' ' + init.substring(8, 10) + ':00';
  
  document.querySelector('#behind-chartbig-s01').innerHTML = behind_header + 'S1'     + behind_footer;
  document.querySelector('#behind-chartbig-snc').innerHTML = behind_header + '積雪深' + behind_footer;
  document.querySelector('#behind-chartbig-tmp').innerHTML = behind_header + '気温'   + behind_footer;

};

//urlのおしり
function makeurl() {

  let init = document.getElementById('init').value;
  let area = document.getElementById('area').value;
  let elem = document.getElementById('elem').value;
  let orga = document.getElementById('orga').value;

  let urlstates = new Array();
  if (!!area && area != 'all') urlstates.push('a=' + area);
  if (!!orga && orga != 'all') urlstates.push('o=' + orga);
  if (!!elem && elem != 'snc') urlstates.push('e=' + elem);

  let urlstate = urlstates.join('&');
  if (urlstate.length > 0) urlstate = '?' + urlstate;
  urlstate = 'SnowView.html' + urlstate;
  history.replaceState(null, null, urlstate);
  return urlstate;

} //function makeurl


//キーコマンド
window.addEventListener('resize', function() { set_window(); });

document.getElementById('init').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') { changeinit(98); }
});

document.body.addEventListener('keydown', function(e) {
  if (e.key.indexOf('Left' ) >= 0 ) { changeinit(-1); }
  if (e.key.indexOf('Right') >= 0 ) { changeinit( 1); }
  if (e.ctrlKey && e.key.indexOf('Left' ) >= 0 ) {  changeinit(-23); }
  if (e.ctrlKey && e.key.indexOf('Right') >= 0 ) {  changeinit( 23); }
  if (e.key == " " || e.key == "Spacebar") { update(); }

  let areas = new Array();
  let orgas = new Array();
  let elems = new Array();

  document.querySelectorAll('#area option').forEach(function(o){ areas.push(o.value); });
  document.querySelectorAll('#orga option').forEach(function(o){ orgas.push(o.value); });
  document.querySelectorAll('#elem option').forEach(function(o){ elems.push(o.value); });

  let iareacurrent = areas.indexOf(document.getElementById('area').value);
  if (e.shiftKey && e.key.indexOf('Up'  ) >= 0) {
    document.getElementById('area').value = areas[Math.max(0, iareacurrent - 1)];
    redraw();
  }
  if (e.shiftKey && e.key.indexOf('Down') >= 0) {
    document.getElementById('area').value = areas[Math.min(areas.length - 1, iareacurrent + 1)];
    redraw();
  }
  
  let iorgacurrent = orgas.indexOf(document.getElementById('orga').value);
  if (e.altKey && e.key.indexOf('Up'  ) >= 0) {
    document.getElementById('orga').value = orgas[Math.max(0, iorgacurrent - 1)];
    redraw();
  }
  if (e.altKey && e.key.indexOf('Down') >= 0) {
    document.getElementById('orga').value = orgas[Math.min(orgas.length - 1, iorgacurrent + 1)];
    redraw();
  }

  let ielemcurrent = elems.indexOf(document.getElementById('elem').value);
  if (e.ctrlKey && e.key.indexOf('Up'  ) >= 0) {
    document.getElementById('elem').value = elems[Math.max(0, ielemcurrent - 1)];
    draw_map();
  }
  if (e.ctrlKey && e.key.indexOf('Down') >= 0) {
    document.getElementById('elem').value = elems[Math.min(elems.length - 1, ielemcurrent + 1)];
    draw_map();
  }

  if (e.key == "Backspace") {
    document.getElementById('area').value = "all";
    document.getElementById('orga').value = "all";
    redraw();
  }
});
