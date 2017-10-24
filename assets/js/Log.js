/**
 * Created by Administrator on 2016/11/24/024.
 */

var Log = {

  log: function (txt) {
    console.log("%c " + txt, 'background:#222;color:#dada55');
  },
  logRed: function (txt) {
    console.log("%c " + txt, 'background:#fff;color:#ff0000');
  },
  logBlue: function (txt) {
    console.log("%c " + txt, 'background:#fff;color:#0066FF');

  }


};
var Utils = {
    /**
     * toast
     */

    Toast: function (msg, duration, position) {
        duration = isNaN(duration) ? 900 : duration;
        if (Utils.isNull(position)) {
            position = '80%';
        }
        var m = document.createElement('div');
        m.innerHTML = msg;
        m.className = "toast";
        m.id = "t_id";
        document.body.appendChild(m);
        var t = document.getElementById("t_id");
        m.style.left = (Utils.windowWidth() - t.clientWidth) / 2 + "px";
        m.style.top = position;
        setTimeout(function () {
            var d = 0.5;
            m.style.webkitTransition = '-webkit-transform ' + d + 's ease-in, opacity ' + d + 's ease-in';
            m.style.opacity = '0';
            setTimeout(function () {
                document.body.removeChild(m)
            }, d * 1000);
        }, duration);
    },

    windowWidth: function () {
        return window.innerWidth;
    },
    windowHeight: function () {
        return window.innerHeight;
    },

    isNull: function (key) {
        if (key === undefined || key.length <= 0 || key === null) {
            return true;
        }
        return false;
    }

};