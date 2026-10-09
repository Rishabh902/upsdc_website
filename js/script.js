(function () {
  'use strict';

  var query = function (selector, root) {
    return (root || document).querySelector(selector);
  };
  var queryAll = function (selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  };

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var menu = query('#menu');
  var menuButton = query('.menu-toggle');
  var menuClose = menu ? menu.querySelector('.menu-close') : null;
  if (menu && menuButton) {
    menuButton.addEventListener('click', function () {
      var open = menu.classList.toggle('menu--open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        document.body.style.overflow = 'hidden';
        menu.querySelector('.menu-item').focus();
      } else {
        document.body.style.overflow = '';
      }
    });
    if (menuClose) {
      menuClose.addEventListener('click', function () {
        menu.classList.remove('menu--open');
        menuButton.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        menuButton.focus();
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('menu--open')) {
        menu.classList.remove('menu--open');
        menuButton.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        menuButton.focus();
      }
    });
  }

  var slides = queryAll('.carousel-slide');
  var dots = query('.carousel-indicators');
  var current = 0;
  var carouselTimer;
  var touchStartX = 0;

  function showSlide(index, animate) {
    if (!slides.length) return;
    var prev = current;
    current = (index + slides.length) % slides.length;
    if (prev === current) return;
    slides.forEach(function (slide, i) {
      var active = i === current;
      slide.classList.toggle('carousel-slide--active', active);
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    queryAll('.carousel-dot', dots).forEach(function (dot, i) {
      dot.classList.toggle('carousel-dot--active', i === current);
      dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
    });
  }

  function startCarousel() {
    if (prefersReducedMotion) return;
    clearInterval(carouselTimer);
    carouselTimer = setInterval(function () {
      showSlide(current + 1);
    }, 3000);
  }

  function stopCarousel() {
    clearInterval(carouselTimer);
  }

  if (slides.length && dots) {
    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot' + (i === 0 ? ' carousel-dot--active' : '');
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dot.addEventListener('click', function () {
        showSlide(i);
        startCarousel();
      });
      dot.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          dot.click();
        }
      });
      dots.appendChild(dot);
    });

    var next = query('.carousel-next');
    var prev = query('.carousel-prev');
    var carousel = query('.carousel');

    if (next) next.addEventListener('click', function () { showSlide(current + 1); startCarousel(); });
    if (prev) prev.addEventListener('click', function () { showSlide(current - 1); startCarousel(); });

    if (carousel) {
      carousel.addEventListener('mouseenter', stopCarousel, { passive: true });
      carousel.addEventListener('mouseleave', startCarousel, { passive: true });
      carousel.addEventListener('focusin', stopCarousel, { passive: true });
      carousel.addEventListener('focusout', startCarousel, { passive: true });

      carousel.addEventListener('touchstart', function (e) {
        touchStartX = e.touches[0].clientX;
      }, { passive: true });

      carousel.addEventListener('touchend', function (e) {
        var touchEndX = e.changedTouches[0].clientX;
        var diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
          showSlide(current + (diff > 0 ? 1 : -1));
          startCarousel();
        }
      }, { passive: true });

      carousel.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); showSlide(current - 1); startCarousel(); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); showSlide(current + 1); startCarousel(); }
      });
    }
    startCarousel();
  }

})();

