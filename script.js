'use strict';

/* ============================================================
   DOM ELEMENTS (querySelector / querySelectorAll)
   We grab references once at the top to avoid repeating queries.
   These elements are used across multiple features:
   - modal open/close
   - smooth scrolling
   - nav hover effect
   - sticky nav
   - tabs
   - reveal sections
   - lazy image loading
   - slider
   - booking form submission + analytics events
============================================================ */

// Modal elements
const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');

// Smooth scroll button + target section
const btnScrollTo = document.querySelector('.btn--scroll-to');
const section1 = document.querySelector('#section--1');

// Navigation + tabs
const nav = document.querySelector('.nav');
const tabs = document.querySelectorAll('.operations__tab');
const tabsContainer = document.querySelector('.operations__tab-container');
const tabsContent = document.querySelectorAll('.operations__content');

// Footer year (auto-updates each year)
document.getElementById('year').textContent = new Date().getFullYear();

///////////////////////////////////////
// MODAL WINDOW (booking popup)
//
// How it works:
// - openModal: removes "hidden" class to show modal + overlay
// - closeModal: adds "hidden" class to hide modal + overlay
// - Event listeners:
//   - open on buttons
//   - close on X button
//   - close on overlay click
//   - close on Escape key
///////////////////////////////////////
const openModal = function (e) {
  // Prevents anchor (#) from jumping to top / changing URL
  e.preventDefault();

  // Show modal + overlay
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = function () {
  // Hide modal + overlay
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

// Attach openModal to all "Book" buttons (nav + CTA + footer etc.)
btnsOpenModal.forEach(btn => btn.addEventListener('click', openModal));

// Close interactions
btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

// Close with Esc key
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
});

///////////////////////////////////////
// BUTTON SCROLLING (hero button)
//
// Scrolls smoothly to Section 1 when the hero button is clicked.
///////////////////////////////////////
btnScrollTo.addEventListener('click', function () {
  section1.scrollIntoView({ behavior: 'smooth' });
});

///////////////////////////////////////
// PAGE NAVIGATION (event delegation)
//
// Instead of adding click listeners to every nav link,
// we add ONE listener on the parent (.nav__links).
// Then we check what was clicked and handle it.
//
// Benefits:
// - fewer event listeners
// - works even if you add new nav items later
///////////////////////////////////////
document.querySelector('.nav__links').addEventListener('click', function (e) {
  e.preventDefault();

  // Only handle clicks on actual nav links
  if (e.target.classList.contains('nav__link')) {
    const id = e.target.getAttribute('href');

    // Only scroll if href is an in-page anchor like "#section--2"
    if (id && id.startsWith('#')) {
      document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
    }
  }
});

///////////////////////////////////////
// TABBED COMPONENT (About section)
//
// Click tabs to show/hide content.
// Uses data-tab="1/2/3" on the buttons.
// Content sections have class:
// - operations__content--1
// - operations__content--2
// - operations__content--3
///////////////////////////////////////
tabsContainer.addEventListener('click', function (e) {
  // closest() ensures clicking on the <span> still selects the button
  const clicked = e.target.closest('.operations__tab');
  if (!clicked) return; // click outside a tab -> do nothing

  // Remove active styles from all tabs/content
  tabs.forEach(t => t.classList.remove('operations__tab--active'));
  tabsContent.forEach(c => c.classList.remove('operations__content--active'));

  // Activate clicked tab
  clicked.classList.add('operations__tab--active');

  // Show matching content panel (based on clicked.dataset.tab)
  document
    .querySelector(`.operations__content--${clicked.dataset.tab}`)
    .classList.add('operations__content--active');
});

