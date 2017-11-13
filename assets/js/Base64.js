/**
 * Created by xiaoxiaoying on 2017/11/10.
 */
(function () {
    $(() => {
        let dir = false;
        let cls = "icon-arrow-down",cls1 = "icon-arrow-up";
        function b64EncodeUnicode(str) {
            return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
                return String.fromCharCode('0x' + p1);
            }));
        }

        function b64DecodeUnicode(str) {
            return decodeURIComponent(atob(str).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
        }

        $('#calculate').on("click", function () {
            let input = $('#clear').val();
            if (dir)
                input = $('#cipher').val();

            if (Utils.isNull(input)) {
                Utils.Toast("请输入明文！");
                return;
            }

            let md = b64EncodeUnicode(input);
            if(dir)
                md =b64DecodeUnicode(input);
            if (dir)
            $('#clear').val(md);
            else $('#cipher').val(md);
        });
        $('#reset').on('click', function () {
            $('#clear').val("");
            $('#cipher').val("");
        });

        function init(disabled) {
            dir = !disabled;
            $('#clear').attr("readonly",!disabled);
            $('#cipher').attr("readonly",disabled);
        }

        init(true);
        $('.button').on('click', function () {
            if (dir){
                init(true);
                $('.button').removeClass(cls1);
                $('.button').addClass(cls);
            }else {
                init(false);
                $('.button').removeClass(cls);
                $('.button').addClass(cls1);
            }
        });

    })
}());