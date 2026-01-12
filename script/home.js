import {getCookie, setCookie, eraseCookie,appendAlert,getUserData,getProductData,getOrderData,updateOrder,addOrder,updateProduct,updateUser} from './main.js';
// import {app, db, collection, getDocs, addDoc, query,limit,where ,deleteDoc,doc,updateDoc,getDoc} from './app.js';

const menuBar =document.querySelector("header .links .menuBar")
const menu =document.querySelector("header .links .menu")
const menuControle =document.querySelector("header .links .menu .controle")
const overlay =document.querySelector(".mainOverlay");
const info =document.querySelector("header .info");
const header = document.querySelector('header');
const userId = getCookie("userId");

var zcart={};
{// header
// menu toggle
menuBar.addEventListener("click",()=>{
    menu.style.right =0;
    info.style.right = '85px'
    overlay.style.display = 'block';
})
menuControle.addEventListener("click",()=>{
    menu.style.right ="-100%";
    info.style.right = '-100%'
    overlay.style.display = 'none';
})
menu.querySelectorAll("ul li").forEach(link=>{
    link.addEventListener("click",()=>{
        menu.style.right ="-100%";
        info.style.right = '-100%'
        overlay.style.display = 'none';
    })
})
overlay.addEventListener("click",()=>{
    menu.style.right ="-100%";
    info.style.right = '-100%'
    overlay.style.display = 'none';
})
window.addEventListener("load",()=>{
    if(window.innerWidth < 520){
        document.querySelector(".mmm").remove();
    }
})
// on scroll change header background
window.addEventListener('scroll', () => {
    if(window.scrollY > 300){
        header.style.backgroundColor = "#ffffffe0";
    }else{
        header.style.backgroundColor = "#ffffffb6";
      }
});
document.querySelector("header .info .userProfile").addEventListener("click",()=>{
    if(getCookie('userId')){
        if(!getCookie("emailToVirify")){
            window.location.href = './components/profile/';
        }else{
            window.location.href = './components/login/verify.html';
        }
    }else{
        window.location.href = './components/login/';
    }
})
document.querySelector("header .info .cart").addEventListener("click",()=>{
    if(getCookie('userId')){
        if(window.localStorage.cart && Object.values(JSON.parse(window.localStorage.cart)).length > 0){
            window.location.href = './components/orderConfirmation/cart.html';
        }else{
            appendAlert("Please add products to your cart first.","warning");
            setTimeout(() => {
                window.location.href = './components/catalog/';
            }, 3000);
        }
    }else{
        appendAlert('Please log in first to view your cart.',"warning");
        setTimeout(() => {
            window.location.href = './components/login/';
        }, 3000);
    }
})
}
// title hock
window.addEventListener('scroll', function(e) {
    const analyseSecs = document.querySelectorAll('section .mainTitle');
    analyseSecs.forEach(title => {
        const scrollPosition = window.scrollY || document.documentElement.scrollTop;
        if (scrollPosition >= title.offsetTop - window.innerHeight  && scrollPosition < title.offsetTop + title.offsetHeight) {
            title.classList.add('visible');
        } else {
            title.classList.remove('visible');
        }
    });
});
window.addEventListener('load', function(e) {
    if(window.innerWidth > 425){
        document.querySelector("#ai img").src = './sources/ai-back.png';
    }else{
        document.querySelector("#ai img").src = './sources/ai-back-small.png';
    }
});
// load products
const loadProducts = async (category, subname, containerSelector,zlimit) => {
    const container = document.querySelector(containerSelector);
    container.innerHTML = '<p>Loading products...</p>'; // Show loading message
    const response = await fetch(`./php/proxy.php?col=products`);
    const result = await response.json();
    container.innerHTML = ''; // Clear loading message
    result.forEach(product=>{
        if(product.subname == subname){
            const data = product;
            const productId = product.id;
            var myfvpr = window.localStorage.favoriteProducts;
            const card = document.createElement('div');
            card.className = 'card';
            card.setAttribute("data-productId", productId);
            card.setAttribute("data-category", data.category);
            card.innerHTML = `
                <img src="${data.imgUrl[0]}" alt="${data.title}">
                <div class="label ${data.status.toLowerCase()}">${data.status}</div>
                <div class="product-info">
                    <h4 class="product-title">${data.title}</h4>
                    <div class='action'>
                        <div class="price">${data.newPrice} EGP</div>
                        <div class="lastPrice">${data.oldPrice} EGP</div>
                        <div class="add-to-cart">
                            <span class="cart-icon"><i class="fa-solid fa-cart-plus"></i></span> 
                        </div>
                    </div>
                </div>
            `;
            const totalQty = Object.values(data.avaliableSizes).reduce((a, b) => a + b, 0);
            if(data.status=="soldOut" || totalQty==0){
                card.querySelector(".label").innerText = "Sold Out";
                card.querySelector(".label").classList.remove("sale");
                card.querySelector(".label").classList.add("soldOut");
                card.querySelector(".add-to-cart").remove();
                card.classList.add("soldOutCard");
            }
            if(card.querySelector(".add-to-cart")){
                card.querySelector(".add-to-cart").addEventListener("click",()=>{
                    document.querySelector(".productPreview").classList.remove("d-none");
                    document.querySelector(".productPreview").style.display = 'flex';
                    // load images container
                    document.querySelector(".productPreview .productImagesContainer .productImage img").src = `${data.imgUrl[0]}`;
                    const thumbnailContainer = document.querySelector(".productPreview .productImagesContainer .thumbnailContainer");
                    thumbnailContainer.innerHTML = '';
                    data.imgUrl.forEach((imgUrl, index) => {
                    const thumbnail = document.createElement("img");
                    thumbnail.src = `${imgUrl}`;
                    thumbnail.alt = `Thumbnail ${index + 1}`;
                    thumbnail.classList.add("thumbnail");
                    if (index === 0) thumbnail.classList.add("active");
                    thumbnail.addEventListener("click", () => {
                        document.querySelector(".productPreview .productImagesContainer .productImage img").src = `${imgUrl}`;
                        thumbnailContainer.querySelectorAll(".thumbnail").forEach(thumb => thumb.classList.remove("active"));
                        thumbnail.classList.add("active");
                    });
                    thumbnailContainer.appendChild(thumbnail);
                    });
                    // end load images container
                    document.querySelector(".productPreview .productTitle").innerText = data.title;
                    document.querySelector(".productPreview .productDescription").innerText = data.description;
                    document.querySelector(".productPreview .productPrice oldPrice").innerText = data.oldPrice?data.oldPrice+" EGP":"";
                    document.querySelector(".productPreview .productPrice span").innerText = data.newPrice;
                    document.querySelector(".productPreview .qtyInput").value = 1;
                    const avaliableSizes = data.avaliableSizes || [""];
                    const sizeSelect = document.querySelector(".productPreview select");
                    sizeSelect.innerHTML = '';
                    Object.keys(avaliableSizes).forEach(size=>{
                    if(avaliableSizes[size] > 0){
                        const option = document.createElement("option");
                        option.value = size;
                        option.text = size;
                        sizeSelect.appendChild(option);
                    }
                    })
                    const theQtyAvaliableSize = data.avaliableSizes[sizeSelect.value];
                    document.querySelector(".productPreview .qtyInput").setAttribute("max", theQtyAvaliableSize);
                    document.querySelector(".productPreview .qtyInput").addEventListener("change",(e)=>{
                    if(e.target.value > theQtyAvaliableSize){
                        e.target.value = theQtyAvaliableSize;
                    }else if(e.target.value < 1){
                        e.target.value = 1;
                    }
                    })
                    document.querySelector(".productPreview .addToCartBtn").onclick = (e)=>{
                    e.target.setAttribute("disabled", "");
                    const productId = product.id;
                    if(getCookie('userId') && !getCookie("emailToVirify")){
                        if(window.localStorage.cart && window.localStorage.cart.length > 0){
                            zcart = JSON.parse(window.localStorage.cart);
                            let found = Object.values(zcart).find(
                            item => item.productId == productId 
                            &&  item.size == document.querySelector(".productPreview select").value
                            && item.sizeType == (document.querySelector(".productPreview .previewCard .regularOversize input").checked?"oversize":"regular")
                            );
                            if (found) {
                                found.quantity +=parseInt(document.querySelector(".productPreview .qtyInput").value);
                                window.localStorage.cart = JSON.stringify(zcart);
                                e.target.removeAttribute("disabled");
                                appendAlert("Product added to cart successfully!","success");
                                // window.location.href = '../orderConfirmation/cart.html';
                            } else {
                                var newProduct = {
                                    productId: productId, 
                                    quantity:parseInt(document.querySelector(".productPreview .qtyInput").value),
                                    size:document.querySelector(".productPreview select").value,
                                    sizeType: document.querySelector(".productPreview .previewCard .regularOversize input").checked?"oversize":"regular",
                                }
                                zcart[Object.keys(zcart).length] = newProduct;
                                window.localStorage.cart = JSON.stringify(zcart);
                                e.target.removeAttribute("disabled");
                                appendAlert("Product added to cart successfully!","success");
                                // window.location.href = '../orderConfirmation/cart.html';
                            }
                            
                        }else{
                            zcart = {
                                0:{
                                    productId: productId,
                                    quantity:parseInt(document.querySelector(".productPreview .qtyInput").value),
                                    size:document.querySelector(".productPreview select").value,
                                    sizeType: document.querySelector(".productPreview .previewCard .regularOversize input").checked?"oversize":"regular",
                                }
                            };
                            window.localStorage.cart = JSON.stringify(zcart);
                            e.target.removeAttribute("disabled");
                            appendAlert("Product added to cart successfully!","success");
                        }
                        document.querySelector(".productPreview .closeBtn").click();
                    }else{
                        appendAlert('please log in first to add to cart.',"warning");
                        setTimeout(() => {
                            window.location.href = '../login/';
                        }, 3000);
                    }
                    }
                })
            }
            card.querySelector("img").addEventListener("click",()=>{
                document.querySelector(".productPreview").classList.remove("d-none");
                document.querySelector(".productPreview").style.display = 'flex';
                // load images container
                document.querySelector(".productPreview .productImagesContainer .productImage img").src = `${data.imgUrl[0]}`;
                const thumbnailContainer = document.querySelector(".productPreview .productImagesContainer .thumbnailContainer");
                thumbnailContainer.innerHTML = '';
                data.imgUrl.forEach((imgUrl, index) => {
                const thumbnail = document.createElement("img");
                thumbnail.src = `${imgUrl}`;
                thumbnail.alt = `Thumbnail ${index + 1}`;
                thumbnail.classList.add("thumbnail");
                if (index === 0) thumbnail.classList.add("active");
                thumbnail.addEventListener("click", () => {
                    document.querySelector(".productPreview .productImagesContainer .productImage img").src = `${imgUrl}`;
                    thumbnailContainer.querySelectorAll(".thumbnail").forEach(thumb => thumb.classList.remove("active"));
                    thumbnail.classList.add("active");
                });
                thumbnailContainer.appendChild(thumbnail);
                });
                // end load images container
                document.querySelector(".productPreview .productTitle").innerText = data.title;
                document.querySelector(".productPreview .productDescription").innerText = data.description;
                document.querySelector(".productPreview .productPrice oldPrice").innerText = data.oldPrice?data.oldPrice+" EGP":"";
                document.querySelector(".productPreview .productPrice span").innerText = data.newPrice;
                document.querySelector(".productPreview .qtyInput").value = 1;
                const avaliableSizes = data.avaliableSizes || [""];
                const sizeSelect = document.querySelector(".productPreview select");
                sizeSelect.innerHTML = '';
                Object.keys(avaliableSizes).forEach(size=>{
                if(avaliableSizes[size] > 0){
                    const option = document.createElement("option");
                    option.value = size;
                    option.text = size;
                    sizeSelect.appendChild(option);
                }
                })
                const theQtyAvaliableSize = data.avaliableSizes[sizeSelect.value];
                document.querySelector(".productPreview .qtyInput").setAttribute("max", theQtyAvaliableSize);
                document.querySelector(".productPreview .qtyInput").addEventListener("change",(e)=>{
                if(e.target.value > theQtyAvaliableSize){
                    e.target.value = theQtyAvaliableSize;
                }else if(e.target.value < 1){
                    e.target.value = 1;
                }
                })
                document.querySelector(".productPreview .addToCartBtn").onclick = (e)=>{
                e.target.setAttribute("disabled", "");
                const productId = product.id;
                if(getCookie('userId') && !getCookie("emailToVirify")){
                    if(window.localStorage.cart && window.localStorage.cart.length > 0){
                        zcart = JSON.parse(window.localStorage.cart);
                        let found = Object.values(zcart).find(
                        item => item.productId == productId 
                        &&  item.size == document.querySelector(".productPreview select").value
                        && item.sizeType == (document.querySelector(".productPreview .previewCard .regularOversize input").checked?"oversize":"regular")
                        );
                        if (found) {
                            found.quantity +=parseInt(document.querySelector(".productPreview .qtyInput").value);
                            window.localStorage.cart = JSON.stringify(zcart);
                            e.target.removeAttribute("disabled");
                            appendAlert("Product added to cart successfully!","success");
                        } else {
                            var newProduct = {
                                productId: productId, 
                                quantity:parseInt(document.querySelector(".productPreview .qtyInput").value),
                                size:document.querySelector(".productPreview select").value,
                                sizeType: document.querySelector(".productPreview .previewCard .regularOversize input").checked?"oversize":"regular",
                            }
                            zcart[Object.keys(zcart).length] = newProduct;
                            window.localStorage.cart = JSON.stringify(zcart);
                            e.target.removeAttribute("disabled");
                            appendAlert("Product added to cart successfully!","success");
                        }
                        
                    }else{
                        zcart = {
                            0:{
                                productId: productId,
                                quantity:parseInt(document.querySelector(".productPreview .qtyInput").value),
                                size:document.querySelector(".productPreview select").value,
                                sizeType: document.querySelector(".productPreview .previewCard .regularOversize input").checked?"oversize":"regular",
                            }
                        };
                        window.localStorage.cart = JSON.stringify(zcart);
                        e.target.removeAttribute("disabled");
                        appendAlert("Product added to cart successfully!","success");
                    }
                    document.querySelector(".productPreview .closeBtn").click();
                }else{
                    appendAlert('please log in first to add to cart.',"warning");
                    setTimeout(() => {
                        window.location.href = '../login/';
                    }, 3000);
                }
                }
            })
            
            container.prepend(card);
            document.querySelector(".productPreview").addEventListener("click",(e)=>{
                if(e.target.classList.contains("closeBtn") || e.target.classList.contains("fa-x")  || e.target.classList.contains("productPreview")){
                    document.querySelector(".productPreview .productImage img").src = '';
                    document.querySelector(".productPreview .productTitle").innerText ='';
                    document.querySelector(".productPreview .productDescription").innerText = '';
                    document.querySelector(".productPreview .productPrice span").innerText = '';
                    document.querySelector(".productPreview .qtyInput").value = 1;
                    document.querySelector(".productPreview").classList.add("d-none");
                    document.querySelector("input#checkNativeSwitch").checked = false;
                }
            })
        }
    })
};

