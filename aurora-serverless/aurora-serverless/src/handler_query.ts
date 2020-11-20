import { APIGatewayProxyEvent } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import ServerlessClient from 'serverless-postgres'

AWS.config.update({ region: 'eu-central-1' })

const ssm = new AWS.SSM()
const secretsManager = new AWS.SecretsManager()

const getSecretJson = (() => {
  let secret: {
    username: string
    password: string
  }

  return async () => {
    if (!secret) {
      const auroraSecretARN = await getSSMValue('/aurora/aurora-rds-secret-arn')
      const auroraSecret = await getSecretValue(auroraSecretARN)
      secret = JSON.parse(auroraSecret.SecretString)
    }

    return secret
  }
})()

const getClient = (() => {
  let client: ServerlessClient

  return async () => {
    if (!client) {
      const credentials = await getSecretJson()
      // Require and initialize outside of your main handler
      const strDebug = process.env.SQL_DEBUG
      const boolDebug = JSON.parse(strDebug)

      client = new ServerlessClient({
        database: process.env.AURORA_DB_NAME,
        user: credentials.username,
        password: credentials.password,
        host: process.env.AURORA_HOST,
        port: process.env.AURORA_PORT,
        debug: boolDebug
      })
    }

    return client
  }
})()

/**
 * Gets parameter value from AWS Systems Manager Parameter Store
 *
 * @param {string} parameterName
 * @return {Promise<string>}
 */
async function getSSMValue(parameterName) {
  const parameterResult = await ssm
    .getParameter({
      Name: parameterName
    })
    .promise()

  if (
    !parameterResult ||
    !parameterResult.Parameter ||
    !parameterResult.Parameter.Value
  ) {
    throw new Error(`Failed to get Parameter Value for ${parameterName}`)
  }

  return parameterResult.Parameter.Value
}

/**
 * Gets secret value from AWS Secrets Manager
 *
 * @param {string} secretId
 * @return {Promise<string>}
 */
async function getSecretValue(secretId) {
  const secret = await secretsManager
    .getSecretValue({ SecretId: secretId })
    .promise()

  if (!secret || !secret.SecretString) {
    throw new Error(`Failed to get Secret Value for ${secretId}`)
  }

  return secret
}

// handler function definition
export const query = async (event: APIGatewayProxyEvent) => {
  try {
    console.debug(JSON.stringify({ event }), null, 2)
    const client = await getClient()
    await client.connect()
    console.log('Function execution started')
    const data = event.body ? JSON.parse(event.body) : {}
    const { query } = data
    console.log(query)
    const result = await client.query(query)
    //console.log(result)
    await client.end()
    await client.clean()
    if (query.toLowerCase().includes('insert')) {
      return {
        body: JSON.stringify(
          { message: 'Insert executed successfully' },
          null,
          2
        ),
        statusCode: 200
      }
    }
    if (query.toLowerCase().includes('select')) {
      return {
        body: JSON.stringify(
          { message: 'Select executed successfully', Result: result.rows },
          null,
          2
        ),
        statusCode: 200
      }
    }
  } catch (err) {
    console.error(err)
    const response = {
      Error: err.message
    }
    console.debug(response)
  }
}
