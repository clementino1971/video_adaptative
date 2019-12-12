export const environment = {
  server:{port: process.env.SERVER_PORT || 3000},
  db:{url:process.env.DB_URL||'mongodb://logger:RmIFvQG2G5BPR6TM@logging-shard-00-00-psbis.gcp.mongodb.net:27017/logs-universe?ssl=true&authSource=admin&replicaSet=logging-shard-0'},
  //db:{url:process.env.DB_URL||'mongodb://logging-shard-00-00-psbis.gcp.mongodb.net/logs-universe'},
  //db:{url:process.env.DB_URL||'mongodb://localhost/logs-universe'},
  security:{
    saltRounds:process.env.SALT_ROUNS || 10,
    apiSecret:process.env.API_SECRET || 'logger-api-secret'
  }  
}
