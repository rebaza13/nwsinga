// This file is used by Vercel to configure the deployment
module.exports = {
  // Tell Vercel to use the dist/spa directory as the root of the deployment
  outputDirectory: 'dist/spa',
  
  // Configure routes to handle SPA routing
  routes: [
    // Serve static files directly
    { src: '/assets/(.*)', dest: '/assets/$1' },
    { src: '/icons/(.*)', dest: '/icons/$1' },
    { src: '/favicon.ico', dest: '/favicon.ico' },
    
    // Redirect all other requests to index.html for SPA routing
    { src: '/(.*)', dest: '/index.html' }
  ]
};
