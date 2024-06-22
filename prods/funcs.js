var db = require("database.xr")


module.exports = {
  findOnBarcode: async (barcode) => {
    var all = db.get("urunler")
    return all.find(urun => urun.barcode === barcode)
  },
  listAll: async () => {
    var all = db.get("urunler")
    return all
  },
  add: async (name, barcode, price, stock) => {
    db.push("urunler", { name: name, barcode: barcode, price: price, stock: stock })
    return { name: name, barcode: barcode, price: price, stock: stock }
  },
  downOfStock: async (barcode, count) => {
  let products = db.get('urunler');
  const productIndex = products.findIndex(urun => urun.barcode === barcode);
  if (productIndex !== -1) {
    const productName = products[productIndex].name;
    const previousStock = products[productIndex].stock;
    products[productIndex].stock -= count;
    db.set('urunler', products);
    const message = `Stok azaltma işlemi başarılı: ${count} adet "${productName}" ürününden düşürüldü. Stok: ${previousStock} ➔ ${products[productIndex].stock}`;
    return { status: 200, message };
  } else {
    return { status: 404, message: 'Böyle bir barkod numarasına sahip ürün bulunamadı.' };
  }
  },
  db: db
}
