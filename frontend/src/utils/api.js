export async function testBackendConnection() {
  try {
    const res = await fetch("http://127.0.0.1:8000/");
    if (!res.ok) throw new Error("Backend not reachable");
    return true;
  } catch (err) {
    console.error("Backend connection failed:", err);
    return false;
  }
}
