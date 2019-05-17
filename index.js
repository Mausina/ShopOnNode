let express = require('express');

let mysql = require('mysql');


let con = mysql.createConnection({
    host: "127.0.0.1",
    user: "mysql",
    password: "mysql",
    database: "new_shonode"
});







let app = express();

app.use(express.static('public'));
app.set('view engine','pug');

const port = 3000;
const pathName = '127.0.0.1';



app.get('/',function (req,res) {
    con.connect(function(err) {
        if (err) throw err;

        con.query("SELECT * FROM oc_customer WHERE customer_id = 1", function (err, result, fields) {
            if (err) throw err;
            let goods = {};

            // for(let i = 0; i < result.length; i++){
            //     goods[result[i]['id']] = result[i];
            // }

            // console.log();
            res.render('main',{
                results: JSON.parse(JSON.stringify(result))
            });

        });

    });

});

app.listen(port,function () {
    console.log(`node express work on ${port}`)
});



