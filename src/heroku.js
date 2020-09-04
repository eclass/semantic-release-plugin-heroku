const { URL } = require('url')
const http = require('https')
const path = require('path')
const crypto = require('crypto')
const os = require('os')
const execa = require('execa')
const fs = require('fs').promises

const HEROKU_HOSTNAME = 'api.heroku.com'
const HEROKU_DEFAULT_HEADERS = {
  'content-type': 'application/json',
  accept: 'application/vnd.heroku+json; version=3'
}

/**
 * @param {number} ms -
 * @returns {Promise<any>} -
 * @example
 * await sleep(5000)
 */
const sleep = ms =>
  new Promise(resolve => {
    setTimeout(() => resolve(), ms)
  })

/**
 * @typedef {import('./types').HerokuBuildRequest} HerokuBuildRequest
 * @typedef {import('./types').Context} Context
 * @typedef {import('./types').HerokuSourceBlob} HerokuSourceBlob
 */

/**
 * Get URL to upload source files.
 *
 * @param {string} app - Heroku app name.
 * @param {string} token - Heroku api key.
 * @returns {Promise<HerokuSourceBlob>} Url to upload source files.
 * @example
 * const url = await getSourceBlob('myapp', 'myapikey')
 */
const getSourceBlob = (app, token) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      hostname: HEROKU_HOSTNAME,
      path: `/apps/${app}/sources`,
      headers: {
        ...HEROKU_DEFAULT_HEADERS,
        'content-length': '0',
        authorization: `Bearer ${token}`
      }
    }

    const req = http.request(options, res => {
      /** @type {Array<Buffer>} */
      const chunks = []

      res.on('data', (/** @type {Buffer} */ chunk) => {
        chunks.push(chunk)
      })

      res.on('end', () => {
        try {
          const raw = Buffer.concat(chunks).toString()
          /** @type {import('./types').HerokuSourceBlobResponse} */
          const body = JSON.parse(raw || '{}')
          if (body.source_blob) {
            resolve(body.source_blob)
          } else {
            reject(new Error('NOT_FOUND'))
          }
        } catch (err) {
          reject(new Error('ERROR_RESPONSE'))
        }
      })

      req.on('error', err => reject(err))
    })

    req.end()
  })
}

/**
 * Upload source files.
 *
 * @param {string} url - Url to upload source files.
 * @param {Buffer} blob - File to upload.
 * @returns {Promise<string>} Url to upload source files.
 * @example
 * await uploadBlob('myapp', 'myapikey')
 */
const uploadBlob = (url, blob) => {
  return new Promise((resolve, reject) => {
    const uri = new URL(url)
    const options = {
      method: 'PUT',
      hostname: uri.hostname,
      path: `${uri.pathname}${uri.search}`,
      headers: {
        'content-type': ''
      }
    }

    const req = http.request(options, res => {
      /** @type {Array<Buffer>} */
      const chunks = []

      res.on('data', (/** @type {Buffer} */ chunk) => {
        chunks.push(chunk)
      })

      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString()
        /**
         * TODO: check response.
         */
        resolve(raw)
      })

      req.on('error', err => reject(err))
    })

    req.write(blob)
    req.end()
  })
}

/**
 * Create build app.
 *
 * @param {string} app - Heroku app name.
 * @param {string} token - Heroku api key.
 * @param {HerokuBuildRequest} data - Request data.
 * @returns {Promise<string>} Url to upload source files.
 * @example
 * await createBuild('myapp', 'myapikey', data)
 */
const createBuild = (app, token, data) => {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data)
    const options = {
      method: 'POST',
      hostname: HEROKU_HOSTNAME,
      path: `/apps/${app}/builds`,
      headers: {
        ...HEROKU_DEFAULT_HEADERS,
        'content-length': body.length,
        authorization: `Bearer ${token}`
      }
    }

    const req = http.request(options, res => {
      /** @type {Array<Buffer>} */
      const chunks = []

      res.on('data', (/** @type {Buffer} */ chunk) => {
        chunks.push(chunk)
      })

      res.on('end', () => {
        try {
          const raw = Buffer.concat(chunks).toString()
          /** @type {import('./types').HerokuBuildResponse} */
          const body = JSON.parse(raw || '{}')
          resolve(body.id)
        } catch (err) {
          reject(new Error('ERROR_RESPONSE'))
        }
      })

      req.on('error', err => reject(err))
    })

    req.write(body)
    req.end()
  })
}

