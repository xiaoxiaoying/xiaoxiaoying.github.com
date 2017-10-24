// ---
//     layout: null
// ---

(function () {
    //提供事件的支持
    class EventEmitter {
        constructor() {
            this.events = new Map();
        }

        on(event, fn) {
            let listeners = this.events.get(event);
            if (!listeners) {
                listeners = new Set();
                this.events.set(event, listeners);
            }
            listeners.add(fn);
        }

        un(event, fn) {
            let listeners = this.events.get(event);
            if (listeners) {
                listeners.delete(fn);
                if (listeners.size == 0) {
                    this.events.delete(event);
                }
            }
        }

        emit(event, data) {
            let listeners = this.events.get(event);
            if (listeners) {
                for (let listener of listeners) {
                    listener.call(null, event, data);
                }
            }
        }
    }
    class App extends EventEmitter {
        constructor() {
            super();
        }

        init() {
            const self = this;
            this.all = new Vue({
                el: '#all',
                data: {
                    list: [],
                    name: 'test'
                },
                methods: {}
            });
            this.about = new Vue({
                el: '#about',
                data: {}
            })
        }

        initPage() {
            let div = this.getIds(),
                $main = $('.center'),
                $pages = $main.children('main.pt-page'),
                animEndEventNames = {
                    'WebkitAnimation': 'webkitAnimationEnd',
                    'OAnimation': 'oAnimationEnd',
                    'msAnimation': 'MSAnimationEnd',
                    'animation': 'animationend'
                };
            this.animEndEventName = animEndEventNames[Modernizr.prefixed('animation')];
            this.supportAnim = Modernizr.cssanimations;
            $pages.each(function (item) {
                Log.logBlue('item === ' + item);
                var t = $(this);
                t.data('originalClassList', t.attr('class'));
            });

            $(div[0]).addClass('pt-page-current');

            this.has = {
                isAnimating: false,
                endNextPage: false,
                endCurrPage: false
            };

        }

        getIds() {
            return ['#all','#tools', '#about'];
        }

        navigate(dir, currClass, nextClass) {
            if (this.has.isAnimating) {
                return false;
            }
            this.has.isAnimating = true;

            let inClass = '', outClass = '';
            if (dir === 'right') {

                inClass = 'fromInRight';
                outClass = 'moveToLeft';
            }
            else if (dir === 'left') {
                inClass = 'fromInLeft';
                outClass = 'moveToRight';
            }
            // let nextClass = $(nextId);
            // let currClass = $(currId);
            let self = this;
            nextClass.addClass('pt-page-current');
            nextClass.addClass(inClass).on(this.animEndEventName, function () {
                nextClass.off(this.animEndEventName);
                self.has.endNextPage = true;
                if (self.has.endCurrPage) {
                    self.onEndAnimation(currClass, nextClass);
                }

            });

            currClass.addClass(outClass).on(this.animEndEventName, function () {
                currClass.off(this.animEndEventName);
                self.has.endCurrPage = true;
                if (self.has.endNextPage) {
                    self.onEndAnimation(currClass, nextClass);
                }
            });


            if (!this.supportAnim) {
                // this.onEndAnimation(currClass, nextClass);
            }
        }

        onEndAnimation($outpage, $inpage) {
            this.has.endCurrPage = false;
            this.has.endNextPage = false;
            this.resetPage($outpage, $inpage);
            this.has.isAnimating = false;
        }

        resetPage($outpage, $inpage) {
            $outpage.attr('class', $outpage.data('originalClassList'));
            $inpage.attr('class', $inpage.data('originalClassList') + ' pt-page-current');
        }

    }
    $(() => {
        Log.logBlue("size = {{site.posts.size}}");
        // for (let i = 0;i < size;i++){
        //     Log.logBlue(i+" type = {{site.posts.type}}");
        // }
        let app = new App();
        app.init();
        app.initPage();
        let head1 = $('.li'),
            head2 = $('.li1'),
            head3 = $('.li2'),
            index = 0;
        let current = head1;
        head1.on('click', function () {
            // location.href = "{{site.url}}"+'/';
            if (index !== 0) {
                index = 0;
                let removeCls = current;
                let cls = $('#tools');
                if (removeCls === head2)
                    cls = $('#about');
                app.navigate("left", cls, $('#all'));
                headAddClass(this);
                removeCls.removeClass('current');
                current = head1;
            }

        });
        head3.on('click',function () {
            if (index === 1)
                return;
            let removeCls = current;
            let orientation = 'left';
            let cls = $('#about');
            if (current === head1){
                orientation = 'right';
                cls = $('#all');
            }

            app.navigate(orientation, cls, $('#tools'));
            headAddClass(this);
            removeCls.removeClass('current');
            index = 1;
            current = head3;
        });
        head2.on('click', function () {
            // location.href = "{{site.url}}" +'/about';
            if (index !== 2) {
                index = 2;
                let removeCls = current;
                let cls = $('#tools');
                if (removeCls === head1)
                    cls = $('#all');
                app.navigate("right", cls, $('#about'));
                headAddClass(this);
                removeCls.removeClass('current');
                current = head2;
            }

        });

        function headAddClass(cls) {
            $(cls).addClass('current');
        }
    });

})();
