import {ModelRouter} from '../common/model-router'
import * as restify from 'restify'
import {Event} from './events.model'
import {authorize} from '../security/authz.handler'

export class EventsRouter extends ModelRouter<Event>{
  constructor(){
      super(Event)
  }
  applyRoutes(application:restify.Server){
    application.get('/events',[authorize('admin','user'),this.findAll])
    application.get('/events/:id',[authorize('admin','user'),this.validateId,this.findById])
    application.post('/events',[authorize('admin','user'),this.save])
    application.put('/events/:id',[authorize('admin'),this.validateId, this.replace])
    application.patch('/events/:id',[authorize('admin'),this.validateId, this.update])
    application.del('/events/:id',[authorize('admin'),this.validateId, this.delete])
  }
}

export const eventsRouter:EventsRouter = new EventsRouter()