/**
 * Get build status.
 *
 * @param {string} app - Heroku app name.
 * @param {string} token - Heroku api key.
 * @param {string} id - Build id.
 * @returns {Promise<string>} Url to upload source files.
 * @example
 * await getBuildStatus('myapp', 'myapikey', id)
 */
const getBuildStatus = (app, token, id) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      hostname: HEROKU_HOSTNAME,
      path: `/apps/${app}/builds/${id}`,
      headers: {
        ...HEROKU_DEFAULT_HEADERS,
        authorization: `Bearer ${token}`
      }
    }

    const req = http.request(options, res => {
      /** @type {Array<Buffer>} */
      const chunks = []

      res.on('data', (/** @type {Buffer} */ chunk) => {
        chunks.push(chunk)
      })

      res.on('end', () => {
        try {
          const raw = Buffer.concat(chunks).toString()
          /** @type {import('./types').HerokuBuildResponse} */
          const body = JSON.parse(raw || '{}')
          resolve(body.status)
        } catch (err) {
          reject(new Error('ERROR_RESPONSE'))
        }
      })

      req.on('error', err => reject(err))
    })

    req.end()
  })
}

/**
 * Check build status.
 *
 * @param {string} app - Heroku app name.
 * @param {string} token - Heroku api key.
 * @param {string} id - Build id.
 * @param {Context} ctx -
 * @returns {Promise<boolean>} Status of build.
 * @example
 * const success = await verifyBuild('myapp', 'myapikey', id)
 */
const verifyBuild = async (app, token, id, ctx) => {
  let status = 'pending'
  let success = false
  while (status === 'pending') {
    status = await getBuildStatus(app, token, id)
    switch (status) {
      case 'pending':
        ctx.logger.log('Heroku build still pending')
        await sleep(5000)
        break
      case 'success':
        success = true
        break
    }
  }
  return success
}

/**
 * Create a temporary tarball of source code.
 *
 * @param {Context} ctx -
 * @returns {Promise<string>} Tarball filename.
 * @example
 * const tarball = await createTarball(ctx)
 */
const createTarball = async ctx => {
  const { cwd, env, stdout, stderr } = ctx
  const exclude = ['--exclude=.git', '--exclude=node_modules']
  const tarball = path.join(
    os.tmpdir(),
    `archive.${crypto
      .randomBytes(6)
      .readUIntLE(0, 6)
      .toString(36)}.tgz`
  )
  const args = ['-zcf', tarball, ...exclude, '.']
  const packResult = execa('tar', args, { cwd, env })
  packResult.stdout.pipe(stdout, { end: false })
  packResult.stderr.pipe(stderr, { end: false })
  await packResult
  return tarball
}

/**
 * Create a temporary tarball of source code.
 *
 * @param {string} filename -
 * @returns {Promise<void>} Status of build.
 * @example
 * await deleteTarball('/tmp/archive.abcdef.tgz')
 */
const deleteTarball = async filename => {
  return await fs.unlink(filename)
}

/**
 * Get URL to upload source files.
 *
 * @param {string} app - Heroku app name.
 * @param {string} token - Heroku api key.
 * @returns {Promise<boolean>} -
 * @example
 * const success = await testCredentials('myapikey')
 */
const testCredentials = (app, token) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      hostname: HEROKU_HOSTNAME,
      path: `/apps/${app}`,
      headers: {
        ...HEROKU_DEFAULT_HEADERS,
        authorization: `Bearer ${token}`
      }
    }

    const req = http.request(options, res => {
      res.on('end', () => resolve(res.statusCode === 200))
      req.on('error', () => resolve(false))
    })

    req.end()
  })
}

module.exports = {
  getSourceBlob,
  uploadBlob,
  createBuild,
  getBuildStatus,
  verifyBuild,
  createTarball,
  deleteTarball,
  testCredentials
}
