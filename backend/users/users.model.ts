import * as mongoose from 'mongoose'
import {validateCPF} from "../common/validators"
import * as bcrypt from 'bcrypt'
import {environment} from '../common/environment'

export interface User extends mongoose.Document{
  name:string,
  email:string,
  password:string,
  profiles:string[],
  matches(password:string):boolean
  hasAny(...profiles:string[]):boolean
}

export interface UserModel extends mongoose.Model<User>{
  findByEmail(email:string, projection?:string):Promise<User>
}

const userSchema = new mongoose.Schema({
  name:{
    type:String,
    required: true,
    minlength:3
  },
  email:{
    type:String,
    required:true,
    match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    unique:true
  },
  password:{
    type:String,
    required:true
  },
  profiles:{
    type:String,
    required:true
  }
  // cpf:{
  //   type:Number,
  //   required:true,
  //   unique:true,
  //   // validate:{
  //   //   validator:validateCPF,
  //   //   message:'Path `CPF` has invalid Value'
  //   // }
  // }
})

const hashPassword = (obj, next)=>{
  bcrypt.hash(obj.password,environment.security.saltRounds)
        .then(hash=>{
          obj.password=hash
          next()
        }).catch(next)
}

const updateMiddleware = function(next){
  if (!this.getUpdate().password){
    next()
  }else{
    hashPassword(this.getUpdate(), next)
  }
}

userSchema.statics.findByEmail = function(email:string,projection:string){
  return this.findOne({email}, projection)
}

userSchema.methods.matches = function(password:string){
  return bcrypt.compareSync(password,this.password)
}

userSchema.methods.hasAny = function(...profiles:string[]) : boolean{
  return profiles.some(profile=>this.profiles.indexOf(profile)!== -1)
}

const saveMiddleware = function(next){
  const user:User = this
  if (!user.isModified('password')){
    next()
  }else{
    hashPassword(user, next)
  }
}

userSchema.pre('save', saveMiddleware)
userSchema.pre('findOneAndUpdate', updateMiddleware)
userSchema.pre('update', updateMiddleware)

export const User = mongoose.model<User,UserModel>('User', userSchema)
