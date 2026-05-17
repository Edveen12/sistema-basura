const express = require('express');

const path = require('path');

const multer = require('multer');

const session = require('express-session');

const db = require('./database');

const app = express();


// ====================================
// SESIONES
// ====================================

app.use(session({

    secret:'basura',

    resave:false,

    saveUninitialized:false

}));


// ====================================
// CONFIGURACIONES
// ====================================

app.use(express.static('public'));

app.use(express.urlencoded({ extended:true }));

app.use(express.json());

app.use('/uploads',
express.static('uploads'));


// ====================================
// MULTER
// ====================================

const storage = multer.diskStorage({

    destination:(req,file,cb)=>{

        cb(null,'uploads/');

    },

    filename:(req,file,cb)=>{

        cb(

            null,

            Date.now() +
            '-' +
            file.originalname

        );

    }

});

const upload = multer({

    storage:storage

});


// ====================================
// PAGINAS
// ====================================

app.get('/', (req,res)=>{

    res.sendFile(

        path.join(
            __dirname,
            'views',
            'index.html'
        )

    );

});


app.get('/registro', (req,res)=>{

    res.sendFile(

        path.join(
            __dirname,
            'views',
            'registro.html'
        )

    );

});


app.get('/login', (req,res)=>{

    res.sendFile(

        path.join(
            __dirname,
            'views',
            'login.html'
        )

    );

});


app.get('/dashboard', (req,res)=>{

    res.sendFile(

        path.join(
            __dirname,
            'views',
            'dashboard.html'
        )

    );

});


app.get('/reportes', (req,res)=>{

    res.sendFile(

        path.join(
            __dirname,
            'views',
            'reportes.html'
        )

    );

});


app.get('/lista-reportes', (req,res)=>{

    res.sendFile(

        path.join(
            __dirname,
            'views',
            'lista-reportes.html'
        )

    );

});


// ====================================
// REGISTRO
// ====================================

app.post('/registro',

(req,res)=>{

    const {

        nombre,
        correo,
        password

    } = req.body;

    db.run(

        `INSERT INTO usuarios

        (

            nombre,
            correo,
            password

        )

        VALUES(?,?,?)`,

        [

            nombre,
            correo,
            password

        ],

        function(err){

            if(err){

                res.send(
                    'Correo ya registrado'
                );

            } else {

                res.send(
                    'Usuario registrado correctamente'
                );

            }

        }

    );

});


// ====================================
// LOGIN
// ====================================

app.post('/login',

(req,res)=>{

    const {

        correo,
        password

    } = req.body;

    db.get(

        `SELECT * FROM usuarios

        WHERE correo = ?
        AND password = ?`,

        [

            correo,
            password

        ],

        (err,row)=>{

            if(row){

                req.session.usuario = row;

                res.json({
                    success:true
                });

            } else {

                res.json({
                    success:false
                });

            }

        }

    );

});


// ====================================
// GUARDAR REPORTE
// ====================================

app.post('/guardar-reporte',

upload.single('imagen'),

(req,res)=>{

    if(!req.session.usuario){

        return res.send(
            'Debes iniciar sesión'
        );

    }

    const {

        ubicacion,
        tipo,
        descripcion,
        latitud,
        longitud

    } = req.body;

    const usuario_id =
    req.session.usuario.id;

    const imagen = req.file
    ? req.file.filename
    : '';

    db.run(

        `INSERT INTO reportes

        (

            ubicacion,
            tipo,
            descripcion,
            imagen,
            latitud,
            longitud,
            usuario_id

        )

        VALUES(?,?,?,?,?,?,?)`,

        [

            ubicacion,
            tipo,
            descripcion,
            imagen,
            latitud,
            longitud,
            usuario_id

        ],

        function(err){

            if(err){

                console.log(err);

                res.send(
                    'Error al guardar'
                );

            } else {

                res.send(
                    'Reporte guardado correctamente'
                );

            }

        }

    );

});


// ====================================
// OBTENER REPORTES
// ====================================

app.get('/obtener-reportes',

(req,res)=>{

    db.all(

        `SELECT * FROM reportes
        ORDER BY id DESC`,

        [],

        (err,rows)=>{

            if(err){

                res.json([]);

            } else {

                res.json(rows);

            }

        }

    );

});


// ====================================
// ELIMINAR REPORTE
// ====================================

app.delete('/eliminar-reporte/:id',

(req,res)=>{

    if(!req.session.usuario){

        return res.send(
            'Debes iniciar sesión'
        );

    }

    const id = req.params.id;

    const usuario_id =
    req.session.usuario.id;

    db.get(

        `SELECT * FROM reportes

        WHERE id = ?`,

        [id],

        (err,reporte)=>{

            if(!reporte){

                return res.send(
                    'Reporte no existe'
                );

            }

            if(reporte.usuario_id
            != usuario_id){

                return res.send(
                    'No puedes eliminar este reporte'
                );

            }

            db.run(

                `DELETE FROM reportes

                WHERE id = ?`,

                [id],

                function(err){

                    if(err){

                        res.send(
                            'Error al eliminar'
                        );

                    } else {

                        res.send(
                            'Reporte eliminado'
                        );

                    }

                }

            );

        }

    );

});


// ====================================
// SERVIDOR
// ====================================

app.listen(3000, ()=>{

    console.log(

        'Servidor corriendo en http://localhost:3000'

    );

});