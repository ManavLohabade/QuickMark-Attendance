const path = require('path');
const fs = require('fs');

exports.saveLocalImage = (file) => {
  const uploadsDir = path.join(__dirname, '../local_uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const filename = Date.now() + '-' + file.originalname;
  const filepath = path.join(uploadsDir, filename);
  fs.writeFileSync(filepath, file.buffer);
  return `/local_uploads/${filename}`; // Public URL path
}; 