# The API Documentation Browser

The API documentation browser provides a standalone implementation of the generated API documentation provided by the ArangoDB admin interface.

Note that apps can be mounted inside of each other, so if you want to make documentation for an app mounted at `/my-foxx-app` available on a sub-path, you could mount this app at `/my-foxx-app/docs`.

**Warning**: as of ArangoDB 2.6 it is possible to mount API documentation directly inside an app using the *apiDocumentation* controller method, eliminating the use case this app was created for. You can still use this app if you want to mount the documentation of a third-party app without writing any code, of course.

## Configuration

This app has the following configuration option:

* *appPath*: Mount point of the app for which documentation will be generated. Example: `/_admin/aardvark`.

## License

This code is distributed under the [Apache License](http://www.apache.org/licenses/LICENSE-2.0) by ArangoDB GmbH.

The documentation browser frontend is based on [swagger-ui v2.0](https://github.com/swagger-api/swagger-ui), which is also distributed under the same license by Reverb Technologies, Inc.