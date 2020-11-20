# Aurora Serverless Postgres RDS Cluster with Custom Resource
This project creates a sample app that make use of [Aurora Serverless](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless.html) Postgres RDS Cluster along with a [custom resource](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-custom-resources.html) to create a new database inside the cluster for each service.

## Resources
This project creates the folloeing resources
* `createDatabase` - Lambda function to support the Custom Resource creation

* `syncQuery` - Lambda function used by Sample App exposed using API GW

* `AuroraSecurityGroup` - AWS SG required for controlling access to RDS Cluster

* `AuroraRDSClusterParameter` - Parameter Group required for the RDS Cluster

* `AuroraRDSInstanceParameter` - Parameter Group required for the RDS Instance

* `AuroraRDSDatabaseSecret` - Secret stroing the master user details

* `AuroraRDSCluster` - Aurora Serverless RDS cluster

## Custom Resource
The project creates a Lambda function that enabled creation of a custom AWS CloudFormation Resource. This custom resource helps in creating the a new Database in the RDS Cluster which can be used to bootstrap any service using just a CloudFormation Resource.

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
The sample serverless app makes use of the [serverless-postgres](https://www.npmjs.com/package/serverless-postgres) npm package to create a client connection to the Serverless Postgres RDS.
it uses the SSM paraneters and the SecretArn created using the serverless framework to execute statements in the database.

The app is exposed using a API GW exnpoint so that we can execute POST calls to execute statements in the RDS Database.

For example: 
```
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"query":"select * from company"}' \
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