// Load products
loadProducts('tshirt','plain','.topCollections .product-grid',100);
loadProducts('tshirt','trendy','.summerCollections .product-grid',100);

document.querySelector("input#checkNativeSwitch").addEventListener("change",()=>{
    var zPrice = document.querySelector(".productPreview .productPrice span");
    var zOldPrice = document.querySelector(".productPreview .productPrice oldPrice");
    if(document.querySelector("input#checkNativeSwitch").checked){
        zPrice.innerText = parseInt(zPrice.innerText)+50;
        zOldPrice.innerText = parseInt(zOldPrice.innerText)+50 +" EGP";
    }else{
        zPrice.innerText = parseInt(zPrice.innerText)-50;
        zOldPrice.innerText = parseInt(zOldPrice.innerText)-50 +" EGP";
    }
})


window.addEventListener('scroll', () => {
    const productGrids = document.querySelectorAll('.collection .product-grid');
    productGrids.forEach(grid => {
        const scrollPosition = window.scrollY || document.documentElement.scrollTop;
        const sectionTop = grid.offsetTop;
        const sectionHeight = grid.offsetHeight;
        if (scrollPosition >= sectionTop - window.innerHeight  && scrollPosition < sectionTop + sectionHeight) {
            grid.classList.add('visible');
        } else {
            grid.classList.remove('visible');
        }
    });
});

