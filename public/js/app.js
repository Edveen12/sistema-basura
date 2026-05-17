// ====================================
// REGISTRO
// ====================================

const formRegistro =
document.getElementById('formRegistro');

if(formRegistro){

    formRegistro.addEventListener('submit',

    async(e)=>{

        e.preventDefault();

        const nombre =
        document.getElementById('nombre').value;

        const correo =
        document.getElementById('correo').value;

        const password =
        document.getElementById('password').value;

        const respuesta =
        await fetch('/registro',{

            method:'POST',

            headers:{
                'Content-Type':'application/json'
            },

            body:JSON.stringify({

                nombre,
                correo,
                password

            })

        });

        const data =
        await respuesta.text();

        alert(data);

    });

}



// ====================================
// LOGIN
// ====================================

const formLogin =
document.getElementById('formLogin');

if(formLogin){

    formLogin.addEventListener('submit',

    async(e)=>{

        e.preventDefault();

        const correo =
        document.getElementById('correo').value;

        const password =
        document.getElementById('password').value;

        const respuesta =
        await fetch('/login',{

            method:'POST',

            headers:{
                'Content-Type':'application/json'
            },

            body:JSON.stringify({

                correo,
                password

            })

        });

        const data =
        await respuesta.json();

        if(data.success){

            window.location.href =
            '/dashboard';

        } else {

            alert(
                'Credenciales incorrectas'
            );

        }

    });

}



// ====================================
// GUARDAR REPORTE
// ====================================

const formReporte =
document.getElementById('formReporte');

if(formReporte){

    formReporte.addEventListener('submit',

    async(e)=>{

        e.preventDefault();

        const formData =
        new FormData();

        formData.append(

            'ubicacion',

            document.getElementById(
            'ubicacion').value

        );

        formData.append(

            'tipo',

            document.getElementById(
            'tipo').value

        );

        formData.append(

            'descripcion',

            document.getElementById(
            'descripcion').value

        );

        formData.append(

            'latitud',

            document.getElementById(
            'latitud').value

        );

        formData.append(

            'longitud',

            document.getElementById(
            'longitud').value

        );

        formData.append(

            'imagen',

            document.getElementById(
            'imagen').files[0]

        );

        const respuesta =
        await fetch('/guardar-reporte',{

            method:'POST',

            body:formData

        });

        const data =
        await respuesta.text();

        alert(data);

        formReporte.reset();

    });

}



// ====================================
// MOSTRAR REPORTES
// ====================================

const contenedorReportes =
document.getElementById(
'contenedorReportes'
);

if(contenedorReportes){

    cargarReportes();

}


async function cargarReportes(){

    const respuesta =
    await fetch('/obtener-reportes');

    const reportes =
    await respuesta.json();

    contenedorReportes.innerHTML = '';

    reportes.forEach(reporte=>{

        contenedorReportes.innerHTML += `

        <div class="card">

            <h2>

                ${reporte.tipo}

            </h2>

            <p>

                <b>Zona:</b>

                ${reporte.ubicacion}

            </p>

            <p>

                ${reporte.descripcion}

            </p>

            ${
                reporte.imagen
                ?

                `<img
                src="/uploads/${reporte.imagen}"
                class="reporte-img">`

                :

                ''

            }

            <button
            class="delete-btn"
            onclick="eliminarReporte(${reporte.id})">

                Eliminar

            </button>

        </div>

        `;

    });

}



// ====================================
// ELIMINAR REPORTE
// ====================================

async function eliminarReporte(id){

    const respuesta =
    await fetch(

        `/eliminar-reporte/${id}`,

        {
            method:'DELETE'
        }

    );

    const data =
    await respuesta.text();

    alert(data);

    cargarReportes();

}



// ====================================
// MAPA
// ====================================

const mapa =
document.getElementById('map');

if(mapa){

    const map =
    L.map('map')
    .setView([13.6929,-89.2182],13);

    L.tileLayer(

        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',

        {

            attribution:
            'OpenStreetMap'

        }

    ).addTo(map);


    let marker =
    L.marker(

        [13.6929,-89.2182],

        {
            draggable:true
        }

    ).addTo(map);




    // ====================================
    // FUNCION OBTENER DIRECCION
    // ====================================

    async function obtenerDireccion(lat,lng){

        try{

            const respuesta =
            await fetch(

                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`

            );

            const data =
            await respuesta.json();

            if(data.address){

                const ciudad =

                data.address.city ||

                data.address.town ||

                data.address.village ||

                data.address.municipality ||

                '';

                const departamento =

                data.address.state ||

                '';

                document.getElementById(
                'ubicacion').value =

                ciudad +

                ', ' +

                departamento;

            }

        }catch(error){

            console.log(error);

        }

    }




    // ====================================
    // UBICACION ACTUAL
    // ====================================

    navigator.geolocation.getCurrentPosition(

        async(pos)=>{

            const lat =
            pos.coords.latitude;

            const lng =
            pos.coords.longitude;

            map.setView([lat,lng],15);

            marker.setLatLng([lat,lng]);

            document.getElementById(
            'latitud').value = lat;

            document.getElementById(
            'longitud').value = lng;

            obtenerDireccion(lat,lng);

        }

    );




    // ====================================
    // MOVER MARCADOR
    // ====================================

    marker.on('dragend',

    async()=>{

        const position =
        marker.getLatLng();

        document.getElementById(
        'latitud').value =
        position.lat;

        document.getElementById(
        'longitud').value =
        position.lng;

        obtenerDireccion(

            position.lat,
            position.lng

        );

    });

}