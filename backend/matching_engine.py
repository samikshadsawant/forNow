import time
from redis_client import redis_client

def enqueue_user(queue_key, device_id):
    redis_client.zadd(queue_key, {device_id: time.time()})

def dequeue_user(queue_key, device_id):
    redis_client.zrem(queue_key, device_id)
