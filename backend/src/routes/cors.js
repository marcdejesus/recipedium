/**
 * Special handler for CORS preflight requests
 * This file is specifically for handling OPTIONS requests to solve CORS issues in Vercel serverless functions
 */

// Express router function
const corsHandler = (req, res) => {
  // Set CORS headers for preflight requests - allow both domains and localhost for development
  const allowedOrigins = [
    'https://recipedium.vercel.app',
    'https://recipedium.com',
    'http://localhost:3000', // Add localhost for development
    'http://127.0.0.1:3000'  // Add alternative localhost format
  ];
  
  const origin = req.headers.origin;
  
  // Debug logging
  console.log('CORS Debug - Origin:', origin, 'Allowed:', allowedOrigins.includes(origin));
  
  // Only set origin if it's in the allowed list
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Respond with 200 OK to preflight requests
  return res.status(200).send();
};

// Export as both a function and a module for Express and Vercel
module.exports = corsHandler; 