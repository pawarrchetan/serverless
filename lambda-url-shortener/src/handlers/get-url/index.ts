import { redirect, _500, _404 } from "../../utils/api";
import { APIGatewayEvent } from "aws-lambda";
import { ShortURL } from "../../types/shorturl";
import { getShortUrl } from "../../utils/dynamodb";

export async function handler(
  ev: APIGatewayEvent
): Promise<{ statusCode: number; body?: string; headers: any }> {
  try {
    const id = ev.pathParameters!.id as string;
    const su = (await getShortUrl(id)) as ShortURL | null;
    if (!su) {
      return _404("id ", id);
    }
    return redirect(su.longurl);
  } catch (error) {
    console.log((error as Error).message);
    return _500();
  }
}
