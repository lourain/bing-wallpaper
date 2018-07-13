const later = require('later')//定时执行脚本
const https = require('https')
const fs = require('fs')
const path = require('path')

const imgPath = path.join(__dirname, './img')

fs.exists(imgPath,exists=>{
    !exists && fs.mkdirSync(imgPath)
})
//获取bing图片
let bing = {
    getImgUrl: function () {
        const url = `https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1`
        return new Promise((resolve, reject) => {
            try {
                https.get(url, res => {
                    var data = '';
                    res.on('data', chunk => {
                        data += chunk
                    })
                    res.on('end', () => {
                        let json = JSON.parse(data)
                        resolve(json)
                    })
                })
            } catch (error) {
                reject(error)
            }

        })
    },
    downloadImg: async function () {
        let json = await this.getImgUrl()
        let images = json.images[0]
        let imgUrl = `https://cn.bing.com${images.url}`
        let title = images.enddate
        const writeStream = fs.createWriteStream(path.join(imgPath, `${title}.jpg`))
        https.get(imgUrl, res => {
            res.setEncoding = 'binary'
            var data = '';
            res.on('data', chunk => {
                data += chunk
                writeStream.write(chunk, 'binary')
            })
            res.on('end', () => {
                console.log(`${title}.jpg 下载完成`);

            })
        })
    }
}

let laterCtrl = {
    basic:{ h: [00], m: [01] },
    composite:function(){
        return [Object.assign({},this.basic)]
    },
    sched:function(){
        return {
            schedules:this.composite()
        }
    },
    getLocalTime:function(){
        later.date.localTime()
    },
    timerHandle:function(){
        later.setInterval(function(){
            bing.downloadImg()
        },this.sched())
    }
    
}
laterCtrl.getLocalTime()
laterCtrl.timerHandle()

