#!/usr/local/bin/python3
# -*- coding: utf-8 -*-

'''
1_snow.py: background csv processing tool for heavy-snow ws

2020-10-23 Y. Yogo
    initiated (transplanted from ExcelVBA)
'''

import os

os.chdir(os.path.dirname(__file__))

import sys
import csv
import json
import glob
import re
import urllib.request
from bs4 import BeautifulSoup
from datetime import datetime, timezone, timedelta

if "tkni" in os.uname().nodename.lower():
    os.environ["http_proxy" ] = "172.17.228.1:8090"
    os.environ["https_proxy"] = "172.17.228.1:8090"
    os.environ["no_proxy"   ] = "kishou.go.jp"

    import ssl
    ssl._create_default_https_context = ssl._create_unverified_context

################################
### define general functions ###
################################

ymdhjstnow = datetime.now().strftime("%Y%m%d%H")

def usage():
    print(''' 
usage: %s [abfghiklnopt] [yyyymmddhh in JST]

download mode: a = all
               mlit:
                h = hokuriku (latest only)
                k = kinki    (latest only)
                l = kanto    (latest only)
                g = takasaki (latest only)
                o = nagano   (latest only)
               pref:
                n = niigata  (latest only)
                t = toyama   (latest only)
                i = ishikawa (latest only)
                f = fukui    (latest only)
                c = tochigi  (latest only)
               j = jma-hp    (latest only)
               b = bufr      (time selectable)

process mode : p             (time selectable)
    ''' % __file__)
    sys.exit(1)

def printmsg(msg):
    print(datetime.now().strftime("[%H:%M:%S] ") + str(msg))

def ft2valid(init, ft, is24 = False, timeshift = 0):
    init_datetime  = datetime.strptime(str(init) + "+0000", "%Y%m%d%H%z")
    valid_datetime = init_datetime + timedelta(hours = int(ft) + timeshift)
    valid          = valid_datetime.strftime("%Y%m%d%H")

    if is24 and valid[8:10] == "00":
        valid_minus1d = (valid_datetime + timedelta(hours = -24)).strftime("%Y%m%d")
        valid         = valid_minus1d + "24"

    return valid

