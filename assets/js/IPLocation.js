/**
 * Created by xiaoxiaoying on 2017/11/9.
 */
(function () {
    $(() => {


        /**
         * Get the user IP throught the webkitRTCPeerConnection
         * @param onNewIP {Function} listener function to expose the IP locally
         * @return undefined
         */
        function getUserIP(onNewIP) { //  onNewIp - your listener function for new IPs
            //compatibility for firefox and chrome
            let myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
            let pc = new myPeerConnection({
                    iceServers: []
                }),
                noop = function () {
                },
                localIPs = {},
                ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g,
                key;

            function iterateIP(ip) {
                if (!localIPs[ip]) onNewIP(ip);
                localIPs[ip] = true;
            }

            //create a bogus data channel
            pc.createDataChannel("");

            // create offer and set local description
            pc.createOffer().then(function (sdp) {
                sdp.sdp.split('\n').forEach(function (line) {
                    if (line.indexOf('candidate') < 0) return;
                    line.match(ipRegex).forEach(iterateIP);
                });

                pc.setLocalDescription(sdp, noop, noop);
            }).catch(function (reason) {
                // An error occurred, so handle the failure to connect
            });

            //sten for candidate events
            pc.onicecandidate = function (ice) {
                if (!ice || !ice.candidate || !ice.candidate.candidate || !ice.candidate.candidate.match(ipRegex)) return;
                ice.candidate.candidate.match(ipRegex).forEach(iterateIP);
            };
        }

        // Usage

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
            getUserIP(function (ip) {
                Log.logBlue("Got IP! :" + ip);
                $('#location').val("公网："+data.Ip + "-" + data.Isp+"  内网："+ip);
            });

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