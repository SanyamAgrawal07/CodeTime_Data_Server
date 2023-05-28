# CodeTime_Data_Server
Webhook controller for the Contest Spy telegram bot!


## Tech Stack 
* Nodejs (v18.9.0)
* ExpressJS
* PostgreSQL(Sequelize)
* Redis
* Axios

## Reference Links 
- [Download and install the latest version of Git.](https://git-scm.com/downloads)
- [Set your username in Git.](https://help.github.com/articles/setting-your-username-in-git)
- [Set your commit email address in Git.](https://help.github.com/articles/setting-your-commit-email-address-in-git)
- [Setup Nodejs](https://nodejs.org/en/blog/release/v16.18.1/)
- [Architecture of Project](https://www.geeksforgeeks.org/model-view-controllermvc-architecture-for-node-applications/)
- [Docs for Express](https://expressjs.com/en/guide/routing.html)
- [Docs for Sequelize](https://sequelize.org/docs/v6/)
- [Docs for Redis](https://redis.io/docs/)

## NPM Packages

* express: ^4.18.2,
* redis: ^4.6.5,
* axios: ^1.2.5,
* sequelize: ^6.29.0
* pg: ^8.9.0,
* pg-hstore: ^2.3.4,
* date-fns: ^2.29.3,
* date-fns-tz: ^2.0.0,
* cors: ^2.8.5,
* dotenv: ^16.0.3,
* body-parser: ^1.20.1,


## Project Structure

```
/src
   
|-- controllers/
    |-- users.controller.js     #Contains http request controllers for user methods
|
|-- models/
    |-- index.model.js     #Connecting to the postgres database and integrating the models 
    |-- user.model.js       #Defining the user relation schema
    |-- apidata.model.js        #Defining the relation schema to store fetched data
|
|-- utils/
    |-- commandTexts.js     #Data filtering and logic according to the specified request
    |-- durationTime.js     #Time units conversion function
    |-- getData.js      #Functions to fetch and store data in the databases
    |-- reminders.js        #Logic to send reminders for contests to the users
|
|-- index.js          #Establishing the express application and connecting to the databases
|-- redis.js          #Redis database configuration

```
  
## Models

### User Model

- firstname: String
- lastname: String
- chat_id : BigInt
- codeforces: Boolean
- codechef: Boolean
- leetcode: Boolean
- atcoder: Boolean
- hackerrank: Boolean

### Apidata Model

- codeforces: Array<JSON>
- codechef: Array<JSON>
- leetcode: Array<JSON>
- atcoder: Array<JSON>
- hackerrank: Array<JSON>