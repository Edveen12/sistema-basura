const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('basura.db');

db.serialize(() => {

    // ====================================
    // TABLA USUARIOS
    // ====================================

    db.run(`

        CREATE TABLE IF NOT EXISTS usuarios (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            nombre TEXT,

            correo TEXT UNIQUE,

            password TEXT

        )

    `);


    // ====================================
    // TABLA REPORTES
    // ====================================

    db.run(`

        CREATE TABLE IF NOT EXISTS reportes (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            ubicacion TEXT,

            tipo TEXT,

            descripcion TEXT,

            imagen TEXT,

            latitud TEXT,

            longitud TEXT,

            usuario_id INTEGER,

            fecha DATETIME DEFAULT CURRENT_TIMESTAMP

        )

    `);

});

module.exports = db;