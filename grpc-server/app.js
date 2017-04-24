const grpc = require('grpc')
const _ = require('lodash')
const shortid = require('shortid')

const NotifierProto = grpc.load(__dirname + '/../protos/notifier.proto')

const database = {}

setInterval(() => {
  console.log(database)
}, 3000)

const GetStatus = (ctx, done) => {
  done(null, database[ctx.request.send_id])
}

const GetStatuses = (ctx, done) => {
  const { send_ids = [] } = ctx.request 
  _(database)
    .filter((iV, iK) => _.includes(send_ids, iK))
    .forEach(status => ctx.write(status))
  ctx.end()
}

const SendWelcomeEmail = (ctx, done) => {
  const send_id = shortid.generate()
  database[send_id] = {
    send_id,
    template: NotifierProto.EmailTemplate.WELCOME,
    recipient: ctx.request.to_email,
    status: NotifierProto.SendingStatus.DELIVERED,
  }
  done(null, { send_id })
}

const server = new grpc.Server()
server.addProtoService(NotifierProto.Notifier.service, { 
  GetStatus,
  GetStatuses,
  SendWelcomeEmail,
})
server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure())
server.start()
