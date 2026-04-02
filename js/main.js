/* =============================================
   RICARDO FITNESS - MAIN JS
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

    // ---- PRELOADER ----
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');
        }, 1200);
    });
    // Fallback
    setTimeout(() => preloader.classList.add('hidden'), 3000);

    // ---- NAVBAR SCROLL ----
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    });

    // ---- MOBILE NAV ----
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });
    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // ---- SMOOTH SCROLL ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ---- STAT COUNTER ANIMATION ----
    const statNumbers = document.querySelectorAll('.stat-number');
    let statsCounted = false;

    function animateStats() {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            const duration = 2000;
            const startTime = performance.now();
            
            function updateCount(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                stat.textContent = Math.floor(target * eased);
                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                } else {
                    stat.textContent = target;
                }
            }
            requestAnimationFrame(updateCount);
        });
    }

    // ---- FAQ ACCORDION ----
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const wasActive = item.classList.contains('active');
            // Close all
            document.querySelectorAll('.faq-item.active').forEach(i => i.classList.remove('active'));
            // Open clicked (if wasn't open)
            if (!wasActive) item.classList.add('active');
        });
    });

    // ---- STICKY MOBILE CTA ----
    const stickyCta = document.getElementById('stickyCta');
    if (stickyCta) {
        let stickyShown = false;
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY > window.innerHeight * 0.8;
            // Hide near footer
            const footer = document.querySelector('footer');
            const nearFooter = footer && window.scrollY + window.innerHeight > footer.offsetTop - 50;
            if (scrolled && !nearFooter && !stickyShown) {
                stickyCta.classList.add('visible');
                stickyShown = true;
            } else if (scrolled && !nearFooter) {
                stickyCta.classList.add('visible');
            } else if (nearFooter) {
                stickyCta.classList.remove('visible');
            } else if (!scrolled) {
                stickyCta.classList.remove('visible');
                stickyShown = false;
            }
        });
    }

    // ---- EXIT INTENT POPUP ----
    const exitPopup = document.getElementById('exitPopup');
    const exitClose = document.getElementById('exitClose');
    const exitBtn = document.getElementById('exitBtn');
    let exitShown = false;

    // Desktop: mouse leaves viewport
    document.addEventListener('mouseleave', (e) => {
        if (e.clientY < 5 && !exitShown && !sessionStorage.getItem('exitShown')) {
            exitPopup.classList.add('active');
            exitShown = true;
            sessionStorage.setItem('exitShown', '1');
        }
    });

    // Mobile: back button / scroll up fast
    let lastScrollY = 0;
    let scrollUpCount = 0;
    window.addEventListener('scroll', () => {
        if (window.scrollY < lastScrollY - 100) {
            scrollUpCount++;
            if (scrollUpCount > 3 && !exitShown && !sessionStorage.getItem('exitShown') && window.scrollY > 600) {
                exitPopup.classList.add('active');
                exitShown = true;
                sessionStorage.setItem('exitShown', '1');
            }
        } else {
            scrollUpCount = 0;
        }
        lastScrollY = window.scrollY;
    });

    if (exitClose) {
        exitClose.addEventListener('click', () => exitPopup.classList.remove('active'));
    }
    if (exitPopup) {
        exitPopup.addEventListener('click', (e) => {
            if (e.target === exitPopup) exitPopup.classList.remove('active');
        });
    }

    if (exitBtn) {
        exitBtn.addEventListener('click', async () => {
            const name = document.getElementById('exitName').value.trim();
            const email = document.getElementById('exitEmail').value.trim();
            if (!name || !email || !isValidEmail(email)) {
                shakeButton(exitBtn);
                return;
            }
            exitBtn.textContent = 'Wird gespeichert...';
            exitBtn.disabled = true;
            await addSubscriber(email, name, LISTS.waitlist);
            document.querySelector('.exit-form').style.display = 'none';
            document.getElementById('exitSuccess').style.display = 'block';
            saveSubmission('waitlist', { name, email, date: new Date().toISOString() });
            setTimeout(() => exitPopup.classList.remove('active'), 2500);
        });
    }

    // ---- SCROLL REVEAL ----
    const revealElements = document.querySelectorAll(
        '.section-tag, .section-title, .section-desc, .pillar-card, .testimonial-card, ' +
        '.about-text-col, .about-image-col, .coaching-text, .coaching-visual, ' +
        '.challenge-content, .giveaway-card, .value-item, .coaching-card, ' +
        '.results-content, .cta-inner'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 80);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => observer.observe(el));

    // Stats observer
    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !statsCounted) {
                    statsCounted = true;
                    animateStats();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        statsObserver.observe(statsSection);
    }

    // ---- BREVO CONFIG ----
    // ⚠️ HIER DEINE BREVO LISTEN-IDs EINTRAGEN:
    // ---- BREVO LISTEN ----
    // ⚠️ Trage hier deine Brevo Listen-IDs ein:
    const LISTS = {
        waitlist:  'WAITLIST_ID',   // Warteliste Challenge
        giveaway:  'GIVEAWAY_ID',   // Gewinnspiel
        coaching:  'COACHING_ID'    // 1:1 Coaching
    };

    async function addSubscriber(email, name, listId, fields = {}) {
        const payload = {
            email: email,
            listId: listId,
            fields: { name: name, ...fields }
        };

        console.log('[Subscribe] Sending:', email, '→ list', listId);

        // 1) Versuche Netlify Function (Production)
        try {
            const res = await fetch('/.netlify/functions/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            console.log('[Subscribe] Netlify Function:', res.status, data);
            if (res.ok) return true;
        } catch (e) {
            console.warn('[Subscribe] Netlify Function not available');
        }

        // 2) Fallback: Direkt an Brevo
        try {
            const res = await fetch('https://api.brevo.com/v3/contacts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': 'BREVO_KEY_PLACEHOLDER'
                },
                body: JSON.stringify({
                    email: payload.email,
                    attributes: {
                        VORNAME: name,
                        ...(fields.last_name ? { NACHNAME: fields.last_name } : {}),
                        ...(fields.phone ? { SMS: fields.phone } : {}),
                        ...(fields.company ? { ZIEL: fields.company } : {}),
                        ...(fields.state ? { NACHRICHT: fields.state } : {}),
                        ...(fields.tier ? { ERFAHRUNG: fields.tier } : {})
                    },
                    listIds: [parseInt(listId)],
                    updateEnabled: true
                })
            });
            const data = await res.json();
            console.log('[Subscribe] Direct API:', res.status, data);
            return res.ok || res.status === 201 || res.status === 204;
        } catch (err) {
            console.error('[Subscribe] Direct API error:', err.message || err);
            return false;
        }
    }

    // ---- COACHING MODAL ----
    const coachingModal = document.getElementById('coachingModal');
    const openBtns = document.querySelectorAll('#openCoachingModal, .openCoachingModal');
    const closeModalBtn = document.getElementById('closeCoachingModal');

    openBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            coachingModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeModal() {
        coachingModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    coachingModal.addEventListener('click', (e) => {
        if (e.target === coachingModal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && coachingModal.classList.contains('active')) closeModal();
    });

    // Coaching Form Submit
    const coachingBtn = document.getElementById('coachingBtn');
    const coachingForm = document.getElementById('coachingForm');
    const coachingSuccess = document.getElementById('coachingSuccess');

    if (coachingBtn) {
        coachingBtn.addEventListener('click', async () => {
            const firstName = document.getElementById('cName').value.trim();
            const lastName = document.getElementById('cLastName').value.trim();
            const email = document.getElementById('cEmail').value.trim();
            const consent = document.getElementById('cConsent').checked;

            if (!firstName || !lastName || !email || !consent) {
                shakeButton(coachingBtn);
                return;
            }
            if (!isValidEmail(email)) {
                shakeButton(coachingBtn);
                return;
            }

            coachingBtn.querySelector('.btn-text').style.display = 'none';
            coachingBtn.querySelector('.btn-loading').style.display = 'inline';
            coachingBtn.disabled = true;

            const phone = document.getElementById('cPhone').value.trim();
            const goal = document.getElementById('cGoal').value;
            const experience = document.getElementById('cExperience').value;
            const message = document.getElementById('cMessage').value.trim();

            // Brevo senden
            await addSubscriber(email, firstName, LISTS.coaching, {
                last_name: lastName,
                phone: phone,
                company: goal || '',
                state: message || '',
                tier: experience || ''
            });

            // Lokal speichern als Backup
            saveSubmission('coaching', {
                firstName, lastName, email, phone, goal, experience, message,
                date: new Date().toISOString()
            });

            coachingForm.style.display = 'none';
            coachingSuccess.style.display = 'block';
            coachingSuccess.style.animation = 'fadeUp 0.5s ease forwards';
        });
    }

    // ---- WAITLIST COUNTER (LIVE) ----
    const waitlistCountEl = document.getElementById('waitlistCount');

    async function loadWaitlistCount() {
        if (!waitlistCountEl) return;
        try {
            const res = await fetch('/.netlify/functions/waitlist-count');
            if (res.ok) {
                const data = await res.json();
                if (data.count !== undefined) {
                    animateCount(waitlistCountEl, data.count);
                    return;
                }
            }
        } catch (e) {
            console.warn('[Count] Netlify not available');
        }
        // Fallback: animate the static number
        const target = parseInt(waitlistCountEl.textContent) || 247;
        animateCount(waitlistCountEl, target);
    }

    function animateCount(el, target) {
        el.textContent = '0';
        const countObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    let current = 0;
                    const duration = 2000;
                    const step = target / (duration / 16);
                    function countUp() {
                        current += step;
                        if (current >= target) {
                            el.textContent = target;
                        } else {
                            el.textContent = Math.floor(current);
                            requestAnimationFrame(countUp);
                        }
                    }
                    countUp();
                    countObserver.disconnect();
                }
            });
        }, { threshold: 0.5 });
        countObserver.observe(el);
    }

    loadWaitlistCount();

    // ---- WAITLIST FORM ----
    const waitlistBtn = document.getElementById('waitlistBtn');
    const waitlistForm = document.getElementById('waitlistForm');
    const waitlistSuccess = document.getElementById('waitlistSuccess');

    if (waitlistBtn) {
        waitlistBtn.addEventListener('click', async () => {
            const name = document.getElementById('waitlistName').value.trim();
            const email = document.getElementById('waitlistEmail').value.trim();

            if (!name || !email) {
                shakeButton(waitlistBtn);
                return;
            }
            if (!isValidEmail(email)) {
                shakeButton(waitlistBtn);
                return;
            }

            // Show loading
            waitlistBtn.querySelector('.btn-text').style.display = 'none';
            waitlistBtn.querySelector('.btn-loading').style.display = 'inline';
            waitlistBtn.disabled = true;

            // Brevo senden
            const success = await addSubscriber(email, name, LISTS.waitlist);
            console.log('[Waitlist] Result:', success);

            waitlistForm.style.display = 'none';
            waitlistSuccess.style.display = 'block';
            waitlistSuccess.style.animation = 'fadeUp 0.5s ease forwards';
                
            // Reload live count
            setTimeout(async () => {
                try {
                    const res = await fetch('/.netlify/functions/waitlist-count');
                    if (res.ok) {
                        const data = await res.json();
                        if (data.count && waitlistCountEl) {
                            waitlistCountEl.textContent = data.count;
                        }
                    }
                } catch(e) {
                    // Fallback increment
                    if (waitlistCountEl) {
                        waitlistCountEl.textContent = parseInt(waitlistCountEl.textContent) + 1;
                    }
                }
            }, 1500);

            saveSubmission('waitlist', { name, email, date: new Date().toISOString() });
        });
    }

    // ---- GIVEAWAY FORM ----
    const giveawayBtn = document.getElementById('giveawayBtn');
    const giveawayForm = document.getElementById('giveawayForm');
    const giveawaySuccess = document.getElementById('giveawaySuccess');

    if (giveawayBtn) {
        giveawayBtn.addEventListener('click', async () => {
            const firstName = document.getElementById('gName').value.trim();
            const lastName = document.getElementById('gLastName').value.trim();
            const email = document.getElementById('gEmail').value.trim();
            const consent = document.getElementById('gConsent').checked;

            if (!firstName || !lastName || !email) {
                shakeButton(giveawayBtn);
                return;
            }
            if (!isValidEmail(email)) {
                shakeButton(giveawayBtn);
                return;
            }
            if (!consent) {
                shakeButton(giveawayBtn);
                return;
            }

            // Show loading
            giveawayBtn.querySelector('.btn-text').style.display = 'none';
            giveawayBtn.querySelector('.btn-loading').style.display = 'inline';
            giveawayBtn.disabled = true;

            const phone = document.getElementById('gPhone').value.trim();
            const goal = document.getElementById('gGoal').value;
            const message = document.getElementById('gMessage').value.trim();

            // Brevo senden
            const success = await addSubscriber(email, firstName, LISTS.giveaway, {
                last_name: lastName,
                phone: phone,
                company: goal || '',
                state: message || ''
            });
            console.log('[Giveaway] Result:', success);

            giveawayForm.style.display = 'none';
            giveawaySuccess.style.display = 'block';
            giveawaySuccess.style.animation = 'fadeUp 0.5s ease forwards';

            saveSubmission('giveaway', {
                firstName, lastName, email, phone, goal, message,
                date: new Date().toISOString()
            });
        });
    }

    // ---- COUNTDOWN TIMER ----
    // Set deadline to 14 days from now
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 14);

    function updateTimer() {
        const now = new Date();
        const diff = deadline - now;

        if (diff <= 0) {
            document.getElementById('timerDays').textContent = '00';
            document.getElementById('timerHours').textContent = '00';
            document.getElementById('timerMins').textContent = '00';
            document.getElementById('timerSecs').textContent = '00';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        const secs = Math.floor((diff / 1000) % 60);

        document.getElementById('timerDays').textContent = pad(days);
        document.getElementById('timerHours').textContent = pad(hours);
        document.getElementById('timerMins').textContent = pad(mins);
        document.getElementById('timerSecs').textContent = pad(secs);
    }

    function pad(num) {
        return num.toString().padStart(2, '0');
    }

    updateTimer();
    setInterval(updateTimer, 1000);

    // ---- TYPEWRITER EFFECT ----
    const typewriterEl = document.getElementById('typewriterText');
    if (typewriterEl) {
        const text = 'ROKK DAS GYM, ROKK DEIN LEBEN!';
        let i = 0;
        setTimeout(() => {
            function typeChar() {
                if (i < text.length) {
                    typewriterEl.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeChar, 120 + Math.random() * 80);
                }
            }
            typeChar();
        }, 1600);
    }

    // ---- CINEMATIC TRAILER ----
    const trailerLines = document.querySelectorAll('.trailer-line, .trailer-divider, .trailer-cta-wrap');
    const trailerFlashes = document.querySelectorAll('.trailer-flash');
    const impactLines = ['.tl-5', '.tl-9', '.tl-11', '.tl-15'];

    const trailerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('tl-visible');

                // Add shake to impact lines
                const el = entry.target;
                impactLines.forEach(sel => {
                    if (el.matches(sel)) {
                        setTimeout(() => el.classList.add('tl-shake'), 100);
                    }
                });

                // Trigger flash on flash elements
                if (el.classList.contains('trailer-flash')) {
                    el.classList.add('flash-active');
                    setTimeout(() => el.classList.remove('flash-active'), 500);
                }

                // Flash on final line
                if (el.classList.contains('tl-final')) {
                    trailerFlashes.forEach(f => {
                        f.classList.add('flash-active');
                        setTimeout(() => f.classList.remove('flash-active'), 500);
                    });
                }

                trailerObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.6, rootMargin: '0px 0px -60px 0px' });

    trailerLines.forEach(line => trailerObserver.observe(line));
    trailerFlashes.forEach(flash => trailerObserver.observe(flash));

    // ---- PILLAR HOVER EFFECTS ----
    document.querySelectorAll('.pillar-card').forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transition = 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
        });
    });

    // ---- UTILITIES ----
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function shakeButton(btn) {
        btn.style.animation = 'shake 0.5s ease';
        setTimeout(() => { btn.style.animation = ''; }, 500);
    }

    function saveSubmission(type, data) {
        try {
            const key = `ricardo_${type}`;
            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            existing.push(data);
            localStorage.setItem(key, JSON.stringify(existing));
            console.log(`[${type}] Saved:`, data);
        } catch (e) {
            console.log('Storage not available, data logged:', data);
        }
    }

    // ---- PARALLAX MICRO-EFFECT ----
    const heroGradient = document.querySelector('.hero-gradient');
    if (heroGradient) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            if (scrolled < window.innerHeight) {
                heroGradient.style.transform = `translateY(${scrolled * 0.3}px) scale(${1 + scrolled * 0.0003})`;
            }
        });
    }

    // ---- ADD SHAKE KEYFRAME ----
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-4px); }
            80% { transform: translateX(4px); }
        }
    `;
    document.head.appendChild(style);
});
