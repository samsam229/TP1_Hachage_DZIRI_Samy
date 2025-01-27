import {createServer} from "node:http"
import {create, liste} from "./blockchain.js";
import {NotFoundError} from "./errors.js";
import {findBlocks} from "./blockchainStorage.js";

createServer(async (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        const url = new URL(req.url, `http://${req.headers.host}`)
        const endpoint = `${req.method}:${url.pathname}`

        let results

        try {
            switch (endpoint) {
                case 'GET:/blockchain':
                    results = await liste(req, res, url)
                    console.log('[INFO] GET /blockchain endpoint hit');
                    break
                case 'POST:/blockchain':
                    results = await create(req, res)
                    console.log('[INFO] POST /blockchain endpoint hit');
                    break
                default :
                    res.writeHead(404)
            }
            if (results) {
                res.write(JSON.stringify(results))
            }
        } catch (erreur) {
            if (erreur instanceof NotFoundError) {
                res.writeHead(404)
            } else {
                throw erreur
            }
        }
        res.end()
    }
).listen(3000)
