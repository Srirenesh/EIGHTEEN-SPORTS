// Eighteen Sports Storefront UI Logic & Animations

document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    // Global states shared between static and dynamic bindings
    let cartCount = 0;
    let allProducts = [];

    // Initializations
    initPreloader();
    initCustomCursor();
    initMobileGestures();
    initHeroParallax();
    loadStorefrontData();

    // 1. Fetch & Render Dynamic Storefront Configuration
    async function loadStorefrontData() {
        try {
            const response = await fetch('/api/data');
            if (!response.ok) throw new Error('API server unreachable');
            const data = await response.json();
            
            // Update Hero Content
            document.getElementById('heroSubtitle').textContent = data.hero.subtitle;
            document.getElementById('heroTitle').innerHTML = `
                ${data.hero.title_part1}<br>
                ${data.hero.title_part2}<br>
                <span class="text-red">${data.hero.title_part3}</span>
            `;
            document.getElementById('heroDescription').textContent = data.hero.description;
            document.getElementById('heroImg').src = data.hero.image;

            // Render Shop Categories
            const categoryGrid = document.getElementById('categoryGrid');
            if (categoryGrid) {
                categoryGrid.innerHTML = ''; // Clear fallback content
                data.categories.forEach(cat => {
                    const card = document.createElement('div');
                    card.className = 'category-card gsap-reveal-category';
                    card.style.cursor = 'pointer';
                    card.innerHTML = `
                        <div class="category-circle">
                            <img src="${cat.image}" alt="${cat.name}">
                        </div>
                        <h3 class="category-name">${cat.name}</h3>
                        <a href="#" class="view-all-link">View All</a>
                    `;
                    
                    // Filter products grid on category card clicks
                    card.addEventListener('click', (e) => {
                        e.preventDefault();
                        filterProductsByCategory(cat.name);
                    });
                    
                    categoryGrid.appendChild(card);
                });
            }

            // Cache products list globally
            if (data.products) {
                allProducts = data.products;
                renderProducts(allProducts);
            }

            // Bind reset filter button
            const resetFilterBtn = document.getElementById('resetFilterBtn');
            if (resetFilterBtn) {
                resetFilterBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    filterProductsByCategory(null);
                });
            }

            // Render Bottom Promotional Banners
            const promoGrid = document.getElementById('promoGrid');
            if (promoGrid) {
                promoGrid.innerHTML = ''; // Clear fallback content
                data.promos.forEach(promo => {
                    const labelClass = `label-${promo.type}`;
                    const card = document.createElement('div');
                    card.className = 'promo-card gsap-reveal-promo';
                    card.style.backgroundImage = `linear-gradient(to right, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0.3) 100%), url('${promo.image}')`;
                    card.innerHTML = `
                        <div class="promo-content">
                            <span class="promo-label ${labelClass}">${promo.label}</span>
                            <h2 class="promo-heading">${promo.heading.split(' ').slice(0, 2).join(' ')}<br><span class="text-red">${promo.heading.split(' ').slice(2).join(' ')}</span></h2>
                        </div>
                    `;
                    promoGrid.appendChild(card);
                });
            }

            // Bind interactions on dynamically created elements
            bindInteractiveCursorHovers();
            bindDynamicCartClicks();
            init3DTilt();
            
            // Trigger GSAP ScrollTrigger animations after loading DOM
            triggerEntranceAnimations();

        } catch (error) {
            console.warn('API error, using static fallback content. Error:', error.message);
            // Even in fallback mode, bind interactions and animations
            bindInteractiveCursorHovers();
            bindDynamicCartClicks();
            init3DTilt();
            triggerEntranceAnimations();
        }
    }

    // 2. Custom Cursor Follower Logic (Desktop Only)
    function initCustomCursor() {
        if (window.matchMedia('(min-width: 1025px)').matches) {
            const cursor = document.createElement('div');
            cursor.className = 'custom-cursor';
            const follower = document.createElement('div');
            follower.className = 'custom-cursor-follower';
            
            document.body.appendChild(cursor);
            document.body.appendChild(follower);

            // Track mouse movements with GSAP quickTo
            const xToCursor = gsap.quickTo(cursor, "x", {duration: 0.08, ease: "power2.out"});
            const yToCursor = gsap.quickTo(cursor, "y", {duration: 0.08, ease: "power2.out"});
            const xToFollower = gsap.quickTo(follower, "x", {duration: 0.25, ease: "power2.out"});
            const yToFollower = gsap.quickTo(follower, "y", {duration: 0.25, ease: "power2.out"});

            document.addEventListener('mousemove', (e) => {
                xToCursor(e.clientX);
                yToCursor(e.clientY);
                xToFollower(e.clientX);
                yToFollower(e.clientY);
            });
        }
    }

    // Toggle hover class for cursor size expansion
    function bindInteractiveCursorHovers() {
        if (window.matchMedia('(min-width: 1025px)').matches) {
            const interactiveSelectors = 'a, button, .category-card, .promo-card, .logo-badge, .product-card';
            document.querySelectorAll(interactiveSelectors).forEach(el => {
                el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
                el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
            });
        }
    }

    // Bind Add to Cart listeners to both static and dynamic elements
    function bindDynamicCartClicks() {
        const cartBadge = document.getElementById('cartBadge');
        const cartBtn = document.getElementById('cartBtn');
        
        document.querySelectorAll('.btn-add-cart').forEach(btn => {
            // Remove previous listener to avoid double binding
            btn.replaceWith(btn.cloneNode(true));
        });

        // Re-query and bind click
        document.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                cartCount++;
                if (cartBadge) cartBadge.textContent = cartCount;
                if (cartBtn) {
                    gsap.fromTo(cartBtn, { scale: 1 }, { scale: 1.3, duration: 0.15, yoyo: true, repeat: 1 });
                }
            });
        });
    }

    // 3. Pro-Level GSAP ScrollTrigger Animations
    function triggerEntranceAnimations() {
        // Trust Badges Scroll Animation
        gsap.fromTo('.trust-card', 
            { opacity: 0, y: 25 },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.12,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.trust-section',
                    start: 'top 85%'
                }
            }
        );

        // Categories section header line animation
        gsap.fromTo('.title-line',
            { width: 0 },
            {
                width: '100px',
                duration: 1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.category-section',
                    start: 'top 80%'
                }
            }
        );

        // Category items Stagger-Reveal
        gsap.fromTo('.gsap-reveal-category, .category-card',
            { opacity: 0, y: 40 },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.08,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.category-section',
                    start: 'top 75%'
                }
            }
        );

        // Products Catalog Stagger-Reveal
        gsap.fromTo('.gsap-reveal-product, .product-card',
            { opacity: 0, y: 40 },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.08,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.products-section',
                    start: 'top 75%'
                }
            }
        );

        // Banners grid fade-in
        gsap.fromTo('.gsap-reveal-promo, .promo-card',
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.promo-section',
                    start: 'top 80%'
                }
            }
        );
    }

    // 4. Mobile Category Swipe & Grab Gestures
    function initMobileGestures() {
        const slider = document.getElementById('categoryScrollContainer');
        if (!slider) return;

        let isDown = false;
        let startX;
        let scrollLeft;

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.classList.add('dragging');
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });

        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.classList.remove('dragging');
        });

        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.classList.remove('dragging');
        });

        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 1.5; // Scroll speed scaling factor
            slider.scrollLeft = scrollLeft - walk;
        });

        // Touch event mapping for actual mobile gestures
        slider.addEventListener('touchstart', (e) => {
            isDown = true;
            startX = e.touches[0].pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });

        slider.addEventListener('touchend', () => {
            isDown = false;
        });

        slider.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            const x = e.touches[0].pageX - slider.offsetLeft;
            const walk = (x - startX) * 1.2;
            slider.scrollLeft = scrollLeft - walk;
        });
    }

    // 5. General storefront actions (Navigation active links & smooth scroll triggers)
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                navLinks.forEach(item => item.classList.remove('active'));
                link.classList.add('active');
                
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            } else if (href === '#') {
                e.preventDefault();
                navLinks.forEach(item => item.classList.remove('active'));
                link.classList.add('active');
                
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });

    // Search Toggle
    const searchBtn = document.getElementById('searchBtn');
    const searchCloseBtn = document.getElementById('searchCloseBtn');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInput');

    if (searchBtn && searchOverlay) {
        searchBtn.addEventListener('click', () => {
            searchOverlay.classList.add('active');
            setTimeout(() => searchInput.focus(), 150);
        });
    }

    if (searchCloseBtn && searchOverlay) {
        searchCloseBtn.addEventListener('click', () => {
            searchOverlay.classList.remove('active');
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
            searchOverlay.classList.remove('active');
        }
    });

    // Hero Shop Now trigger
    const shopNowBtn = document.getElementById('shopNowBtn');
    if (shopNowBtn) {
        shopNowBtn.addEventListener('click', (e) => {
            e.preventDefault();
            cartCount++;
            const cartBadge = document.getElementById('cartBadge');
            const cartBtn = document.getElementById('cartBtn');
            if (cartBadge) cartBadge.textContent = cartCount;
            if (cartBtn) {
                gsap.fromTo(cartBtn, { scale: 1 }, { scale: 1.3, duration: 0.15, yoyo: true, repeat: 1 });
            }
        });
    }

    // 6. Pro-Level 3D Hero Parallax Hover Animation
    function initHeroParallax() {
        const hero = document.querySelector('.hero-section');
        const img = document.querySelector('.hero-img');
        const glow = document.querySelector('.hero-glow');
        const watermark = document.querySelector('.hero-watermark-img');
        
        if (!hero || !img) return;
        
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;
            
            // Apply GSAP 3D translations and tilts
            gsap.to(img, {
                x: deltaX * 25,
                y: deltaY * 20,
                rotationY: deltaX * 12,
                rotationX: -deltaY * 12,
                duration: 0.8,
                ease: 'power2.out'
            });
            
            if (glow) {
                gsap.to(glow, {
                    x: deltaX * -35,
                    y: deltaY * -30,
                    duration: 0.8,
                    ease: 'power2.out'
                });
            }
            
            if (watermark) {
                gsap.to(watermark, {
                    x: deltaX * -15,
                    y: deltaY * -10,
                    rotation: deltaX * -3,
                    duration: 1.2,
                    ease: 'power2.out'
                });
            }
        });
        
        hero.addEventListener('mouseleave', () => {
            // Smoothly reset components to baseline coordinates
            gsap.to(img, { x: 0, y: 0, rotationX: 0, rotationY: 0, duration: 1.2, ease: 'power3.out' });
            if (glow) gsap.to(glow, { x: 0, y: 0, duration: 1.2, ease: 'power3.out' });
            if (watermark) gsap.to(watermark, { x: 0, y: 0, rotation: 0, duration: 1.5, ease: 'power3.out' });
        });
    }

    // 7. Interactive 3D Card Tilting Hover (Tactile Spring Physics)
    function init3DTilt() {
        // Disable on touch screens for proper scrolling gesture behaviors
        if (window.matchMedia('(hover: hover)').matches) {
            const cards = document.querySelectorAll('.product-card, .promo-card, .category-card');
            
            cards.forEach(card => {
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    
                    // Degree offset calculations (limit rotation to 12 degrees)
                    const rotateX = ((centerY - y) / centerY) * 12;
                    const rotateY = ((x - centerX) / centerX) * 12;
                    
                    card.style.transition = 'transform 0.05s ease-out, box-shadow 0.1s ease-out';
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
                    card.style.boxShadow = `0 15px 35px rgba(198, 26, 35, 0.35)`;
                });
                
                card.addEventListener('mouseleave', () => {
                    // Reset with tactile springy ease-out timing
                    card.style.transition = 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.6s ease-out';
                    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                    card.style.boxShadow = '';
                });
            });
        }
    }

    // 8. Cinematic Intro Video Preloader Controller
    function initPreloader() {
        const preloader = document.getElementById('preloader');
        const video = document.getElementById('preloaderVideo');
        const skipBtn = document.getElementById('skipPreloader');
        
        if (!preloader) return;
        
        let hasDissolved = false;
        
        function fadeOutPreloader() {
            if (hasDissolved) return;
            hasDissolved = true;
            
            // GSAP Dissolve timeline
            const preloaderTl = gsap.timeline({
                onComplete: () => {
                    preloader.remove(); // Release video file memory
                    document.body.classList.remove('preloader-active');
                    
                    // Fire hero content entrance reveals
                    triggerHeroEntranceAnimations();
                }
            });
            
            preloaderTl.to(preloader, {
                opacity: 0,
                scale: 1.05,
                duration: 0.8,
                ease: 'power2.out'
            });
        }
        
        if (video) {
            // Once video ends naturally, dissolve preloader
            video.addEventListener('ended', fadeOutPreloader);
            
            // Handle browsers blocking autoplay (forces playback start or fades after timeout)
            video.play().catch(err => {
                console.warn("Autoplay block detected or video play error:", err);
            });
        }
        
        if (skipBtn) {
            skipBtn.addEventListener('click', (e) => {
                e.preventDefault();
                fadeOutPreloader();
            });
        }
        
        // Safety Fallback Timeout: clear overlay after 6.5s to prevent blank screens
        setTimeout(fadeOutPreloader, 6500);
    }

    // 9. Hero Content Reveal (fired post-dissolve)
    function triggerHeroEntranceAnimations() {
        const heroTl = gsap.timeline();
        heroTl.fromTo('.hero-subtitle', 
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
        );
        heroTl.fromTo('.hero-title', 
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
            '-=0.4'
        );
        heroTl.fromTo('.hero-description', 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
            '-=0.4'
        );
        heroTl.fromTo('.hero-buttons .btn', 
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.15, ease: 'power2.out' },
            '-=0.3'
        );
        heroTl.fromTo('.hero-image-wrapper', 
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, duration: 1.2, ease: 'back.out(1.2)' },
            '-=0.8'
        );
    }

    // 10. Dynamic Product Catalog Renderer
    function renderProducts(productsList) {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;
        
        productsGrid.innerHTML = '';
        productsList.forEach(prod => {
            const formattedPrice = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
            }).format(prod.price);

            const card = document.createElement('div');
            card.className = 'product-card gsap-reveal-product';
            card.innerHTML = `
                <div class="product-img-box">
                    <img src="${prod.image}" alt="${prod.name}">
                </div>
                <div class="product-info">
                    <span class="product-cat">${prod.category}</span>
                    <h3 class="product-title">${prod.name}</h3>
                    <div class="product-price-row">
                        <span class="product-price">${formattedPrice}</span>
                        <button class="btn-add-cart" data-name="${prod.name}">Add to Cart</button>
                    </div>
                </div>
            `;
            productsGrid.appendChild(card);
        });
        
        // Re-bind interactive cursor hovers and dynamic click actions
        bindInteractiveCursorHovers();
        bindDynamicCartClicks();
        init3DTilt();
    }

    // 11. Dynamic Products Filter by Category
    function filterProductsByCategory(categoryName) {
        const titleEl = document.getElementById('productsSectionTitle');
        const resetBtn = document.getElementById('resetFilterBtn');
        const sectionEl = document.getElementById('productsSection');
        
        if (categoryName) {
            // Apply filtering logic
            const filtered = allProducts.filter(p => p.category.toLowerCase() === categoryName.toLowerCase());
            renderProducts(filtered);
            
            if (titleEl) {
                titleEl.innerHTML = `CATEGORY: <span class="text-red">${categoryName}</span>`;
            }
            if (resetBtn) {
                resetBtn.style.display = 'block';
            }
            
            // Scroll smoothly down to the products list
            if (sectionEl) {
                sectionEl.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            // Reset filter
            renderProducts(allProducts);
            if (titleEl) {
                titleEl.innerHTML = 'FEATURED <span class="text-red">PRODUCTS</span>';
            }
            if (resetBtn) {
                resetBtn.style.display = 'none';
            }
        }
        
        // Re-run the reveal stagger transitions for user feedback
        gsap.fromTo('.gsap-reveal-product, .product-card',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
        );
    }
});
