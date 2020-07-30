const path = require('path');
const shareUrl = require('./shareUrl');

const shared = (req, res) => {
  res.sendFile(path.resolve(`${__dirname}/../public/pages/shared.html`));
};


module.exports = shared;
