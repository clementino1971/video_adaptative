import * as restify from "restify"
import {environment} from "../common/environment"
import {Router} from "../common/router"
import * as mongoose from "mongoose"
import {mergePatchBodyParser} from "./merge-patch.parser"
import {handleError} from "./error.handler"
import {tokenParser} from "../security/token.parser"
import * as fs from 'fs'
import * as corsMiddleware from "restify-cors-middleware"

export class Server{
  application: restify.Server
  connection: mongoose.Connection

  initializeDB() {
  //  (<any>mongoose).Promise = global.Promise
    let opt = {
//          useMongoClient:true,
          useUnifiedTopology:true,
          useNewUrlParser:true,
          ssl:true
        }
    return mongoose.connect(environment.db.url,opt)
  }
  initRouters(routers:Router[]):Promise<any>{
    return new Promise((resolve,reject)=>{
      try{
        const cors = corsMiddleware({
              origins: ["*"],
              allowHeaders: ["Authorization"],
              exposeHeaders: ["Authorization"]
        });
        this.application=restify.createServer({
          name:'log-api',
          version:'1.0.0'//,
          //certificate: fs.readFileSync('./security/keys/cert.pem'),
          //key:fs.readFileSync('./security/keys/key.pem')
        })
        this.application.pre(cors.preflight)

        this.application.use(cors.actual)
        this.application.use(restify.plugins.queryParser())
        this.application.use(restify.plugins.bodyParser())
        this.application.use(mergePatchBodyParser)
        this.application.use(tokenParser)

        for (let router of routers){
            router.applyRoutes(this.application)
        }

        this.application.listen(environment.server.port,()=>{
          resolve(this.application)
        })

        this.application.on('restifyError',handleError)

        console.log(environment.db.url)

      }catch(error){
        reject(error)
      }
    })
}

  bootstrap(routers: Router[]=[]): Promise<Server>{

    return  this.initializeDB().then(()=>
            this.initRouters(routers).then(()=>this)
  )}

}
