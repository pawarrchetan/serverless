import { CloudFormationCustomResourceEvent, CloudFormationCustomResourceUpdateEvent } from 'aws-lambda';

/*
 * CloudFormation properties supported by the custom resource.
 */
export const RequiredProperties = ['ClusterARN', 'DatabaseName'];
export interface ResourceProperties {
  ServiceToken: string;
  /**
   * The ARN of the Aurora Serverless DB cluster to create database in.
   */
  ClusterARN: string;
  /**
   * The name or ARN of the secret that enables access to the DB cluster via the RDS Data API.
   */
  ClusterSecret: string;
  /**
   * The name of the database to create.
   */
  DatabaseName: string;
  /**
   * The name of the user to create for the database. Defaults to value of DatabaseName.
   */
  DatabaseUser?: string;
  /**
   * The name of the secret that will be created to store the credentials. If not provided, a default value will be generated based on other inputs.
   */
  SecretName?: string;
}

/*
 * The return values of the resource accessible via Fn::GetAtt
 */
export interface ResourceAttributes {
  /**
   * ARN of the secrets manager secret resource which contains the RDS access credentials to the database
   */
  SecretArn: string;
}

/**
 * Get typed resource properties from event
 */
export const getProperties = (event: CloudFormationCustomResourceEvent) =>
  event.ResourceProperties as ResourceProperties;

/**
 * Get typed resource properties from event
 */
export const getOldProperties = (event: CloudFormationCustomResourceUpdateEvent) =>
  event.OldResourceProperties as ResourceProperties;
