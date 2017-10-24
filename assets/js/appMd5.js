/**
 * Created by xiaoxiaoying on 2017/10/24.
 */
;(function () {
    $(() => {
        $('#calculate').on("click", function () {
            let input = $('#input').val();
            if (Utils.isNull(input)){
                Utils.Toast("请输入明文！");
                return ;
            }

            let md = md5(input);
            $('#result').val(md);
        });
        $('#reset').on('click', function () {
            $('#input').val("");
            $('#result').val("");
        })
    })
}());