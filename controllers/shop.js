const Product = require('../models/product');
const Cart = require('../models/cart');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
  Product.findAll()
  .then(products =>{
      res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  })
  .catch(err => {console.log(err)});
};
exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  /*
  Product.findAll({where: {id: prodId}})
  .then(product=>{
    res.render('shop/product-detail', {
      product: product[0],
      pageTitle: product[0].title,
      path: '/products'
    });
  })
  .catch(err => console.log(err));
  */
  Product.findByPk(prodId)
  .then(product=>{
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/products'
    });
  })
  .catch(err => console.log(err));
}
exports.getIndex = (req, res, next) => {
  Product.findAll()
  .then(products =>{
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  })
  .catch(err =>{ console.log(err)});
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then(cart=>{return cart.getProducts().then(product=>{
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: product
      });
    })})
    .catch(err=>console.log(err));
  /*
  Cart.getCart(cart=>{
    Product.fetchAll(products => {
      const cartProducts = [];
      for (product of products) {
        const cartProductData = cart.products.find(prod => prod.id === product.id);
        if (cartProductData){
          cartProducts.push({productData: product, qty: cartProductData.qty})
        }
      }
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: cartProducts
      });
    });
  });
  */
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;
  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts({where: {id: prodId}})
    })
    .then(products => {
      let product;
      if(products.length > 0){product = products[0]}
      if (product) {
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity +1;
        return product
      }
      return Product.findByPk(prodId)
    })
    .then(product=>{
      return fetchedCart.addProduct(product, {through: {quantity: newQuantity}})
    })
    .then(()=>{res.redirect('/cart')})
    .catch(err => console.log(err));
  /*
  Product.findById(prodId, (product)=>{
    Cart.addProduct(prodId, product.price);
  });
  res.redirect('/cart');
  */
};

exports.postCartDeleteProduct = (req, res, next)=>{
  const prodId = req.body.productId;
  req.user
    .getCart()
    .then(cart=>{
      return cart.getProducts({where: {id: prodId}});
    })
    .then(products=>{
      const product=products[0];
      return product.cartItem.destroy();
    })
    .then(result =>{
      res.redirect('./cart')
    })
    .catch(err=>console.log(err))
  /*
  Product.findById(prodId, product =>{
    Cart.deleteProduct(prodId, product.price);
    res.redirect('/cart');
  });
  */
}

exports.postOrder = (req, res, next) => {
  req.user
    .getCart()
    .then(cart => {
      return cart.getProducts()
    })
    .then(products => {
      return req.user
        .createOrder()
        .then(order => {
          return order.addProducts(products.map(product =>{
            product.orderItem = {quantity: product.cartItem.quantity};
            return product
          }))
        })
        .then(result => {
          res.redirect('/orders')
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
}

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders'
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};