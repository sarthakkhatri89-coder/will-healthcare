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

    // ============ FLOATING PHARMACEUTICAL ANIMATION (CAPSULES, TABLETS, OINTMENTS) ============
    const canvas = document.getElementById('heroParticles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let elements = [];
        let animationId;
        const types = ['capsule', 'tablet', 'ointment', 'droplet'];

        function resizeCanvas() {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class PharmaParticle {
            constructor() {
                this.reset(true);
            }

            reset(initial = false) {
                this.type = types[Math.floor(Math.random() * types.length)];
                this.x = Math.random() * canvas.width;
                this.y = initial ? Math.random() * canvas.height : canvas.height + 70;
                this.scale = Math.random() * 0.45 + 0.65; // High-visibility large float
                this.speedY = -(Math.random() * 0.45 + 0.3); // Upward drift
                this.speedX = (Math.random() - 0.5) * 0.35;
                this.rotation = Math.random() * Math.PI * 2;
                this.rotSpeed = (Math.random() - 0.5) * 0.008;
                this.opacity = Math.random() * 0.35 + 0.28;
                this.wave = Math.random() * Math.PI * 2;
                this.waveSpeed = Math.random() * 0.02 + 0.008;
            }

            update() {
                this.wave += this.waveSpeed;
                this.x += this.speedX + Math.sin(this.wave) * 0.35;
                this.y += this.speedY;
                this.rotation += this.rotSpeed;

                if (this.y < -90 || this.x < -90 || this.x > canvas.width + 90) {
                    this.reset(false);
                }
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                ctx.scale(this.scale, this.scale);
                ctx.globalAlpha = this.opacity;

                if (this.type === 'capsule') {
                    this.drawCapsule();
                } else if (this.type === 'tablet') {
                    this.drawTablet();
                } else if (this.type === 'ointment') {
                    this.drawOintment();
                } else if (this.type === 'droplet') {
                    this.drawDroplet();
                }

                ctx.restore();
            }

            drawCapsule() {
                const w = 48;
                const h = 24;
                const r = h / 2;

                ctx.shadowColor = 'rgba(109, 40, 217, 0.25)';
                ctx.shadowBlur = 10;

                // Left half (Purple)
                ctx.beginPath();
                ctx.arc(-w/4, 0, r, Math.PI / 2, Math.PI * 1.5);
                ctx.lineTo(0, -r);
                ctx.lineTo(0, r);
                ctx.closePath();
                const gradLeft = ctx.createLinearGradient(-w/2, -r, 0, r);
                gradLeft.addColorStop(0, '#7C3AED');
                gradLeft.addColorStop(1, '#9333EA');
                ctx.fillStyle = gradLeft;
                ctx.fill();

                // Right half (Cyan)
                ctx.beginPath();
                ctx.arc(w/4, 0, r, Math.PI * 1.5, Math.PI / 2);
                ctx.lineTo(0, r);
                ctx.lineTo(0, -r);
                ctx.closePath();
                const gradRight = ctx.createLinearGradient(0, -r, w/2, r);
                gradRight.addColorStop(0, '#06B6D4');
                gradRight.addColorStop(1, '#0891B2');
                ctx.fillStyle = gradRight;
                ctx.fill();

                // Dividing seam
                ctx.shadowBlur = 0;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.moveTo(0, -r);
                ctx.lineTo(0, r);
                ctx.stroke();

                // Gloss highlight
                ctx.beginPath();
                ctx.ellipse(-w/6, -r * 0.45, w/3.2, r * 0.22, 0, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
                ctx.fill();
            }

            drawTablet() {
                const r = 22;
                ctx.shadowColor = 'rgba(14, 116, 144, 0.2)';
                ctx.shadowBlur = 10;

                const gradPill = ctx.createRadialGradient(-r*0.3, -r*0.3, 2, 0, 0, r);
                gradPill.addColorStop(0, '#FFFFFF');
                gradPill.addColorStop(0.7, '#F1F5F9');
                gradPill.addColorStop(1, '#CBD5E1');

                ctx.beginPath();
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.fillStyle = gradPill;
                ctx.fill();

                ctx.shadowBlur = 0;
                ctx.strokeStyle = '#E2E8F0';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Debossed center score line
                ctx.beginPath();
                ctx.moveTo(0, -r * 0.72);
                ctx.lineTo(0, r * 0.72);
                ctx.strokeStyle = '#94A3B8';
                ctx.lineWidth = 1.8;
                ctx.stroke();

                // Specular rim
                ctx.beginPath();
                ctx.arc(0, 0, r * 0.85, Math.PI * 1.1, Math.PI * 1.8);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            drawOintment() {
                const len = 50;
                const bodyW = 20;

                ctx.shadowColor = 'rgba(109, 40, 217, 0.18)';
                ctx.shadowBlur = 10;

                // Tube body
                ctx.beginPath();
                ctx.moveTo(-len/2, -bodyW/2);
                ctx.lineTo(len/4, -bodyW * 0.45);
                ctx.lineTo(len/3, -bodyW * 0.25);
                ctx.lineTo(len/3, bodyW * 0.25);
                ctx.lineTo(len/4, bodyW * 0.45);
                ctx.lineTo(-len/2, bodyW/2);
                ctx.closePath();

                const gradTube = ctx.createLinearGradient(-len/2, 0, len/4, 0);
                gradTube.addColorStop(0, '#EDE9FE');
                gradTube.addColorStop(0.5, '#FFFFFF');
                gradTube.addColorStop(1, '#DDD6FE');
                ctx.fillStyle = gradTube;
                ctx.fill();
                ctx.strokeStyle = '#C4B5FD';
                ctx.lineWidth = 1.2;
                ctx.stroke();

                // Crimped tail (left)
                ctx.beginPath();
                ctx.rect(-len/2 - 4, -bodyW/2, 4, bodyW);
                ctx.fillStyle = '#A78BFA';
                ctx.fill();

                // Brand color band on tube
                ctx.beginPath();
                ctx.rect(-len/5, -bodyW * 0.42, 10, bodyW * 0.84);
                ctx.fillStyle = '#6D28D9';
                ctx.fill();

                // Cap (right)
                ctx.shadowBlur = 0;
                ctx.beginPath();
                ctx.rect(len/3, -bodyW * 0.35, 10, bodyW * 0.7);
                ctx.fillStyle = '#0891B2';
                ctx.fill();
                ctx.strokeStyle = '#06B6D4';
                ctx.lineWidth = 1;
                ctx.stroke();

                // Specular highlight
                ctx.beginPath();
                ctx.moveTo(-len/3, -bodyW * 0.25);
                ctx.lineTo(len/5, -bodyW * 0.2);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            drawDroplet() {
                const r = 16;
                ctx.shadowColor = 'rgba(6, 182, 212, 0.25)';
                ctx.shadowBlur = 10;

                ctx.beginPath();
                ctx.moveTo(0, -r * 1.5);
                ctx.bezierCurveTo(r * 1.2, -r * 0.3, r, r, 0, r);
                ctx.bezierCurveTo(-r, r, -r * 1.2, -r * 0.3, 0, -r * 1.5);
                ctx.closePath();

                const gradDrop = ctx.createRadialGradient(-r*0.3, -r*0.3, 2, 0, 0, r);
                gradDrop.addColorStop(0, '#E0F2FE');
                gradDrop.addColorStop(0.5, '#38BDF8');
                gradDrop.addColorStop(1, '#0284C7');
                ctx.fillStyle = gradDrop;
                ctx.fill();

                ctx.shadowBlur = 0;
                ctx.beginPath();
                ctx.arc(-r * 0.3, -r * 0.4, r * 0.28, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.fill();
            }
        }

        // Create initial floating pharma elements
        const count = Math.min(32, Math.max(16, Math.floor((canvas.width * canvas.height) / 38000)));
        for (let i = 0; i < count; i++) {
            elements.push(new PharmaParticle());
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            elements.forEach(el => {
                el.update();
                el.draw();
            });

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
        '.eco-card, .why-card, .timeline-item, .product-card, .process-step, .mfg-dosage-card, .segment-card, .dual-block, .f-benefit-item'
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

    // ============ THIRD-PARTY MANUFACTURING SEGMENT QUOTE BUTTONS ============
    const segmentQuoteButtons = document.querySelectorAll('.btn-segment-quote');
    segmentQuoteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetDosage = btn.dataset.targetDosage || '';

            // Ensure third-party form is active
            const tpTab = document.querySelector('.form-tab[data-form="thirdparty"]');
            if (tpTab) tpTab.click();

            // Select dosage in dropdown if present
            const dosageSelect = document.getElementById('tp-dosage');
            if (dosageSelect && targetDosage) {
                for (let option of dosageSelect.options) {
                    if (option.value.toLowerCase().includes(targetDosage.toLowerCase().slice(0, 5)) ||
                        targetDosage.toLowerCase().includes(option.value.toLowerCase().slice(0, 5))) {
                        dosageSelect.value = option.value;
                        break;
                    }
                }
            }

            // Prefill message hint if empty
            const tpMsg = document.getElementById('tp-message');
            if (tpMsg && !tpMsg.value) {
                tpMsg.value = `Inquiring for Contract Manufacturing in: ${targetDosage}. Looking for pricing, MOQ, and formulation options.`;
            }

            // Scroll to contact
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => {
                    const nameField = document.getElementById('tp-name');
                    if (nameField) nameField.focus();
                }, 700);
            }
        });
    });

    // Nav and Hero Mfg CTA buttons
    const navQuoteBtn = document.getElementById('navQuoteBtn');
    const heroMfgCta = document.getElementById('heroMfgCta');
    [navQuoteBtn, heroMfgCta].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', (e) => {
                const tpTab = document.querySelector('.form-tab[data-form="thirdparty"]');
                if (tpTab) tpTab.click();
            });
        }
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

    // ============ CATALOG DOWNLOAD MODAL (LEAD GATE) ============
    const openCatalogBtn = document.getElementById('openCatalogBtn');
    const catalogModal = document.getElementById('catalogModal');
    const closeCatalogModalBtn = document.getElementById('closeCatalogModalBtn');
    const catalogDownloadForm = document.getElementById('catalogDownloadForm');
    const catalogDownloadSuccess = document.getElementById('catalogDownloadSuccess');
    const successLeadName = document.getElementById('successLeadName');

    if (openCatalogBtn && catalogModal) {
        openCatalogBtn.addEventListener('click', () => {
            catalogModal.classList.add('active');
            catalogModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                const firstInput = catalogModal.querySelector('input');
                if (firstInput) firstInput.focus();
            }, 300);
        });

        function closeModal() {
            catalogModal.classList.remove('active');
            catalogModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        if (closeCatalogModalBtn) {
            closeCatalogModalBtn.addEventListener('click', closeModal);
        }

        catalogModal.addEventListener('click', (e) => {
            if (e.target === catalogModal) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && catalogModal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    if (catalogDownloadForm) {
        catalogDownloadForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(catalogDownloadForm);
            const name = formData.get('name') || 'Partner';
            const phone = formData.get('phone') || '';
            const email = formData.get('email') || '';
            const location = formData.get('location') || '';
            const interest = formData.get('interest') || '';

            // Store lead in localStorage for persistence
            try {
                const leads = JSON.parse(localStorage.getItem('will_catalog_leads') || '[]');
                leads.push({ name, phone, email, location, interest, timestamp: new Date().toISOString() });
                localStorage.setItem('will_catalog_leads', JSON.stringify(leads));
            } catch (err) {
                console.log(err);
            }

            // Update UI to success state
            if (successLeadName) successLeadName.textContent = name;
            catalogDownloadForm.style.display = 'none';
            if (catalogDownloadSuccess) {
                catalogDownloadSuccess.classList.remove('hidden');
                catalogDownloadSuccess.style.display = 'block';
            }

            // Trigger actual PDF download automatically
            const downloadTrigger = document.createElement('a');
            downloadTrigger.href = 'Will_Healthcare_Product_Catalog.pdf';
            downloadTrigger.download = 'Will_Healthcare_Product_Catalog.pdf';
            document.body.appendChild(downloadTrigger);
            downloadTrigger.click();
            document.body.removeChild(downloadTrigger);
        });
    }
});
