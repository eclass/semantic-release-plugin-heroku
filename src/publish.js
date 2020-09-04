const fs = require('fs').promises
const {
  createTarball,
  getSourceBlob,
  uploadBlob,
  createBuild,
  verifyBuild
} = require('./heroku')
const getError = require('./get-error')
/**
 * @typedef {import('./types').Context} Context
 * @typedef {import('./types').Config} Config
 * @typedef {import('./types').HerokuBuildRequest} HerokuBuildRequest
 */
/**
 * @param {Config} pluginConfig -
 * @param {Context} ctx -
 * @returns {Promise<void>} -
 * @example
 * publish(pluginConfig, ctx)
 */
module.exports = async (pluginConfig, ctx) => {
  ctx.logger.log('Create temporary tarball of source code')
  const tarball = await createTarball(ctx)
  ctx.logger.log('Create a source of heroku app')
  const sourceBlob = await getSourceBlob(
    pluginConfig.appName,
    ctx.env.HEROKU_API_KEY
  )
  ctx.logger.log('Upload tarball to source blob')
  const buffer = await fs.readFile(tarball)
  await uploadBlob(sourceBlob.put_url, buffer)
  ctx.logger.log('Create a build')
  /** @type {HerokuBuildRequest} */
  const data = {
    source_blob: { url: sourceBlob.get_url, version: ctx.nextRelease.version }
  }
  const buildId = await createBuild(
    pluginConfig.appName,
    ctx.env.HEROKU_API_KEY,
    data
  )
  ctx.logger.log('Check build status')
  const success = await verifyBuild(
    pluginConfig.appName,
    ctx.env.HEROKU_API_KEY,
    buildId,
    ctx
  )
  if (success) {
    ctx.logger.log('Success build')
  } else {
    throw getError('EHEROKUDEPLOY', ctx)
  }
}
