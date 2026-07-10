export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY;
  return Response.json({ 
    keyPresent: !!key, 
    keyValue: JSON.stringify(key),
    keyLength: key?.length ?? 0,
    keyPrefix: key ? key.slice(0, 20) : null
  });
}
