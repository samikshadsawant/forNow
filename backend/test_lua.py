from redis_client import redis_client
from datetime import date

# Load Lua script
with open("match.lua", "r") as f:
    match_script = redis_client.register_script(f.read())

device_id = "device_test_1"
mood = "just-vibing"
filter_pref = "any"

queue = f"queue:{mood}:{filter_pref}"
today = date.today().isoformat()
limit_key = f"limit:{device_id}:{today}"

# Clean slate
redis_client.delete(queue)
redis_client.delete(f"pair:{device_id}")
redis_client.delete(limit_key)

# -------- First call (should WAIT) --------
result1 = match_script(
    keys=[queue],
    args=[device_id, limit_key, 5],
)

print("Result 1:", result1)

# -------- Second user --------
result2 = match_script(
    keys=[queue],
    args=["device_test_2", f"limit:device_test_2:{today}", 5],
)

print("Result 2:", result2)

# -------- Verify pairing --------
print("Pair device_test_1:", redis_client.get("pair:device_test_1"))
print("Pair device_test_2:", redis_client.get("pair:device_test_2"))
