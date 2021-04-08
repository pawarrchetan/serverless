import { ShortURL } from "../types/shorturl";
import { DynamoDB } from "aws-sdk";

const linkTable = process.env.LINK_TABLE as string;
const dynamodb = new DynamoDB.DocumentClient();

export async function putShortUrl(shortURL: ShortURL): Promise<boolean> {
  if (!linkTable || linkTable == "") {
    throw new Error("'LINK_TABLE' Environment Variable Not Set");
  }
  await dynamodb
    .put({
      TableName: linkTable,
      Item: {
        ...shortURL,
      },
      ConditionExpression: "attribute_not_exists(id)",
    })
    .promise();

  return true;
}

export async function getShortUrl(id: string): Promise<ShortURL | null> {
  if (!linkTable || linkTable == "") {
    throw new Error("'LINK_TABLE' Environment Variable Not Set");
  }
  try {
    const resp = await dynamodb
      .get({
        TableName: linkTable,
        Key: {
          id,
        },
      })
      .promise();
    return resp.Item as ShortURL;
  } catch (error) {}
  return null;
}
