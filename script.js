/* ============================================
   WILL HEALTHCARE — JAVASCRIPT
   Handles: Navigation, Particles, Animations,
   Product Filters, Form Tabs, Scroll Effects
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============ NAVBAR SCROLL ============
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        // Navbar background
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active nav link
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // ============ MOBILE NAV TOGGLE ============
    const navToggle = document.getElementById('navToggle');
    const navLinksContainer = document.getElementById('navLinks');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinksContainer.classList.toggle('open');
    });

    // Close mobile nav on link click
    navLinksContainer.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinksContainer.classList.remove('open');
        });
    });

    // ============ HERO PARTICLES ============
    const canvas = document.getElementById('heroParticles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId;

        function resizeCanvas() {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.5 + 0.1;
                this.hue = Math.random() > 0.5 ? 270 : 186; // Purple or Cyan
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${this.hue}, 80%, 60%, ${this.opacity})`;
                ctx.fill();
            }
        }

        // Create particles
        const particleCount = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 120) {
                        const opacity = (1 - distance / 120) * 0.15;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(124, 58, 237, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            drawConnections();
            animationId = requestAnimationFrame(animate);
        }

        animate();

        // Pause animation when hero is not visible
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!animationId) animate();
                } else {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
            });
        }, { threshold: 0.1 });

        heroObserver.observe(document.querySelector('.hero'));
    }

    // ============ COUNTER ANIMATION ============
    const statNumbers = document.querySelectorAll('.hero-stat-number[data-target]');

    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-target'));
        const duration = 2000;
        const start = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out quad
            const eased = 1 - (1 - progress) * (1 - progress);
            const current = Math.floor(eased * target);

            el.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target.toLocaleString();
            }
        }

        requestAnimationFrame(update);
    }

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                if (!el.dataset.animated) {
                    el.dataset.animated = 'true';
                    animateCounter(el);
                }
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(num => counterObserver.observe(num));

    // ============ SCROLL REVEAL ANIMATIONS ============
    const revealElements = document.querySelectorAll(
        '.eco-card, .why-card, .timeline-item, .product-card, .process-step, .mfg-dosage-card'
    );

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, index * 60);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => {
        el.classList.add('scroll-reveal');
        revealObserver.observe(el);
    });

    // ============ PRODUCT FILTERING ============
    const productTabs = document.querySelectorAll('.product-tab');
    const productCards = document.querySelectorAll('.product-card');
    const productSearch = document.getElementById('productSearch');

    productTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            productTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const category = tab.dataset.category;
            filterProducts(category, productSearch.value);
        });
    });

    if (productSearch) {
        productSearch.addEventListener('input', () => {
            const activeTab = document.querySelector('.product-tab.active');
            const category = activeTab ? activeTab.dataset.category : 'all';
            filterProducts(category, productSearch.value);
        });
    }

    function filterProducts(category, searchText) {
        const search = searchText.toLowerCase().trim();

        productCards.forEach(card => {
            const cardCategory = card.dataset.category || '';
            const categories = cardCategory.split(' ');
            const name = card.querySelector('.product-name').textContent.toLowerCase();
            const composition = card.querySelector('.product-composition').textContent.toLowerCase();

            const matchesCategory = category === 'all' || categories.includes(category);
            const matchesSearch = !search || name.includes(search) || composition.includes(search);

            if (matchesCategory && matchesSearch) {
                card.style.display = '';
                card.style.animation = 'fadeInUp 0.4s ease forwards';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // ============ PRODUCT ENQUIRY BUTTONS ============
    const enquireButtons = document.querySelectorAll('.btn-product-enquire');
    enquireButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const prodName = btn.dataset.product || '';
            const prodComp = btn.dataset.composition || '';

            // Switch to PCD form tab
            const pcdTab = document.querySelector('.form-tab[data-form="pcd"]');
            if (pcdTab) pcdTab.click();

            // Prefill message
            const msgField = document.getElementById('pcd-message');
            if (msgField) {
                msgField.value = `Hello Will Healthcare Team, I am interested in Monopoly PCD Franchise / Distribution rights for "${prodName}" (${prodComp}). Please share franchise details, pricing, and minimum order quantity.`;
            }

            // Scroll to contact section
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => {
                    const nameField = document.getElementById('pcd-name');
                    if (nameField) nameField.focus();
                }, 700);
            }
        });
    });

    // ============ CONTACT FORM TABS ============
    const formTabs = document.querySelectorAll('.form-tab');
    const pcdForm = document.getElementById('pcdForm');
    const thirdpartyForm = document.getElementById('thirdpartyForm');

    formTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            formTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const formType = tab.dataset.form;
            if (formType === 'pcd') {
                pcdForm.classList.remove('hidden');
                thirdpartyForm.classList.add('hidden');
            } else {
                pcdForm.classList.add('hidden');
                thirdpartyForm.classList.remove('hidden');
            }
        });
    });

    // ============ FORM SUBMISSION ============
    const forms = document.querySelectorAll('.contact-form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            // Show success animation
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>✅ Inquiry Submitted Successfully!</span>';
            submitBtn.style.background = 'linear-gradient(135deg, #059669, #10B981)';
            submitBtn.disabled = true;

            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
                form.reset();
            }, 3000);

            console.log('Form submitted:', data);
        });
    });

    // ============ SMOOTH SCROLL FOR ALL ANCHOR LINKS ============
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ============ PARALLAX GLOW EFFECT ============
    const glows = document.querySelectorAll('.hero-glow');
    window.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 30;
        const y = (e.clientY / window.innerHeight - 0.5) * 30;

        glows.forEach((glow, i) => {
            const factor = i === 0 ? 1 : -1;
            glow.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
        });
    });
});
