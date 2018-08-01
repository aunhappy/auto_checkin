var request = require('superagent');
var sendEmail = require('./sendEmail');
var headers = {
    'accept': 'application/json, text/javascript, */*; q=0.01',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'content-length': '48',
    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'origin': 'https://new.ssr233.com',
    'referer': 'https://new.ssr233.com/auth/login',
    'user-agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36',
    'x-requested-with': 'XMLHttpRequest'
};
var headerss = {
	'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
	'accept-encoding': 'gzip, deflate, br',
	'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
	'cache-control': 'max-age=0',
	'content-length': '42',
	'content-type': 'application/x-www-form-urlencoded',
	'origin': 'https://new.ssr233.com',
	'referer': 'https://new.ssr233.com/user',
	'upgrade-insecure-requests': '1',
	'user-agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36',
};

var origin = 'https://new.ssr233.com',
    urls = {
        login: origin + '/auth/login',
        checkIn: origin + '/user/checkin'
    };


/**
 * 自动签到
 * @param account {object}
 * @constructor
 */
function AutoCheckIn(account) {
    this.account = account;

    this.cookie = {
        value: null,
        expires: null
    };

    this.init();
}

AutoCheckIn.prototype = {
    constructor: AutoCheckIn,

    init: function () {
        var that = this;

        that.checkIn(function () {
            sendEmail(that.account.Email + '，签到完毕。 ' + new Date());
            console.log('======', '签到完毕，' + that.account.Email, '======');
        });
    },

    // 验证登录，如果凭证没过期，无需重新验证
    _verify: function (cb) {
        Date.now() > this.cookie.expires * 1000 ? this._login(cb) : cb(this.cookie);
    },

    // 登录
    _login: function (cb) {
        var that = this;
        console.log('======', '即将执行登录操作' + '======');
        request
            .post(urls.login)
            .set(headers)
            .type('form')
            .send({
                email: that.account.Email,
                passwd: that.account.Password,
                code: null
            })
            .redirects(0) // 防止页面重定向
            .end(function (err,result) {
                if(err || !result.ok){
                    console.log('======', '登录失败' + '======');
                }else{
                    console.log('======', JSON.parse(result.text).msg , '======');
                    var cookie = result.headers['set-cookie'];
                    that.cookie = {
                        value: cookie,
                        expires: cookie.join().match(/expire_in=(\d*)/)[1]
                    };
                    cb(that.cookie);
                } 
            })
    },

    // 签到
    checkIn: function (cb) {
        var that = this;
        that._verify(function (cookie) {
            request
                .post(urls.checkIn)
                .set(headerss)
                .set('cookie', cookie.value)
                .type('form')
                .send({
                    email: that.account.Email,
                    passwd: that.account.Password
                })
                .end(function (err,result) {
                    if(err || !result.ok){
                        console.error('======', err + '======');
                    }else{
                        console.log('======', JSON.parse(result.text).msg + '======');
                        cb();
                    } 
                })
        });
    }
};


module.exports = function (account) {
    return new AutoCheckIn(account);
};