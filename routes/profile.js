const express = require('express');
const router = express.Router();

router.use(express.static('/public'));
router.get('/profile', async (req, res) => {
  try {
    console.log('sending file')
    res.sendFile(__dirname + '/public/pages/profile.html');
  } catch(err){
    console.log(err);
    res.send(err);
  }
});

module.exports = router;