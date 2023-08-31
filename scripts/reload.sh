pm2 kill

git stash

git pull origin master

pm2 start ./src/index.js --name rest

pm2 logs rest
