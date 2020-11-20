import { RDS } from 'aws-sdk';

const rds = new RDS();

export const describeServerlessCluster = async (clusterArn: string) => {
  const res = await rds
    .describeDBClusters({
      DBClusterIdentifier: clusterArn,
    })
    .promise();
  return {
    dbClusterIdentifier: res.DBClusters[0].DBClusterIdentifier,
    host: res.DBClusters[0].Endpoint,
    port: res.DBClusters[0].Port,
  };
};
