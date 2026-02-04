-- KEYS[1] = queue key
-- ARGV[1] = device_id
-- ARGV[2] = today_key
-- ARGV[3] = daily_limit

-- Daily limit check
local used = redis.call("GET", ARGV[2])
if used and tonumber(used) >= tonumber(ARGV[3]) then
  return { "LIMIT" }
end

-- Get oldest waiting user
local candidates = redis.call("ZRANGE", KEYS[1], 0, 0)
if #candidates == 0 then
  redis.call("ZADD", KEYS[1], redis.call("TIME")[1], ARGV[1])
  return { "WAIT" }
end

local partner = candidates[1]

-- Prevent self-match
if partner == ARGV[1] then
  return { "WAIT" }
end

-- Remove partner from queue
redis.call("ZREM", KEYS[1], partner)

-- Create pairing
redis.call("SET", "pair:" .. ARGV[1], partner)
redis.call("SET", "pair:" .. partner, ARGV[1])

-- Increment daily usage
redis.call("INCR", ARGV[2])
redis.call("EXPIRE", ARGV[2], 86400)

return { "MATCH", partner }
