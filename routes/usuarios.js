import crypto from'crypto'
import passport from 'passport'
import async from 'async'
import nodemailers from 'nodemailer'
import express from 'express'
const router=express.Router()


//pedir el uso del modelo

import usuarios from '../models/usuariosmodels.js'
import admin from '../models/adminmodels.js'


// Checks if user is authenticated
function isAuthenticatedUser(req, res, next) {
  if(req.isAuthenticated()) {
      return next();
  }
  req.flash('error_msg', 'Por favor inicie sesión.')
  res.redirect('/login');
}


//Get login
router.get('/login',(req,res)=>{
 
  res.render('pages/usuarios/login');
 
})
//login administrador
router.get('/loginAdmin',(req,res)=>{
 
  res.render('pages/administrador/loginAdmin');
 
})
  //Get cerrar sesion
  router.get("/logout", isAuthenticatedUser, (req, res) => {
    req.logout(() => {}); 
    req.flash('success_msg', 'Ha cerrado sesión exitosamente.');
    res.redirect("/");
  });
  
  //Get para inscribirse usuarios
 router.get("/registrarse", (req, res) => {
  
res.render('pages/usuarios/registrarse')

 })
 router.get("/registrarseAdmin", (req, res) => {
  res.render('pages/administrador/registrarseAdmin')
  
   })
  //Get olvide la contraseña
  router.get("/olvide", (req, res) => {
    res.render('pages/usuarios/olvideContraseña')
  });
  //Get reset token
  router.get('/reset/:token', (req, res)=> {
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires : {$gt : Date.now() } })
        .then(user => {
            if(!user) {
                req.flash('error_msg', 'token no valido.');
                res.redirect('/olvide');
            }

            res.render('./users/newpassword', {token : req.params.token});
        })
        .catch(err => {
            req.flash('error_msg', 'ERROR: '+err);
            res.redirect('/olvide');
        });
});


  //Get mostrar todos los usuarios
  router.get("/todosUsuarios", (req, res) => {
    usuarios.find({})
    .then(usuarios=>{
       res.render('pages/administrador/todosUsuarios',{usuarios:usuarios})
       })
       .catch(error =>{
       res.flash('error_msg','ERROR:',+error)
        res.render('pages/usuarios/todosUsuarios')

       })
       
   
  });

 //Get editar usuarios

  router.get('/editar/:id',(req,res)=>{
let usuarioId= {_id:req.params.id}
usuarios.findOne(usuarioId)
.then(usuarios=>{

  res.render('pages/administrador/editarUsuarios',{usuarios:usuarios})
})
.catch(error=>{
  req.flash('error_msg', 'ERROR: '+err);
res.redirect('/todosUsuarios')

})
})
//Get buscar los producctos
  router.get("/productos/buscar", (req, res) => {//ver
    res.render('pages/administrador/buscar')
  }); 


