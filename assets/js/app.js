---
    layout: null
---

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
        class App extends EventEmitter{
            constructor(){
                super();
            }

            init(){
                const self = this;
                this.all = new Vue({
                    el:'#all',
                    data:{
                        list:[],
                        name:'test'
                    },
                    methods:{

                    }
                });
                this.about = new Vue({
                    el:'#about',
                    data:{

                    }
                })
            }
            initPage() {
                var div = this.getIds(),
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
                return ['#all', '#about'];
            }

            navigate(dir, currClass, nextClass) {
                if (this.has.isAnimating) {
                    return false;
                }
                this.has.isAnimating = true;

                let inClass = '', outClass = '';
                if (dir == 'right') {

                    inClass = 'fromInRight';
                    outClass = 'moveToLeft';
                }
                else if (dir == 'left') {
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
        $(() =>{
            Log.logBlue("=========="+"{{site.posts.size}}");
            let app = new App();
            app.init();
            app.initPage();
            let head1 = $('.li'),
                head2 = $('.li1'),
                index = 0;
            head1.on('click',function () {
                // location.href = "{{site.url}}"+'/';
                if (index != 0){
                    index = 0;
                    app.navigate("left",$('#about'),$('#all'));
                    headAddClass(this);
                    head2.removeClass('current');
                }

            });
            head2.on('click',function () {
                // location.href = "{{site.url}}" +'/about';
                if (index != 1 )
                {
                    index = 1;
                    app.navigate("right",$('#all'),$('#about'));
                    headAddClass(this);
                    head1.removeClass('current');
                }

            });

            function headAddClass(cls) {
                $(cls).addClass('current');
            }
        });

    })();
