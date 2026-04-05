const d = require('./tmp_products.json');
console.log('Count:', d.length);
d.forEach(p => console.log(p.id, p.product_name, '-', p.category, '-', 'RM'+p.price));
