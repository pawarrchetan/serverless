import ShortUniqueId from "short-unique-id";
import { _200, _500, _400 } from "../../utils/api";
import { APIGatewayEvent } from "aws-lambda";
import { ShortURL } from "../../types/shorturl";
import { putShortUrl } from "../../utils/dynamodb";
import {
  epochDateTime,
  expireDateTime,
  validateOwner,
  validateLongUrl,
} from "../../utils/util";

const shortUniqueId = new ShortUniqueId();
const ownerDomain = process.env.OWNER_DOMAIN as string;

export async function handler(
  ev: APIGatewayEvent
): Promise<{ statusCode: number; body: string; headers: any }> {
  try {
    const su: ShortURL = JSON.parse(ev.body as string) as ShortURL;
    if (!validateOwner(ownerDomain)) {
      return _400("Invalid Owner Domain Configured");
    }
    if (!validateLongUrl(su.longurl)) {
      return _400("Invalid Long URL Provided");
    }

    su.id = shortUniqueId();
    su.created = epochDateTime(new Date());
    su.expire = su.expire ? su.expire : expireDateTime();
    su.shorturl = `https://${ownerDomain}/${su.id}`;

    await putShortUrl(su);

    return _200(su);
  } catch (error) {
    console.log((error as Error).message);
    return _500();
  }
}
