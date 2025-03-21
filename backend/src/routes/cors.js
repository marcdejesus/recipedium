/**
 * Special handler for CORS preflight requests
 * This file is specifically for handling OPTIONS requests to solve CORS issues in Vercel serverless functions
 */

// Express router function
const corsHandler = (req, res) => {
  // Set CORS headers for preflight requests
  res.header('Access-Control-Allow-Origin', 'https://recipedium.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Respond with 200 OK to preflight requests
  return res.status(200).send();
};

// Export as both a function and a module for Express and Vercel
module.exports = corsHandler;
// Vercel handler function
module.exports.default = corsHandler; 