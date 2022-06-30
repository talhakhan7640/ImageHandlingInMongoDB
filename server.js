var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('public'))

// For handling image files
var fs = require("fs");
var path = require("path");
var multer = require("multer");

// Creating a mongodb connection
mongoose.connect("mongodb://localhost:27017/fileSystem")
// Create mongoose schema
const imageSchema = new mongoose.Schema({
    imageDescription: String,
    img: {
        data: Buffer,
        contentType: String
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
  })
  
const upload = multer({ storage: storage })

const imgModel = new mongoose.model('Image', imageSchema)

// GET Request
app.get('/', (req, res) => {
    imgModel.find({}, (err, items) => {
        if(err){
            console.log(err)
            res.status(500).send('An error occured', err)
        } else {
            res.render('index', {items: items});
        }
    })
})

// Handle POST Request
app.post('/', upload.single('image'), (req, res, next) => {
    var obj = {
        desc:req.body.desc,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'img/png'
        }
    }
    imgModel.create(obj, (err, item) => {
        if(err){
            console.log(err)
        }else{
            res.redirect('/')
        }
    })
})

app.get('/detailed', (req,res)=> {
    imgModel.find({}, (err, items) => {
        if(err){
            console.log(err)
            res.status(500).send('An error occured', err)
        } else {
            res.render('detailed', {items: items});
        }
    })
})

app.listen(3000, () => {
    console.log("server is running on port 3000")
})