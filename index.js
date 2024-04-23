"use strict"
/* -------------------------------------------------------
    NODEJS EXPRESS | CLARUSWAY FullStack Team
------------------------------------------------------- */
const express = require('express')
//FS_DEPLOY const path = require("node:path") // FE ve BE render ederken bunu rquire ettik
const path = require("path")//FS_DEPLOY bu şekilde de yapılabilir build-in modül olduğu için, yukarıdaki şekilde bazen hata verebiliyormuş render ederken
const app = express()

/* ------------------------------------------------------- */
// Required Modules:

// envVariables to process.env:
require('dotenv').config({ path: __dirname + '/.env' })
const HOST = process.env?.HOST || '127.0.0.1'
const PORT = process.env?.PORT || 8000

// asyncErrors to errorHandler:
require('express-async-errors')

//FS_DEPLOY static dsyaların yerini gösteriyoruz
app.use(express.static(path.join(__dirname, "public")));//burda join yerine resolve da kullanılabilirmiş

/* ------------------------------------------------------- */
// Configrations:

// Connect to DB:
const { dbConnection } = require('./src/configs/dbConnection')
dbConnection()

/* ------------------------------------------------------- */
// Middlewares:

// Accept JSON:
app.use(express.json())

// Cors:
app.use(require('cors')())

// Check Authentication:
app.use(require('./src/middlewares/authentication'))

// res.getModelList():
app.use(require('./src/middlewares/findSearchSortPage'))

/* ------------------------------------------------------- */
// Routes:

// HomePath:
//FS_DEPLOY 2. FE ile beraber deploy edeceğimiz için "/" yerine /api/v1/documents yazdı
app.all('/api/v1/documents', (req, res) => {

    res.send(`
        <h3>Stock Management API Service</h3>
        <hr>
        <p>
            Documents:
            <ul> 
                <li><a href="/api/v1/documents/swagger">SWAGGER</a></li>
                <li><a href="/api/v1/documents/redoc">REDOC</a></li>
                <li><a href="/api/v1/documents/json">JSON</a></li>
            </ul>
        </p>
    `)
})

// Routes:
//FS_DEPLOY 1. "/api/v1", FE nin src/services/useAxios satır 10 ve 15 de verdiğimiz isimdi, hoca kendi verdi
// bu şu anlama geliyor, ana route da direkt FE ana sayfa açılacak, BE ye ulaşmak istersek /api/v1 yazmamız gerekecek örnek;
//FS_DEPLOY /api/v1/users gibi veya /api/v1/auth/login gibi
app.use("/api/v1", require('./src/routes'))

/* ------------------------------------------------------- */

//FS_DEPLOY browserden site adı yazıldığında FE hizmet vermeye başlasın
//index.html static olarak render edilecek
app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "./public", "index.html"));//burdaki resolve yerine join de kullanılabilirmiş
});

//FS_DEPLOY olmayan bir route a istek atılırsa verilecek hata
app.use("*", (req, res) => {
    res.status(404).json({ msg: "not found" });
})

// errorHandler:
app.use(require('./src/middlewares/errorHandler'))

// RUN SERVER:
app.listen(PORT, () => console.log(`http://${HOST}:${PORT}`))

/* ------------------------------------------------------- */
// Syncronization (must be in commentLine):
//sadece geliştirme moodundayken DB silme sync işlemleri yapılsın 
// proje canlıya alındığında, .env deki NODE_ENV = production yapılacağı için bu sync işlemi bidaha çalışmaz
if (process.env.NODE_ENV == 'development') {
    // require('./src/configs/sync')() // !!! It clear database.
}
