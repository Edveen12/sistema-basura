const Database =
require('better-sqlite3');

const db =
new Database('basura.db');



// =========================
// TABLA USUARIOS
// =========================

db.prepare(`

CREATE TABLE IF NOT EXISTS usuarios(

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    nombre TEXT,

    correo TEXT UNIQUE,

    password TEXT

)

`).run();




// =========================
// TABLA REPORTES
// =========================

db.prepare(`

CREATE TABLE IF NOT EXISTS reportes(

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    ubicacion TEXT,

    tipo TEXT,

    descripcion TEXT,

    latitud TEXT,

    longitud TEXT,

    imagen TEXT,

    usuario_id INTEGER

)

`).run();




module.exports = db;