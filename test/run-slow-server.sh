#!/bin/bash

echo "Set addon to reload localhost pages for every 3seconds."

ruby -rsinatra -e 'get("/"){sleep 5; "OK #{Time.now}"}'
