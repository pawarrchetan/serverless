import 'source-map-support/register';
import {
  CloudFormationCustomResourceCreateEvent,
  CloudFormationCustomResourceDeleteEvent,
  CloudFormationCustomResourceEvent,
  CloudFormationCustomResourceUpdateEvent,
  Context,
} from 'aws-lambda';
import cfnresponse from 'cfn-response-promise';
import { getPhysicalResourceId, validateEvent } from './event';
import * as resource from './resource';
import {
  createDatabase,
  createDatabaseUserWithFullPrivileges,
  deleteDatabaseUser,
  getSanitizedDatabaseName,
  getSecretName,
} from './aurora';
import { describeServerlessCluster } from './rds';
import { deleteRDSSecret, putRDSSecret } from './secret';

/**
 * Custom CloudFormation Resource to create a database and credentials in an Aurora Serverless PostgreSQL cluster
 */
export const handler = async (event: CloudFormationCustomResourceEvent, context: Context) => {
  try {
    console.debug(JSON.stringify({ event, context }), null, 2);

    const { valid, errors } = validateEvent(event);
    if (!valid) {
      throw new Error(JSON.stringify(errors, null, 2));
    }

    const response = await handleEvent(event);
    await cfnresponse.send(event, context, cfnresponse.SUCCESS, response, getPhysicalResourceId(event));
  } catch (err) {
    console.error(err);
    const response = {
      Error: err.message,
    };
    await cfnresponse.send(event, context, cfnresponse.FAILED, response, getPhysicalResourceId(event));
  }
};

/**
 * Handlers for each CloudFormation Custom Resource Event
 */
const handleEvent = async (event: CloudFormationCustomResourceEvent) => {
  if (event.RequestType === 'Create') {
    return createEvent(event);
  }
  if (event.RequestType === 'Update') {
    return updateEvent(event);
  }
  if (event.RequestType === 'Delete') {
    return deleteEvent(event);
  }
  throw new Error('Unknown CloudFormation RequestType');
};

const createEvent = async (event: CloudFormationCustomResourceCreateEvent): Promise<resource.ResourceAttributes> => {
  const props = resource.getProperties(event);

  console.info('Creating database...');
  const { database } = await createDatabase(props);
  console.debug({ database });

  console.info('Creating user with full privileges...');
  const { username, password } = await createDatabaseUserWithFullPrivileges(props);
  console.debug({ username });

  const { host, port, dbClusterIdentifier } = await describeServerlessCluster(props.ClusterARN);

  console.info('Putting secret in Secrets Manager...');
  const secretArn = await putRDSSecret({
    secretName: getSecretName(props),
    secretValue: {
      username,
      password,
      database,
      engine: 'postgres',
      host,
      port,
      dbClusterIdentifier,
    },
  });

  return {
    SecretArn: secretArn,
  };
};

const updateEvent = async (event: CloudFormationCustomResourceUpdateEvent): Promise<resource.ResourceAttributes> => {
  const props = resource.getProperties(event);
  const oldProps = resource.getOldProperties(event);

  console.info('Deleting old database user...');
  const { deletedUser } = await deleteDatabaseUser(oldProps);
  console.debug({ deletedUser });

  const databaseChanged = getSanitizedDatabaseName(oldProps) !== getSanitizedDatabaseName(props);
  const clusterChanged = oldProps.ClusterARN !== props.ClusterARN;
  if (databaseChanged || clusterChanged) {
    console.info('Creating database...');
    await createDatabase(props);
  }

  console.info('Creating new database user...');
  const { database, username, password } = await createDatabaseUserWithFullPrivileges(props);
  console.debug({ database, username });

  const { host, port, dbClusterIdentifier } = await describeServerlessCluster(props.ClusterARN);

  if (getSecretName(oldProps) !== getSecretName(props)) {
    console.info('Deleting old secret in Secrets Manager...');
    await deleteRDSSecret({
      secretName: getSecretName(oldProps),
    });
  }

  console.info('Putting new secret in Secrets Manager...');
  const secretArn = await putRDSSecret({
    secretName: getSecretName(props),
    secretValue: {
      username,
      password,
      database,
      engine: 'postgres',
      host,
      port,
      dbClusterIdentifier,
    },
  });

  return {
    SecretArn: secretArn,
  };
};

const deleteEvent = async (event: CloudFormationCustomResourceDeleteEvent) => {
  const props = resource.getProperties(event);

  // TODO: add prop to drop database on delete
  // not sure why someone would want that though...

  console.info('Deleting database user...');
  const { deletedUser } = await deleteDatabaseUser(props);
  console.debug({ deletedUser });

  console.info('Deleting secret in Secrets Manager...');
  await deleteRDSSecret({
    secretName: getSecretName(props),
  });

  return { deletedUser };
};
