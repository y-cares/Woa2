const obj = {
    _name: 'king',
    get name() {
        return this._name
    },
    set name(val) {
        console.log('new name is ' + val)
        this._name = val
    }
}

// console.log(obj.name)
// obj.name = 'sb'
// console.log(obj.name)

function add(x, y) {
    return x + y
}
function double(z) {
    return z * 2
}

// const res1 = add(1, 2)
// const res2 = double(res1)
// console.log(res2)

const middlewares = [add, double]
const len = middlewares.length

// 同步的compose
// 将所有的函数，压缩成一个函数
function compose(midds) {
    // ...args  无限值
    return (...args) => {
        // 初始值
        let res = midds[0](...args)
        for (let i = 1; i < len; i ++) {
            // 更新res的值
            res = midds[i](res)
        }
        return res
    }
}


// const fn = compose(middlewares)
// const res = fn(1, 2)
// console.log(res)


// 异步的compose
async function fn1(next) {
    console.log('fn1')
    await next()
    console.log('end fn1')
}

async function fn2(next) {
    console.log('fn2')
    await delay()
    await next()
    console.log('end fn2')
}

async function fn3(next) {
    console.log('fn3')
}

function delay() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, 2000)
    })
}

// 洋葱模型
function asyncCompose(asyncMiddlewares) {
    return function() {
        // dispatch 函数执行的逻辑，从第一个开始执行
        return dispatch(0)
        // 控制整个异步的函数
        function dispatch(i) {
            let fn = asyncMiddlewares[i]
            // 边界的判断
            if (!fn) return Promise.resolve()
            return Promise.resolve(fn(function next() {
                // 执行next的时候，执行下一个中间件
                return dispatch(i+1)
            }))
        }
    }
}

const asyncMiddlewares = [fn1, fn2, fn3]
const finalFn = asyncCompose(asyncMiddlewares)
finalFn()
