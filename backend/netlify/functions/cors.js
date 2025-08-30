/**
 * CORS Handler
 * Handles OPTIONS preflight requests with proper CORS headers
 */

// Handler function for CORS preflight OPTIONS requests
exports.handler = async function(event, context) {
  // Get the origin from the request headers
  const origin = event.headers.origin || event.headers.Origin;
  
  // List of allowed origins
  const allowedOrigins = [
    'https://recipedium.vercel.app',
    'https://recipedium.com'
  ];
  
  // Debug logging
  console.log('CORS Debug - Origin:', origin, 'Allowed:', allowedOrigins.includes(origin));
  
  // Return CORS headers for preflight requests
  if (event.httpMethod === 'OPTIONS') {
    const responseHeaders = {
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400' // 24 hours cache for preflight requests
    };
    
    // Only set origin if it's in the allowed list
    if (allowedOrigins.includes(origin)) {
      responseHeaders['Access-Control-Allow-Origin'] = origin;
    }
    
    return {
      statusCode: 204, // No content needed for OPTIONS
      headers: responseHeaders
    };
  }

  // For non-OPTIONS requests (should not happen with this handler's config)
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "CORS preflight handler" })
  };
}; 