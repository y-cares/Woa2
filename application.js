const http = require('http')

// 请求
const request = {
    get url() {
        return this.req.url
    }
}

// 响应
const response = {
    get body() {
        return this._body
    },
    set body(val) {
        this._body = val
    }
}

const context ={
    get url() {
        return this.request.url
    },
    get body() {
        return this.response.body
    },
    set body(val) {
        this.response.body = val
    }
}

class Application {
    constructor() {
        // this.callback = () => {}
        // 将定义好的 context、request、response 挂载到 application 中
        this.context = context
        this.request = request
        this.response = response
        // 用于存放中间件
        this.middlewares = []
    }
    // koa2的use
    use(callback) {
        // 中间件的处理函数
        // this.callback = callback
        this.middlewares.push(callback)
    }
    // 监听端口号
    listen(...args) {
        const server = http.createServer(async (req, res) => {
            // 挂载 req, res 到 ctx
            let ctx = this.creatCtx(req, res)
            const fn = this.compose(this.middlewares)
            await fn(ctx)
            ctx.res.end(ctx.body)
            // this.callback(req, res)
        })
        server.listen(...args)
    }
    creatCtx(req, res) {
        // 将context、request、response 挂载到 ctx 中
        const ctx = Object.create(this.context)
        ctx.request = Object.create(this.request)
        ctx.response = Object.create(this.response)
        // 将原生的 req、res 挂载到ctx上
        ctx.req = ctx.request.req = req
        ctx.res = ctx.response.res = res
        return ctx
    }
    // 洋葱模型
    compose(middlewares) {
        return function(context) {
            // dispatch 函数执行的逻辑，从第一个开始执行
            return dispatch(0)
            // 控制整个异步的函数
            function dispatch(i) {
                let fn = middlewares[i]
                // 边界的判断
                if (!fn) return Promise.resolve()
                return Promise.resolve(fn(context, function next() {
                    // 执行next的时候，执行下一个中间件
                    return dispatch(i+1)
                }))
            }
        }
    }
}

module.exports = Application
