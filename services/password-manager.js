/**
 * Password Manager
 *
 * Hash library to create a password.
 */

var
  libuuid = require('uuid'),
  generator = require('generate-password'),
  bcrypt = require('bcrypt');

module.exports = {

  /**
   * function uuid()
   * returns a UUID v4 based on RFC4122
   */
  uuid: function() {
    return libuuid.v4();
  },

  /**
   * function random(options)
   *   @options()
   * returns a random string using generate-password options
   */
  generate: function(options) {
    // base options
    var genoptions = {
      length: 10,
      numbers: true,
      symbols: true,
      uppercase: true,
      excludeSimilarCharacters: true
    };
    // Override options with provided ones
    for (var attrname in options) { genoptions[attrname] = options[attrname]; }
    return generator.generate(genoptions);
  },

  /**
   * function hash(password)
   *   @password: the plain text password
   * returns a bcrypted string
   */
  hash: function(password) {
    // bcrypt password with 10 salt round
    return bcrypt.hashSync(password, 10);
  },

  /**
   * function check(password, hash)
   *   @password: the plain text password
   *   @hash: a supposed hash matching the password
   * returns true in case of success
   */
  check: function(password, hash) {
    return bcrypt.compareSync(password, hash);
  }

}
