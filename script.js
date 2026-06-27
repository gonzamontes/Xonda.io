document.addEventListener("DOMContentLoaded", () => {

    // 1. Evitamos que el navegador intente recordar el scroll al refrescar
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    // 2. PRELOADER CON "SCROLL FANTASMA"
    window.addEventListener("load", () => {
        const preloader = document.getElementById("preloader");
        if (preloader) {
            document.body.style.overflow = "hidden";
            window.scrollTo(0, document.body.scrollHeight);
            setTimeout(() => {
                window.scrollTo(0, 0);
                setTimeout(() => {
                    preloader.style.opacity = "0";
                    setTimeout(() => { 
                        preloader.style.visibility = "hidden";
                        document.body.style.overflow = ""; 
                    }, 800);
                }, 50);
            }, 600);
        } else {
            document.body.style.overflow = "";
        }
    });
    
    let idx = 0;
    
    // FUNCIÓN DE CONTROL DE CARRUSEL
    const updateCarousel = () => {
        const activePanel = document.querySelector('.service-panel.active');
        if (!activePanel) return;
        
        const cards = activePanel.querySelectorAll('.card-servicio-ancha');
        const total = cards.length;
        if (!total) return;
        
        idx = (idx + total) % total;
        cards.forEach((card, i) => {
            if (i === idx) {
                card.classList.add('is-center');
            } else {
                card.classList.remove('is-center');
            }
        });

        const dotsContainer = document.querySelector('.carousel-indicators');
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            cards.forEach((_, i) => {
                const dot = document.createElement('div');
                dot.className = `indicator-dot ${i === idx ? 'active' : ''}`;
                dot.addEventListener('click', () => { idx = i; updateCarousel(); });
                dotsContainer.appendChild(dot);
            });
        }
    };

    const obs1 = new IntersectionObserver((entries, o) => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('activa'); o.unobserve(e.target); }
    }), { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(el => obs1.observe(el));

    const obs2 = new IntersectionObserver(entries => entries.forEach(e => {
        e.target.style.animationPlayState = e.isIntersecting ? 'running' : 'paused';
    }));
    document.querySelectorAll('.tab-btn-crystal.active, .badge-track').forEach(el => obs2.observe(el));

    setTimeout(updateCarousel, 50);

    const prev = document.querySelector('.carousel-arrow.prev');
    const next = document.querySelector('.carousel-arrow.next');
    if (next) next.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); idx++; updateCarousel(); });
    if (prev) prev.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); idx--; updateCarousel(); });

    // ====================================================================
    // 3. PESTAÑAS PRINCIPALES (Auto-Centrado al hacer clic)
    // ====================================================================
    const tabsContainer = document.querySelector('.servicios-tabs');
    const tabs = document.querySelectorAll('.tab-btn-crystal');
    const panels = document.querySelectorAll('.service-panel');
    
    tabs.forEach(t => t.addEventListener('click', (e) => {
        tabs.forEach(tab => tab.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        
        const btn = e.currentTarget;
        btn.classList.add('active');
        
        if (tabsContainer && window.innerWidth <= 480) {
            const scrollPos = btn.offsetLeft - (tabsContainer.offsetWidth / 2) + (btn.offsetWidth / 2);
            tabsContainer.scrollTo({ left: scrollPos, behavior: 'smooth' });
        }
        
        const targetPanel = document.getElementById(btn.getAttribute('data-target'));
        if (targetPanel) targetPanel.classList.add('active');
        
        idx = 0; 
        obs2.disconnect();
        document.querySelectorAll('.tab-btn-crystal.active, .badge-track').forEach(el => obs2.observe(el));
        updateCarousel();
    }));

    // ====================================================================
    // [ INYECCIÓN MÓVIL B ]: SWIPE CON AISLANTE ANTI-BURBUJEO
    // ====================================================================
    const carruselWrapper = document.querySelector('.servicios-interactive-wrapper');
    if (carruselWrapper) {
        let touchstartX = 0;
        let touchendX = 0;

        carruselWrapper.addEventListener('touchstart', e => {
            // EL ESCUDO: Si pusiste el dedo sobre la barra de pestañas superior, abortamos
            if (e.target.closest('.servicios-tabs')) return;

            touchstartX = e.changedTouches[0].screenX;
        }, { passive: true });

        carruselWrapper.addEventListener('touchend', e => {
            // EL ESCUDO: Verificamos de nuevo al soltar el dedo
            if (e.target.closest('.servicios-tabs')) return;

            touchendX = e.changedTouches[0].screenX;
            const umbral = 35; 

            if (touchendX < touchstartX - umbral) {
                idx++; 
                updateCarousel();
            } else if (touchendX > touchstartX + umbral) {
                idx--; 
                updateCarousel();
            }
        }, { passive: true });
    }

    // ====================================================================
    // [ INYECCIÓN MÓVIL C ]: SWIPE EN LAS PESTAÑAS (Auto-selección)
    // ====================================================================
    if (tabsContainer && window.innerWidth <= 480) {
        let tabStartX = 0;
        let tabEndX = 0;

        tabsContainer.addEventListener('touchstart', e => {
            tabStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        tabsContainer.addEventListener('touchend', e => {
            tabEndX = e.changedTouches[0].screenX;
            const dist = tabStartX - tabEndX;
            const umbralTab = 40; // Sensibilidad de arrastre

            // Solo actuamos si el swipe fue suficientemente largo
            if (Math.abs(dist) > umbralTab) {
                let activeTabIndex = Array.from(tabs).findIndex(t => t.classList.contains('active'));
                if (activeTabIndex === -1) activeTabIndex = 0;

                if (dist > 0 && activeTabIndex < tabs.length - 1) {
                    // Swipe a la izquierda -> Simula clic en la SIGUIENTE pestaña
                    tabs[activeTabIndex + 1].click();
                } else if (dist < 0 && activeTabIndex > 0) {
                    // Swipe a la derecha -> Simula clic en la pestaña ANTERIOR
                    tabs[activeTabIndex - 1].click();
                }
            }
        }, { passive: true });
    }


    // Efecto Parallax 3D 
    const cardScene = document.getElementById('card-scene');
    const cardInner = document.getElementById('card-inner');
    const btnFlipForm = document.getElementById('btn-flip-form');
    const btnFlipBack = document.getElementById('btn-flip-back');
    const mockups = document.querySelectorAll('.interfaz-mockup, .mini-mockup-card');

    if (cardScene || mockups.length > 0) {
        const updateTilt = () => {
            const winH = window.innerHeight;
            if (cardScene) {
                const rect = cardScene.getBoundingClientRect();
                if (rect.top < winH && rect.bottom > 0) {
                    let progress = (rect.top - (winH * 0.1)) / (winH * 0.9);
                    progress = Math.max(0, Math.min(1, progress)); 
                    const angle = progress * 45; 
                    cardScene.style.transform = `perspective(2000px) rotateX(${angle}deg)`;
                }
            }

            mockups.forEach(mockup => {
                const rect = mockup.getBoundingClientRect();
                if (rect.top < winH && rect.bottom > 0) {
                    let progress = (rect.top - (winH * 0.2)) / (winH * 0.8);
                    progress = Math.max(0, Math.min(1, progress));
                    const angleX = progress * 20; 
                    mockup.style.transform = `perspective(1200px) rotateY(-6deg) rotateX(${angleX}deg) translateZ(0)`;
                }
            });

            const parallaxGeometries = document.querySelectorAll('.esfera-central-3d, .geometria-capsula-3d, .geometria-cubo-3d');
            parallaxGeometries.forEach(el => {
                const speed = 0.05; 
                const rectTop = el.parentElement.getBoundingClientRect().top;
                if (rectTop < winH && rectTop > -winH) {
                    const yPos = (winH - rectTop) * speed; 
                    if (el.classList.contains('esfera-central-3d')) {
                        el.style.transform = `translate(-65%, calc(-20% - ${yPos}px)) translateZ(0)`;
                    } else if (el.classList.contains('geometria-capsula-3d')) {
                        el.style.transform = `rotate(35deg) translateZ(-10px) translateY(${-yPos}px)`;
                    } else if (el.classList.contains('geometria-cubo-3d')) {
                        el.style.transform = `rotate(-20deg) rotateX(15deg) translateZ(-10px) translateY(${-yPos}px)`;
                    }
                }
            });
        };

        window.addEventListener('scroll', updateTilt, { passive: true });
        updateTilt(); 
        
    }

    // Giro 180 del formulario + EXPANSIÓN DE ESCENARIO
    if (btnFlipForm && btnFlipBack && cardInner) {
        btnFlipForm.addEventListener('click', (e) => { 
            e.preventDefault(); 
            cardInner.classList.add('is-flipped'); 
            // Le avisamos al escenario que se estire:
            if (cardScene) cardScene.classList.add('is-expanded'); 
        });

        btnFlipBack.addEventListener('click', (e) => { 
            e.preventDefault(); 
            cardInner.classList.remove('is-flipped'); 
            // El escenario vuelve a encogerse:
            if (cardScene) cardScene.classList.remove('is-expanded'); 
        });
    }
    // --- NUEVA LÓGICA DE DETECCIÓN MÓVIL ---
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    if (isMobile) {
        // Desactivamos el form por defecto
        document.querySelector('[data-panel="form"]').classList.remove('active');
        document.getElementById('panel-form').classList.remove('active');

        // Activamos el panel de WhatsApp
        document.querySelector('[data-panel="whatsapp"]').classList.add('active');
        document.getElementById('panel-whatsapp').classList.add('active');
        
        // Opcional: marca el botón de WhatsApp como activo visualmente
        document.querySelectorAll('.switch-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-panel="whatsapp"]').classList.add('active');
    }
    // ====================================================================
    // Inicialización BULLETPROOF del Teléfono (Con prefijo y blindaje)
    // ====================================================================
    const phoneInput = document.querySelector("#phone");
    
    if (phoneInput) {
        setTimeout(() => {
            if (typeof window.intlTelInput !== "undefined") {
                const iti = window.intlTelInput(phoneInput, {
                    initialCountry: "ar",
                    preferredCountries: ["ar", "cl", "uy", "br", "mx", "es", "us"],
                    separateDialCode: true,
                    utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
                });

                // ESCUDO 1: Destruye al instante cualquier tecla que no sea un número (0-9)
                phoneInput.addEventListener("input", function() {
                    this.value = this.value.replace(/\D/g, "");
                });

                // ESCUDO 2 (Crítico para Formspree): Captura el prefijo (+54) justo antes de enviar
                const form = phoneInput.closest("form");
                if (form) {
                    form.addEventListener("submit", function() {
                        if (iti.isValidNumber() || iti.getNumber().length > 0) {
                            phoneInput.value = iti.getNumber(); // Convierte "9261..." en "+549261..."
                        }
                    });
                }

            } else {
                console.error("Error: La librería intl-tel-input no se cargó correctamente.");
            }
        }, 200);
    }
});



// Lógica para alternar canales de contacto en la parte trasera de la tarjeta
const switchButtons = document.querySelectorAll('.switch-btn');

switchButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remover estado activo de todos los botones y añadir al seleccionado
        switchButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Ocultar todos los paneles de contacto
        const targetPanelId = button.getAttribute('data-panel');
        document.querySelectorAll('.contact-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        // Mostrar el panel seleccionado
        const activePanel = document.getElementById(`panel-${targetPanelId}`);
        if (activePanel) {
            activePanel.classList.add('active');
        }
    });
});