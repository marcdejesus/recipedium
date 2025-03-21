// Simple health check function
exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET'
    },
    body: JSON.stringify({
      status: 'ok',
      message: 'API is operational',
      timestamp: new Date().toISOString(),
      serverless: true
    })
  };
}; 