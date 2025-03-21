/**
 * CORS Handler
 * Handles OPTIONS preflight requests with proper CORS headers
 */

// Handler function for CORS preflight OPTIONS requests
exports.handler = async function(event, context) {
  // Return CORS headers for preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204, // No content needed for OPTIONS
      headers: {
        'Access-Control-Allow-Origin': 'https://recipedium.vercel.app',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400' // 24 hours cache for preflight requests
      }
    };
  }

  // For non-OPTIONS requests (should not happen with this handler's config)
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "CORS preflight handler" })
  };
}; 