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

    let catId = req.query.id;

    let sqlCategories = `SELECT * FROM  ${DB_PREFIX}category c LEFT JOIN ${DB_PREFIX}category_description cd ON (c.category_id = cd.category_id) LEFT JOIN ${DB_PREFIX}category_to_store c2s ON (c.category_id = c2s.category_id)  WHERE c.parent_id = 0 AND c.status = '1' ORDER BY c.sort_order, LCASE(cd.name)`;
    let sqlSubcategory = `SELECT * FROM  ${DB_PREFIX}category c LEFT JOIN ${DB_PREFIX}category_description cd ON (c.category_id = cd.category_id) LEFT JOIN ${DB_PREFIX}category_to_store c2s ON (c.category_id = c2s.category_id)  WHERE c.parent_id = ${catId} AND c.status = '1' ORDER BY c.sort_order, LCASE(cd.name)`;
    let sqlCat = `SELECT * FROM ${DB_PREFIX}category as oc JOIN ${DB_PREFIX}category_description as od WHERE oc.category_id = od.category_id AND oc.category_id =`+ req.query.id;

    let cat  = new Promise(function (resolve, reject) {
        con.query(
            sqlCat,
            function (error,result) {
               if(error) reject(err);
               resolve(result)
            }
        )
    });

    let subcategory  = new Promise(function (resolve, reject) {
        con.query(
            sqlSubcategory,
            function (error,result) {
                if(error) reject(err);
                resolve(result)
            }
        )
    });

    // console.log(sqlCat);
    let categories  = new Promise(function (resolve, reject) {
        con.query(
            sqlCategories,
            function (error,result) {
                if(error) reject(err);
                resolve(result)
            }
        )
    });

    Promise.all([cat,categories,subcategory]).then(function (value) {
        // console.log(value[0]);
        res.render('cat',{
            cat: JSON.parse(JSON.stringify(value[0])),
            categories:JSON.parse(JSON.stringify(value[1])),
            subcategory:JSON.parse(JSON.stringify(value[2]))
        })
    })
});

app.get('/subcategory',function (req,res) {
    // console.log(req.query.page);

    let catId = req.query.id;

    let page = req.query.page ? req.query.page : 0;
    let offset = page + "0";


    let sqlCategories = `SELECT * FROM  ${DB_PREFIX}category c LEFT JOIN ${DB_PREFIX}category_description cd ON (c.category_id = cd.category_id) LEFT JOIN ${DB_PREFIX}category_to_store c2s ON (c.category_id = c2s.category_id)  WHERE c.parent_id = 0 AND c.status = '1' ORDER BY c.sort_order, LCASE(cd.name)`;
    let sqlCat = `SELECT * FROM ${DB_PREFIX}category as oc JOIN ${DB_PREFIX}category_description as od WHERE oc.category_id = od.category_id AND oc.category_id =`+ req.query.id;

    let sqlProducts = `SELECT op.product_id,op.model,op.image,op.price,opd.name,opd.description 
    FROM  oc_product_to_category as optc 
    JOIN ${DB_PREFIX}product as op ON optc.product_id = op.product_id 
    JOIN ${DB_PREFIX}product_description as opd  ON opd.product_id = op.product_id
    WHERE optc.category_id = ${req.query.id}
    ORDER BY optc.product_id DESC LIMIT 10 OFFSET ${Number(offset)} `;

    let productLength = `SELECT COUNT(op.product_id) as length
    FROM  oc_product_to_category as optc
    JOIN oc_product as op ON optc.product_id = op.product_id
    WHERE optc.category_id = ${req.query.id}
    ORDER BY optc.product_id DESC`;

    let cat  = new Promise(function (resolve, reject) {
        con.query(
            sqlCat,
            function (error,result) {
                if(error) reject(err);
                resolve(result)
            }
        )
    });

    let categories  = new Promise(function (resolve, reject) {
        con.query(
            sqlCategories,
            function (error,result) {
                if(error) reject(err);
                resolve(result)
            }
        )
    });

    let productsLength  = new Promise(function (resolve, reject) {
        con.query(
            productLength,
            function (error,result) {
                if(error) reject(err);
                resolve(result)
            }
        )
    });
    // console.log(sqlProducts);
    let products  = new Promise(function (resolve, reject) {
        con.query(
            sqlProducts,
            function (error,result) {
                if(error) reject(err);

                let size = 10; //размер подмассива
                let subcategory = [];

                for (let i = 0; i < Math.ceil(result.length / size); i++) {
                    subcategory[i] = result.slice((i * size), (i * size) + size);
                }
                resolve(subcategory)
            }
        )
    });

    Promise.all([cat,categories,products,productsLength]).then(function (value) {
        // console.log(JSON.parse(JSON.stringify(value[2])));
        res.render('subcategory',{
            cat: JSON.parse(JSON.stringify(value[0])),
            categories:JSON.parse(JSON.stringify(value[1])),
            products:JSON.parse(JSON.stringify(value[2][0])),
            catId: catId,
            productsLength: Math.ceil(JSON.parse(JSON.stringify(value[3][0].length)) / 10),
            iterator: 0
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



