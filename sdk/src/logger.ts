import {environment} from "../common/environment"
import fetch from 'node-fetch'


export interface iLogger{
  debug(primaryMessage:string, ...supportingData:any[]):void;
  warn(primaryMessage:string, ...supportingData:any[]):void;
  error(primaryMessage:string, ...supportingData:any[]):void;
  info(primaryMessage:string, ...supportingData:any[]):void;

}

export class Logger implements iLogger{
  private sessionId:string
  private userId:string
  constructor(userId:string, sessionId:string){
    this.userId = userId
    this.sessionId=sessionId
  }
  debug(primaryMessage:string, ...supportingData:any[]){
    this.emitLogMessage("debug",primaryMessage,supportingData)
  }
  warn(primaryMessage:string, ...supportingData:any[]){
    this.emitLogMessage("warn",primaryMessage,supportingData)

  }
  error(primaryMessage:string, ...supportingData:any[]){
    this.emitLogMessage("error",primaryMessage,supportingData)

  }
  info(primaryMessage:string, ...supportingData:any[]){
    this.emitLogMessage("info",primaryMessage,supportingData)

  }
  private emitLogMessage(msgType:"debug"|"info"|"error"|"warn", msg:string, supportingDetails:any[]){

    const mapa = supportingDetails[0];
    const iterador = mapa.entries();
    let obj:{[index: string]: any} = {};
    let aux = iterador.next().value;
    while(aux !== undefined){
      obj[aux[0]] = aux[1];
      aux = iterador.next().value;
    }
    var body = {'msgType':msgType,
                'msg':msg,
                'userId':this.userId,
                'sessionId':this.sessionId,
                'log':obj
    }

    console.warn('Sending...', body);

    console.log(JSON.stringify(body))
    fetch(environment.log.url+'/events', {
      headers: { "Content-Type": "application/json; charset=utf-8",
                 "Authorization": "Bearer "+ this.sessionId
               },
      method: 'POST',
      body: JSON.stringify(body)
    }).then(response=>response.json())
      .then(json=>console.log(json))
      .catch(error=>{
      })
  }
}