//reviews section
// load reviews
window.addEventListener('load', async() => {
    loadReviews();
});
// enable/disable button based on input

var giveStarsOf5 = document.querySelectorAll('.analyse .stars i');
giveStarsOf5.forEach((star, index) => {
    star.addEventListener('click', () => {
        if(getCookie('userId')){
            giveStarsOf5.forEach(ss => ss.classList.add('filled'));
            for (let i = giveStarsOf5.length-1; i > index; i--) {
                giveStarsOf5[i].classList.remove('filled');
            }
            // Here you can add code to actually handle the star rating action (e.g., update a database or local storage)
            star.parentElement.setAttribute("data-rating", index + 1);
        }else{
            appendAlert('Please log in first to rate.',"warning");
            setTimeout(() => {
                window.location.href = './components/login/';
            }, 3000);
        }
    });
});

document.querySelector('.analyse .reviews input').addEventListener('input', function() {
    const button = document.querySelector('.analyse .reviews button');
    button.disabled = this.value.trim() === '';
});
document.querySelector('.analyse .reviews input').addEventListener('focus', function() {
    userId?"":this.placeholder= 'Please log in first to add a review';
});
document.querySelector('.analyse .reviews input').addEventListener('blur', function() {
    this.placeholder= "Share your opinion with us!";
});
document.querySelector('.analyse .reviews button').addEventListener('click', async()=> {
    const input = document.querySelector('.analyse .reviews input');
    const rates = document.querySelector('.analyse .giveStarsOf5 .stars');
    if(rates.getAttribute("data-rating")){
        if (input.value.trim() !== '') {
            if(getCookie('userId')){
                getUserData(userId).then(userData=>{
                    if(userData.firstName || userData.lastName){
                        if(userData.orders && userData.orders.length > 0){
                            document.querySelector('.analyse .reviews button').setAttribute("disabled", "");
                            updateUser(userId,{
                                userComment:[input.value, parseInt(rates.getAttribute("data-rating"))],
                            }).then(() => {
                                loadReviews();
                                input.value = '';
                                rates.removeAttribute("data-rating");
                                appendAlert('Thank you for sharing your review !',"info");
                                document.querySelector('.analyse .reviews button').removeAttribute("disabled");
                            });
                        }else{
                            appendAlert("You need to purchase first to add a review.","warning");
                            setTimeout(() => {
                                window.location.href='./components/catalog/';
                            }, 3000);
                        }
                    }else{
                        appendAlert("Please complete your profile first to add a review.","warning");
                        setTimeout(() => {
                            window.location.href='./components/profile';
                        }, 3000);
                    }
                })
            }else{
                appendAlert('Please log in first to add a review.',"warning");
                setTimeout(() => {
                    window.location.href = './components/login/';
                }, 3000);
            }
        }else{
            appendAlert('Please enter a review before submitting.',"warning");
        }
    }else{
        appendAlert('Please select a star rating before submitting your review.',"warning");
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
const loadReviews = async () => {
    const reviewsContainer = document.querySelector('.analyse .carousel-inner');
    reviewsContainer.innerHTML = '<p>Loading reviews...</p>'; // Show loading message
    try {
        reviewsContainer.innerHTML = '';
        let hasReviews = false;
        const response = await fetch(`./php/proxy.php?col=users`);
        const result = await response.json();
        result.forEach((doc) => {
            const data = doc;
            if(data.userComment){
                hasReviews = true;
                const reviewCard = document.createElement('div');
                reviewCard.className = 'carousel-item active';
                reviewCard.innerHTML = `
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${data.firstName} ${data.lastName}</h5>
                            <div class="stars" data-rating="${data.userComment[1]}">
                                `+ Array.from({ length: 5 }, (_, i) => 
                                    `<i class="fa-solid fa-star ${i < data.userComment[1] ? 'filled' : ''}"></i>`
                                ).join('') + `
                            </div>
                            <p class="card-text">~ ${data.userComment[0]} ~</p>
                        </div>
                    </div>
                `;
                reviewsContainer.appendChild(reviewCard);
            }
        });
        if(!hasReviews){
            reviewsContainer.innerHTML = '<p>There is no reviews yet.</p>';
        }
    } catch (error) {
        console.error("Error loading reviews: ", error);
        reviewsContainer.innerHTML = '<p>Error loading reviews. Please try again later.</p>';
    }
}
//end reviews section



