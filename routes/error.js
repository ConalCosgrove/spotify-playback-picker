const path = require('path');

const getErrorPage = async (req, res) => {
  try {
    res.sendFile(path.resolve(`${__dirname}/../public/pages/error.html`));
  } catch (err) {
    console.log(err);
    res.send(err);
  }
};

module.exports = getErrorPage;
