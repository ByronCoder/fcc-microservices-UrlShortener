const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const shortUrl = require('./models/shortUrl');

app.use(bodyParser.json())
app.use(cors());
mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost/shortUrls');
app.use(express.static(__dirname + '/public'));

app.get('/new/:urlToShorten(*)', (req, res, next) =>{
    var { urlToShorten } = req.params;
    var expression = /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    var regex = expression;
    if(regex.test(urlToShorten)===true) {
        var short = Math.floor(Math.random() * 100000).toString();

        var data = new shortUrl( 
        {
            originalUrl: urlToShorten,
            shorterUrl: short
        }

    );

    data.save(err=> {
        if(err) {
            return res.send('Error saving to database');
        }
    });
        return  res.json(data);
    }
     var data = new shortUrl({
            originalUrl: urlToShorten,
            shorterUrl: 'InvalidURL'
        })
        return res.json(data);
    
});


app.get('/new/:urlToForward', (req, res, next)=> {
    var shorterUrl = req.params.urlToForward;

    shortUrl.findOne({'shorterUrl': shorterUrl} , (err, data) => {
        if(err) return res.send('Error reading database');
        var re = new RegExp("^(http|https)://", "i");

        var strtoCheck = data.originalUrl;
        if(re.test(strtoCheck)) {
            res.redirect(301, data.originalUrl);
        }
        else {
            res.redirect(301, 'http://' + data.originalUrl);
        }
    });
});



app.listen(process.env.PORT || 3000, ()=> {
    console.log('Everything is working.');
})