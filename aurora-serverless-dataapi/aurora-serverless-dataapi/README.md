# Aurora Serverless app using RDS Data API
This project creates a sample app that make use of [Aurora Serverless](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless.html) Postgres RDS Cluster along with a [custom resource](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-custom-resources.html) to create the database in the RDS cluster for each service.
It also exposes a serverless app that exposes API to access the data publicly.

## Resources
This project creates the folloeing resources
* `get` - A simple Lambda function to expose the RDS Data API

* `TestDatabase` - Lambda function used by Sample App exposed using API GW

## Custom Resource
The project creates a AWS CloudfFormation Custom Resource `TestDatabase` using a previously deployed Lambda Function which enables the Custom Resource.

Example : 
```
  Resources:
    TestDatabase:
      Type: Custom::ServerlessPostgresDatabase
      Properties:
        ServiceToken: ${ssm:/aurora/custom-resource-lambda-arn}
        ClusterARN: ${ssm:/aurora/cluster-arn}
        ClusterSecret: ${ssm:/aurora/master-secret-arn}
        DatabaseName: testdatabase
        DatabaseUser: test
        SecretName: testdatabasesecret
        Tags:
            - Key: heritage
              Value: cloudformation
            - Key: environment
              Value: ${self:custom.determinedStage}
            - Key: service-name
              Value: ${self:service}
```

## Sample Serverless App
The sample serverless app makes use of the [Class: AWS.RDSDataService](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/RDSDataService.html) to make use of the data api to connect to the Serverless Postgres RDS.
it uses the SSM paraneters and the SecretArn created using the serverless framework to execute statements in the database.

The app is exposed using a API GW exnpoint so that we can execute POST calls to execute statements in the RDS Database.

For example: 
```
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"sql":"select * from company"}' \
  https://nxxxxxy9i6.execute-api.eu-central-1.amazonaws.com/dev/query
```

## Schema creation
The objects required to create the schema need to be created by the Service team before starting query execution on the database.
The schema can be created by any of the following approaches
* Using a SQL script during the bootstrapping of the service
* Using automated tools like [Prisma javascript library](https://github.com/prisma/prisma) to create schema

## Exposing the App
I have exposed the app using API GW which is publicly accessible for demonstration purposes.
Please make sure that you do not expose the sensite data from your database accidently.