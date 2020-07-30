const path = require('path');
const fs = require('fs');

const getToken = (id) => {
  const filePath = path.join(__dirname, '../data/database.json');
  const map = fs.readFileSync(filePath, { flag: 'r' });

  if (!map) {
    fs.writeFile(filePath, Buffer.from('{}'));
    return '';
  }
  const parsedMap = JSON.parse(map.toString());
  return parsedMap[id];
};

const tokens = async (req, res) => {
  const token = getToken(req.params.id);
  res.send(token);
};


module.exports = tokens;
