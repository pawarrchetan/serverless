# Overview

This project deployes the following components :

* Deploy a simple API endpoint
* Add a DynamoDB table and two endpoints to create and retrieve a User object
* Set up path-specific routing for more granular metrics and monitoring
* Configure your environment for local development for a faster development experience.

## Getting started
To get started, you'll need the Serverless Framework installed. You'll also need your environment configured with AWS credentials.

### Install Steps

*  Deploy single endpoint
```
$ mkdir my-flask-application && cd my-flask-application
$ npm init -f
$ npm install --save-dev serverless-wsgi serverless-python-requirements
```

* Install dependencies
```
$ virtualenv venv --python=python3
$ source venv/bin/activate
```

* Create python virtual environment
```
$ virtualenv venv --python=python3
$ source venv/bin/activate
```

* Install python packages
```
(venv) $ pip install flask
(venv) $ pip freeze > requirements.txt
```

* Deploy the function
```
$ sls deploy
... snip ...
Service Information
service: serverless-flask
stage: dev
region: us-east-1
stack: serverless-flask-dev
api keys:
  None
endpoints:
  ANY - https://850l3boqp4.execute-api.us-east-1.amazonaws.com/dev
  ANY - https://850l3boqp4.execute-api.us-east-1.amazonaws.com/dev/{proxy+}
functions:
  app: serverless-flask-dev-app
```

### Test endpoint

* Export the BASE_DOMAIN variable
```
export BASE_DOMAIN=https://850l3boqp4.execute-api.us-east-1.amazonaws.com/dev
```

* Create User 
```
$ curl -H "Content-Type: application/json" -X POST ${BASE_DOMAIN}/users -d '{"userId": "testbasin", "name": "Alex DeBrie"}'
{
  "name": "Test Basin",
  "userId": "testbasin"
}
```

* Get User
```
$ curl -H "Content-Type: application/json" -X GET ${BASE_DOMAIN}/users/testbasin
{
  "name": "Test Basin",
  "userId": "testbasin"
}
```
