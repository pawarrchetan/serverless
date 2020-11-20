import { CloudFormationCustomResourceEvent } from 'aws-lambda';
import * as resource from './resource';

/**
 * Validate event and return a list of errors
 */
export const validateEvent = (event: CloudFormationCustomResourceEvent) => {
  const errors: string[] = [];
  const props = resource.getProperties(event);

  if (!props) {
    errors.push('Invalid lambda payload. Missing ResourceProperties from event');
  }

  for (const propName of resource.RequiredProperties) {
    if (propName in props === false) {
      errors.push(`${propName} is a required property`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Get physical resource id from event. Uses existing id if passed via event
 */
export const getPhysicalResourceId = (event: CloudFormationCustomResourceEvent) => {
  if ('PhysicalResourceId' in event) {
    return event.PhysicalResourceId;
  }
  const { ClusterARN, DatabaseName } = resource.getProperties(event);
  return `${ClusterARN}/${DatabaseName}`;
};
