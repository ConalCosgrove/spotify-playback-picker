const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const generateId = () => crypto.randomBytes(8).toString('hex');
const filePath = path.join(__dirname, '../data/database.json');

const saveTokens = (accessToken, refreshToken) => {
  const id = generateId();

  try {
    let map = fs.readFileSync(filePath, { flag: 'r' });
    if (!map) {
      map = {};
    } else {
      map = JSON.parse(map.toString());
    }
    map[id] = { accessToken, refreshToken };
    fs.writeFile(filePath, Buffer.from(JSON.stringify(map)), () => {});
    return id;
  } catch (err) {
    console.log(err);
    return err;
  }
};


    

const shareUrl = async (req, res) => {
  try {
    const { accessToken, refreshToken } = req.query;
    const id = saveTokens(accessToken, refreshToken);
    res.send({
      id,
    });
  } catch (err) {
    res.send(err);
  }
};

module.exports = shareUrl;
