var request = require('superagent');
var fs = require('fs');
var sendEmail = require('./sendEmail');
var site = require('../config').site.host;
    urls = {
        login: site + require('../config').site.loginUrl,
        checkIn: site + require('../config').site.checkInUrl
    };
var header = {
    'accept': '*/*',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'content-type': 'application/x-www-form-urlencoded',
    'site': site,
    'referer': site,
    'user-agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36',
};




/**
 * 自动签到
 * @param account {object}
 * @constructor
 */
function AutoCheckIn(account) {
    this.account = account;
    fs.existsSync('./'+ account.Email +'.json')?
        this.cookie = require('../'+ account.Email +'.json'):
        this.cookie = {value: null,expires: null};
    this.msg = null;

    this.init();
}

AutoCheckIn.prototype = {
    constructor: AutoCheckIn,

    init: function () {
        var that = this;

        that.checkIn(function () {
            var contents = {
                email : that.account.Email,
                msg : that.msg
            };
            //sendEmail(that.account,that.msg);
            console.log('======', '签到完毕，' + that.account.Email+that.msg+ '======');
        });
    },

    // 验证登录，如果凭证没过期，无需重新验证
    _verify: function (cb) {
        var timestamp = this.cookie.expires;
        Number.isNaN(timestamp) ? timestamp = 0:false;
        if(Date.now() > timestamp*1000)
            this._login(cb)
        else{
            console.log('======' , '凭证有效，自动登录' , '======');
            cb(this.cookie);
        }       
    },
    
    _login: function (cb) {
        var that = this;
        request
            .post(urls.login)
            .set(header)
            .type('form')
            .send({
                email: that.account.Email,
                passwd: that.account.Password,
                remember_me: "week"
            })
            .redirects(0) // 防止页面重定向
            .end(function (err,result) {
                if(err || !result.ok){
                    console.error('======' + err + '======');
                }else{
                    console.log('======', JSON.parse(result.text).msg , '======');
                    var cookie = result.headers['set-cookie'];
                    that.cookie = {
                        value: cookie.join().match(/uid=(\d*);|email=[^\s]*;|key=[^\s]*;|ip=[^\s]*;|expire_in=(\d*);/g).join(' '),
                        expires: cookie.join().match(/expire_in=(\d*)/)[1]
                    };
                    
                    
                    fs.writeFile('./'+ that.account.Email +'.json', JSON.stringify(that.cookie), function(err) {
                        if (err) {
                            throw err;
                        }
                        console.log(that.account.Email +'的cookie存入本地了.');
                        // 写入成功后读取测试
                        
                    });
                    cb(that.cookie);
                } 
            });
        //});
    },

    // 签到
    checkIn: function (cb) {
        var that = this;
        that._verify(function (cookie) {
            request
                .post(urls.checkIn)
                .set(header)
                .set('cookie', cookie.value)
                .end(function (err,result) {
                    if(err || !result.ok){
                        console.error('======' + err + '======');
                    }else{
                        console.log('======', JSON.parse(result.text).msg , '======');
                        that.msg = JSON.parse(result.text).msg;
                        cb();
                    } 
                })
        });
    }
};


module.exports = function (account) {
    return new AutoCheckIn(account);
};
