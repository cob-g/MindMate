
// Selecting elements
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('#mobileMenu a'); // Anchor tags inside the mobile menu
const navMenu = document.getElementById("nav-menu");
const navLink = document.querySelectorAll(".nav-link");
const hamburger = document.getElementById("hamburger");

// Scroll effect to change navbar color
window.addEventListener("scroll", () => {
  if (window.scrollY > 650) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// Toggle mobile menu visibility
hamburger.addEventListener("click", () => {
  navMenu.classList.toggle("left-[0]");  // Opens or closes the mobile menu
  hamburger.classList.toggle('ri-close-large-fill'); // Switch between open and close icon
});

// Close the mobile menu when a link is clicked
navLink.forEach(link => {
  link.addEventListener("click", () => {
    navMenu.classList.toggle("left-[0]");  // Closes the mobile menu
    hamburger.classList.toggle('ri-close-large-fill'); // Switch back to hamburger icon
  });
});


// Navbar background change on scroll
// window.addEventListener('scroll', () => {
//   if (window.scrollY > 50) {
//     navbar.classList.add('bg-black-400', 'backdrop-blur-lg');
//   } else {
//     navbar.classList.remove('bg-opacity-100', 'backdrop-blur-lg');
//   }
// });

document.querySelectorAll('.faq-item').forEach((item) => {
  const question = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');
  const icon = question.querySelector('span');

  question.addEventListener('click', () => {
    const isOpen = !answer.classList.contains('max-h-0');

    // Close all other open FAQs
    document.querySelectorAll('.faq-answer').forEach((faq) => {
      faq.style.maxHeight = null;
      faq.classList.add('max-h-0');
      faq.previousElementSibling.querySelector('span').textContent = '+';
    });

    // Toggle current FAQ
    if (!isOpen) {
      answer.style.maxHeight = answer.scrollHeight + 'px';
      answer.classList.remove('max-h-0');
      icon.textContent = '−';
    } else {
      answer.style.maxHeight = null;
      answer.classList.add('max-h-0');
      icon.textContent = '+';
    }
  });
});

function openChatSpace() {
  window.open('Chatbot.html', '_blank');
}




