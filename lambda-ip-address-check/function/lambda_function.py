import os
import logging
import jsonpickle
import boto3
from aws_xray_sdk.core import xray_recorder
from aws_xray_sdk.core import patch_all
import requests

logger = logging.getLogger()
logger.setLevel(logging.INFO)
patch_all()

client = boto3.client('lambda')
client.get_account_settings()

def lambda_handler(event, context):
    logger.info('## EVENT\r' + jsonpickle.encode(event))
    response = client.get_account_settings()
    ipaddr = requests.get('http://checkip.amazonaws.com').text.rstrip()
    logger.info('## IPADDR\r' + ipaddr)
    return response['AccountUsage']
