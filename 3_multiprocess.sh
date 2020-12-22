#!/bin/bash

ymdhi=$1;: ${ymdhi:="NA"}
ymdht=$2;: ${ymdht:="NA"}

if [ ${ymdhi} = "NA" ]; then echo "args ymdhi (ymdht) required..."; exit 1; fi

ymdh=${ymdhi}
while [ ${ymdh} -le ${ymdht} ]; do
    ./1_snow.py p ${ymdh}
    ymdh2="`echo ${ymdh} | cut -c01-04`/`echo ${ymdh} | cut -c05-06`/`echo ${ymdh} | cut -c07-08` `echo ${ymdh} | cut -c09-10`:00:00"
    ymdh=`date -d "${ymdh2} 1 hour" +%Y%m%d%H`
done

