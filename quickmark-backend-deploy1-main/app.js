const path = require('path');
 
// Serve local_uploads statically
app.use('/local_uploads', require('express').static(path.join(__dirname, 'local_uploads'))); 