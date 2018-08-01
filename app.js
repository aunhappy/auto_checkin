var accounts = require('./config').accounts;
var time = require('./config').time;
var task = require('./controller/task');
var autoCheckIn = require('./controller/autoCheckIn');

// 定时执行
task(time, function () {
    autoCheckIn(accounts);
});
//accounts.forEach(function (v) {
        
//		return false;
  //  });
console.log('======', '自动签到服务运行中..', '======');