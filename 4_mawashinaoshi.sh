#!/bin/bash

ymdi=$1;: ${ymdi:="NA"}
ymdt=$2;: ${ymdt:=${ymdi}}

if [ ${ymdi} = "NA" ]; then echo "args ymdi (ymdt) required..."; exit 1; fi

ymd=${ymdt}
while [ ${ymd} -ge ${ymdi} ]; do
    ymd1=${ymd}
    ymd2="`echo ${ymd} | cut -c01-04`/`echo ${ymd} | cut -c05-06`/`echo ${ymd} | cut -c07-08` 00:00:00"
    ymd3=`date -d "${ymd2} 1 day ago" +%Y%m%d`
    cd raw
    tar xf ${ymd1}.tgz
    tar xf ${ymd3}.tgz
    cd ..
    ./3_multiprocess.sh ${ymd1}00 ${ymd1}23
    rm -rf raw/${ymd1}??
    ymd=${ymd3}
done

rm -rf raw/${ymd3}??

