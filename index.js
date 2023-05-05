var express = require('express');
var cors = require('cors');
require('dotenv').config()

var app = express();
let mongoose = require('mongoose')
const multer  = require('multer')

const mySecret = process.env['MONGO_URI']
mongoose.connect(mySecret, {useNewUrlParser: true, useUnifiedTopology: true})

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// file Schema
const fileSchema = new mongoose.Schema({
  filename: String,
  type: String,
  data: Buffer
})

// file model
const fileModel = mongoose.model('File', fileSchema)

// setup multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// file analysys after submiting
app.post('/api/fileanalyse', upload.single('upfile'), async (req, res) => {
  console.log(req.file)
  let respObj = {}
  respObj.name = req.file.originalname
  respObj.type = req.file.mimetype
  respObj.size = req.file.size

  const file = new fileModel({
    filename: req.file.originalname,
    type: req.file.mimetype,
    data: req.file.buffer
  });

  //for file uploads
  try {
    await file.save();
    res.json(respObj)
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
})

// Define a route to retrieve a file by filename
app.get('/files/:filename', async (req, res) => {
  const { filename } = req.params;

  try {
    const file = await fileModel.findOne({ filename });

    if (!file) {
      return res.status(404).send('File not found');
    }

    // res.set('Content-Type', file.contentType); <- | should be not commented but isnt crucial |  
    res.send(file.data);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
