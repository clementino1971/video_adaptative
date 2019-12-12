export interface iEvent{
  set(key:string,records:[number]):void
  get(key:string):[number]|undefined
  dump():Object
}

export class Event implements iEvent{
  private logs:Map<string,[number]>
  constructor(){
    this.logs = new Map()
//    this.logs = new Object()
  }
  set(key:string, records:[number]):void{
      this.logs.set(key,records)
  }
  get(key:string):[number]|undefined{
      return this.logs.get(key)
  }

  push(key:string, value:number):void{
    let isExist = key in this.logs
    if (isExist){
      const records:[number]|undefined = this.logs.get(key)
      if (records !== undefined)
          records.push(value)
    }else{
      this.logs.set(key,[value])
    }
  }
  dump():Object{
    return this.logs;
  }
}
