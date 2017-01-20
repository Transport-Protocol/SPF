#!/bin/sh

declare -a arr=("AuthenticationService" "Bitbucket" "Dropbox" "Google" "Github" "NotificationService" "Owncloud" "SeCoApi" "SeCoFileStorage" "Slack" "TeamManagement" "TransferService"  "UserManagement" "Frontend/cliProject")

for i in "${arr[@]}"
do
   cd "$i"
   npm install
   cd ..
done
