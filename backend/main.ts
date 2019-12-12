import {Server} from "./server/server"
import {usersRouter} from './users/users.router'
import {eventsRouter} from './events/events.router'

const server = new Server()


server.bootstrap([usersRouter,eventsRouter]).then(server=>{
    console.log('Server is list on:',server.application.address())
}).catch(error=>{
  console.log('Server failed to start')
  console.error(error)
  process.exit(1)
})
