import {
  Config as SemanticReleaseConfig,
  Context as SemanticReleaseContext,
  Result as SemanticReleaseResult
} from 'semantic-release'

export interface Context
  extends SemanticReleaseContext,
    SemanticReleaseConfig,
    SemanticReleaseResult {}

export interface Config {
  /**
   * Heroku app name.
   *
   * @example
   * "myapp"
   */
  appName: string
}

export interface SemanticReleaseError {
  message: string
  details: string
}

export interface HerokuSourceBlob {
  /** URL to download blob. */
  get_url: string
  /** URL to upload blob. */
  put_url: string
}

export interface HerokuSourceBlobResponse {
  source_blob?: HerokuSourceBlob
}

export interface HerokuBuildSourceBlob {
  /**
   * URL where gzipped tar archive of source code for build was downloaded.
   *
   * @example
   * "https://example.com/source.tgz?token=xyz"
   */
  url: string
  /**
   * An optional checksum of the gzipped tarball for verifying its integrity.
   *
   * @example
   * "SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
   */
  checksum?: string
  /**
   * Version of the gzipped tarball.
   *
   * @example
   * "v1.3.0"
   */
  version?: string
}

export interface HerokuBuildPack {
  /**
   * Buildpack Registry name of the buildpack for the app.
   *
   * @example
   * "heroku/ruby"
   */
  name: string
  /**
   * The URL of the buildpack for the app.
   *
   * @example
   * "https://github.com/heroku/heroku-buildpack-ruby"
   */
  url: string
}

export interface HerokuBuildRequest {
  source_blob: HerokuBuildSourceBlob
  /**
   * Buildpacks executed for this build, in order.
   *
   * @example
   *
   * [
   *   {
   *     "url": "https://github.com/heroku/heroku-buildpack-ruby",
   *     "name": "heroku/ruby"
   *   }
   * ]
   */
  buildpacks?: HerokuBuildPack[]
}

export interface HerokuBuildResponseApp {
  /**
   * @example
   * "01234567-89ab-cdef-0123-456789abcdef"
   */
  id: string
}

export interface HerokuBuildResponseRelease {
  /**
   * @example
   * "01234567-89ab-cdef-0123-456789abcdef"
   */
  id: string
}

export interface HerokuBuildResponseSlug {
  /**
   * @example
   * "01234567-89ab-cdef-0123-456789abcdef"
   */
  id: string | null
}

export interface HerokuBuildResponseUser {
  /**
   * @example
   * "01234567-89ab-cdef-0123-456789abcdef"
   */
  id: string
  /**
   * @example
   * "username@example.com"
   */
  email: string
}

export interface HerokuBuildResponse {
  app: HerokuBuildResponseApp
  /**
   * Buildpacks executed for this build, in order.
   *
   * @example
   *
   * [
   *   {
   *     "url": "https://github.com/heroku/heroku-buildpack-ruby",
   *     "name": "heroku/ruby"
   *   }
   * ]
   */
  buildpacks?: HerokuBuildPack[]
  /**
   * @example
   * "2012-01-01T12:00:00Z"
   */
  created_at: string
  /**
   * @example
   * "01234567-89ab-cdef-0123-456789abcdef"
   */
  id: string
  /**
   * @example
   * "https://build-output.heroku.com/streams/01234567-89ab-cdef-0123-456789abcdef"
   */
  output_stream_url: string
  source_blob: HerokuBuildSourceBlob
  release: HerokuBuildResponseRelease
  slug: HerokuBuildResponseSlug
  /**
   * @example
   * "heroku-16"
   */
  stack: string
  /**
   * @example
   * "succeeded"
   */
  status: string
  /**
   * @example
   * "2012-01-01T12:00:00Z"
   */
  updated_at: string
  user: HerokuBuildResponseUser
}
