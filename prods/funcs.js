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
  db: db
}