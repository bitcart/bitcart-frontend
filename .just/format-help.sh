#!/usr/bin/env sh

green="$(tput setaf 10)"
yellow="$(tput setaf 11)"
white="$(tput setaf 15)"
blue="$(tput setaf 14)"
gray="$(tput setaf 8)"
reset="$(tput sgr0)"

awk -v green="$green" \
    -v yellow="$yellow" \
    -v white="$white" \
    -v blue="$blue" \
    -v gray="$gray" \
    -v reset="$reset" \
    -f "$(dirname "$0")/format-help.awk"
