import { useEffect, useMemo, useRef, useState } from 'react';

const FORMSPREE_URL = 'https://formspree.io/f/mqedlrnk';
const PLACEHOLDER_IMAGE =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
const LOGO_SRC = '/logo.JPG';
const HEADER_IMAGE_SRC = '/guitar-piano.jpg';
const GUITAR_IMAGE_SRC = '/guitar.jpg';
const PIANO_IMAGE_SRC = '/piano.jpg';
const MUSIC_THEORY_IMAGE_SRC = '/musictheory.jpg';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const headerRef = useRef(null);
  const navRef = useRef(null);
  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const section3Ref = useRef(null);
  const formRef = useRef(null);

  const slides = useMemo(
    () => [
      {
        header: 'Clear and encouraging',
        text: 'Lessons are structured, easy to follow, and motivating. I\'ve improved faster than I expected.',
        name: 'Student (Beginner Guitar)',
        location: 'London, UK',
      },
      {
        header: 'Progress every week',
        text: 'I finally understand chords and rhythm. Practise feels purposeful now, not random.',
        name: 'Student (Piano)',
        location: 'Online',
      },
      {
        header: 'Friendly and professional',
        text: 'Great teaching style - patient, knowledgeable, and focused on what I want to achieve.',
        name: 'Student (Intermediate)',
        location: 'London, UK',
      },
    ],
    []
  );

  const currentYear = new Date().getFullYear();
  const maxSlide = slides.length;

  const openModal = (event) => {
    if (event) event.preventDefault();
    setIsModalOpen(true);
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'book_lesson_click');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const showSuccessMessage = () => {
    setToastMessage('Thank you for booking!');
    window.setTimeout(() => setToastMessage(''), 3000);
  };

  const scrollToSection = (sectionRef, event) => {
    if (event) event.preventDefault();
    sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === maxSlide - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? maxSlide - 1 : prev - 1));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!formRef.current) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData(formRef.current);
      const response = await fetch(FORMSPREE_URL, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        window.alert('Sorry, something went wrong. Please try again.');
        return;
      }

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', {
          event_category: 'engagement',
          event_label: 'booking_form',
        });
      }

      formRef.current.reset();
      closeModal();
      showSuccessMessage();
    } catch (_error) {
      window.alert('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavHover = (event, opacity) => {
    const target = event.target;
    if (!target.classList.contains('nav__link')) return;

    const navEl = navRef.current;
    if (!navEl) return;

    const links = navEl.querySelectorAll('.nav__link');
    const logoEl = navEl.querySelector('img');

    links.forEach((link) => {
      if (link !== target) link.style.opacity = opacity;
    });

    if (logoEl) logoEl.style.opacity = opacity;
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && isModalOpen) {
        closeModal();
      }

      if (event.key === 'ArrowLeft') {
        prevSlide();
      }

      if (event.key === 'ArrowRight') {
        nextSlide();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isModalOpen, maxSlide]);

  useEffect(() => {
    const headerEl = headerRef.current;
    const navEl = navRef.current;
    if (!headerEl || !navEl) return;

    const navHeight = navEl.getBoundingClientRect().height;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          navEl.classList.add('sticky');
        } else {
          navEl.classList.remove('sticky');
        }
      },
      {
        root: null,
        threshold: 0,
        rootMargin: `-${navHeight}px`,
      }
    );

    observer.observe(headerEl);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll('.section'));
    if (!sections.length) return;

    sections.forEach((section) => section.classList.add('section--hidden'));

    const observer = new IntersectionObserver(
      (entries, obs) => {
        const [entry] = entries;
        if (!entry.isIntersecting) return;

        entry.target.classList.remove('section--hidden');
        obs.unobserve(entry.target);
      },
      {
        root: null,
        threshold: 0.15,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll('img[data-src]'));
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        const [entry] = entries;
        if (!entry.isIntersecting) return;

        const image = entry.target;
        const source = image.getAttribute('data-src');

        if (source) {
          image.src = source;
          image.addEventListener(
            'load',
            () => {
              image.classList.remove('lazy-img');
            },
            { once: true }
          );
        }

        obs.unobserve(image);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: '200px',
      }
    );

    targets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const navEl = navRef.current;
    if (!navEl) return;

    return () => {
      navEl.querySelectorAll('.nav__link').forEach((link) => {
        link.style.opacity = '';
      });
      const logoEl = navEl.querySelector('img');
      if (logoEl) logoEl.style.opacity = '';
    };
  }, []);

  return (
    <>
      <header className="header" ref={headerRef}>
        <nav
          className="nav"
          ref={navRef}
          onMouseOver={(event) => handleNavHover(event, 0.5)}
          onMouseOut={(event) => handleNavHover(event, 1)}
        >
          <img
            src={LOGO_SRC}
            alt="Your Guitar and Piano Lessons logo"
            className="nav__logo"
            id="logo"
            data-version-number="3.0"
          />

          <ul className="nav__links">
            <li className="nav__item">
              <a className="nav__link" href="#section--1" onClick={(event) => scrollToSection(section1Ref, event)}>
                Lessons
              </a>
            </li>
            <li className="nav__item">
              <a className="nav__link" href="#section--2" onClick={(event) => scrollToSection(section2Ref, event)}>
                About
              </a>
            </li>
            <li className="nav__item">
              <a className="nav__link" href="#section--3" onClick={(event) => scrollToSection(section3Ref, event)}>
                Reviews
              </a>
            </li>
            <li className="nav__item">
              <a className="nav__link nav__link--btn btn--show-modal" href="#" onClick={openModal}>
                Book
              </a>
            </li>
          </ul>
        </nav>

        <div className="header__title">
          <h1>
            Learn <span className="highlight">Guitar</span> and <span className="highlight">Piano</span>
            <br />
            with confidence
          </h1>

          <h4>In-person (London) and online lessons - beginners to intermediate.</h4>

          <button className="btn--text btn--scroll-to" onClick={(event) => scrollToSection(section1Ref, event)}>
            See how it works &DownArrow;
          </button>

          <img src={HEADER_IMAGE_SRC} className="header__img" alt="Guitar and piano lessons" />
        </div>
      </header>

      <section className="section" id="section--1" ref={section1Ref}>
        <div className="section__title">
          <h2 className="section__description">Lessons</h2>
          <h3 className="section__header">A clear plan, real progress, and enjoyable sessions.</h3>
        </div>

        <div className="features">
          <img src={PLACEHOLDER_IMAGE} data-src={GUITAR_IMAGE_SRC} alt="Music lessons" className="features__img lazy-img" />

          <div className="features__feature">
            <div className="features__icon">
              <span>🎸</span>
            </div>
            <h5 className="features__header">Guitar Lessons</h5>
            <p>
              Learn chords, rhythm, picking, fingerstyle, strumming patterns, and songs you actually want to play.
              Perfect for beginners and players who want structure and accountability.
            </p>
          </div>

          <div className="features__feature">
            <div className="features__icon">
              <span>🎹</span>
            </div>
            <h5 className="features__header">Piano Lessons</h5>
            <p>
              Build strong foundations: technique, chords, scales, reading (optional), and playing by ear. We&apos;ll
              focus on musicality - not just "pressing keys".
            </p>
          </div>

          <img src={PLACEHOLDER_IMAGE} data-src={PIANO_IMAGE_SRC} alt="Online lessons" className="features__img lazy-img" />

          <img src={PLACEHOLDER_IMAGE} data-src={MUSIC_THEORY_IMAGE_SRC} alt="Progress" className="features__img lazy-img" />

          <div className="features__feature">
            <div className="features__icon">
              <span>🧠</span>
            </div>
            <h5 className="features__header">Music Theory (Made Simple)</h5>
            <p>
              Learn the "why" behind music: chords, progressions, harmony, and how songs work - explained clearly.
              Great for improvisation, songwriting, and playing with confidence.
            </p>
          </div>
        </div>
      </section>

      <section className="section" id="section--2" ref={section2Ref}>
        <div className="section__title">
          <h2 className="section__description">About</h2>
          <h3 className="section__header">
            Qualified teacher. Working musician. Friendly and structured coaching.
          </h3>
        </div>

        <div className="operations">
          <div className="operations__tab-container">
            <button
              className={`btn operations__tab operations__tab--1 ${activeTab === 1 ? 'operations__tab--active' : ''}`}
              data-tab="1"
              onClick={() => setActiveTab(1)}
            >
              <span>01</span>Teaching style
            </button>

            <button
              className={`btn operations__tab operations__tab--2 ${activeTab === 2 ? 'operations__tab--active' : ''}`}
              data-tab="2"
              onClick={() => setActiveTab(2)}
            >
              <span>02</span>What you&apos;ll learn
            </button>

            <button
              className={`btn operations__tab operations__tab--3 ${activeTab === 3 ? 'operations__tab--active' : ''}`}
              data-tab="3"
              onClick={() => setActiveTab(3)}
            >
              <span>03</span>Who it&apos;s for
            </button>
          </div>

          <div className={`operations__content operations__content--1 ${activeTab === 1 ? 'operations__content--active' : ''}`}>
            <div className="operations__icon operations__icon--1">
              <span>✅</span>
            </div>
            <h5 className="operations__header">Supportive, clear, and goal-focused</h5>
            <p>
              Every lesson is structured and tailored to you. We&apos;ll set goals, track progress, and keep things
              enjoyable. You&apos;ll always know what to practise and why it matters.
            </p>
          </div>

          <div className={`operations__content operations__content--2 ${activeTab === 2 ? 'operations__content--active' : ''}`}>
            <div className="operations__icon operations__icon--2">
              <span>🎶</span>
            </div>
            <h5 className="operations__header">Songs, technique, and confidence</h5>
            <p>
              You&apos;ll build technique and musical understanding through real songs. We can include ear training,
              improvisation, worship/gospel styles, pop, R&amp;B, afrobeats, or your preferred genre.
            </p>
          </div>

          <div className={`operations__content operations__content--3 ${activeTab === 3 ? 'operations__content--active' : ''}`}>
            <div className="operations__icon operations__icon--3">
              <span>👤</span>
            </div>
            <h5 className="operations__header">Beginners to intermediate</h5>
            <p>
              Perfect if you&apos;re starting from scratch, returning after a break, or you&apos;ve hit a plateau. Adults and
              teens welcome - online or in-person (London).
            </p>
          </div>
        </div>
      </section>

      <section className="section" id="section--3" ref={section3Ref}>
        <div className="section__title section__title--testimonials">
          <h2 className="section__description">Reviews</h2>
          <h3 className="section__header">What students say about lessons</h3>
        </div>

        <div className="slider">
          {slides.map((slide, index) => (
            <div
              className="slide"
              key={slide.header}
              style={{ transform: `translateX(${100 * (index - currentSlide)}%)` }}
            >
              <div className="testimonial">
                <h5 className="testimonial__header">{slide.header}</h5>
                <blockquote className="testimonial__text">{slide.text}</blockquote>
                <address className="testimonial__author">
                  <img src={LOGO_SRC} alt="Student" className="testimonial__photo" />
                  <h6 className="testimonial__name">{slide.name}</h6>
                  <p className="testimonial__location">{slide.location}</p>
                </address>
              </div>
            </div>
          ))}

          <button className="slider__btn slider__btn--left" onClick={prevSlide} aria-label="Previous review">
            &larr;
          </button>
          <button className="slider__btn slider__btn--right" onClick={nextSlide} aria-label="Next review">
            &rarr;
          </button>

          <div className="dots">
            {slides.map((_, index) => (
              <button
                key={`dot-${index}`}
                className={`dots__dot ${index === currentSlide ? 'dots__dot--active' : ''}`}
                data-slide={index}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--sign-up">
        <div className="section__title">
          <h3 className="section__header">Ready to start? Book a lesson and begin making real progress.</h3>
        </div>
        <button className="btn btn--show-modal" onClick={openModal}>
          Book a lesson
        </button>
      </section>

      <footer className="footer">
        <ul className="footer__nav">
          <li className="footer__item">
            <a className="footer__link" href="#section--1" onClick={(event) => scrollToSection(section1Ref, event)}>
              Lessons
            </a>
          </li>
          <li className="footer__item">
            <a className="footer__link" href="#section--2" onClick={(event) => scrollToSection(section2Ref, event)}>
              About
            </a>
          </li>
          <li className="footer__item">
            <a className="footer__link" href="#section--3" onClick={(event) => scrollToSection(section3Ref, event)}>
              Reviews
            </a>
          </li>
          <li className="footer__item">
            <a className="footer__link btn--show-modal" href="#" onClick={openModal}>
              Book
            </a>
          </li>
        </ul>

        <p className="footer__copyright">
          &copy; <span id="year">{currentYear}</span> -{' '}
          <a className="footer__link" target="_blank" rel="noreferrer" href="https://jjai.dev">
            JJ
          </a>
          .
        </p>
      </footer>

      <div className={`modal ${isModalOpen ? '' : 'hidden'}`} role="dialog" aria-modal="true" aria-hidden={!isModalOpen}>
        <button className="btn--close-modal" onClick={closeModal} aria-label="Close booking modal">
          &times;
        </button>

        <h2 className="modal__header">
          Book a lesson <br />
          in just <span className="highlight">10 seconds</span>
        </h2>

        <form className="modal__form" id="bookingForm" action={FORMSPREE_URL} method="POST" onSubmit={handleFormSubmit} ref={formRef}>
          <label htmlFor="firstName">First Name</label>
          <input id="firstName" type="text" name="firstName" required />

          <label htmlFor="lastName">Last Name</label>
          <input id="lastName" type="text" name="lastName" required />

          <label htmlFor="email">Email Address</label>
          <input id="email" type="email" name="email" required />

          <label htmlFor="instrument">Instrument</label>
          <select id="instrument" name="instrument" required defaultValue="">
            <option value="" disabled>
              Select an instrument
            </option>
            <option value="Guitar">Guitar</option>
            <option value="Piano">Piano</option>
          </select>

          <label htmlFor="lessonType">Lesson type</label>
          <select id="lessonType" name="lessonType" required defaultValue="">
            <option value="" disabled>
              Select lesson type
            </option>
            <option value="In-person (London)">In-person (London)</option>
            <option value="Online">Online</option>
          </select>

          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            rows="4"
            placeholder="Tell me your level (beginner/intermediate), what you want to learn, and your availability..."
            required
          />

          <input type="hidden" name="_subject" value="New lesson booking enquiry" />
          <input type="text" name="_gotcha" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

          <button className="btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Next step ->'}
          </button>
        </form>
      </div>

      <div className={`overlay ${isModalOpen ? '' : 'hidden'}`} onClick={closeModal} aria-hidden={!isModalOpen} />

      {toastMessage ? <div className="success-message">{toastMessage}</div> : null}
    </>
  );
}

export default App;
