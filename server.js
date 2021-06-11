import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Grid from 'gridfs-stream';
import multer from 'multer';
import gridFsStorage from 'multer-gridfs-storage';
import path from 'path';
import Pusher from 'pusher';
import dotEnv from 'dotenv';
import db from './dbModel.js';


// app configs
dotEnv.config();
const PORT = process.env.PORT || 9000;
const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// db configs
const MONGO_DB_URI = process.env.MONGO_DB_URI;
mongoose.connect(MONGO_DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

const conn = mongoose.createConnection(MONGO_DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

mongoose.connection.once('open', () => {
  console.log('DB Connected');
  // trigger pusher
});

let gfs;

conn.once('open', () => {
  console.log('DB Connected');

  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('images');
});

const storage = new gridFsStorage({
  url: MONGO_DB_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const filename = `image-${Date.now()}${path.extname(file.originalname)}`;
      const fileInfo = {
        filename: filename,
        bucketName: 'images',
      };
      resolve(fileInfo);
    });
  },
});

const upload = multer({ storage });

// app routes
app.get('/', (req, res) => res.status(200).send('API IS LIVE'));

app.post('/upload/image', upload.single('file'), (req, res) => {
  res.status(201).send(req.file);
});

app.get('/retrieve/image/single', (req, res) => {
  gfs.files.findOne({ filename: req.query.filename }, (err, file) => {
    if (err) {
      res.status(500).send(err);
    } else if (!file || file.length === 0) {
      res.status(404).send('file Not found');
    } else {
      const readStream = gfs.createReadStream(file.filename);
      readStream.pipe(res);
    }
  });
});

app.post('/upload/newPost', (req, res) => {
      
      const newPost = req.body
      db.create(newPost, (err, data) => {
           if(err){
               res.status(500).send(err);
           }else{
               res.status(201).send(data);
           }
      })
})

 app.get('/retrieve/posts', (req, res) => {
        
       db.find((err, data) => {
           if(err){
               res.status(500).send(err)
           }else{
               res.status(200).send(data);
           }
       })
 } )

// listen

app.listen(PORT, () => console.log(`server is running at port ${PORT}`));

// mongo password
