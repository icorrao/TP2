import express from 'express'
import nodemailer from 'nodemailer'
const router=express.Router()

// Get del footer
router.get("/politicas",(req,res)=>{
   res.render('pages/footer/politicas.ejs')


})
//Get del formulario
router.get('/enviar-correo',(req,res)=>{
  res.render('pages/correo/correo.ejs')
})


//Post formulario
router.post('/enviar-correo', async(req, res) => {
    const formData = req.body; 
    console.log(formData.email)
  
    // Transporte de Nodemailer, envía el correo electrónico
  
    const transporter = nodemailer.createTransport({
      
      // Configuración del servidor SMTP
      host:'smtp.gmail.com',  
      port : 587,
      user: '',
      pass:''
  });
  // Opciones del correo electrónico
    const mailOptions = {
        from:`Correo ${formData.email}`,
        to:'diegocolman14@gmail.com',
        subjet:`nuevo mensaje de contacto ${formData.nombre}`,
        text:`
        Nombre ${formData.nombre}
        
        Mensaje ${formData.mensaje}`
     };
  
  
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.send('Error al enviar el correo electrónico');
      } else {
        console.log('Correo electrónico enviado: ' + info.response);
        res.send('Correo electrónico enviado correctamente');
        
      }
      
    });
  });

  let carrito = [];

// Ruta para mostrar la página principal
router.get('/', (req, res) => {
  const libros = [
    { id: 1, nombre: 'Libro 1', precio: 10, imagen: 'libro1.jpg' },
    { id: 2, nombre: 'Libro 2', precio: 15, imagen: 'libro2.jpg' },
    { id: 3, nombre: 'Libro 3', precio: 20, imagen: 'libro3.jpg' },
    { id: 1, nombre: 'Libro 1', precio: 10, imagen: 'libro1.jpg' },
    { id: 2, nombre: 'Libro 2', precio: 15, imagen: 'libro2.jpg' },
    { id: 3, nombre: 'Libro 3', precio: 20, imagen: 'libro3.jpg' },
    { id: 1, nombre: 'Libro 1', precio: 10, imagen: 'libro1.jpg' },
    { id: 2, nombre: 'Libro 2', precio: 15, imagen: 'libro2.jpg' },
    { id: 3, nombre: 'Libro 3', precio: 20, imagen: 'libro3.jpg' },
  ];

  res.render('pages/index', { libros, carrito });
});

// Ruta para agregar un libro al carrito
router.post('/agregar-al-carrito', (req, res) => {
  const libroId = parseInt(req.body.libroId);
  console.log(libroId)
  const libro = {
    id: libroId,
    nombre: req.body.nombre,
    precio: parseInt(req.body.precio),
    imagen: req.body.imagen,
  };

  carrito.push(libro);
  res.redirect('/');
});

// Ruta para mostrar el carrito de compras
router.get('/carrito', (req, res) => {
  const total = carrito.reduce((sum, libro) => sum + libro.precio, 0);
  res.render('pages/partials/carrito', { carrito, total });
});

router.post('/carrito/eliminar', (req, res) => {
  const productoId =Number(req.body.id) 
  console.log(productoId)

  const indice = carrito.findIndex((producto) => producto.id === productoId);
  console.log(carrito)
console.log(indice)
  if (indice !== -1) {
    carrito.splice(indice, 1);
    console.log('Se eliminó el producto del carrito');
  } else {
    console.log('No se encontró el producto en el carrito');
  }

  // total del carrito
  let total = 0;
  carrito.forEach((producto) => {
    total += producto.precio;
  });

  res.render('pages/partials/carrito', { carrito, total });
});








  export default router