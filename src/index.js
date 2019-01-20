require('babel-polyfill');
import express from 'express';
import bodyParser from 'body-parser';
import ejs from 'ejs';
import fs from 'fs';
import PoopyDiScoop from 'poopy-di-scoop';

export default class PoopyDiScoopCms {
  constructor(options = {}) {
    let { port = '9090', rootDir = './', fmt = 'pretty', githubName } = options;

    this.port = port;
    this.fmt = fmt;
    this.githubName = githubName || null;

    let slash = (rootDir.substr(-1) === '/' ? '' : '/');
    this.rootDir = rootDir + slash;
  }

  run () {
    var app = express();

    let rootDir = './';

    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json());

    app.get('/', (req, res) => {
      (async function () {
        let pds = new PoopyDiScoop({ rootDir });
        let pages = await pds.listPages();

        console.log(Object.keys(pages));

        res.send('Hello World');
      }());
    });

    app.get('/pages/new', (req, res) => {
      (async function () {
        let pds = new PoopyDiScoop({ rootDir });
        let components = await pds.listComponents();
        console.log(process.cwd())
        res.render(__dirname + '/views/pages/selectComp.ejs', { hello: 'world', components });
      })();
    });

    app.post('/pages/new', (req, res) => {
      let componentName = req.body.component;

      if (componentName) {
        (async function () {
          let pds = new PoopyDiScoop({ rootDir });
          let components = await pds.listComponents();
          let component = components[componentName]

          if (component) {
            let paramsUsed = pds.paramsUsed(component);
            res.render(__dirname + '/views/pages/new.ejs', { componentName, paramsUsed });
          } else {
            res.send('Component not found');
          }
        })();
      } else {
        res.send('Invalid component');
      }
    });

    app.post('/pages/create', (req, res) => {
      let component = req.body.component;
      let params = req.body.params;
      let tags = req.body.tags;
      let name = req.body.name;
      let url = req.body.url;
      let title = req.body.title;
      let page = {
        name,
        url,
        title,
        component,
        tags,
        params
      };

      (async function () {
        let pds = new PoopyDiScoop({ rootDir });
        let components = await pds.listComponents();
        let pages = await pds.listPages();

        if (Object.keys(pages).includes(name)) {
          res.send('On no a page already exsist with that name');
        } else {
          fs.writeFile(`${pds.rootDir}pages/${name}.js`, JSON.stringify(page, undefined, 2), (err, data) => {
            if (err) throw err;

            res.send('Hello World');
          });
        }
      }());
    });

    app.listen(this.port);
  }
}
