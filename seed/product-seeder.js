var Product = require('../models/product');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/shopping');

var products = [
    new Product({
        imagePath: 'http://www.twsteel.com/media/catalog/product/cache/3/thumbnail/420x/9df78eab33525d08d6e5fb8d27136e95/t/w/tw535_2.jpg',
        title: 'TW Steel',
        description: 'TW Steel Sport Watch for Women',
        price: 10
    }),
    new Product({
        imagePath: 'http://images.shopcasio.com/imagesEdp/p223703z.jpg',
        title: 'Casio Sport Watch',
        description: 'Best Sports Watch by Casio',
        price: 15
    }),
    new Product({
        imagePath: 'http://d10b75yp86lc36.cloudfront.net/Monotaro3/pi/full/mono22466684-160325-02.jpg',
        title: 'Tinker Victoriknox',
        description: 'EDC Victoriknox',
        price: 12
    })
];
var done = 0;
for (var i = 0; i < products.length; i++){
    products[i].save(function(err, result){
        done++;
        console.log(products[i]);
        if (done === products.length){
            exit();
        }
    });
}
function exit() {
    console.log('Done');
    mongoose.disconnect();
}


