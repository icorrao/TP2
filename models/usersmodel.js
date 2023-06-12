import mongoose from 'mongoose'

let userSchema = new mongoose.Schema ({
    nombre:String,
    email:String,
    password:{
        type:String,
        select:false
    },
    resetPasswordToken:String,

})

module.exports = mongoose.model('User', userSchema)