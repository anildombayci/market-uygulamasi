var db = require("database.xr");

module.exports = {
  findOnBarcode: async (barcode) => {
    var all = db.get("urunler");
    return all.find((urun) => urun.barcode === barcode);
  },
  listAll: async (x) => {
    if (x === "order") {
      var orderAll = db.get("orders");
      return orderAll;
    } else if (!x) {
      var all = db.get("urunler");
      return all;
    }
  },
  add: async (name, barcode, price, stock) => {
    db.push("urunler", {
      name: name,
      barcode: barcode,
      price: price,
      stock: stock,
    });
    return { name: name, barcode: barcode, price: price, stock: stock };
  },
  downOfStock: async (barcode, count) => {
    let products = db.get("urunler");
    const productIndex = products.findIndex((urun) => urun.barcode === barcode);
    if (productIndex !== -1) {
      const productName = products[productIndex].name;
      const previousStock = products[productIndex].stock;
      products[productIndex].stock -= count;
      db.set("urunler", products);
      const message = `Stok azaltma işlemi başarılı: ${count} adet "${productName}" ürününden düşürüldü. Stok: ${previousStock} ➔ ${products[productIndex].stock}`;
      return { status: 200, message };
    } else {
      return {
        status: 404,
        message: "Böyle bir barkod numarasına sahip ürün bulunamadı.",
      };
    }
  },
  saveShopping: async (countedBarcodes, totalPrice) => {
    const orderDetails = Object.keys(countedBarcodes).map((barcode) => {
      return {
        barcode,
        count: countedBarcodes[barcode].count,
        product: countedBarcodes[barcode].product,
      };
    });
    const order = {
      items: orderDetails,
      totalPrice: totalPrice,
      date: new Date(),
    };
    try {
      db.push("orders", order);
      return { status: 200, message: "Sipariş başarıyla kaydedildi" };
    } catch (error) {
      return { status: 500, error: "Veritabanına kaydedilemedi" };
    }
  },
  db: db,
};
