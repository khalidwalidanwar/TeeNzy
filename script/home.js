const menuBar =document.querySelector("header .links .menuBar")
const menu =document.querySelector("header .links .menu")
const menuControle =document.querySelector("header .links .menu .controle")
const overlay =document.querySelector(".mainOverlay");
const info =document.querySelector("header .info");
const header = document.querySelector('header');


// menu toggle
menuBar.addEventListener("click",()=>{
    menu.style.left =0;
    info.style.left = '85px'
    overlay.style.display = 'block';
})
menuControle.addEventListener("click",()=>{
    menu.style.left ="-100%";
    info.style.left = '-100%'
    overlay.style.display = 'none';
})
menu.querySelectorAll("ul li").forEach(link=>{
    link.addEventListener("click",()=>{
        menu.style.left ="-100%";
        info.style.left = '-100%'
        overlay.style.display = 'none';
    })
})
overlay.addEventListener("click",()=>{
    menu.style.left ="-100%";
    info.style.left = '-100%'
    overlay.style.display = 'none';
})

// on scroll change header background
window.addEventListener('scroll', () => {
    if(window.scrollY > 300){
        header.style.backgroundColor = "#ffffffe0";
    }else{
        header.style.backgroundColor = "#ffffffb6";
      }
});
// title hock
window.addEventListener('scroll', function(e) {
    const analyseSecs = document.querySelectorAll('section .mainTitle');
    console.log(analyseSecs)
    analyseSecs.forEach(title => {
        const scrollPosition = window.scrollY || document.documentElement.scrollTop;
        if (scrollPosition >= title.offsetTop - window.innerHeight + 200 && scrollPosition < title.offsetTop + title.offsetHeight) {
            title.classList.add('visible');
        } else {
            title.classList.remove('visible');
        }
    });
});


// filter cards
// Favorite icon toggle
document.querySelectorAll(' .favorite').forEach(icon => {
    icon.addEventListener('click', () => {
        icon.classList.toggle('active');
        icon.textContent = icon.classList.contains('active') ? '❤️' : '♡';
    });
});

    // Add to Cart alert
    document.querySelectorAll(' .add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
        const productTitle = button.closest('.card').querySelector(' .product-title').textContent;
        alert(`✔️ "${productTitle}" added to cart!`);
    });
    });

    // Filter products
    const filterButtons = document.querySelectorAll(' .filter-btn');
    const cards = document.querySelectorAll('.card');

    filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // remove active from all
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        cards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
        });
    });
});
window.addEventListener('scroll', () => {
    const productGrids = document.querySelectorAll('.collection .product-grid');
    productGrids.forEach(grid => {
        const scrollPosition = window.scrollY || document.documentElement.scrollTop;
        const sectionTop = grid.offsetTop;
        const sectionHeight = grid.offsetHeight;
        if (scrollPosition >= sectionTop - window.innerHeight + 200 && scrollPosition < sectionTop + sectionHeight) {
            grid.classList.add('visible');
        } else {
            grid.classList.remove('visible');
        }
    });
});


//reviews section
document.querySelector('.analyse .reviews input').addEventListener('input', function() {
    const button = document.querySelector('.analyse .reviews button');
    button.disabled = this.value.trim() === '';
});
document.querySelector('.analyse .reviews input').addEventListener('focus', function() {
    this.placeholder= 'يلزم تسجيل الدخول لكتابة رأيك';
});
document.querySelector('.analyse .reviews input').addEventListener('blur', function() {
    this.placeholder= "...اكتب رأيك هنا";
});
document.querySelector('.analyse .reviews button').addEventListener('click', function() {
    const input = document.querySelector('.analyse .reviews input');
    if (input.value.trim() !== '') {
        alert('شكراً لمشاركتك رأيك!');
        input.value = '';
        this.disabled = true;
    }else{
        alert('الرجاء كتابة رأيك قبل الإرسال.');
    }
});
window.addEventListener('scroll', function(e) {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    const analyseSection = document.querySelector('.analyse .container');
    const sectionTop = analyseSection.offsetTop;
    const sectionHeight = analyseSection.offsetHeight;

    if (scrollPosition >= sectionTop - window.innerHeight && scrollPosition < sectionTop + sectionHeight) {
        analyseSection.classList.add('visible');
    } else {
        analyseSection.classList.remove('visible');
    }
});
//end reviews section
