# API doc

This document asserts `<api>` is equivalent to `http://localhost:8008`.

## Response code

| code | explanation |
|---|---|
| 200 | OK |
| 204 | OK, no output |
| 400 | Missing parameter, help will be provided |
| 401 | Authentication header is missing or malformed |
| 403 | Authentication issue, no more explanation will be provided, check logs |
| 422 | Unprocessable API call, something is broken at database side |
| 500 | That should **never** happen |

## Authentication

caligarum supports both HTTP basic and JSON Web Token authentication scheme. Basic authentication is required for API transactions as well as getting a JSON Web Token as a user.

*Basic authentication for API usage:*

Use your API key with user `api`. Your authentication token should be base64 encoded (part of the HTTP Basic Auth method, *see RFC if needed*).

    curl -u api:api_key http://your_server:port/endpoint

*Basic authentication when requesting a JWT:*

As a user, authenticate with your email address and password thru HTTP Basic authentication. This authentication scheme might be used to retrieve a JWT only. All others user-level actions require a JWT as an authentication bearer.

*JWT authentication:*

Use a JSON Web Token as an authentication bearer. This can be achieve by sending a custom `Authorization` header in your request.

    curl -H "Authorization: Bearer <JWT>" http://your_server:port/endpoint

## i18n

Some calls support internationalization. These are the one which interracts with end-users in a human readable way; i.e.: using emails. The right language will be selected by analyzing the `accept-language` HTTP header. To enable i18n, just pass this header.

	curl <api>/<endpoint> \
	  -H 'accept-language: <any_supported_language>'

The i18n engine defaults to `en`.

##<a name="calls"></a> API calls

This is the fastpath ti API call. Use the following table as a quick reference. All parameters should be sent as raw JSON unless stated otherwise. URL parameters are prefixed with the column symbol. They **do NOT** have to be sent in body.

|   | i18n | verb | endpoint | auth | parameters | desc |
|:-:|:-:|---|---|---|---|---|
| [&#8681;](#call_generic_hello) | | GET | / | none | none | hello caligarum :) |
| [&#8681;](#call_generic_doc) | | OPTIONS | / | none | none | `api.md` |
| [&#8681;](#call_auth_token) | | GET | /auth/token | basic | none | gets a JSON Web Token |
| [&#8681;](#call_auth_token_refresh) | | PUT | /auth/token | JWT | none | refreshes a JSON Web Token |
| [&#8681;](#call_user_create) | &#1044; | POST | /user | none | firstname, lastname, email | creates a user |
| [&#8681;](#call_user_get) | | GET | /user/:*hash* | JWT | :*hash* | retrieve user info |
| [&#8681;](#call_user_recover_1) | &#1044; | POST | /user/recovery | none | email | send an email with a password recovery link |
| [&#8681;](#call_user_recover_2) | &#1044; | GET | /user/recovery/:*hash*/:*recovery* | none | :*hash*, :*recovery* | generates a new password |


## details of API calls

### generic calls

The following API calls are platform specific.

####<a name="call_generic_hello"></a>**hello**

This call is a standard `ping` intended for checking this API availability.

*query*

    curl -X GET <api>/
    
*response*

    {
      "banner": "",
      "doc": "curl -X OPTIONS <api>"
    }

[&#8682;](#calls)

####<a name="call_generic_doc"></a>**API doc**

This call returns this file.

*query*

    curl -X OPTIONS <api>/
    
*response*

    this file

[&#8682;](#calls)

### authentication

####<a name="call_auth_token"></a>**get a JSON Web Token**

As a user, get a JWT so you can authenticate on other calls.

*query*

    curl -u '<email>:<password>' -X GET <api>/auth/token
    
or

    curl -X GET <api>/auth/token \
      -H 'authorization: Basic <base64_encoded_email:password>'
    
*response*

    {
      "jwt": "<JWT>"
    }

[&#8682;](#calls)

####<a name="call_auth_token_refresh"></a>**refresh a JSON Web Token**

As a user, refreshes an expiring JWT. The authentication token **MUST** be valid and not expired.

*query*

    curl -X PUT <api>/auth/token \
      -H 'authorization: Bearer <JWT>'
    
*response*

    {
      "jwt": "<JWT>"
    }

[&#8682;](#calls)

### user related

####<a name="call_user_create"></a>**create a user**

Create a user. Password is sent in response and by email (if configured).

*query*

    curl -X POST <api>/user \
      -H 'content-type: application/json' \
      -d '{
	       "firstname": "<firstname>",
	       "lastname": "<lastname>",
	       "email": "<email_address>"
        }'    
*response*

    {
      "user": "<hash>",
      "passwd": "<password>"
    }

[&#8682;](#calls)

####<a name="call_user_get"></a>**get user info**

Request user info. Works great with admin rights otherwise returns the current user profile.

*query*

    curl -X GET <api>/user/:hash \
      -H 'authorization: Bearer <JWT>'

*response*

    {
      "id": "<hash>",
      "firstname": "<firstname>",
      "lastname": "<lastname>",
      "email": "<email_address>",
      "type": "<USER|ADMIN>"
    }

[&#8682;](#calls)

####<a name="call_user_recover_1"></a>**lost password: step 1**

Send an email with a recovery link. A new recovery key is generated each time this call kicks in.

> This call returns 204 even if the user is unknown. This is a security feature.

*query*

    curl -X POST <api>/user/recover \
      -H 'content-type: application/json' \
      -d '{ "email": "<email_address>" }'

*response*

    no response

[&#8682;](#calls)

####<a name="call_user_recover_2"></a>**lost password: step 2**

This should be handled by a frontend app then send to this API server.

*query*

    curl -X GET <api>/user/recover/:hash/:recover
    
*response*

    {
      "user": "<hash>",
      "passwd": "<password>"
    }

[&#8682;](#calls)

<sub>powered by [caligarum](https://github.com/fmasclef/caligarum)</sub>