///////////////////////////////////////
// MENU FADE ANIMATION (hover effect)
//
// When user hovers a nav link:
// - dim siblings and logo
// When mouse leaves:
// - restore opacity
//
// Uses bind() to set "this" to the opacity value:
// - mouseover -> 0.5
// - mouseout -> 1
///////////////////////////////////////
const handleHover = function (e) {
  if (e.target.classList.contains('nav__link')) {
    const link = e.target;

    // Get all nav links + the logo within the same nav area
    const siblings = link.closest('.nav').querySelectorAll('.nav__link');
    const logo = link.closest('.nav').querySelector('img');

    // Dim all links except the hovered one
    siblings.forEach(el => {
      if (el !== link) el.style.opacity = this;
    });

    // Dim logo too
    logo.style.opacity = this;
  }
};

// Bind sets "this" inside handleHover to a number (opacity)
nav.addEventListener('mouseover', handleHover.bind(0.5));
nav.addEventListener('mouseout', handleHover.bind(1));

///////////////////////////////////////
// STICKY NAVIGATION (IntersectionObserver)
//
// When header is not visible, add "sticky" class to nav.
// rootMargin uses navHeight so the sticky effect triggers
// exactly when the header scrolls past the nav height.
///////////////////////////////////////
const header = document.querySelector('.header');
const navHeight = nav.getBoundingClientRect().height;

const stickyNav = function (entries) {
  const [entry] = entries;

  // If header isn't intersecting viewport, stick the nav
  if (!entry.isIntersecting) nav.classList.add('sticky');
  else nav.classList.remove('sticky');
};

const headerObserver = new IntersectionObserver(stickyNav, {
  root: null, // viewport
  threshold: 0, // trigger as soon as header is out of view
  rootMargin: `-${navHeight}px`, // trigger earlier by nav height
});

headerObserver.observe(header);

///////////////////////////////////////
// REVEAL SECTIONS (scroll animation)
//
// Start with sections hidden (section--hidden class).
// As section enters viewport, remove hidden class and stop observing it.
///////////////////////////////////////
const allSections = document.querySelectorAll('.section');

const revealSection = function (entries, observer) {
  const [entry] = entries;
  if (!entry.isIntersecting) return; // not visible yet -> ignore

  entry.target.classList.remove('section--hidden');
  observer.unobserve(entry.target); // performance: stop observing once revealed
};

const sectionObserver = new IntersectionObserver(revealSection, {
  root: null,
  threshold: 0.15, // reveal when 15% visible
});

// Hide all sections by default, then observe them
allSections.forEach(function (section) {
  sectionObserver.observe(section);
  section.classList.add('section--hidden');
});

///////////////////////////////////////
// LAZY LOADING IMAGES
//
// Images with data-src are loaded only when near viewport.
// - entry.target.src is replaced with entry.target.dataset.src
// - on load, remove blur class "lazy-img"
///////////////////////////////////////
const imgTargets = document.querySelectorAll('img[data-src]');

const loadImg = function (entries, observer) {
  const [entry] = entries;
  if (!entry.isIntersecting) return;

  // Replace low-res src with high-res data-src
  entry.target.src = entry.target.dataset.src;

  // When the new image has fully loaded, remove blur effect class
  entry.target.addEventListener('load', function () {
    entry.target.classList.remove('lazy-img');
  });

  observer.unobserve(entry.target);
};

const imgObserver = new IntersectionObserver(loadImg, {
  root: null,
  threshold: 0,
  rootMargin: '200px', // start loading before image enters viewport
});

imgTargets.forEach(img => imgObserver.observe(img));

