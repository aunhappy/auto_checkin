var accounts = require('./config').accounts;
var task = require('./controller/task');
var autoCheckIn = require('./controller/autoCheckIn');

// 定时执行
task({h: [12], m: [50,51,52,53]}, function () {
    autoCheckIn(accounts);
});
//accounts.forEach(function (v) {
        
//		return false;
  //  });
console.log('======', '自动签到服务运行中..', '======');