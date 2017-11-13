/**
 * Created by xiaoxiaoying on 2017/11/9.
 */
(function () {
    $(() => {
        let url = "http://chaxun.1616.net/s.php?type=ip&output=json&callback=?&_=" + Math.random();
        //https://api.map.baidu.com/location/ip?ip=xx.xx.xx.xx&ak=您的AK&coor=bd09ll
        let d = null;
        let ip = $('#ip');
        let locationIp = $('#location-ip');
        let reset = $('#reset');
        let calculate = $('#calculate');
        let result = $('#result');
        $.getJSON(url, function (data) {
            Log.logBlue("data = " + JSON.stringify(data));
            Log.logBlue("ip === " + data.Ip);
            d = data;
            $('#location').val(data.Ip + "    " + data.Isp);
            $('#location').attr('readonly', true);
        });

        locationIp.on('click', function () {
            ip.val(d.Ip);
        });
        function getLocation(ipStr) {
            $.getJSON("https://api.map.baidu.com/location/ip?ip=" + ipStr + "&ak=kGNwTWf9zg3p4Wa4Cl45M3oiBkr3knwc&coor=bd09ll&callback=?", function (data) {
                Log.logBlue(JSON.stringify(data));
                result.val("地址：" + data.content.address +
                    "\n经度：" + data.content.point.x + "\n纬度：" + data.content.point.y);
            });
        }

        calculate.on('click', function () {
            setResult();
        });

        locationIp.on('click', function () {
            ip.val(d.Ip);
            setResult();
        });

        reset.on('click', function () {
            ip.val("");
            result.val('');
        });

        function setResult() {
            let p = ip.val();
            getLocation(p);
        }
    })
}());