///////////////////////////////////////
// SLIDER (testimonials carousel)
//
// Main idea:
// - Slides are positioned horizontally using translateX()
// - Current slide = 0
// - Next slide shifts everything left
// - Dots represent slides and allow direct navigation
///////////////////////////////////////
const slider = function () {
  const slides = document.querySelectorAll('.slide');
  const btnLeft = document.querySelector('.slider__btn--left');
  const btnRight = document.querySelector('.slider__btn--right');
  const dotContainer = document.querySelector('.dots');

  let curSlide = 0;
  const maxSlide = slides.length;

  // Create navigation dots for each slide
  const createDots = function () {
    slides.forEach(function (_, i) {
      dotContainer.insertAdjacentHTML(
        'beforeend',
        `<button class="dots__dot" data-slide="${i}"></button>`
      );
    });
  };

  // Highlight the active dot
  const activateDot = function (slide) {
    document
      .querySelectorAll('.dots__dot')
      .forEach(dot => dot.classList.remove('dots__dot--active'));

    document
      .querySelector(`.dots__dot[data-slide="${slide}"]`)
      .classList.add('dots__dot--active');
  };

  // Move slides into position based on current slide index
  const goToSlide = function (slide) {
    slides.forEach(
      (s, i) => (s.style.transform = `translateX(${100 * (i - slide)}%)`)
    );
  };

  // Go to next slide (wrap around to 0 at end)
  const nextSlide = function () {
    curSlide = curSlide === maxSlide - 1 ? 0 : curSlide + 1;
    goToSlide(curSlide);
    activateDot(curSlide);
  };

  // Go to previous slide (wrap around to last at start)
  const prevSlide = function () {
    curSlide = curSlide === 0 ? maxSlide - 1 : curSlide - 1;
    goToSlide(curSlide);
    activateDot(curSlide);
  };

  // Initialize slider state
  const init = function () {
    goToSlide(0);
    createDots();
    activateDot(0);
  };
  init();

  // Click controls
  btnRight.addEventListener('click', nextSlide);
  btnLeft.addEventListener('click', prevSlide);

  // Keyboard controls
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
  });

  // Dot navigation (event delegation)
  dotContainer.addEventListener('click', function (e) {
    if (e.target.classList.contains('dots__dot')) {
      curSlide = Number(e.target.dataset.slide);
      goToSlide(curSlide);
      activateDot(curSlide);
    }
  });
};

slider();

///////////////////////////////////////
// BOOKING FORM -> FORMSPREE + GA4 EVENT
//
// What this does:
// - Intercepts form submission (preventDefault)
// - Sends the form to Formspree using fetch()
// - On success:
//   - sends GA4 event "generate_lead"
//   - resets form, closes modal, shows success alert
//
// IMPORTANT:
// - You must replace FORMSPREE_URL with your real endpoint.
//   Your HTML currently posts to:
//   action="https://formspree.io/f/mldjgppg"
//
// So you should set:
//   const FORMSPREE_URL = 'https://formspree.io/f/mldjgppg';
///////////////////////////////////////
const bookingForm = document.querySelector('#bookingForm');

if (bookingForm) {
  bookingForm.addEventListener('submit', async function (e) {
    e.preventDefault();

        const FORMSPREE_URL = 'https://formspree.io/f/mqedlrnk';

    // ✅ Replace placeholder with your REAL Formspree endpoint.
    // It should match the one in your HTML form action attribute.
   

    // Gather form fields into FormData for POST request
    const formData = new FormData(bookingForm);

    try {
      const res = await fetch(FORMSPREE_URL, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        // ✅ GA4 conversion / lead event
        // This event will appear under Reports > Engagement > Events
        // and can be marked as a Key event (conversion) in GA4 UI.
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'generate_lead', {
            event_category: 'engagement',
            event_label: 'booking_form',
          });
        }

        // Reset form fields
        bookingForm.reset();

        // Close modal for a nice UX
        closeModal();

        // Feedback to user
        alert('Thanks! Your booking request has been sent. I’ll reply shortly.');
      } else {
        alert('Sorry, something went wrong. Please try again.');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
  });
}

///////////////////////////////////////
// GA4 EVENT: "Book lesson" button click
//
// Tracks when a user clicks any button/link that opens the modal.
// (nav Book button, CTA Book button, footer Book link, etc.)
//
// FIX: We safely check gtag exists to avoid runtime errors.
///////////////////////////////////////
document.querySelectorAll('.btn--show-modal').forEach(btn => {
  btn.addEventListener('click', () => {
    // Only fire event if GA is loaded
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'book_lesson_click');
    }
  });
});
