# ![caligarum](./static/images/caligarum.png) caligarum

> an ORM-free REST API with JWT support

This is **caligarum**, an Express powered API server. caligarum has been designed with reliability in mind. caligarum is asynchronous, clustered and ORM free.

Why do we need an ORM free API server? Well, if you're asking the question, you should definitely not use caligarum.

# setup instruction

This setup guide assumes the following:

* you're running a GNU/Linux server
* you're connected with user `exploit`
* you're able to `sudo` or have a way to gain root access

As root, create a suitable folder then give `exploit` rights on it.

    # mkdir -p /data/git
    # chown -R exploit:users /data

Should you plan to use `caligarum` in production, make sure to create the required log storage directory:

    # mkdir /var/log/caligarum
    # chown exploit:users /var/log/caligarum

> Please note that you can customize the filename and the logger behavior using the per-environment config files.

## fetch the source

The source code is avaialable on a git repository. As usual, **git fork** the repo then **git clone**. Let's assume you've forked to `you/project`, do

    $ git clone https://github.com/you/project.git /data/git/caligarum

Now add an upstream so you'll be able to update:

    $ cd /data/git/caligarum
    $ git remote add upstream https://github.com/fmasclef/caligarum.git

Each time you want to update, **git rebase**:

    $ git fetch upstream
    $ git rebase upstream/master

## prepare a MariaDB database

caligarum relies on a MariaDB database. Connect to your MariaDB instance as root, then create a database:

    # mysql -u xxx -h xxx -p
    create database caligarum character set 'utf8' collate 'utf8_general_ci';
    grant all privileges on caligarum.* to 'caligarum'@'localhost' identified by 'passw0rd';
    flush privileges;

Make sure to use a strong password :)

On a production instance, you might limits rights to:

* create
* select
* insert
* update
* delete

## install dependencies

caligarum is npm powered. Run `npm` the usual way to install required dependencies.

    $ cd /data/git/caligarum
    $ npm install

## configure

In order to configure caligarum, you should copy `config/config.dist` to `<environment>.json`. Edit your config file then start the app by specifying the right `environment` as the NODE_ENV variable.

> NODE_ENV defaults to `production`.

### database

Make sure to configure the database connection string properly. You should not escape strange characters in passwords.

### supported transactional email providers

caligarum comes with support of major transactional email providers. What you need is basically to register one of these and get an API key. `config/config.dist` is quite self-explanatory about emails. The supported providers are

- mailgun (with proxy support)
- mailjet (with proxy support)
- sendgrid
- sparkpost (with proxy support)

You might configure multiple providers. In such a case, emails will be sent thru a random provider.

## run it

You can run caligarum from within a terminal or using any distro-level service. Please refer to your distro for suitable guidelines.

From terminal:

    $ cd /data/git/caligarum
    $ NODE_ENV=development npm start

When in `production` mode, you should store logs in `/var/log/caligarum ` by setting the correct Winston transport parameters from within the `config/production.json` config file.

## bundled API calls

A special call returns a markdown documentation of the REST API. This markdown file is `static/api.md`. You should update it to document your own API. Out-of-the-box, it contains informations on the bundled API calls as well as some hints on authentication. In order to avoid confusion, **this file will not be rewritten here**. So make sure to read the [api.md](./static/api.md) file as well.

The special call is:

		curl -X OPTIONS localhost:8008
		
It's an unauthenticated call by design. Should you require to secure it, just use one of the authentication middlewares available *(or write your own)*.

## hack it!

caligarum is a base template. You have to implement your own model and controllers to define a custom logic.

### model

Your logic surely requires some SQL. caligarum will update the database schema by using files located in the `sql` folder. You have to write *custom* patches for the **do** and **undo** methods. Your patch files must be named `custom-<A>-<B>.sql` where *A* is the origin version and *B* the resulting version.

> You must alter `metadata.custom-patch-level` to reflect the current patch level.

Sample patches from version 0000 to 0001 (and back) are provided.

### controllers

Create a new `router` in the *controller* folder. Add the required routing info in the `app.js` file. It should look like

	app.use('/route', require('./controllers/route'))

where *route* is your own logic.

You can add as many router as your project requires. But don't forget to remove the `testing/` controller.

### middlewares

caligarum provides an API authentication mechanism as well as a user JWT based authentication mechanism. Those can be used using pre-built middlewares exposed as globals:

* basicAuth: deal with both API and user:pwd authentication
* jwtAuth: deal with JWT

The API usage requires the user to send a basic HTTP authentication header:

	Authorization: Basic *base64 encoded api:<api_key>*
	
The user authentication mchanism requires the user to authenticate using HTTP basic authentication with his email and password to receive a JWT token he can use for further requests:

	Authorization: Basic *base64 encoded email:<password>*
	GET /auth/token
	
then:

	Authorization: Bearer <JWT>
	GET /another/route

Some other middlewares are exposed such as:

* chronometer: a helper to log basic info about query performance

### services

Some services are available as globals to handle common tasks:

* Helpers: various helpers, such as a base64 encoder
* mailer: a mailing system supporting various providers
* pwdmgr: anything you need to generate, encrypt or test passwords

### mailing

As previously noted a mailer service is available. It makes use of **pug** templates to generate emails. Usage is as follows:

	let mail = mailer.prepare(<template>, customization, options)
	mailer.send(mail)
  
<tempalte> is a the name of both plain text and HTML template. They are located on the `views/mail/html|text` folder.

> The HTML version of the template is mandatory. The plain text version will fallback to `views/mail/text/_fallback.pug`

The `customization` parameter is a JSON used as substitution variables by the pug template engine. 

The `options` parameter is a JSON object containing both *to* and *subject* keys.

 	 {
 	 	to: "email_address",
 	 	subject: "caligarum rocks!"
 	 }

### i18n

Despite caligarum has been designed as an API, it should sometimes comuniate with humans in a human compatible format we call mails. Such can be translated using the i18n library.

Follow this process:

* customize your template with keys
* translate to any language you support (fallback is `en`)
* call the right router including the `Accept-language` header

#### the template

Use the `__` JS function to call the translator service.

	p= __('greetings', firstname)
	
This will create a `<p>` tag with the translated message referenced `greetings` with parameter `firstname`. Note that `firstname` should have been defined as a key of the customization object used with *mailer.prepare*.

#### the translation files

Edit JSON files located in the `locales` folder. You might add as many language as you want to support.

	{
		"greetings": "Hello %s"
	}
	
> Note the use of `%s` which is a placeholder for a string (in our scenario: the firstname).

#### call the router

Most of your API calls will be language-free. Anyway, should you require to translate things, the i18n engine needs to determine which language to use. Send the `Accept-Language` header to define the right language. i18n will then look for a suitable JSON file.

	Accept-Language: fr-CH, en-US;q=0.9, en;q=0.8

## contribute

Should you like to contribute, follow the usual steps.

fork, code, push origin, pull request :)