def get_init(ymdh, wait_min, init_interval_hour):
    jst = timezone(timedelta(hours=+9), "JST")
    utc = timezone(timedelta(hours= 0), "UTC")
    now = datetime.now(jst)

    init_interval_sec = init_interval_hour * 60 * 60

    init_unixtime = datetime.strptime((ymdh + "+0000"), "%Y%m%d%H%z").astimezone(jst)
    init_unixtime = (int(init_unixtime.strftime("%s")) // init_interval_sec) * init_interval_sec
    init_datetime = datetime.fromtimestamp(init_unixtime).astimezone(utc)
    init          = init_datetime.strftime("%Y%m%d%H")

    latest_unixtime = int((now + timedelta(minutes = -1 * wait_min)).strftime("%s"))
    latest_unixtime = (latest_unixtime // init_interval_sec) * init_interval_sec
    latest_datetime = datetime.fromtimestamp(latest_unixtime).astimezone(utc)
    latest          = latest_datetime.strftime("%Y%m%d%H")

    if int(latest) < int(init):
        init = latest

    return init

def downloader(url, filepath):
    if not os.path.isdir(os.path.dirname(filepath)):
        os.makedirs(os.path.dirname(filepath))

    if not os.path.isfile(filepath):
        printmsg("downloading: " + url)
        urllib.request.urlretrieve(url, filepath)
        printmsg("downloaded : " + filepath)

def downloader4latest(url, filename, wait_min):
    ymdhfile = get_init(ymdhjstnow, wait_min = wait_min, init_interval_hour = 1)
    ymdhfile = ft2valid(ymdhfile, 9)
    filepath = "raw/" + ymdhfile + "/" + filename

    downloader(url, filepath)

#############
### setup ###
#############

args = sys.argv

if   len(args) == 2:
    symbols = args[1].lower()
    ymdhjst = ymdhjstnow

elif len(args) == 3:
    symbols = args[1].lower()
    ymdhjst = args[2]

else:
    usage()

if any(s.isdigit() for s in symbols):
    usage()

printmsg("started with " + symbols + ", " + ymdhjst)

if "a" in symbols:
    symbols += "bcdefghijklmnoqrstuvwxyz"

ymdhutc = ft2valid(ymdhjst, -9, False, 0)

with open("csv/station.csv", "r", encoding="utf-8") as f:
    reader = csv.reader(f, delimiter=",")
    stations = [row for row in reader]
    stacolnames = stations[0]
    del stations[0]
    del stations[0]

colpref   = stacolnames.index("府県")
colorg    = stacolnames.index("所属")
#colsimple = stacolnames.index("観測所名")
colname   = stacolnames.index("情報発表名")
colnum    = stacolnames.index("観測所番号")
coljma    = stacolnames.index("JMA番号")
colqc     = stacolnames.index("気温JMA番号")
colsd     = stacolnames.index("積雪基準")

########################
### data acquisition ###
########################

#################################################################
### mlit                                                      ###
### hokuriku: json  / every 10m after 07min / 1h SD, S1, Temp ###
### kinki   : json  / hourly    after 10min / 1h SD, S1, Temp ###
### kanto   : json  / every 10m after 07min / 1h SD, S1       ###
### takasaki: table / every 10m after 03min / 1h SD,     Temp ###
### nagano  : json  / every 10m after 09min / 1h SD           ###
#################################################################

if "h" in symbols:
    try:
        for elem in ["snow", "temperature"]:
            url      = "https://its.hrr.mlit.go.jp/json/" + elem + ".json"
            filename = "mlit_hokuriku_" + elem + ".json"
            downloader4latest(url, filename, 10)

    except:
        printmsg("download failed: mlit-hokuriku")

if "k" in symbols:
    try:
        for elem in ["snow", "temperature"]:
            url      = "http://road.kkr.mlit.go.jp/road/json/" + elem + ".json"
            filename = "mlit_kinki_" + elem + ".json"
            downloader4latest(url, filename, 10)

    except:
        printmsg("download failed: mlit-kinki")

if "l" in symbols:
    try:
        url      = "http://www.road.ktr.mlit.go.jp/php/snow/get_list.php"
        filename = "mlit_kanto.json"
        downloader4latest(url, filename, 10)

    except:
        printmsg("download failed: mlit-kanto")

if "g" in symbols:
    try:
        url      = "https://www.ktr.mlit.go.jp/takasaki/road/xml01.html"
        filename = "mlit_takasaki.html"
        downloader4latest(url, filename, 4)

    except:
        printmsg("download failed: mlit-takasaki")

if "o" in symbols:
    try:
        url      = "https://www.ktr.mlit.go.jp/nagano/douroinfo/data/snow/now/22_60_83_781.jsn"
        filename = "mlit_nagano.json"
        downloader4latest(url, filename, 8)

    except:
        printmsg("download failed: mlit-nagano")

###############################################################
### pref                                                    ###
### niigata : table / hourly after 07min / 47h SD, S1, Temp ###
### toyama  : json  / hourly after 15min / 24h SD, S1, Temp ###
### ishikawa: json  / hourly after 10min /  1h SD, S1, Temp ###
### fukui   : json  / hourly after 10min / 25h SD, S1, Temp ###
### tochigi : json  / hourly after 03min /  1h SD,     Temp ###
###############################################################

if "n" in symbols:
    try:
        urlpre = "http://doboku-bousai.pref.niigata.jp/douro/servlet/bousaiweb.servletBousaiTableDetail?sy=gra_snow&rg=2&sn="

        for row in stations:
            if row[colpref] == "新潟" and row[colorg] == "10":
                id       = row[colnum].strip()
                url      = urlpre + id
                filename = "niigata_" + id + ".html"
                downloader4latest(url, filename, 10)

    except:
        printmsg("download failed: niigata-pref")

if "t" in symbols:
    try:
        url      = "https://www.toyama-douro.toyama.toyama.jp/json/snow.json"
        filename = "toyama.json"
        downloader4latest(url, filename, 10)

    except:
        printmsg("download failed: toyama-pref")

if "i" in symbols:
    try:
        url      = "https://douro.pref.ishikawa.lg.jp/api/getSnow"
        filename = "ishikawa.json"
        downloader4latest(url, filename, 10)

    except:
        printmsg("download failed: ishikawa-pref")

if "f" in symbols:
    url      = "http://info.pref.fukui.jp/hozen/yuki/assets/jsons/weathers.json"
    filename = "fukui.json"
    try:
        downloader4latest(url, filename, 10)

    except:
        printmsg("download failed: fukui-pref")

if "c" in symbols:
    url      = "http://www.kendo.pref.tochigi.lg.jp/roadinfo/StateWindowService.asmx/GetNowStateWindowItem"
    ymdhfile = get_init(ymdhjstnow, wait_min = 5, init_interval_hour = 1)
    ymdhfile = ft2valid(ymdhfile, 9)

    for row in stations:
        try:
            if row[colpref] == "栃木" and row[colorg] == "10":
                filepath = "raw/" + ymdhfile + "/" + "tochigi_" + row[colnum].strip() + ".json"

                if not os.path.isdir(os.path.dirname(filepath)):
                    os.makedirs(os.path.dirname(filepath))

                params = json.dumps({
                    "bordID": row[colnum].strip(),
                    "bordKind": "WK", "ctrlID": None, "args1": ["NaturalSnow", "Temp"], "args2": None
                }).encode("utf-8")

                req = urllib.request.Request(
                    url = url,
                    method = "POST",
                    headers = { "Content-Type" : "application/json" },
                    data = params
                )

                if not os.path.isfile(filepath):
                    printmsg("downloading: " + url)

                    res = urllib.request.urlopen(req, timeout = 5).read().decode("utf-8")
                    res = json.loads(res)
                    json.dump(res, open(filepath, "w", encoding = "utf_8"), indent = 4)

                    printmsg("downloaded : " + filepath)

        except:
            printmsg("download failed: tochigi-pref")

################################################
### jmahp                                    ###
### table / hourly after ??min / 1h SD, Temp ###
################################################

if "j" in symbols:
    try:
        for row in stations:
            if row[colorg] == "1":
                jma      = row[colqc].strip()[1:]
                url      = "https://www.jma.go.jp/jp/amedas_h/today-" + jma + ".html"
                filename = "jmahp_" + jma + ".html"
                downloader4latest(url, filename, 10)

                url      = "https://www.jma.go.jp/jp/amedas_h/yesterday-" + jma + ".html"
                ymdhyest = ft2valid(ymdhjstnow, -1, False)[0:8] + "00"
                filepath = "raw/" + ymdhyest + "/jmahp_" + jma + ".html"
                downloader(url, filepath)

    except:
        printmsg("download failed: jmahp")

#################################################
### bufr                                      ###
### csv / hourly after 14min / 1h SD (, Temp) ###
#################################################

'''
if "b" in symbols:
    try:
        url      = "ftp://172.18.133.7/data2/obsdata/bdata/" + ymdhutc[0:8] + "/bdata_" + ymdhutc + "00_n3.txt"
        filepath = "raw/" + ymdhjst + "/bufr.txt"
        downloader(url, filepath)

    except:
        printmsg("download failed: bufr")
'''

#######################
### data processing ###
#######################

if "p" in symbols:
    printmsg("processing started")

    out = [["" for x in range(25)] for y in range(len(stations) + 2)]
    det = [["" for x in range(85)] for y in range(len(stations) + 2)]

    out[0][ 0] = "情報発表名"
    out[0][ 1] = "積雪"
    out[1][ 1] = "余裕"
    out[1][ 2] = "実況"
    out[0][ 3] = "降雪深"
    out[1][ 3] = "S3"
    out[1][ 4] = "S6"
    out[1][ 5] = "S12"
    out[1][ 6] = "S24"
    out[0][ 7] = "積雪深差"
    out[1][ 7] = "D3"
    out[1][ 8] = "D6"
    out[1][ 9] = "D12"
    out[1][10] = "D24"
    out[0][23] = "気温"
    out[1][23] = "実況"
    out[0][24] = "最新"

    for backhour in range(0, 11+1, 1):
        ymdhback = ft2valid(ymdhjst, -1 * backhour, True, 0)
        out[0][22 - backhour] = ""
        out[1][22 - backhour] = ymdhback[8:10]

        if   backhour == 0 or backhour == 11 or ymdhback[8:10] == "01":
            out[0][22 - backhour] = ymdhback[6: 8]

    det[0][ 0] = "情報発表名"
    det[0][ 1] = "降雪深"
    det[1][ 1] = "S3"
    det[1][ 2] = "S6"
    det[1][ 3] = "S12"
    det[1][ 4] = "S24"
    det[0][ 5] = "積雪深差"
    det[1][ 5] = "D3"
    det[1][ 6] = "D6"
    det[1][ 7] = "D12"
    det[1][ 8] = "D24"
    det[0][ 9] = "S1"
    det[0][34] = "積雪"
    det[0][59] = "気温"
    det[0][84] = "最新"

    for backhour in range(0, 24+1, 1):
        ymdhback = ft2valid(ymdhjst, -1 * backhour, False, 0)
        det[1][33 - backhour] = ymdhback[8:10]
        det[1][58 - backhour] = ymdhback[8:10]
        det[1][83 - backhour] = ymdhback[8:10]

    invalid = -999

    bufr25 = ["" for x in range(25)]

    for ista in range(len(stations)):
        row  = stations[ista]
        iout = ista + 2

        sd25     = [invalid for x in range(25)]
        sf25     = [invalid for x in range(25)]
        temp25   = [invalid for x in range(25)]
        sd25flag = [0       for x in range(25)]

        ymdhdata = ""

        if   row[colpref] in ["新潟", "富山", "石川", "福井"] and row[colorg] == "3":
            ########################################
            ### decoder for mlit-hokuriku, kinki ###
            ########################################

            if row[colpref] == "福井":
                region   = "kinki"
                jsonkey1 = "観測局名称"
                jsonkey2 = "時間積雪"

            else:
                region   = "hokuriku"
                jsonkey1 = "観測所名称"
                jsonkey2 = "時間降雪"

            for backhour in range(25):
                snowdepth = invalid
                snowfall  = invalid
                temp      = invalid

                ymdhback = ft2valid(ymdhjst, -1 * backhour, False, 0)
                filepath = "raw/" + ymdhback + "/mlit_" + region + "_snow.json"

                if not os.path.isfile(filepath):
                    continue

                mlitjson = json.load(open(filepath, "r"))

                mlit = None

                for mlitpoint in mlitjson["body"]:
                    if mlitpoint[jsonkey1] in row[colname]:
                        mlit = mlitpoint
                        break

                if mlit is None:
                    continue

                snowdepth = mlit["積雪深"]
                snowfall  = mlit[jsonkey2]

                #if snowdepth == "" or snowdepth is None:
                #    snowdepth = 0

                if snowfall  == "" or snowfall  is None:
                    snowfall  = 0

                if out[iout][24] == "":
                    timetemp = mlit["観測時刻"]

                    if ymdhdata == "":
                        if   region == "hokuriku":
                            ymdhdata = datetime.fromtimestamp(timetemp, timezone(timedelta(hours=9))).strftime("%Y%m%d%H%M")
                        elif region == "kinki":
                            ymdhdata = timetemp[0:4] + timetemp[5:7] + timetemp[8:10] + timetemp[12:14] + timetemp[15:17]

                try:
                    sd25  [backhour] = int(snowdepth)
                except:
                    pass

                try:
                    sf25  [backhour] = int(snowfall)
                except:
                    pass

                filepath = "raw/" + ymdhback + "/mlit_" + region + "_temperature.json"

                if not os.path.isfile(filepath):
                    continue

                mlitjson = json.load(open(filepath, "r"))

                for mlitpoint in mlitjson["body"]:
                    if mlitpoint[jsonkey1] in row[colname]:
                        temp = mlitpoint["気温"]

                        if temp == "" or temp is None:
                            temp = invalid

                        break

                try:
                    temp25[backhour] = float(temp)
                except:
                    pass

        elif row[colpref] == "群馬" and row[colorg] == "3":
            #################################
            ### decoder for mlit-takasaki ###
            #################################

            for backhour in range(25):
                ymdhback = ft2valid(ymdhjst, -1 * backhour, False, 0)
                filepath = "raw/" + ymdhback + "/mlit_takasaki.html"

                if not os.path.isfile(filepath):
                    continue

                soup     = BeautifulSoup(open(filepath, "r", encoding="shift_jis"), "html.parser")
                ymdhsoup0= soup.findAll("table")[0].findAll("tr")[0].findAll("td")[0].get_text()
                ymdhsoup = ymdhsoup0[0:4] + ymdhsoup0[5:7] + ymdhsoup0[8:10] + ymdhsoup0[11:13] + ymdhsoup0[14:16]

                if ymdhback != ymdhsoup[0:10]:
                    continue

                souprows = soup.findAll("table")[1].findAll("tr")
                del souprows[0]

                for souprow in souprows:
                    soupelems = souprow.findAll("td")

                    snowname  = soupelems[0].get_text()
                    staname2  = re.sub("\(.*\)", "", row[colname])
                    if not staname2 in snowname:
                        continue

                    snowdepth = soupelems[4].get_text()
                    temp      = soupelems[5].get_text()

                    try:
                        sd25  [backhour] = int(re.sub("cm", "", snowdepth))
                    except:
                        pass

                    try:
                        temp25[backhour] = float(re.sub("℃", "", temp))
                    except:
                        pass

                    if ymdhdata == "":
                        ymdhdata = ymdhback + "00"

        elif row[colpref] == "長野" and row[colorg] == "3":
            ###############################
            ### decoder for mlit-nagano ###
            ###############################

            for backhour in range(25):

                ymdhback = ft2valid(ymdhjst, -1 * backhour, False, 0)
                filepath = "raw/" + ymdhback + "/mlit_nagano.json"

                if not os.path.isfile(filepath):
                    continue

                mlitjson = json.load(open(filepath, "r"))

                mlit = None

                for mlitdata in mlitjson["snowDatas"]:
                    if mlitdata["station"]["managementNumber"] == row[colnum]:
                        ymdhmlit = re.sub("[/:\s]", "", mlitdata["dataDT"])[0:12]
                        if ymdhmlit[0:10] != ymdhback:
                            break
                        mlit = mlitdata["data"]
                        break

                try:
                    sd25  [backhour] = int(mlit["snowfall"]["view"])
                except:
                    pass

                try:
                    sf25  [backhour] = int(mlit["hourUpdown"]["view"])
                except:
                    pass

                if ymdhdata == "":
                    ymdhdata = str(ymdhmlit)

        elif row[colpref] == "新潟" and row[colorg] == "10":
            ################################
            ### decoder for niigata-pref ###
            ################################

            filepath = "raw/" + ymdhjst + "/niigata_" + row[colnum].strip() + ".html"

            if not os.path.isfile(filepath):
                continue

            soup     = BeautifulSoup(open(filepath, "r", encoding="shift_jis"), "html.parser")
            souprows = soup.findAll("table")[4].findAll("tr")
            del souprows[0]

            for backhour in range(25):
                ymdhback24 = ft2valid(ymdhjst, -1 * backhour, True, 0)

                for souprow in souprows:
                    soupelems = souprow.findAll("td")

                    soupdate = soupelems[0].get_text()
                    ymdhsoup = soupdate[0:4] + soupdate[5:7] + soupdate[8:10] + soupdate[-5:-3]

                    if ymdhback24 != ymdhsoup:
                        continue

                    snowdepth = soupelems[1].get_text()
                    snowfall  = soupelems[2].get_text()
                    temp      = soupelems[3].get_text()

                    try:
                        sd25  [backhour] = int(snowdepth)
                    except:
                        pass

                    try:
                        sf25  [backhour] = int(snowfall)
                    except:
                        pass

                    try:
                        temp25[backhour] = float(temp)
                    except:
                        pass

                    if ymdhdata == "":
                        ymdhback = ft2valid(ymdhjst, -1 * backhour, False, 0)
                        ymdhdata = ymdhback + "00"

        elif row[colpref] == "富山" and row[colorg] == "10":
            ###############################
            ### decoder for toyama-pref ###
            ###############################

            filepath = "raw/" + ymdhjst + "/toyama.json"

            if not os.path.isfile(filepath):
                continue

            toyamajson = json.load(open(filepath, "r"))

            for backhour in range(25):
                if backhour == 24:
                    filepath = "raw/" + ft2valid(ymdhjst, -1, False, 0) + "/toyama.json"

                    if not os.path.isfile(filepath):
                        continue

                    toyamajson = json.load(open(filepath, "r"))

                ymdhback = ft2valid(ymdhjst, -1 * backhour, False, 0)

                if str(ymdhback) + "00" not in toyamajson["snow_" + str(row[colnum])]["snow_data"].keys():
                    continue

                toyama = toyamajson["snow_" + str(row[colnum])]["snow_data"][str(ymdhback) + "00"]

                try:
                    sd25  [backhour] = int(toyama["snowcover"])
                except:
                    pass

                try:
                    sf25  [backhour] = int(toyama["snowfall"])
                except:
                    pass

                try:
                    temp25[backhour] = float(toyama["temp"])
                except:
                    pass

                if ymdhdata == "":
                    ymdhdata = str(ymdhback) + "00"

        elif row[colpref] == "石川" and row[colorg] == "10":
            #################################
            ### decoder for ishikawa-pref ###
            #################################

            for backhour in range(25):
                ymdhback = ft2valid(ymdhjst, -1 * backhour, False, 0)
                filepath = "raw/" + ymdhback + "/ishikawa.json"

                if not os.path.isfile(filepath):
                    continue

                ishikawajson = json.load(open(filepath, "r"))

                ishikawa = None

                for ishikawapoint in ishikawajson["vals"]:
                    if str(ishikawapoint["id"]) == str(row[colnum]):
                        ishikawa = ishikawapoint
                        break

                if ishikawa is None:
                    continue

                if ishikawa["ts"][0:10] != ymdhback:
                    continue

                try:
                    sd25  [backhour] = int(ishikawa["snow"])
                except:
                    pass

                try:
                    sf25  [backhour] = int(ishikawa["fallsnow"])
                except:
                    pass

                try:
                    temp25[backhour] = float(ishikawa["temperature"])
                except:
                    pass

                if ymdhdata == "":
                    ymdhdata = ishikawa["ts"]

        elif row[colpref] == "福井" and row[colorg] == "10":
            ##############################
            ### decoder for fukui-pref ###
            ##############################

            filepath = "raw/" + ymdhjst + "/fukui.json"

            if not os.path.isfile(filepath):
                continue

            try:
                fukuijson = json.load(open(filepath, "r"))
            except:
                fukuijson = []

            fukui = None

            for fukuipoint in fukuijson:
                if str(fukuipoint["id"]) == str(row[colnum]):
                    fukui = fukuipoint["datas"]
                    break

            for backhour in range(25):
                if fukui is None:
                    continue

                ymdhback = ft2valid(ymdhjst, -1 * backhour, False, 0)
                fukui2 = None

                for fukuitime in fukui:
                    if ymdhback == fukuitime["observedAt"][0:10]:
                        fukui2 = fukuitime
                        break

                if fukui2 is None:
                    continue

                try:
                    sd25  [backhour] = int(fukui2["snowDepth"])
                except:
                    pass

                try:
                    sf25  [backhour] = int(fukui2["snowDiff"])
                except:
                    pass

                try:
                    temp25[backhour] = float(fukui2["temperature"])
                except:
                    pass

                if ymdhdata == "":
                    ymdhdata = fukui2["observedAt"][0:12]

        elif row[colpref] == "栃木" and row[colorg] == "10":
            ################################
            ### decoder for tochigi-pref ###
            ################################

            for backhour in range(25):
                snowdepth = invalid
                snowfall  = invalid
                temp      = invalid

                ymdhback = ft2valid(ymdhjst, -1 * backhour, False, 0)
                filepath = "raw/" + ymdhback + "/tochigi_" + row[colnum].strip() + ".json"

                if not os.path.isfile(filepath):
                    continue

                tochigi = json.load(open(filepath, "r"))

                ymdhmsfile = re.sub("[/:\s]", "", tochigi["LastUpDateTime"])
                if ymdhback[0:10] != ymdhmsfile[0:10]:
                    continue

                try:
                    sd25  [backhour] = int(tochigi["States"][0])
                except:
                    pass

                try:
                    temp25[backhour] = float(tochigi["States"][1])
                except:
                    pass

                if ymdhdata == "":
                    ymdhdata = ymdhmsfile[0:12]

        elif row[colorg] == "1":
            #########################
            ### decoder for jmahp ###
            #########################

            filepathprev = ""

            for backhour in range(25):
                snowdepth = invalid
                snowfall  = invalid
                temp      = invalid

                ymdhjst24  = ft2valid(ymdhjst, 0            , True , 0)
                ymdhback24 = ft2valid(ymdhjst, -1 * backhour, True , 0)

                if int(ymdhback24[0:8]) == int(ymdhjst24[0:8]):
                    filepath = "raw/" + ymdhjst + "/jmahp_" + row[colqc][1:] + ".html"
                else:
                    ymdhyest = ft2valid(ymdhjst, -1, False, 0)[0:8] + "00"
                    filepath = "raw/" + ymdhyest + "/jmahp_" + row[colqc][1:] + ".html"

                if not os.path.isfile(filepath):
                    continue

                if filepath != filepathprev:
                    soup = BeautifulSoup(open(filepath, "r", encoding="utf-8"), "html.parser")
                    souprows = soup.findAll("table")[5].findAll("tr")
                    souprow0 = [s.get_text() for s in souprows[0].findAll("td")]
                    del souprows[0]
                    del souprows[0]

                    filepathprev = filepath

                for souprow in souprows:
                    soupcols = souprow.findAll("td")
                    if int(soupcols[souprow0.index("時刻")].get_text()) == int(ymdhback24[8:10]):
                        snowdepth = soupcols[souprow0.index("積雪深")].get_text()

                        try:
                            temp = soupcols[souprow0.index("気温")].get_text()
                        except:
                            pass

                        break

                try:
                    snowdepth = re.sub("[\)\]]", "", snowdepth)
                    sd25  [backhour] = int(snowdepth)
                except:
                    pass

                try:
                    temp = re.sub("[\)\]]", "", temp)
                    temp25[backhour] = float(temp)
                except:
                    pass

                if ymdhdata == "":
                    ymdhback = ft2valid(ymdhjst, -1 * backhour, False, 0)
                    ymdhdata = ymdhback + "00"

            '''
            ########################
            ### decoder for bufr ###
            ########################

            for backhour in range(25):
                snowdepth = invalid
                snowfall  = invalid
                temp      = invalid

                ymdhback = ft2valid(ymdhjst, -1 * backhour, False, 0)
                filepath = "raw/" + ymdhback + "/bufr.txt"

                if   bufr25[backhour] == "":
                    if not os.path.isfile(filepath):
                        continue

                    with open(filepath, "r") as f:
                        reader = csv.reader(f, delimiter=",")
                        bufr0 = [[y.strip() for y in x] for x in reader]
                        bufr = []

                        for bufrrow0 in bufr0:
                            if int(bufrrow0[1]) in [54, 55, 56, 57]:
                                bufr.append(bufrrow0)

                    bufr25[backhour] = bufr

                else:
                    bufr = bufr25[backhour]

                for bufrrow in bufr:
                    if int(row[coljma]) == 100000 * int(bufrrow[0]) + 1000 * int(bufrrow[1]) + int(bufrrow[2]):
                        snowdepth = int(bufrrow[16])
                        break

                if snowdepth <= -1:
                    snowdepth = invalid

                sd25[backhour] = int(snowdepth)

                for bufrrow in bufr:
                    if int(row[colqc]) == 100000 * int(bufrrow[0]) + 1000 * int(bufrrow[1]) + int(bufrrow[2]):
                        temp = int(bufrrow[13])
                        break

                if temp > 4000 or temp < 2000:
                    temp = invalid
                else:
                    temp = (temp - 2732) / 10

                temp25[backhour] = float(temp)

                if ymdhdata == "":
                    ymdhdata = ymdhback + "00"
            '''

        ######################
        ### postprocessing ###
        ######################

        out[iout][0] = row[colname]

        for backhour in range(23, -1, -1):
            #################
            ### QC for SD ###
            #################

            if   sd25[backhour] == invalid and sd25[backhour + 1] != invalid and sd25flag[backhour + 1] <= 2:
                sd25    [backhour] = sd25[backhour + 1]
                sf25    [backhour] = 0

                if   sf25[backhour + 1] != 0 or sd25flag[backhour + 1] >= 2:
                    sd25flag[backhour] = 3
                else:
                    sd25flag[backhour] = 2


            #################
            ### QC for S1 ###
            #################

            if sf25[backhour] == invalid:
                if sd25[backhour] != invalid and sd25[backhour + 1] != invalid:
                    sf25[backhour] = max(0, sd25[backhour] - sd25[backhour + 1])

            if sf25[backhour] < 0 and sf25[backhour] != invalid:
                sf25[backhour] = 0

            if sf25[backhour] > 0:
                if sd25[backhour] != invalid and sd25[backhour + 1] != invalid:
                    if sf25[backhour] > sd25[backhour] - sd25[backhour + 1]:
                        sf25    [backhour] = max(0, sd25[backhour] - sd25[backhour + 1])

            if (sf25[backhour] > 0 and temp25[backhour] >= 4.0) or sf25[backhour] >= 30:
                sf25    [backhour] = 0
                sd25    [backhour] = min(sd25[backhour], sd25[backhour + 1])
                sd25flag[backhour] = 1

            if sf25[backhour] >= 22:
                sd25flag[backhour] = 4

        if row[colsd] == "////":
            snowspare = invalid
        else:
            snowspare = int(row[colsd])

        if   snowspare == invalid:
            out[iout][1] = "-"
        elif sd25[0]   == invalid:
            out[iout][1] = invalid
        else:
            out[iout][1] = snowspare - sd25[0]

        out[iout][2] = sd25[0]

        for isnowfall in range(4):
            maxback = [3, 6, 12, 24][isnowfall]
            sfacc = 0

            for backhour in range(maxback):
                if sf25[backhour] < 0:
                    sfacc = invalid
                    break
                else:
                    sfacc += sf25[backhour]

            if sd25[maxback] == invalid or sd25[0] == invalid:
                sddiff = invalid
            else:
                sddiff = sd25[0] - sd25[maxback]

            errorrate = [(i >= 3) for i in sd25flag[0:maxback]].count(True) / maxback

            if   errorrate >= 0.4 or sfacc == invalid:
                sfacc  = invalid
            elif errorrate >= 0.2:
                sfacc  = str(sfacc)  + "]"
            elif errorrate >  0.0:
                sfacc  = str(sfacc)  + ")"

            out[iout][3 + isnowfall] = sfacc
            out[iout][7 + isnowfall] = sddiff

        for backhour in range(0, 11+1, 1):
            sfsuffix = ""

            if   sd25flag[backhour] == 1:
                sfsuffix = "F"
            elif sd25flag[backhour] == 2:
                sfsuffix = ")"
            elif sd25flag[backhour] == 3:
                sfsuffix = "]"
            elif sd25flag[backhour] == 4:
                sfsuffix = "#"

            out[iout][22 - backhour] = str(sf25[backhour]) + sfsuffix

        if temp25[0] == invalid:
            out[iout][23] = "-"
        else:
            out[iout][23] = temp25[0]

        if ymdhdata != "":
            out[iout][24] = ymdhdata[4:]

        det[iout][ 0] = out[iout][ 0]
        det[iout][84] = out[iout][24]
        for icol in range(3, 10+1, 1):
            det[iout][icol - 2] = out[iout][icol]

        for backhour in range(0, 24+1, 1):
            sfsuffix = ""

            if   sd25flag[backhour] == 1:
                sfsuffix = "F"
            elif sd25flag[backhour] == 2:
                sfsuffix = ")"
            elif sd25flag[backhour] == 3:
                sfsuffix = "]"
            elif sd25flag[backhour] == 4:
                sfsuffix = "#"

            det[iout][33 - backhour] = str(sf25  [backhour]) + sfsuffix
            det[iout][58 - backhour] = str(sd25  [backhour])
            det[iout][83 - backhour] = str(temp25[backhour])

        for icol in range(len(out[iout])):
            if str(invalid) in str(out[iout][icol]):
                out[iout][icol] = "X"

        for icol in range(len(det[iout])):
            if str(invalid) in str(det[iout][icol]):
                det[iout][icol] = "X"

        if ista % 100 == 99 or ista + 1 == len(stations):
            printmsg("processing done: " + str(ista + 1) + " / " + str(len(stations)))

    ##################
    ### output csv ###
    ##################

    outname = "csv/So_" + ymdhjst + ".csv"

    if not os.path.isdir(os.path.dirname(outname)):
        os.makedirs(os.path.dirname(outname))

    csv.writer(open(outname, "w", encoding="utf-8"), delimiter=",").writerows(out)

    detname = "csv/Details_" + ymdhjst + ".csv"

    csv.writer(open(detname, "w", encoding="utf-8"), delimiter=",").writerows(det)
    printmsg("csv output done")

    #####################
    ### make timelist ###
    #####################

    timelist = glob.glob("csv/So_20????????.csv")
    timelist = [re.sub("csv/So_", "", timelist[i]) for i in range(len(timelist))]
    timelist = [re.sub("\.csv"  , "", timelist[i]) for i in range(len(timelist))]
    timelist = sorted(timelist)[::-1]

    listname = "csv/_list.txt"
    csv.writer(open(listname, "w", encoding="utf-8"), delimiter=",").writerow(timelist)
    printmsg("timelist output done")
