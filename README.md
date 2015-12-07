### Installation notes

First, install [NodeJS with NPM](https://docs.npmjs.com/getting-started/installing-node), [Bower](http://bower.io/#install-bower) and [Grunt](http://gruntjs.com/installing-grunt).

Clone [git repository](https://github.com/Freywar/org.visit.web.codetest1.git) or download [zip file](https://github.com/Freywar/org.visit.web.codetest1/archive/master.zip) and extract to any folder. Open console in this folder.

Run ```npm install```.

Run ```bower install```.

Run ```grunt full```. Project will be built into ```/dist``` folder.

Since project uses cross origin request you should configure any HTTP server to this directory.