#!/bin/bash
docker compose build
docker save planning-poker-be | bzip2 | pv | ssh testqauser@planning-poker.ptsecurity.ru docker load
docker save planning-poker-web | bzip2 | pv | ssh testqauser@planning-poker.ptsecurity.ru docker load

scp -r ./traefik testqauser@planning-poker.ptsecurity.ru:~/traefik
scp ./docker-compose.yml testqauser@planning-poker.ptsecurity.ru:~/docker-compose.yml

ssh testqauser@planning-poker 'bash -s' < ./scripts/restart.sh
