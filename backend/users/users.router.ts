import {ModelRouter} from '../common/model-router'
import * as restify from 'restify'
import {User} from './users.model'
import {authenticate} from '../security/auth.handler'
import {authorize} from '../security/authz.handler'

class UsersRouter extends ModelRouter<User>{
  constructor(){
      super(User)
      this.on('beforeRender', document=>{
        document.password=undefined
      })
  }

  findByEmail=(req,resp,next)=>{
    if(req.query.email){
      User.find({email:req.query.email})
          .then(this.renderAll(resp,next))
          .catch(next)
    }else{
      next()
    }
  }

  applyRoutes(application:restify.Server){
//    application.get({path:'/users',version:'2.0.0'},[this.findByEmail,this.findAll])
//    application.get({path:'/users',version:'1.0.0'},this.findAll)
    application.get('/users',restify.plugins.conditionalHandler([
                                        {version:'1.0.0',handler:[authorize('admin'),this.findAll]},
                                        {version:'2.0.0', handler:[authorize('admin'),this.findByEmail,this.findAll]}]
                                      ))

    application.get('/users/:id',[authorize('admin','user'),this.validateId,this.findById])
    application.post('/users',[authorize('admin'),this.save])
    application.put('/users/:id',[authorize('admin'),this.validateId, this.replace])
    application.patch('/users/:id',[authorize('admin'),this.validateId, this.update])
    application.del('/users/:id',[authorize('admin'),this.validateId,this.delete])

    application.post('/users/authenticate',authenticate)
  }
}

export const usersRouter:UsersRouter = new UsersRouter()
