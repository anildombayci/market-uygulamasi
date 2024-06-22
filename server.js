let express = require("express"),
  app = require("express")(),
  terminal = require("terminal.xr"),
  bodyParser = require("body-parser"),
  session = require("express-session"),
  xariona = new terminal({
    saveFile: false,
    autoAdapterLoader: false,
    design: {
      timeStyle: "[{time}] >",
      filename: "output",
      adapterDir: `./adapters`,
    },
  }),
  ayarlar = {
    port: 3000
  },
  path = require("path"),
  passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  helmet = require("helmet"),
  moment = require("moment-timezone"),
  axios = require("axios"),
  func = require("./prods/funcs");

app.use(express.static("dist"));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
// Express için session yapılandırması
app.use(
  session({
    secret: "1542", // Daha güvenli bir değer kullanın
    resave: false,
    saveUninitialized: false,
  })
);
moment.tz.setDefault("Europe/Istanbul");
moment.locale("tr");

app.use(passport.initialize());
app.use(passport.session());
app.use(helmet());
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

//---------------------
let dir = path.resolve(`${process.cwd()}${path.sep}res`);
//---------------------

const yukle = (res, req, template, data = {}) => {
  const baseData = {
    path: req.path,
    db: func.db
  };
  res.render(
    path.resolve(`${dir}${path.sep}${template}`),
    Object.assign(baseData, data)
  );
};

app.get("/", async (req, res) => {
  var items = await func.listAll()
  yukle(res, req, "index.ejs", { products: items })
})

app.get("/test", (req, res) => {
  func.db.set("sa", "as")
})

app.get("/add", async (req, res) => {
  yukle(res, req, "urunEkle.ejs")
})

function Barkot() {
  let result = '';
  const characters = '0123456789';

  for (let i = 0; i < 13; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

app.post("/add", async (req, res) => {
  const { name, price, stock } = req.body;
  var olusanBarkod = Barkot()

  try {
    const newProduct = await func.add(name, olusanBarkod, price, stock); // Yeni ürünü veritabanına ekliyoruz
    console.log("Yeni ürün eklendi:", newProduct);
    res.redirect("/"); // Başarıyla eklendikten sonra ana sayfaya yönlendiriyoruz
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).send("Error adding product");
  }
});

// Ürün bulma formunu gösterme
app.get('/find', (req, res) => {
  yukle(res, req, 'find.ejs'); // Ürün bulma formu için EJS şablonunu render etmek için
});

// Ürün bulma işlemi (POST isteği)
app.post('/find', async (req, res) => {
  const barcode = req.body.barcode; // Formdan gelen barkod numarası

  // Veritabanında barkod numarasına göre ürünü arama
  const foundProduct = await func.findOnBarcode(barcode); // db.findOnBarcode() metodunuzu kullanarak veritabanından ürünü bulun

  if (foundProduct) {
    yukle(res, req, 'find.ejs', { foundProduct, searched: true }); // Bulunan ürünü ve arama yapıldığını EJS şablonuna gönder
  } else {
    yukle(res, req, 'find.ejs', { searched: true }); // Ürün bulunamazsa sadece arama yapıldığını EJS şablonuna gönder
  }
});

app.post('/downStock', async (req, res) => {
  const barcode = req.body.barcode
  const count = req.body.count
  
  const foundProduct = await func.findOnBarcode(barcode)
  if (foundProduct) {
    var downStock = await func.downOfStock(barcode, count)
    return downStock
  } else {
    return { status: 404, message: "Bu Stok ürünü bulunamadı veya kaldırılmış olabilir." }
  }
})

app.get("/scan", async (req, res) => {
  var items = await func.listAll()
  yukle(res, req, "scan.ejs", {items: items})
})

// Barkod okuma ve stoktan düşme işlemi
app.post('/scan', async (req, res) => {
  const barcodes = req.body.barcodes;

  try {
    const results = [];
    for (const barcode of barcodes) {
      // Veritabanında barkod numarasına göre ürünü bul
      const scannedProduct = await func.findOnBarcode(barcode);

      if (scannedProduct) {
        // Ürün bulunduysa ve stokta varsa
        if (scannedProduct.stock > 0) {
          results.push({ scannedProduct });
        } else {
          results.push({ scanError: true }); // Stokta ürün yok hatası
        }
      } else {
        results.push({ scanError: true }); // Ürün bulunamadı hatası
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Ürün arama hatası:', error);
    res.status(500).json({ error: 'Barkod işleme sırasında bir hata oluştu.' });
  }
});

app.listen(ayarlar.port, () => {
  xariona.create("Yelkenler açıldı başkan! Proje hazır " + xariona.tick, { type: "info" });
});
