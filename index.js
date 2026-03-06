$(function () {

  const AC = new (window.AudioContext || window.webkitAudioContext)();

  function playSound(type) {
    try {
      if (AC.state === 'suspended') AC.resume();

      if (type === 'match') {
        [523, 659, 784, 1047].forEach(function (freq, i) {
          var osc = AC.createOscillator();
          var gain = AC.createGain();
          osc.connect(gain);
          gain.connect(AC.destination);
          osc.frequency.value = freq;
          osc.type = 'sine';
          var t = AC.currentTime + i * 0.1;
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
          osc.start(t);
          osc.stop(t + 0.25);
        });

      } else if (type === 'wrong') {
        var osc = AC.createOscillator();
        var gain = AC.createGain();
        osc.connect(gain);
        gain.connect(AC.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, AC.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, AC.currentTime + 0.25);
        gain.gain.setValueAtTime(0.15, AC.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, AC.currentTime + 0.3);
        osc.start();
        osc.stop(AC.currentTime + 0.3);

      } else if (type === 'win') {
        [523, 659, 784, 1047, 784, 1047, 1319].forEach(function (freq, i) {
          var osc = AC.createOscillator();
          var gain = AC.createGain();
          osc.connect(gain);
          gain.connect(AC.destination);
          osc.frequency.value = freq;
          osc.type = 'sine';
          var t = AC.currentTime + i * 0.13;
          gain.gain.setValueAtTime(0.22, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
          osc.start(t);
          osc.stop(t + 0.3);
        });
      }
    } catch (e) {
    }
  }

  var EMOJIS = ['🦊', '🐳', '🌵', '🔮', '🎸', '🦋', '🍕', '🚀', '🌈', '🎩', '🦄', '🐙'];
  var TOTAL_PAIRS = 8;

  var flipped        = [];
  var matched        = 0;
  var moves          = 0;
  var locked         = false;
  var started        = false;
  var seconds        = 0;
  var timerInterval  = null;
  var cards          = [];

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = a[i];
      a[i] = a[j];
      a[j] = temp;
    }
    return a;
  }

  function formatTime(sec) {
    var m = Math.floor(sec / 60);
    var s = String(sec % 60).padStart(2, '0');
    return m + ':' + s;
  }

  function startTimer() {
    started = true;
    timerInterval = setInterval(function () {
      seconds++;
      $('#timer').text(formatTime(seconds));
    }, 1000);
  }

  function newGame() {
    clearInterval(timerInterval);
    flipped   = [];
    matched   = 0;
    moves     = 0;
    locked    = false;
    started   = false;
    seconds   = 0;

    $('#moves').text('0');
    $('#timer').text('0:00');
    $('#winMessage').removeClass('show');

    var pairs = EMOJIS.slice(0, TOTAL_PAIRS);
    cards = shuffle(pairs.concat(pairs)).map(function (emoji, i) {
      return { id: i, emoji: emoji };
    });

    var $board = $('#gameBoard').empty();
    cards.forEach(function (card) {
      $board.append(
        '<div class="card" data-id="' + card.id + '">' +
          '<div class="card-inner">' +
            '<div class="card-face card-back"></div>' +
            '<div class="card-face card-front">' + card.emoji + '</div>' +
          '</div>' +
        '</div>'
      );
    });
  }

  $(document).on('click', '.card', function () {
    if (AC.state === 'suspended') AC.resume();

    var $card = $(this);

    if (locked || $card.hasClass('flipped') || $card.hasClass('matched')) return;

    if (!started) startTimer();

    $card.addClass('flipped');
    var id = parseInt($card.data('id'));
    flipped.push({ id: id, emoji: cards[id].emoji, el: $card });

    if (flipped.length === 2) {
      locked = true;
      moves++;
      $('#moves').text(moves);

      var a = flipped[0];
      var b = flipped[1];

      if (a.emoji === b.emoji && a.id !== b.id) {
        setTimeout(function () {
          a.el.addClass('matched').removeClass('flipped');
          b.el.addClass('matched').removeClass('flipped');
          playSound('match');
          matched++;
          flipped = [];
          locked  = false;

          if (matched === TOTAL_PAIRS) {
            clearInterval(timerInterval);
            setTimeout(function () {
              playSound('win');
              $('#finalMoves').text(moves);
              $('#finalTime').text(formatTime(seconds));
              $('#winMessage').addClass('show');
            }, 400);
          }
        }, 300);

      } else {
        setTimeout(function () {
          a.el.addClass('wrong');
          b.el.addClass('wrong');
          playSound('wrong');
          setTimeout(function () {
            a.el.removeClass('flipped wrong');
            b.el.removeClass('flipped wrong');
            flipped = [];
            locked  = false;
          }, 600);
        }, 700);
      }
    }
  });

  $('#newGameBtn').on('click', function () {
    newGame();
  });

  $('#playAgainBtn').on('click', function () {
    $('#winMessage').removeClass('show');
    newGame();
  });

  newGame();

});