// Post para autenticar al usuario
router.post('/login', passport.authenticate('user', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: 'Email o contraseña incorrecta, intente nuevamente'
}));
// Post para autenticar a los administradores
router.post('/login/admin', passport.authenticate('admin', {
  successRedirect: '/todosUsuarios',
  failureRedirect: '/login',
  failureFlash: 'Email o contraseña incorrecta, intente nuevamente'
}));
//Get registrar usuario
router.post("/registrarse",(req, res) => {
  let { nombre, email, password } = req.body;
  const nuevoUsuario = {
    nombre: nombre,
    email: email,
     
  }

  usuarios.register(nuevoUsuario, password, (err, usuario)=> {
    if(err) {
        req.flash('error_msg', 'ERROR: '+err);
        res.redirect('/registrarse');
    }
    req.flash('success_msg', 'registracion exitosa' );
    res.redirect('/login');
  });
  

//Get registrar usuario
});
router.post("/registrarseAdmin",(req, res) => {
  let { nombre, email, password } = req.body;
  const nuevoUsuario = {
    nombre: nombre,
    email: email,
  }
  admin.register(nuevoUsuario, password, (err, user)=> {
    if(err) {
        req.flash('error_msg', 'ERROR: '+err);
        res.redirect('/registrarseAdmin');
    }
    req.flash('success_msg', 'registracion exitosa');
    res.redirect('/loginAdmin');
  });
});
//ruta olvide contraseña
router.post('/olvide', (req, res, next) => {
    async.waterfall([
      (done) => {
        crypto.randomBytes(20, (err, buf) => {
          let token = buf.toString('hex');
          done(err, token);
        });
      },
      (token, done) => {
        usuarios.findOne({ email: req.body.email })
          .then(user => {
            if (!user) {
              req.flash('error_msg', 'El usuario no existe con este correo electronico.');
              return res.redirect('/olvide');
            }
  
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 1800000; // 1/2 hours
  
            user.save()
              .then(savedUser => {
                done(null, token, user);
              })
              .catch(error => {
                req.flash('error_msg', 'ERROR: ' + error);
                res.redirect('/olvide');
              });
          })
          .catch(err => {
            req.flash('error_msg', 'ERROR: ' + err);
            res.redirect('/olvide');
          });
      },
      (token, user) => {
        let smtpTransport = nodemailers.createTransport({
          service: 'Gmail',
          auth: {
            user: 'diegocolman14@gmail.com',
            pass: 'ihibzaeectzefovs'
          }
        });
  
        let mailOptions = {
          to: user.email,
          from: 'Ghulam Abbas myapkforest@gmail.com',
          subject: 'Recovery Email from Auth Project',
          text: 'Please click the following link to recover your password: \n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email.'
        };
  
        smtpTransport.sendMail(mailOptions, err => {
          if (err) {
            req.flash('error_msg', 'ERROR: No se pudo mandar el correo electronico.');
          } else {
            req.flash('success_msg', 'Correo eviado con intruccione. Por favor compruebe esto.');
          }
          res.redirect('/olvide');
        });
      }
    ], err => {
      if (err) res.redirect('/olvide');
    });
  });
router.post('/reset/:token', (req, res)=>{
  async.waterfall([
      (done) => {
          User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires : {$gt : Date.now() } })
              .then(user => {
                  if(!user) {
                      req.flash('error_msg', 'Password reset token in invalid or has been expired.');
                      res.redirect('/forgot');
                  }

                  if(req.body.password !== req.body.confirmpassword) {
                      req.flash('error_msg', "Password don't match.");
                      return res.redirect('/forgot');
                  }

                  user.setPassword(req.body.password, err => {
                      user.resetPasswordToken = undefined;
                      user.resetPasswordExpires = undefined;

                      user.save(err => {
                          req.logIn(user, err => {
                              done(err, user);
                          })
                      });
                  });
              })
              .catch(err => {
                  req.flash('error_msg', 'ERROR: '+err);
                  res.redirect('/forgot');
              });
      },
      (user) => {
          let smtpTransport = nodemailer.createTransport({
              service : 'Gmail',
              auth:{
                  user : process.env.GMAIL_EMAIL,
                  pass : process.env.GMAIL_PASSWORD
              }
          });

          let mailOptions = {
              to : user.email,
              from : 'Ghulam Abbas myapkforest@gmail.com',
              subject : 'Your password is changed',
              text: 'Hello, '+user.name+'\n\n'+
                    'This is the confirmation that the password for your account '+ user.email+' has been changed.'
          };

          smtpTransport.sendMail(mailOptions, err=>{
              req.flash('success_msg', 'Su contraseña cambio con exito.');
              res.redirect('/login');
          });
      }

  ], err => {
      res.redirect('/login');
  });
});


//PUT editar
router.put('/editar/:id', (req, res)=> {
  let searchQuery = {_id : req.params.id};

  usuarios.updateOne(searchQuery, {$set : {
      nombre : req.body.nombre,
      email : req.body.email
  }})
  .then(user => {
      req.flash('success_msg', 'Usuario modificado exitosamente.');
      res.redirect('/todosUsuarios');
  })
  .catch(err => {
      req.flash('error_msg', 'ERROR: '+err);
      res.redirect('/editarUsuarios');
  })
});

//DELETE eliminar
router.delete('/eliminar/usuario/:id', (req, res)=>{
  let searchQuery = {_id : req.params.id};

  usuarios.deleteOne(searchQuery)
  
      .then(user=> {
          req.flash('success_msg', 'Usuario eliminado exitosamente.');
          res.redirect('/todosUsuarios');
      })
      .catch(err => {
          req.flash('error_msg', 'ERROR: '+err);
          res.redirect('/todosUsuarios');
      })
});


export default router


