let express = require('express');
const path = require('path');
let mysql = require('mysql');

let app = express();

const DB_PREFIX = 'oc_';
const port = 3000;
const pathName = '127.0.0.1';

let con = mysql.createConnection({
    host: "127.0.0.1",
    user: "mysql",
    password: "mysql",
    database: "new_shonode"
});


app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');

app.use(express.static('public'));

app.get('/',function (req,res) {

    let sql = `SELECT * FROM  ${DB_PREFIX}category c LEFT JOIN ${DB_PREFIX}category_description cd ON (c.category_id = cd.category_id) WHERE parent_id = 0`;
    let sqlBanner = `SELECT image FROM ${DB_PREFIX}banner_image`;
    let sqlFeatured = `SELECT op.product_id,model,image,name FROM ${DB_PREFIX}product AS op JOIN oc_product_description AS opd WHERE op.product_id = opd.product_id LIMIT 0,3`;

    let categories  = new Promise(function (resolve, reject) {
        con.query(
            sql,
            function (error,result) {
                if(error) reject(err);
                resolve(result)
            }
        )
    });
    let banners  = new Promise(function (resolve, reject) {
        con.query(
            sqlBanner,
            function (error,result) {
                if(error) reject(err);
                resolve(result)
            }
        )
    });
    let featured = new Promise(function (resolve, reject) {
        con.query(
            sqlFeatured,
            function (error,result) {
                if(error) reject(err);
                resolve(result)
            }
        )
    });

    Promise.all([categories,banners,featured]).then(function (value) {
        // console.log(JSON.parse(JSON.stringify(value[2])));
        res.render('main',{
            categories: JSON.parse(JSON.stringify(value[0])),
            banners: JSON.parse(JSON.stringify(value[1])),
            featured: JSON.parse(JSON.stringify(value[2])),
        })
    })

});


app.get('/cat',function (req,res) {
    console.log(req.query.id);
    let catId = req.query.id;

    let cat  = new Promise(function (resolve, reject) {
        con.query(
            'SELECT * FROM oc_category WHERE id='+catId,
            function (error,result) {
               if(error) reject(err);
               resolve(result)
            }
        )
    });

    let products  = new Promise(function (resolve, reject) {
        con.query(
            'SELECT * FROM oc_products WHERE category='+catId,
            function (error,result) {
                if(error) reject(err);
                resolve(result)
            }
        )
    });

    Promise.all([cat,products]).then(function (value) {
        console.log(value[0]);
        res.render('cat',{
            cat: JSON.parse(JSON.stringify(value[0])),
            products: JSON.parse(JSON.stringify(value[1]))
        })
    })
});

app.get('/categories',function (req,res) {
    let sql = `SELECT * FROM  ${DB_PREFIX}category c LEFT JOIN ${DB_PREFIX}category_description cd ON (c.category_id = cd.category_id) LEFT JOIN ${DB_PREFIX}category_to_store c2s ON (c.category_id = c2s.category_id)  WHERE c.parent_id = 0 AND c.status = '1' ORDER BY c.sort_order, LCASE(cd.name)`;
    // console.log(sql);
    let categories  = new Promise(function (resolve, reject) {
        con.query(
            sql,
            function (error,result) {
                if(error) reject(err);
                resolve(result)
            }
        )
    });


    Promise.all([categories]).then(function (value) {
        // console.log(JSON.parse(JSON.stringify(value[0].length)));
        res.render('categories',{
            categories: JSON.parse(JSON.stringify(value[0])),
        })
    })
});

app.listen(port,function () {
    console.log(`node express work on ${port}`)
});



