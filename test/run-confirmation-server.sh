#!/bin/bash

echo "Set addon to bypass confirmation."

ruby -rsinatra -e 'get("/"){"<!DOCTYPE html><script type=\"application/x-javascript\">window.onbeforeunload = function() { return \"OK?\"; };</script>OK #{Time.now}"}'

