const path = require('path');

const getProfilePage = async (req, res) => {
  try {
    res.sendFile(path.resolve(`${__dirname}/../public/pages/profile.html`));
  } catch (err) {
    console.log(err);
    res.send(err);
  }
};

module.exports = getProfilePage;
