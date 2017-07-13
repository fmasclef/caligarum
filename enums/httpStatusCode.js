/**
 * HTTP status codes
 */

var codes = {};

/**
 * 1xx status codes
 */
codes[exports.CONTINUE            = 100] = "Continue";
codes[exports.SWITCHING_PROTOCOLS = 101] = "Switching Protocols";
codes[exports.PROCESSING          = 102] = "Processing";

/**
 * 2xx status codes
 */
codes[exports.OK                = 200] = "OK";
codes[exports.CREATED           = 201] = "Created";
codes[exports.ACCEPTED          = 202] = "Accepted";
codes[exports.NON_AUTHORITATIVE = 203] = "Non-Authoritative Information";
codes[exports.NO_CONTENT        = 204] = "No Content";
codes[exports.RESET_CONTENT     = 205] = "Reset Content";
codes[exports.PARTIAL_CONTENT   = 206] = "Partial Content";
codes[exports.MULTI_STATUS      = 207] = "Multi-Status";
codes[exports.ALREADY_REPORTED  = 208] = "Already Reported";
codes[exports.IM_USED           = 226] = "IM Used";

/**
 * 3xx status codes
 */
codes[exports.MULTIPLE_CHOICES   = 300] = "Multiple Choices";
codes[exports.MOVED_PERMANENTLY  = 301] = "Moved Permanently";
codes[exports.MOVED_TEMPORARY    = 302] = "Found";
codes[exports.SEE_OTHER          = 303] = "See Other";
codes[exports.NOT_MODIFIED       = 304] = "Not Modified";
codes[exports.USE_PROXY          = 305] = "Use Proxy";
codes[exports.SWITCH_PROXY       = 306] = "Switch Proxy";
codes[exports.REDIRECT_TEMPORARY = 307] = "Temporary Redirect";
codes[exports.REDIRECT_PERMANENT = 308] = "Permanent Redirect";

/**
 * 4xx status codes
 */
codes[exports.BAD_REQUEST           = 400] = "Bad Request";
codes[exports.UNAUTHORIZED          = 401] = "Unauthorized";
codes[exports.PAYMENT_REQUIRED      = 402] = "Payment Required";
codes[exports.FORBIDDEN             = 403] = "Forbidden";
codes[exports.NOT_FOUND             = 404] = "Not Found";
codes[exports.METHOD_NOT_ALLOWED    = 405] = "Method Not Allowed";
codes[exports.NOT_ACCEPTABLE        = 406] = "Not Acceptable";
codes[exports.PROXY_AUTH            = 407] = "Proxy Authentication Required";
codes[exports.TIMEOUT               = 408] = "Request Timeout";
codes[exports.CONFLICT              = 409] = "Conflict";
codes[exports.GONE                  = 410] = "Gone";
codes[exports.LENGTH_REQUIRED       = 411] = "Length Required";
codes[exports.PRECONDITION_FAILED   = 412] = "Precondition Failed";
codes[exports.PAYLOAD_TOO_LARGE     = 413] = "Payload Too Large";
codes[exports.URI_TOO_LONG          = 414] = "URI Too Long";
codes[exports.UNSUPPORTED           = 415] = "Unsupported Media Type";
codes[exports.RANGE_ERROR           = 416] = "Range Not Satisfiable";
codes[exports.EXPECTATION_FAILED    = 417] = "Expectation Failed";
codes[exports.TEAPOT                = 418] = "I'm a teapot";
codes[exports.MISDIRECTED           = 421] = "Misdirected Request";
codes[exports.UNPROCESSABLE         = 422] = "Unprocessable Entity";
codes[exports.LOCKED                = 423] = "Locked";
codes[exports.FAILED_DEPENDENCY     = 424] = "Failed Dependency";
codes[exports.UPGRADE_REQUIRED      = 426] = "Upgrade Required";
codes[exports.PRECONDITION_REQUIRED = 428] = "Precondition Required";
codes[exports.TOO_MANY_REQUESTS     = 429] = "Too Many Requests";
codes[exports.HEADER_TOO_LARGE      = 431] = "Request Header Fields Too Large";
codes[exports.FAHRENHEIT            = 451] = "Unavailable For Legal Reasons";

/**
 * 5xx status codes
 */
codes[exports.INTERNAL_SERVER_ERROR = 500] = "Internal Server Error";
codes[exports.NOT_IMPLEMENTED       = 501] = "Not Implemented";
codes[exports.BAD_GATEWAY           = 502] = "Bad Gateway";
codes[exports.UNAVAILABLE           = 503] = "Service Unavailable";
codes[exports.GATEWAY_TIMEOUT       = 504] = "Gateway Tiemout";
codes[exports.NOT_SUPPORTED         = 505] = "HTTP Version Not Supported";
codes[exports.VARIANT_NEGOTIATES    = 506] = "Variant Also Negotiates";
codes[exports.NO_SPACE_LEFT         = 507] = "Insufficient Storage";
codes[exports.LOOP                  = 508] = "Loop Detected";
codes[exports.NOT_EXTENDED          = 510] = "Not Extended";
codes[exports.NET_AUTH_REQUIRED     = 511] = "Network Authentication Required";

/**
 * Get relevant text message as per RFCs
 */
exports.text = function(code) {
 if (codes.hasOwnProperty(code)) {
   return codes[code];
 } else {
   throw new Error("Non existent HTTP status code: " + code);
 }
};
