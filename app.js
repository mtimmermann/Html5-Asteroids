const express = require('express');
const path = require('path');
const port = process.env.PORT || 3000;

const app = express();
const http = require('http').createServer(app);

// Serve static assets from src directory
app.use(express.static(path.join(__dirname, '/src')));


// Single page app method for 404s, return the static html file
// Handles all routes so you do not get a not found error
app.get('*', function (req, res, next) {
  res.sendFile(path.resolve(__dirname, 'src', 'index.html'));
});


// Error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});


/**
 * Listen on provided port, on all network interfaces.
 */
//app.listen(port);
http.listen(port);
console.log('Server started on port ' + port);
