const AWS = require('aws-sdk')
const RDS = new AWS.RDSDataService()

exports.handler = async (event, context, callback) => {

  console.log('Function execution started')
  console.log(JSON.stringify({ event, context }), null, 2)
  const data = event.body ? JSON.parse(event.body) : {}
  console.log(data)
  const query = data.sql
  console.log(query)
  
  var sql = query
  var secretArn = process.env.DBSECRETSSTOREARN
  var resourceArn = process.env.DBAURORACLUSTERARN
  var database = process.env.DB_NAME

  const params = {
    secretArn: secretArn,
    resourceArn: resourceArn,
    sql: sql,
    database: database,
    includeResultMetadata: false
  }
  try {
    const result = await RDS.executeStatement(params).promise()
    console.log(result.records)

    let response = {
      statusCode: 200,
      body: JSON.stringify(result.records)
    }
    return response
   } catch (err) {
      console.log(err, err.stack)
    }
}
