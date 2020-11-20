import { SecretsManager } from 'aws-sdk'

const secretsManager = new SecretsManager()

export interface RDSSecret {
  username: string
  password: string
  database: string
  engine: string
  host: string
  port: number
  dbClusterIdentifier: string
}

export const putRDSSecret = async (opts: {
  secretName: string
  secretValue: RDSSecret
}) => {
  const secretName = getSanitizedSecretName(opts.secretName)
  const jsonSecret = JSON.stringify(opts.secretValue)
  console.debug(`putting sercret ${secretName}...`)

  return secretsManager
    .createSecret({
      Name: secretName,
      SecretString: jsonSecret
    })
    .promise()
    .then((res) => res.ARN)
    .catch(() =>
      secretsManager
        .updateSecret({
          SecretId: secretName,
          SecretString: jsonSecret
        })
        .promise()
        .then((res) => res.ARN)
    )
}

export const deleteRDSSecret = async (opts: { secretName: string }) => {
  const secretName = getSanitizedSecretName(opts.secretName)
  console.debug(`deleting sercret ${secretName}...`)

  return secretsManager
    .deleteSecret({
      SecretId: secretName
    })
    .promise()
    .catch(console.warn)
}

const getSanitizedSecretName = (name: string) => name
