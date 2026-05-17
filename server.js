const express = require('express');

const path = require('path');

const session = require('express-session');

const multer = require('multer');

const fs = require('fs');

const db = require('./database/database');

const app = express();



// ====================================
// CREAR CARPETA UPLOADS
// ====================================

if(!fs.existsSync('uploads')){

    fs.mkdirSync('uploads');

}



// ====================================
// CONFIGURAR MULTER
// ====================================

const storage = multer.diskStorage({

    destination:(req,file,cb)=>{

        cb(null,'uploads/');

    },

    filename:(req,file,cb)=>{

        cb(

            null,

            Date.now() +

            path.extname(file.originalname)

        );

    }

});

const upload = multer({

    storage

});



// ====================================
// CONFIGURACIONES
// ====================================

app.use(express.urlencoded({

    extended:true

}));

app.use(express.json());

app.use(express.static('public'));

app.use('/uploads',

express.static('uploads'));



// ====================================
// SESIONES
// ====================================

app.use(session({

    secret:'basura',

    resave:false,

    saveUninitialized:true

}));



// ====================================
// RUTAS HTML
// ====================================

app.get('/',

(req,res)=>{

    res.sendFile(

        path.join(

            __dirname,

            'views',

            'index.html'

        )

    );

});



app.get('/registro',

(req,res)=>{

    res.sendFile(

        path.join(

            __dirname,

            'views',

            'registro.html'

        )

    );

});



app.get('/login',

(req,res)=>{

    res.sendFile(

        path.join(

            __dirname,

            'views',

            'login.html'

        )

    );

});



app.get('/dashboard',

(req,res)=>{

    if(!req.session.usuario){

        return res.redirect('/login');

    }

    res.sendFile(

        path.join(

            __dirname,

            'views',

            'dashboard.html'

        )

    );

});



app.get('/reportes',

(req,res)=>{

    if(!req.session.usuario){

        return res.redirect('/login');

    }

    res.sendFile(

        path.join(

            __dirname,

            'views',

            'reportes.html'

        )

    );

});



app.get('/lista-reportes',

(req,res)=>{

    if(!req.session.usuario){

        return res.redirect('/login');

    }

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

    try{

        db.prepare(`

        INSERT INTO usuarios(

            nombre,
            correo,
            password

        )

        VALUES(?,?,?)

        `).run(

            nombre,
            correo,
            password

        );

        res.send(

            'Usuario registrado'

        );

    }catch(error){

        res.send(

            'Error al registrar'

        );

    }

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

    const usuario =

    db.prepare(`

    SELECT * FROM usuarios

    WHERE correo = ?

    AND password = ?

    `).get(

        correo,
        password

    );

    if(usuario){

        req.session.usuario = usuario;

        res.json({

            success:true

        });

    }else{

        res.json({

            success:false

        });

    }

});



// ====================================
// GUARDAR REPORTE
// ====================================

app.post(

'/guardar-reporte',

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

    let imagen = '';

    if(req.file){

        imagen = req.file.filename;

    }

    try{

        db.prepare(`

        INSERT INTO reportes(

            ubicacion,
            tipo,
            descripcion,
            latitud,
            longitud,
            imagen,
            usuario_id

        )

        VALUES(?,?,?,?,?,?,?)

        `).run(

            ubicacion,
            tipo,
            descripcion,
            latitud,
            longitud,
            imagen,
            req.session.usuario.id

        );

        res.send(

            'Reporte guardado'

        );

    }catch(error){

        console.log(error);

        res.send(

            'Error al guardar'

        );

    }

});



// ====================================
// OBTENER REPORTES
// ====================================

app.get('/obtener-reportes',

(req,res)=>{

    const reportes =

    db.prepare(`

    SELECT * FROM reportes

    ORDER BY id DESC

    `).all();

    res.json(reportes);

});



// ====================================
// ELIMINAR REPORTE
// ====================================

app.delete(

'/eliminar-reporte/:id',

(req,res)=>{

    if(!req.session.usuario){

        return res.send(

            'No autorizado'

        );

    }

    const reporte =

    db.prepare(`

    SELECT * FROM reportes

    WHERE id = ?

    `).get(req.params.id);

    if(!reporte){

        return res.send(

            'Reporte no encontrado'

        );

    }

    if(

        reporte.usuario_id !==

        req.session.usuario.id

    ){

        return res.send(

            'No puedes eliminar este reporte'

        );

    }

    db.prepare(`

    DELETE FROM reportes

    WHERE id = ?

    `).run(req.params.id);

    res.send(

        'Reporte eliminado'

    );

});



// ====================================
// LOGOUT
// ====================================

app.get('/logout',

(req,res)=>{

    req.session.destroy();

    res.redirect('/');

});



// ====================================
// SERVIDOR
// ====================================

const PORT =

process.env.PORT || 3000;

app.listen(PORT,()=>{

    console.log(

        `Servidor corriendo en puerto ${PORT}`

    );

});