import * as Log from './src/logger'
import * as Event from './src/event'
import {CredentialManager} from './src/credential'

var logger
var econtrols
var emedia
var email='icc453@icomp'
var password = 'batman'

function wrapup(){
  logger.info("Viewer:player-controls", econtrols.dump() )
  logger.info("Media:tracking", emedia.dump() )
}

function initApp(){
  CredentialManager.login(email,password).then(credential =>{
    var sessionID = credential.token
    logger = new Log.Logger(email,sessionID)
    econtrols = new Event.Event()
    emedia = new Event.Event()

    try{
      econtrols.push('pause',2.0)
      econtrols.push('pause',30.0)

      econtrols.push('play',0.0)
      econtrols.push('play',3.0)
      econtrols.push('play',30.0)

      wrapup()

    }catch(err){
      console.error(err)
    }
  }).catch(error=>{
    console.log('Failed to log in')
    throw error
  })
}

initApp()
