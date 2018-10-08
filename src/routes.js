const fs = require('fs')
const path = require('path')
const {sequelize} = require('./models')
const mp3Duration = require('mp3-duration')

module.exports = (app) => {

  app.get('/categorias', async (req, res) => {
    var categorias = (await sequelize.query('select * from temas'))[0]
    res.send(JSON.stringify(categorias))
  })

  app.get('/categorias/:sub_categoria', async (req, res) => {
    var categorias = (await sequelize.query(`select * from sub_temas where tema_id = '${req.params.sub_categoria}'`))[0]
    res.send(JSON.stringify(categorias))
  })

  app.get('/himno/:id', async (req, res) => {
    var himno = (await sequelize.query(`select * from parrafos where himno_id = ${req.params.id}`))[0]
    res.send(JSON.stringify(himno))
  })

  app.get('/himno/:id/:voz', (req, res) => {
    const archivo = path.resolve(__dirname, `./himnos/${req.params.id}/${req.params.voz}.mp3`)
    const audio = fs.createReadStream(archivo)
    var stat = fs.statSync(archivo);
    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Content-Length': stat.size
    })
    audio.pipe(res)
  })

  app.get('/disponibles', async (req, res) => {
    res.send(fs.readdirSync(path.resolve(__dirname, './himnos')))
  })

  // app.get('/himno/:id/:voz', (req, res) => {
  //   const archivo = path.resolve(__dirname, `./himnos/${req.params.id}/${req.params.voz}.mp3`)
  //   const audio = fs.createReadStream(archivo)
  //   audio.pipe(res)
  // })
  
  app.get('/himno/:id/:voz/duracion', (req, res) => {
    mp3Duration(path.resolve(__dirname, `./himnos/${req.params.id}/${req.params.voz}.mp3`), function (err, duration) {
      if (err) return console.log(err.message)
      res.send(duration.toString())
    })
  })

  app.get('/himno/:id/:voz/disponible', (req, res) => {
    const archivo = path.resolve(__dirname, `./himnos/${req.params.id}/${req.params.voz}.mp3`)
    if(fs.existsSync(archivo)) 
      res.send('si')  
    else
      res.send('no')
  })

  app.get('/himnos/todos', async (req, res) => {
    var himnos = (await sequelize.query('select himnos.id, himnos.titulo from himnos order by himnos.id ASC'))[0]
    res.send(JSON.stringify(himnos))
  })

  app.get('/himnos/todos/:query', async (req, res) => {
    var himnos = (await sequelize.query(`select himnos.id, himnos.titulo from himnos where himnos.id || ' ' || himnos.titulo like '%${req.params.query}%'`))[0]
    res.send(JSON.stringify(himnos))
  })

  app.get('/categorias/:id/himnos', async (req, res) => {
    var himnos = (await sequelize.query(`select himnos.id, himnos.titulo from himnos join tema_himnos on himnos.id = tema_himnos.himno_id where tema_himnos.tema_id = '${req.params.id}'`))[0]
    res.send(JSON.stringify(himnos))
  })

  app.get('/categorias/:id/himnos/:query', async (req, res) => {
    var himnos = (await sequelize.query(`select himnos.id, himnos.titulo from himnos join tema_himnos on himnos.id = tema_himnos.himno_id where tema_himnos.tema_id = '${req.params.id}' and himnos.id || ' ' || himnos.titulo like '%${req.params.query}%'`))[0]
    res.send(JSON.stringify(himnos))
  })

  app.get('/sub_categorias/:id/himnos', async (req, res) => {
    var himnos = (await sequelize.query(`select himnos.id, himnos.titulo from himnos join sub_tema_himnos on sub_tema_himnos.himno_id = himnos.id where sub_tema_himnos.sub_tema_id = '${req.params.id}'`))[0]
    res.send(JSON.stringify(himnos))
  })

  app.get('/sub_categorias/:id/himnos/:query', async (req, res) => {
    var himnos = (await sequelize.query(`select himnos.id, himnos.titulo from himnos join sub_tema_himnos on sub_tema_himnos.himno_id = himnos.id where sub_tema_himnos.sub_tema_id = '${req.params.id}' and himnos.id || ' ' || himnos.titulo like '%${req.params.query}%'`))[0]
    res.send(JSON.stringify(himnos))
  })

  app.post('/updates', async (req, res) => {
    var recent = (await sequelize.query(`select * from parrafos where updatedAt > '${req.body.latest}' order by updatedAt desc`))[0]
    res.send(JSON.stringify(recent))
  })

  app.post('/fix', async (req, res) => {
    await sequelize.query(`update parrafos set parrafo = '${req.body.fix}', updatedAt = CURRENT_TIMESTAMP where parrafo = '${req.body.parrafo}'`)
    res.send(true)
  })

}

// const mediaserver = require('mediaserver')

// module.exports = (app) => {
//   app.get('/', (req, res) => {
//     mediaserver.pipe(req, res, path.join(__dirname, './himnos/71/Soprano.mp3'))
//   })
// }