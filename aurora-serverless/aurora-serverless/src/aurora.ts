import { randomBytes } from 'crypto'

import { RDSDataService } from 'aws-sdk'
import { String } from 'aws-sdk/clients/cloudsearch'

import { ResourceProperties } from './resource'

const dataApi = new RDSDataService()

const connectionOpts = (props: ResourceProperties) => ({
  resourceArn: props.ClusterARN,
  secretArn: props.ClusterSecret
})

const queryWithOpts = (
  opts: Partial<RDSDataService.ExecuteStatementRequest>
) => (sql: string) =>
  dataApi
    .executeStatement({
      sql,
      resourceArn: opts.resourceArn,
      secretArn: opts.resourceArn,
      ...opts
    })
    .promise()

/**
 * Creates a database and user with full privileges using the RDS data api
 */
export const createDatabase = async (props: ResourceProperties) => {
  const database = getSanitizedDatabaseName(props)

  const query = queryWithOpts(connectionOpts(props))

  console.debug(`creating database ${database}...`)
  await query(`create database ${database};`)

  return { database }
}

/**
 * Creates database user with full privileges using the RDS data api
 */
export const createDatabaseUserWithFullPrivileges = async (
  props: ResourceProperties
) => {
  const database = getSanitizedDatabaseName(props)
  const username = getSanitizedUser(props)
  const password = generateDbPassword()

  const query = queryWithOpts(connectionOpts(props))

  console.debug(`creating user ${username}...`)
  await query(`create user ${username} with encrypted password '${password}';`)

  console.debug(`granting privileges on database ${database}...`)
  await query(`grant all privileges on database ${database} to ${username};`)

  return { database, username, password }
}

/**
 * Deletes database user using the RDS data api
 */
export const deleteDatabaseUser = async (props: ResourceProperties) => {
  const username = getSanitizedUser(props)
  const database = getSanitizedDatabaseName(props)

  const query = queryWithOpts(connectionOpts(props))

  console.debug(`revoking privileges on database ${database}...`)
  await query(
    `revoke all privileges on database ${database} from ${username};`
  ).catch(console.warn)

  console.debug(`dropping user ${username}...`)
  await query(`drop user if exists ${username};`)

  return { deletedUser: username }
}

export const getSanitizedDatabaseName = ({
  DatabaseName
}: ResourceProperties) => {
  return DatabaseName.replace(/[^0-9a-zA-Z_]+/g, '').substr(0, 63)
}

export const getSanitizedUser = ({
  DatabaseUser,
  DatabaseName
}: ResourceProperties) => {
  const user = DatabaseUser || DatabaseName

  return user.replace(/[^0-9a-zA-Z]+/g, '').substr(0, 31)
}

export const getSecretName = (props: ResourceProperties) =>
  props.SecretName ||
  `rds-credentials/${getSanitizedDatabaseName(props)}/${getSanitizedUser(
    props
  )}`

const generateDbPassword = () => randomBytes(24).toString('hex')
