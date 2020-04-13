# Link Chatter - Anonymous chats

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) and the [Heroku Toolbelt](https://toolbelt.heroku.com/) installed.

```sh
$ git clone git@github.com:karboosx/linkchatter.git # or clone your own fork
$ cd linkchatter
$ npm install
$ npm start
```

Your app should now be running on [localhost:3000](http://localhost:3000/).

## History

If you want to enable saving history, you have to make Postgres database with schema available in sql.sql file and change .env file.

## Deploying to Heroku

```
$ heroku create
$ git push heroku master
$ heroku open
```
or

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)
