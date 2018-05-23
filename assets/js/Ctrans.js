/**
 * Created by xiaoxiaoying on 2018/5/23.
 */

/**
 * Created by xiaoxiaoying on 2017/11/10.
 */
(function () {
    $(() => {
        let dir = false;
        let cls = "icon-arrow-down", cls1 = "icon-arrow-up";


        $('#calculate').on("click", function () {
            let input = $('#clear').val();
            if (dir)
                input = $('#cipher').val();

            if (Utils.isNull(input)) {
                if (dir)
                    Utils.Toast("请输入简体！");
                else Utils.Toast("请输入繁体");
                return;
            }

            let md = Chinese.toStr(input,dir);
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
            $('#clear').attr("readonly", !disabled);
            $('#cipher').attr("readonly", disabled);
        }

        init(true);
        $('.button').on('click', function () {
            if (dir) {
                init(true);
                $('.button').removeClass(cls1);
                $('.button').addClass(cls);
            } else {
                init(false);
                $('.button').removeClass(cls);
                $('.button').addClass(cls1);
            }
        });

    })
}());