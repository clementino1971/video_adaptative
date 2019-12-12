import * as mongoose from 'mongoose'

export interface Event extends mongoose.Document{
  createdAt:Date,
  userId:string,
  sessionId:string,
  msgType:string,
  msg:string,
  log:Map<String,[number]>
}

const eventSchema = new mongoose.Schema({
  createdAt:{
    type: Date,
    default:Date.now
  },
  userId:{
    type:String,
    required:true
  },
  sessionId:{
    type:String,
    required:true
  },
  msgType:{
    type:String
  },
  msg:{
    type:String
  },
  context:{
    type:String,default:'Player/Viewer',
  },
  log:{
    type:Map,
    of:[Number]
  }
})

export const Event = mongoose.model<Event>('Event', eventSchema)
