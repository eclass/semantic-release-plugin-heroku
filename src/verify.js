const AggregateError = require('aggregate-error')
const getError = require('./get-error')
const { testCredentials } = require('./heroku')

/**
 * @typedef {import('./types').Context} Context
 * @typedef {import('./types').Config} Config
 * @typedef {import('./types').SemanticReleaseError} SemanticReleaseError
 */
/**
 * @param {Config} pluginConfig -
 * @param {Context} ctx -
 * @returns {Promise<void>} -
 * @example
 * verifyConditions(pluginConfig, ctx)
 */
module.exports = async (pluginConfig, ctx) => {
  /** @type {Error[]} */
  const errors = []
  if (!pluginConfig.appName) {
    errors.push(getError('ENOHEROKUAPPNAME', ctx))
  }
  if (!ctx.env.HEROKU_API_KEY) {
    errors.push(getError('ENOHEROKUAPIKEY', ctx))
  }
  ctx.logger.log('Validate api key and app name with heroku api platform')
  const isValid = await testCredentials(
    pluginConfig.appName,
    ctx.env.HEROKU_API_KEY
  )
  if (!isValid) errors.push(getError('EINVALIDCREDENTIALS', ctx))
  if (errors.length > 0) {
    throw new AggregateError(errors)
  }
}
