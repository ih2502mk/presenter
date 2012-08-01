(function($){
  /**
   * Slider - конструктор для создания объекта, который знает все про слайды.
   * Он знает как добавить слайд к массиву слайдов, знает как переключаться 
   * между слайдами, и что значит переключаться между слайдами.
   */
  function Slider() {
    this.slides = [];
    this.shown = 0;
  }
  
  /**
   * Добавление слайда в массив cлайдов, 
   * $container - jQuery обьект, в общем случае любой HTML, содержимое слайда
   * добавленный слайд снабжается информацией о своем "номере в списке"
   */
  Slider.prototype.pushSlide = function($container) {
    if(!$container.data('slide')) {
      var num = this.slides.length;
      $container
        .wrapInner('<div class="slide body" />')
        .data('slide', {num:num})
        .addClass('slide')
        .addClass('container')
        .addClass('slide-' + num);
      this.slides.push($container);
    }
  }
  
  /**
   * Показ слайда c номером n
   */
  Slider.prototype.show = function(n){
    this.slides[this.shown].hide();
    this.shown = n;
    this.slides[n].show();
  }

  /**
   * Шортхенд для показа следующего слайда
   */
  Slider.prototype.next = function() {
    if(this.shown + 1 >= this.slides.length) {
      this.show(0);
    }
    else {
      this.show(this.shown + 1);
    }
  }
  
  /**
   * Шортхенд для показа предыдущего слайда
   */
  Slider.prototype.prev = function() {
    if(this.shown - 1 < 0) {
      this.show(this.slides.length - 1);
    }
    else {
      this.show(this.shown - 1);
    }
  }
  
  /**
   * Метод для подгонки слайдов под размер окна. 
   * При определении размеров слайда принимаем размер слайда равным 800 х 600, далее
   * масштабируем так чтобы он был меньше самого меньшего из размеров окна на 0,05.
   */
  Slider.prototype.fit = function(){
    var self = this;
  
    var fit = function(){
      var wh = $(window).height(),
      ww = $(window).width(),
      k,
      offsetTop,
      offsetLeft;
      if( ww/wh >= 800/600 ) {
        k = wh / 600;
        offsetTop = Math.ceil(600 * (k - 1) / 2);
        offsetLeft = Math.ceil((ww - 800) / 2);
      }
      else {
        k = ww / 800;
        offsetLeft = Math.ceil(800 * (k - 1) / 2);
        offsetTop = Math.ceil((wh - 600) / 2);
      }
      
      k = k * 0.95;
      
      $.each(self.slides, function() {
        this.find('.slide.body')
          .css({
            '-webkit-transform' : 'scale(' + k + ')',
            '-moz-transform' : 'scale(' + k + ')',
            '-ms-transform' : 'scale(' + k + ')',
            'transform' : 'scale(' + k + ')',
            'top' : offsetTop + 'px',
            'left' : offsetLeft + 'px'
          });
      });
    }
  
    $(window).on('resize', fit);
    fit();
  }
  
  /**
   * Инстанциируем тут же, чтобы обеспечить единственный экземпляр слайдера 
   * на странице
   */
  var slider = new Slider();


  /**
   * Конструктор объекта навигации. Знает все про навигацию. Умеет индексировать 
   * некую коллекцию элементов, по которым будет навигировться. Умеет создавать 
   * виджеты для переключения по елементам коллекции. 
   */
  function Nav() {
    this.indexWidget = $([]);
    this.indexItems = [];
  }
  
  /**
   * Индексатор, в качестве параметров принимает коллекцию, для каждого элемента 
   * которой создает включатель.
   */
  Nav.prototype.index = function(collection) {
    var indexItems = [];
      
    $.each(collection, function(i){
      var item = $('<li>')
        .addClass('nav-item')
        .text("#" + (i))
        .data({'itemNum' : i});
      indexItems.push(item);
    });
    
    this.indexItems = indexItems;
  }
  
  /**
   * Создатель виджета быстрого переключения. Собирает все включатели в один элемент
   * и назначает ему функцию колбек (activator), в которую передается вся необходимая 
   * информация (в даном случае номер елемента который хотим включить).
   */
  Nav.prototype.indexWidgetCreate = function(activator) {
    var self = this;
    
    self.indexWidget = $("<ul>")
      .addClass('nav-index')
      .on('click', 'li', function(e){
        var clicked = $(this);
        activator(clicked.data().itemNum);
        self.indicate(clicked.data().itemNum);
      });  
    
    $.each(self.indexItems, function(){
      self.indexWidget.append(this);
    })
    
    self.indexWidget.appendTo('body');
  }
  
  /**
   * Метод для привязки клбеков к нажатиям клавиш клавиатуры.
   * Параметр map сопоставляет набору клавиш колбек.
   * Параметр nGetter - это функция получения номера включенного элемента.
   */
  Nav.prototype.keyBoard = function(map, nGetter) {  
    var keys = {
      'page up' :   33,
      'page down' : 34,
      'end' :       35,
      'home' :      36,
      'left' :      37,
      'up' :        38,
      'right' :     39,
      'down' :      40,
      'space' :     32,
      'enter' :     13,
      'esc' :       27
    };
    
    var normalizedMap = {};
    
    var self = this;
    
    $.each(map, function(key, fn) {
      var commaKeys = key.split(/\s*,\s*/);
      $.each(commaKeys, function(i, val) {
        normalizedMap[keys[val].toString()] = fn;
      });
    });
    
    $(document).on('keydown', function(e){
      if(typeof normalizedMap[e.which.toString()] === 'function' ) {
        normalizedMap[e.which.toString()]();
        self.indicate(nGetter);
      }
      return true;
    });
  };
  
  /**
   * Метод, который "подсвечивает" те элементы навигации, которые 
   * соответствуют включенному елементу.
   * Параметр nGetter - это функция получения номера включенного элемента.
   */
  Nav.prototype.indicate = function(nGetter) {
    var n = false;
    if(typeof nGetter === 'function') {
      n = nGetter();
    }
    else {
      n = nGetter;
    }
    
    if(!isNaN(parseInt(n, 10))) {
      this.indexItems[n].siblings().removeClass('active');
      this.indexItems[n].addClass('active');
    }
  }
  
  /**
   * Навигация тоже должна быть одна на странице.
   */
  var nav = new Nav();
  
  /**
   * Конструктор объекта слежения за урл хешем
   */
  function Hash() {
    this.watchable = false;
  }
  
  /**
   * Установщик значения
   */
  Hash.prototype.indicate = function(nGetter) {
    var self = this;
    
    var n = false;
    if(typeof nGetter === 'function') {
      n = nGetter();
    }
    else {
      n = nGetter;
    }

    self.watchable = false;

    location.hash = "slide=" + n;

    self.watchable = true;
  }

  Hash.prototype.getNumber = function() {
    var n = parseInt(location.hash.slice(1).split('=')[1], 10)
    return !isNaN(n) ? n : 0;
  }

  Hash.prototype.setup = function (activator) {
    var self = this;
    window.onhashchange = function(){
      if (self.watchable) {
        activator(self.getNumber());
      }
    }
  }

  var hash = new Hash();
  
  /**
   * Инициализация и связывание всего.
   */
  var methods = {
    init: function() {
      //Если селектор ничего не нашел, выходим.
      if(!this.length) {
        return this;
      }
      // Собираем слайды
      this.each(function(i, el){
        slider.pushSlide($(el));
      });
      //Индексируем слайды
      nav.index(slider.slides);
      //Создаем виджет навигации
      nav.indexWidgetCreate(function(n){
        slider.show(n);
        hash.indicate(n);
      })
      //Привязываем клавиатуру
      nav.keyBoard({
        'space, enter, right' : function(){
          slider.next();
          hash.indicate(slider.shown);
        },
        'left' : function(){
          slider.prev();
          hash.indicate(slider.shown);
        }
      },
      function() {
        return slider.shown;
      });

      hash.setup(function(n) {
        if(!isNaN(n)) {
          slider.show(n);
          nav.indicate(n);
        }
      });
      
      //Показываем первый слайд
      slider.fit();
      slider.show(hash.getNumber());
      nav.indicate(hash.getNumber());
      
      return this; //Maintain chainability
    }
  }

  //Рекомендуемая для плагинов jQuery форма оформления плагина.
  $.fn.presenter = function( method ) {
    
    if ( methods[method] ) {
      return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.presenter' );
    }    
  
  };
}(jQuery));