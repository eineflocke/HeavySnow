// time.js ver1.0.0 2019/03/29 pj194
// 佐藤大輔 <satodai@met.kishou.go.jp>

var Time = new Object();

// 時刻をUTC文字列に変換する。
// time: 時刻
// format: フォーマット文字列
// return: UTC文字列
Time.strUTC = function(time, format) {
    return format.
        replace(/%Y/g, time.getUTCFullYear()).
        replace(/%m/g, this.format02d(time.getUTCMonth() + 1)).
        replace(/%d/g, this.format02d(time.getUTCDate())).
        replace(/%H/g, this.format02d(time.getUTCHours())).
        replace(/%M/g, this.format02d(time.getUTCMinutes()));
}

// 時刻をJST文字列に変換する。
// time: 時刻
// format: フォーマット文字列
// return: JST文字列
Time.strJST = function(time, format) {
    return format.
        replace(/%Y/g, time.getFullYear()).
        replace(/%m/g, this.format02d(time.getMonth() + 1)).
        replace(/%d/g, this.format02d(time.getDate())).
        replace(/%H/g, this.format02d(time.getHours())).
        replace(/%M/g, this.format02d(time.getMinutes()));
}

// 値を"02d"文字列に変換する。
// value: 値
// return: "02d"文字列
Time.format02d = function(value) {
    if (value < 10) {
        return "0" + value;
    } else {
        return "" + value;
    }
}

// UTC文字列を時刻に変換する。
// str: UTC文字列
// return: 時刻
Time.timeUTC = function(str) {
    return new Date(Date.UTC(
        str.substr(0, 4), str.substr(4, 2) - 1, str.substr(6, 2),
        str.substr(8, 2), str.substr(10, 2), str.substr(12, 2)));
}

// JST文字列を時刻に変換する。
// str: JST文字列
// return: 時刻
Time.timeJST = function(str) {
    return new Date(
        str.substr(0, 4), str.substr(4, 2) - 1, str.substr(6, 2),
        str.substr(8, 2), str.substr(10, 2), str.substr(12, 2));
}

