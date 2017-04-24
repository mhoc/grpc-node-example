const async = require('async')
const grpc = require('grpc')

const NotifierProto = grpc.load(__dirname + '/../protos/notifier.proto')

const client = new NotifierProto.Notifier('localhost:50051', grpc.credentials.createInsecure())

async.waterfall([
  (done) => {
    client.sendWelcomeEmail({ to_email: 'test1@example.com' }, (err, resp) => {
      if (err) return done(err)
      console.log(`sendWelcomeEmail1 resp: `, resp)
      const { send_id } = resp
      return done(null, send_id)
    })
  },
  (send_id_1, done) => {
    client.getStatus({ send_id: send_id_1 }, (err, resp) => {
      if (err) return done(err)
      console.log(`getStatus resp:`, resp)
      done(null, send_id_1)
    })
  },
  (send_id_1, done) => {
    client.sendWelcomeEmail({ to_email: 'test2@example.com' }, (err, resp) => {
      if (err) return done(err)
      console.log(`sendWelcomeEmail2 resp: `, resp)
      const { send_id } = resp
      return done(null, send_id_1, send_id)
    })
  },
  (send_id_1, send_id_2, done) => {
    const call = client.getStatuses({ send_ids: [ send_id_1, send_id_2 ] })
    call.on('data', (d) => {
      console.log(`getStatuses resp: `, d)
    })
    call.on('end', () => {
      done()
    })
  }
], (err) => {
  if (err) console.error('error', err)
})