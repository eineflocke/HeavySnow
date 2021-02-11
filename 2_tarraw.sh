#!/bin/bash

cd `dirname $0`

ymd=$1;: ${ymd:="NA"}
if [ ${ymd} = "NA" ]; then echo "oee"; exit 1; fi

cd raw
ls ${ymd}?? > /dev/null 2>&1
if [ $? -eq 0 ]; then 
    rm -f ${ymd}??/bufr.txt
    tar -zcf ${ymd}.tgz ${ymd}??
    rm -rf ${ymd}??
else
    echo "no directory found for ${ymd}"
fi

