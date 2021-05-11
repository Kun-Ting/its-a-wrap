# It's a Wrap! [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
### Toroidal Wrapping of Network Visualisations Support Cluster Understanding Tasks
=======

JavaScript torus layout for high-quality graph visualization and exploration based on pairwise gradient descent.

[Homepage with code and examples](https://ialab.it.monash.edu/~kche0088/its-a-wrap/index.html)

#### Npm:

You can install it by first downloading its-a-wrap to your local repository. 
Then run `npm install`.

If you use TypeScript, you can get complete TypeScript definitions by installing [tsd 0.6](https://github.com/DefinitelyTyped/tsd) and running `tsd link`.

Building
--------

*Linux/Mac/Windows Command Line:*

 - install [node.js](http://nodejs.org)
 - install grunt from the command line using npm (comes with node.js):

        npm install -g grunt-cli

 - from the its-a-wrap directory:

        npm install

 - build, minify and test:

        grunt

This creates the `index.js` files in the `its-a-wrap` directory, generates `index.js` for npm.

Running
-------

*Linux/Mac/Windows Command Line:*

Install the Node.js http-server module:

    npm install -g http-server

After installing http-server, we can serve out the example content in the WebCola directory.

    http-server its-a-wrap

The default configuration of http-server will serve the exampes on [http://localhost:8080](http://localhost:8080).
