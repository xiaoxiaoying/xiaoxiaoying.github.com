/**
 * Created by xiaoxiaoying on 2017/11/9.
 */
(function () {
    $(() => {
        let calculate = $('#calculate');
        let reset = $('#reset');
        let latitude = $('#latitude');
        let longitude = $('#longitude');
        let result = $('#result');
        function getLocation(x,y) {
            // 创建地理编码实例
            let myGeo = new BMap.Geocoder();
            // 根据坐标得到地址描述
            myGeo.getLocation(new BMap.Point(x, y), function (data) {
                if (data) {
                    Log.logBlue(JSON.stringify(data.address));
                    result.val("地址："+data.address);
                }
            });
        }
        reset.on('click',function () {
            result.val('');
            latitude.val('');
            longitude.val('');
        });
        calculate.on('click',function () {
            getLocation(latitude.val(),longitude.val());
        });

        // var map = new BMap.Map("container");          // 创建地图实例
        // var point = new BMap.Point(116.404, 39.915);  // 创建点坐标
        // map.centerAndZoom(point, 15);
        // map.enableScrollWheelZoom(true);

    })
}());