/**
 * Helpers
 *
 * Various helpers.
 */

const
  fs = require('fs'),
  Buffer = require('buffer').Buffer

module.exports = {

  /**
   * Encode a file to a base64 string. This can be used to embed an image into a
   * MIME message.
   */
  file2base64: (file) => {
    winston.debug('file2base64: %s', file)
    let bitmap = fs.readFileSync(file)
    return new Buffer(bitmap).toString('base64')
  }

}
