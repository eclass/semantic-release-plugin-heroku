const { describe, it } = require('mocha')
const { expect } = require('chai')
const tempy = require('tempy')
const verify = require('../src/verify')

describe('Verify', () => {
  /** @type {import('../src/types').Context} */
  const ctx = {
    cwd: tempy.directory(),
    env: {},
    logger: { log: () => ({}), error: () => ({}) }
  }
  /** @type {import('../src/types').Config} */
  const config = { appName: 'myapp' }

  it('Return SemanticReleaseError if a custom environment variable is not defined', async () => {
    try {
      await verify(config, ctx)
    } catch (err) {
      expect(err.name).to.equal('SemanticReleaseError')
      expect(err.code).to.equal('CUSTOMERROR')
    }
  })

  it('Verify alias from a custom environmen variable', async () => {
    ctx.env = { CUSTOM_ENV: 'custom' }
    expect(await verify(config, ctx)).to.be.a('undefined')
  })
})
