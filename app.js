document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================================================
  // CUSTOM CURSOR
  // ==========================================================================
  const cursor = document.getElementById('customCursor');
  
  // Only enable custom cursor if it's not a touch device
  if (window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    });

    // Cursor scaling states on interactive elements
    const hoverables = document.querySelectorAll('a, button, .menu-item, .zone-option, select, input, textarea');
    hoverables.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.width = '40px';
        cursor.style.height = '40px';
        cursor.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
        cursor.style.borderColor = 'var(--primary-gold)';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.width = '20px';
        cursor.style.height = '20px';
        cursor.style.backgroundColor = 'transparent';
        cursor.style.borderColor = 'var(--primary-gold)';
      });
    });
  } else {
    // Hide cursor on touch devices
    cursor.style.display = 'none';
  }

  // ==========================================================================
  // STICKY HEADER & SCROLL SPY & REVEAL ANIMATION
  // ==========================================================================
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');
  const reveals = document.querySelectorAll('.reveal');

  // Trigger hero animation immediately
  document.getElementById('home').classList.add('active');

  const handleScroll = () => {
    const scrollPos = window.scrollY;

    // Sticky Header
    if (scrollPos > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Scroll Spy (navigation highlighting)
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });

    // Reveal elements on scroll
    reveals.forEach(reveal => {
      const windowHeight = window.innerHeight;
      const revealTop = reveal.getBoundingClientRect().top;
      const revealPoint = 100;

      if (revealTop < windowHeight - revealPoint) {
        reveal.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Run once on startup

  // Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  mobileToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    // Animate burger lines
    const spans = mobileToggle.querySelectorAll('span');
    spans[0].style.transform = navMenu.classList.contains('open') ? 'rotate(45deg) translate(6px, 6px)' : 'none';
    spans[1].style.opacity = navMenu.classList.contains('open') ? '0' : '1';
    spans[2].style.transform = navMenu.classList.contains('open') ? 'rotate(-45deg) translate(6px, -6px)' : 'none';
  });

  // Close mobile menu on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      const spans = mobileToggle.querySelectorAll('span');
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    });
  });

  // ==========================================================================
  // MENU FILTERING
  // ==========================================================================
  const filterBtns = document.querySelectorAll('.menu-filter-btn');
  const menuItems = document.querySelectorAll('.menu-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all buttons
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-category');

      menuItems.forEach(item => {
        // Add fade-out transition
        item.style.opacity = '0';
        item.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
          if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
            item.style.display = 'flex';
            setTimeout(() => {
              item.style.opacity = '1';
              item.style.transform = 'scale(1)';
            }, 50);
          } else {
            item.style.display = 'none';
          }
        }, 300);
      });
    });
  });

  // ==========================================================================
  // "CURATE YOUR FEAST" CART LOGIC & WINE RECOMMENDER
  // ==========================================================================
  const feastSidebar = document.getElementById('feastSidebar');
  const openFeastBtn = document.getElementById('openFeastBtn');
  const closeFeastBtn = document.getElementById('closeFeastBtn');
  const addButtons = document.querySelectorAll('.menu-add-btn');
  
  const feastEmptyMessage = document.getElementById('feastEmptyMessage');
  const feastItemsContainer = document.getElementById('feastItemsContainer');
  const feastCountBadge = document.getElementById('feastCount');
  const feastSubtotal = document.getElementById('feastSubtotal');
  
  const feastWineBox = document.getElementById('feastWineBox');
  const wineSuggText = document.getElementById('wineSuggText');
  const feastReserveBtn = document.getElementById('feastReserveBtn');

  let feastCart = [];

  const toggleSidebar = (isOpen) => {
    if (isOpen) {
      feastSidebar.classList.add('open');
    } else {
      feastSidebar.classList.remove('open');
    }
  };

  openFeastBtn.addEventListener('click', () => toggleSidebar(true));
  closeFeastBtn.addEventListener('click', () => toggleSidebar(false));

  // Add click outside to close sidebar
  document.addEventListener('click', (e) => {
    if (!feastSidebar.contains(e.target) && !openFeastBtn.contains(e.target) && feastSidebar.classList.contains('open')) {
      // Don't close if clicking modal buttons
      if (!e.target.closest('.menu-add-btn')) {
        toggleSidebar(false);
      }
    }
  });

  const updateFeastUI = () => {
    // Update Badge count
    const totalItems = feastCart.reduce((total, item) => total + item.quantity, 0);
    feastCountBadge.textContent = totalItems;
    
    // Toggle Empty screen
    if (feastCart.length === 0) {
      feastEmptyMessage.style.display = 'block';
      feastItemsContainer.style.display = 'none';
      feastWineBox.classList.remove('active');
      feastSubtotal.textContent = '$0.00';
    } else {
      feastEmptyMessage.style.display = 'none';
      feastItemsContainer.style.display = 'block';
      
      // Render items
      feastItemsContainer.innerHTML = '';
      feastCart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'feast-item';
        div.innerHTML = `
          <img src="${item.img}" alt="${item.name}" class="feast-item-img">
          <div class="feast-item-details">
            <h4 class="feast-item-name">${item.name} (x${item.quantity})</h4>
            <span class="feast-item-price">$${item.price * item.quantity}</span>
          </div>
          <button class="feast-item-remove" data-id="${item.id}" aria-label="Remove item"><i class="fa-solid fa-trash-can"></i></button>
        `;
        feastItemsContainer.appendChild(div);
      });

      // Bind remove listeners
      document.querySelectorAll('.feast-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = parseInt(btn.getAttribute('data-id'));
          removeFromFeast(id);
        });
      });

      // Calculate totals
      const subtotal = feastCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      feastSubtotal.textContent = `$${subtotal.toFixed(2)}`;

      // Sommelier Recommender Engine
      runSommelierEngine();
    }
  };

  const addToFeast = (id, name, price, img, wine) => {
    const existingItem = feastCart.find(item => item.id === id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      feastCart.push({ id, name, price, img, wine, quantity: 1 });
    }
    updateFeastUI();
    // Open sidebar automatically on add to provide immediate visual feedback
    toggleSidebar(true);
  };

  const removeFromFeast = (id) => {
    feastCart = feastCart.filter(item => item.id !== id);
    updateFeastUI();
  };

  const runSommelierEngine = () => {
    feastWineBox.classList.add('active');
    
    // Categorize selection
    const hasPasta = feastCart.some(item => item.id === 2 || item.id === 6); // Tagliatelle, Risotto
    const hasSeafood = feastCart.some(item => item.id === 3 || item.id === 5); // Salmon, Calamari
    const hasSteak = feastCart.some(item => item.id === 7); // Bistecca Fiorentina
    const isDolciOnly = feastCart.every(item => item.id === 4 || item.id === 8); // Only Tiramisu or Cannoli
    
    if (hasSteak) {
      wineSuggText.innerHTML = `For the robust and dry-aged <strong>Bistecca alla Fiorentina</strong>, our Sommelier highly recommends a powerful, structured Tuscan red like a <strong>Brunello di Montalcino</strong> or <strong>Chianti Classico Gran Selezione</strong>.`;
    } else if (hasPasta && hasSeafood) {
      wineSuggText.innerHTML = `To bridge the rich truffles/mushrooms and delicate seafood, we suggest a medium-bodied, elegant white like <strong>Pinot Grigio Alto Adige</strong> or a light-bodied red like <strong>Valpolicella Ripasso</strong>.`;
    } else if (hasPasta) {
      wineSuggText.innerHTML = `Your savory pasta selection (Tagliatelle or Risotto) pairs magnificently with a bold, complex Nebbiolo-based red such as <strong>Barolo</strong> or a fine <strong>Nebbiolo d'Alba</strong>.`;
    } else if (hasSeafood) {
      wineSuggText.innerHTML = `For your seafood courses (Calamari or Salmon), we recommend a dry, aromatic Italian white wine like <strong>Vermentino di Sardegna</strong> or <strong>Chardonnay</strong>.`;
    } else if (isDolciOnly) {
      wineSuggText.innerHTML = `Conclude your sweet selections (Tiramisu or Cannoli) with a chilled glass of sparkling <strong>Moscato d'Asti</strong> or a glass of amber-colored dessert wine, <strong>Vin Santo</strong>.`;
    } else {
      wineSuggText.innerHTML = `A wonderful selection! To open your feast, our Sommelier recommends a crisp, sparkling glass of premium <strong>Valdobbiadene Prosecco Superiore</strong>.`;
    }
  };

  // Wire Add Buttons
  addButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'));
      const name = btn.getAttribute('data-name');
      const price = parseFloat(btn.getAttribute('data-price'));
      const img = btn.getAttribute('data-img');
      const wine = btn.getAttribute('data-wine');
      
      addToFeast(id, name, price, img, wine);
    });
  });

  // Feast Book Button triggers reservation scroll
  feastReserveBtn.addEventListener('click', () => {
    toggleSidebar(false);
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
    
    // Autofill Special Notes with feast detail
    const notesArea = document.getElementById('bookNotes');
    const feastListStr = feastCart.map(item => `${item.name} (x${item.quantity})`).join(', ');
    notesArea.value = `I would like to order my pre-curated feast during this reservation: ${feastListStr}.`;
  });

  // ==========================================================================
  // TABLE SEATING AREA PICKER
  // ==========================================================================
  const zoneOptions = document.querySelectorAll('.zone-option');
  let selectedZone = "Main Hall"; // Default

  zoneOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      zoneOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      selectedZone = opt.getAttribute('data-zone');
    });
  });

  // Set default min date to today's date
  const dateInput = document.getElementById('bookDate');
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
  dateInput.value = today;

  // ==========================================================================
  // RESERVATION SUBMISSION & VALIDATION
  // ==========================================================================
  const bookingForm = document.getElementById('bookingForm');
  const successModal = document.getElementById('successModal');
  const closeSuccessBtn = document.getElementById('closeSuccessBtn');
  
  const ticketCode = document.getElementById('ticketCode');
  const ticketGuests = document.getElementById('ticketGuests');
  const ticketDate = document.getElementById('ticketDate');
  const ticketTime = document.getElementById('ticketTime');
  const ticketZone = document.getElementById('ticketZone');
  const ticketFeastRow = document.getElementById('ticketFeastRow');
  const ticketFeastCount = document.getElementById('ticketFeastCount');

  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Custom Validation
    const name = document.getElementById('bookName').value.trim();
    const email = document.getElementById('bookEmail').value.trim();
    const phone = document.getElementById('bookPhone').value.trim();
    const guests = document.getElementById('bookGuests').value;
    const date = document.getElementById('bookDate').value;
    const time = document.getElementById('bookTime').value;

    if (!name || !email || !phone || !guests || !date || !time) {
      alert("Si prega di compilare tutti i campi (Please fill in all details).");
      return;
    }

    // Generate confirmation number
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const code = `BV-${randomNum}`;

    // Fill virtual ticket
    ticketCode.textContent = code;
    ticketGuests.textContent = `${guests} ${guests === '1' ? 'Guest' : 'Guests'}`;
    
    // Format Date beautifully
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const dateFormatted = new Date(date).toLocaleDateString('en-US', options);
    ticketDate.textContent = dateFormatted;
    
    // Format Time
    ticketTime.textContent = time;
    ticketZone.textContent = selectedZone;

    // Check if they booked with a custom feast
    if (feastCart.length > 0) {
      const totalFeastItems = feastCart.reduce((total, item) => total + item.quantity, 0);
      ticketFeastRow.style.display = 'flex';
      ticketFeastCount.textContent = `${totalFeastItems} items pre-selected`;
    } else {
      ticketFeastRow.style.display = 'none';
    }

    // Show Modal
    successModal.classList.add('active');
  });

  closeSuccessBtn.addEventListener('click', () => {
    successModal.classList.remove('active');
    
    // Reset Form
    bookingForm.reset();
    dateInput.value = today;
    
    // Reset Seating zone
    zoneOptions.forEach(o => o.classList.remove('selected'));
    document.getElementById('zoneMain').classList.add('selected');
    selectedZone = "Main Hall";
    
    // Optional: Reset cart on booking completion
    feastCart = [];
    updateFeastUI();
  });

  // Close modal if click outer success window
  successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
      successModal.classList.remove('active');
    }
  });

  // ==========================================================================
  // TESTIMONIALS CAROUSEL
  // ==========================================================================
  const carouselTrack = document.getElementById('carouselTrack');
  const dots = document.querySelectorAll('.carousel-dot');
  let currentSlide = 0;
  const slideInterval = 6000; // 6 seconds auto-rotate

  const goToSlide = (slideIndex) => {
    currentSlide = slideIndex;
    carouselTrack.style.transform = `translateX(-${slideIndex * 100}%)`;
    
    // Update dots
    dots.forEach(dot => dot.classList.remove('active'));
    dots[slideIndex].classList.add('active');
  };

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.getAttribute('data-slide'));
      goToSlide(index);
    });
  });

  // Auto Play
  let timer = setInterval(() => {
    let nextSlide = (currentSlide + 1) % dots.length;
    goToSlide(nextSlide);
  }, slideInterval);

  // Reset timer on user manual interaction
  const resetCarouselTimer = () => {
    clearInterval(timer);
    timer = setInterval(() => {
      let nextSlide = (currentSlide + 1) % dots.length;
      goToSlide(nextSlide);
    }, slideInterval);
  };

  dots.forEach(dot => {
    dot.addEventListener('click', resetCarouselTimer);
  });
});
