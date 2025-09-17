import {app, db, collection, getDocs, addDoc, query,limit,where ,deleteDoc,doc,updateDoc,getDoc} from './app.js';

const menuBar =document.querySelector("header .links .menuBar")
const menu =document.querySelector("header .links .menu")
const menuControle =document.querySelector("header .links .menu .controle")
const overlay =document.querySelector(".mainOverlay");
const info =document.querySelector("header .info");
const header = document.querySelector('header');
const userId = getCookie("userId");

var zcart={};

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
            alert("! يرجي اضافة منتجات الي العربة ");
            window.location.href = './components/catalog/';
        }
    }else{
        alert('يرجى تسجيل الدخول أولاً للوصول إلى سلة التسوق.');
        window.location.href = './components/login/';
    }
})
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

// ai section
document.querySelector('.AI .prompt button').addEventListener('click', () => {
    if(getCookie('userId')){
        if(!getCookie("emailToVirify")){
            if(document.querySelector('.AI .prompt textarea').value.trim() !== '') {
                const prompt = encodeURIComponent(document.querySelector('.AI .prompt textarea').value.trim());
                setCookie("aiPrompt", prompt, 1); // Store prompt for 1 day
                window.location.href = './components/designers/';
            }else{
                alert('الرجاء كتابة وصف التصميم قبل المتابعة.');
            }
        }else{
            alert('يرجى التحقق من بريدك الإلكتروني أولاً لتصميم تيشيرتك.');
            window.location.href = './components/login/verify.html';
        }
    }else{
        alert('يرجى تسجيل الدخول أولاً لتصميم تيشيرتك.');
        window.location.href = './components/login/';
    }
});
document.querySelector('.AI .prompt textarea').addEventListener('click', () => {
    if(!getCookie('userId') || getCookie("emailToVirify")){
        alert('يرجى تسجيل الدخول أولاً لتصميم تيشيرتك.');
        window.location.href = './components/login/';
    }
});
// end ai section

// load products
const loadProducts = async (category, subname, containerSelector,zlimit) => {
    const container = document.querySelector(containerSelector);
    container.innerHTML = '<p>Loading products...</p>'; // Show loading message
    let q;
    if(category && subname){
        q = query(collection(db, "products"), where("category", "==", category), where("subname", "==", subname), limit(4));
    }else if(category){
        q = query(collection(db, "products"), where("category", "==", category), limit(zlimit));
    }
    try {
        const querySnapshot = await getDocs(q);
        container.innerHTML = ''; // Clear loading message
        if (querySnapshot.empty) {
            container.innerHTML = '<p>No products found.</p>';
            return;
        }
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const productId = doc.id;
            var myfvpr = window.localStorage.favoriteProducts;
            const card = document.createElement('div');
            card.className = 'card';
            card.setAttribute("data-productId", productId);
            card.setAttribute("data-category", data.category);
            card.innerHTML = `
                <img src="./sources/${data.imgUrl[0]}" alt="${data.title}">
                <div class="label ${data.status.toLowerCase()}">${data.status}</div>
                <div class="favorite ${myfvpr?JSON.parse(myfvpr).includes(doc.id)?"active":"":""}">
                ${myfvpr?JSON.parse(myfvpr).includes(doc.id)?"❤️":'<i class="fa-solid fa-heart"></i>':'<i class="fa-solid fa-heart"></i>'}
                </div>
                <div class="product-info">
                    <h4 class="product-title">${data.title}</h4>
                    <div class='action'>
                        <div class="price">${data.newPrice} ج.م</div>
                        <div class="lastPrice">${data.oldPrice} ج.م</div>
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
            card.querySelector(".add-to-cart").addEventListener("click",()=>{
                document.querySelector(".productPreview").classList.remove("d-none");
                // load images container
                document.querySelector(".productPreview .productImagesContainer .productImage img").src = `../sources/${data.imgUrl[0]}`;
                const thumbnailContainer = document.querySelector(".productPreview .productImagesContainer .thumbnailContainer");
                thumbnailContainer.innerHTML = '';
                data.imgUrl.forEach((imgUrl, index) => {
                const thumbnail = document.createElement("img");
                thumbnail.src = `../sources/${imgUrl}`;
                thumbnail.alt = `Thumbnail ${index + 1}`;
                thumbnail.classList.add("thumbnail");
                if (index === 0) thumbnail.classList.add("active");
                thumbnail.addEventListener("click", () => {
                    document.querySelector(".productPreview .productImagesContainer .productImage img").src = `../sources/${imgUrl}`;
                    thumbnailContainer.querySelectorAll(".thumbnail").forEach(thumb => thumb.classList.remove("active"));
                    thumbnail.classList.add("active");
                });
                thumbnailContainer.appendChild(thumbnail);
                });
                // end load images container
                document.querySelector(".productPreview .productTitle").innerText = data.title;
                document.querySelector(".productPreview .productDescription").innerText = data.description;
                document.querySelector(".productPreview .productPrice").setAttribute("data-lastPrice",data.oldPrice);
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
                document.querySelector(".productPreview .addToCartBtn").onclick = (e)=>{
                e.target.setAttribute("disabled", "");
                const productId = doc.id;
                if(getCookie('userId') && !getCookie("emailToVirify")){
                    if(window.localStorage.cart && window.localStorage.cart.length > 0){
                        zcart = JSON.parse(window.localStorage.cart);
                        let found = Object.values(zcart).find(
                        item => item.productId == productId &&  item.size == document.querySelector(".productPreview select").value
                        );
                        if (found) {
                            found.quantity +=parseInt(document.querySelector(".productPreview .qtyInput").value);
                            window.localStorage.cart = JSON.stringify(zcart);
                            e.target.removeAttribute("disabled");
                            alert("Product added to cart successfully!");
                            // window.location.href = '../orderConfirmation/cart.html';
                        } else {
                            var newProduct = {productId: productId, quantity:parseInt(document.querySelector(".productPreview .qtyInput").value),size:document.querySelector(".productPreview select").value}
                            zcart[Object.keys(zcart).length] = newProduct;
                            window.localStorage.cart = JSON.stringify(zcart);
                            e.target.removeAttribute("disabled");
                            alert("Product added to cart successfully!");
                            // window.location.href = '../orderConfirmation/cart.html';
                        }
                        
                    }else{
                        zcart = {
                            0:{
                                productId: productId,
                                quantity:parseInt(document.querySelector(".productPreview .qtyInput").value),
                                size:document.querySelector(".productPreview select").value,
                            }
                        };
                        window.localStorage.cart = JSON.stringify(zcart);
                        e.target.removeAttribute("disabled");
                        alert("Product added to cart successfully!");
                    }
                    document.querySelector(".productPreview .closeBtn").click();
                }else{
                    alert('يرجى تسجيل الدخول أولاً للاضافة إلى سلة التسوق.');
                    window.location.href = '../components/login/';
                }
                }
            })
            card.querySelector("img").addEventListener("click",()=>{
                document.querySelector(".productPreview").classList.remove("d-none");
                // load images container
                document.querySelector(".productPreview .productImagesContainer .productImage img").src = `../sources/${data.imgUrl[0]}`;
                const thumbnailContainer = document.querySelector(".productPreview .productImagesContainer .thumbnailContainer");
                thumbnailContainer.innerHTML = '';
                data.imgUrl.forEach((imgUrl, index) => {
                const thumbnail = document.createElement("img");
                thumbnail.src = `../sources/${imgUrl}`;
                thumbnail.alt = `Thumbnail ${index + 1}`;
                thumbnail.classList.add("thumbnail");
                if (index === 0) thumbnail.classList.add("active");
                thumbnail.addEventListener("click", () => {
                    document.querySelector(".productPreview .productImagesContainer .productImage img").src = `../sources/${imgUrl}`;
                    thumbnailContainer.querySelectorAll(".thumbnail").forEach(thumb => thumb.classList.remove("active"));
                    thumbnail.classList.add("active");
                });
                thumbnailContainer.appendChild(thumbnail);
                });
                // end load images container
                document.querySelector(".productPreview .productTitle").innerText = data.title;
                document.querySelector(".productPreview .productDescription").innerText = data.description;
                document.querySelector(".productPreview .productPrice").setAttribute("data-lastPrice",data.oldPrice);
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
                document.querySelector(".productPreview .addToCartBtn").onclick = (e)=>{
                e.target.setAttribute("disabled", "");
                const productId = doc.id;
                if(getCookie('userId') && !getCookie("emailToVirify")){
                    if(window.localStorage.cart && window.localStorage.cart.length > 0){
                        zcart = JSON.parse(window.localStorage.cart);
                        let found = Object.values(zcart).find(
                        item => item.productId == productId &&  item.size == document.querySelector(".productPreview select").value
                        );
                        if (found) {
                            found.quantity +=parseInt(document.querySelector(".productPreview .qtyInput").value);
                            window.localStorage.cart = JSON.stringify(zcart);
                            e.target.removeAttribute("disabled");
                            alert("Product added to cart successfully!");
                            // window.location.href = '../orderConfirmation/cart.html';
                        } else {
                            var newProduct = {productId: productId, quantity:parseInt(document.querySelector(".productPreview .qtyInput").value),size:document.querySelector(".productPreview select").value}
                            zcart[Object.keys(zcart).length] = newProduct;
                            window.localStorage.cart = JSON.stringify(zcart);
                            e.target.removeAttribute("disabled");
                            alert("Product added to cart successfully!");
                            // window.location.href = '../orderConfirmation/cart.html';
                        }
                        
                    }else{
                        zcart = {
                            0:{
                                productId: productId,
                                quantity:parseInt(document.querySelector(".productPreview .qtyInput").value),
                                size:document.querySelector(".productPreview select").value,
                            }
                        };
                        window.localStorage.cart = JSON.stringify(zcart);
                        alert("Product added to cart successfully!");
                    }
                    document.querySelector(".productPreview .closeBtn").click();
                }else{
                    alert('يرجى تسجيل الدخول أولاً للاضافة إلى سلة التسوق.');
                    window.location.href = '../login/';
                }
                }
            })
            
            container.appendChild(card);
        });
        document.querySelector(".productPreview .closeBtn").addEventListener("click",()=>{
            document.querySelector(".productPreview .productImage img").src = '';
            document.querySelector(".productPreview .productTitle").innerText ='';
            document.querySelector(".productPreview .productDescription").innerText = '';
            document.querySelector(".productPreview .productPrice span").innerText = '';
            document.querySelector(".productPreview .qtyInput").value = 1;
            document.querySelector(".productPreview").classList.add("d-none");
        })
        document.querySelectorAll(' .favorite').forEach(icon => {
            icon.addEventListener('click', async() => {
                if(getCookie('userId') && !getCookie("emailToVirify")){
                    var productId = icon.closest(".card").getAttribute("data-productId");
                    const userRef = doc(db, "users", userId);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        const userData = userSnap.data();
                        var favoriteProducts = userData.favoriteProducts || [];
                        if(favoriteProducts && favoriteProducts.includes(productId)){
                            favoriteProducts = favoriteProducts.filter(item => item !== productId);
                            icon.classList.remove('active');
                        }else{
                            favoriteProducts.push(productId);
                            icon.classList.add('active');
                        }
                        updateDoc(doc(db, "users", userId), {
                            favoriteProducts:favoriteProducts
                        }).then(() => {
                            window.localStorage.favoriteProducts = JSON.stringify(favoriteProducts);
                            icon.innerHTML = icon.classList.contains('active') ? '❤️' : '<i class="fa-solid fa-heart"></i>';
                        });
                    }
                    // Here you can add code to actually handle the favorite action (e.g., update a database or local storage)
                }else{
                    alert('يرجى تسجيل الدخول أولاً لتسجيل الاعجاب.');
                    window.location.href = '../components/login/';
                }
            });
        });
    } catch (error) {
        console.error("Error loading products: ", error);
        container.innerHTML = '<p>Error loading products. Please try again later.</p>';
    }
};

// Load products
loadProducts('tshirt','','.topCollections .product-grid',10);
loadProducts('pants','','.summerCollections .product-grid',10);




// add 15 products to product db
// const products = [
//   {
//     title: "تيشيرت غابة",
//     description: "تيشيرت بتصميم غابة خضراء.",
//     category: "tshirt",
//     newPrice: 120,
//     oldPrice: 180,
//     imgUrl: ["1.jpeg","2.jpeg","3.jpeg"],
//     avaliableSizes: { Small: 12, Medium: 10, Large: 7, XL: 5, "2XL": 3 },
//     status: "New",
//     subname: "men"
//   },
//   {
//     title: "تيشيرت أسود",
//     description: "تيشيرت كلاسيك باللون الأسود.",
//     category: "tshirt",
//     newPrice: 100,
//     oldPrice: 150,
//     imgUrl: ["1.jpeg","2.jpeg","3.jpeg"],
//     avaliableSizes: { Small: 20, Medium: 15, Large: 8, XL: 4, "2XL": 2 },
//     status: "New",
//     subname: "boy"
//   },
//   {
//     title: "بنطلون جينز",
//     description: "بنطلون جينز أزرق مريح.",
//     category: "pants",
//     newPrice: 200,
//     oldPrice: 260,
//     imgUrl: ["1.jpeg","2.jpeg","3.jpeg"],
//     avaliableSizes: { Small: 8, Medium: 14, Large: 6, XL: 3, "2XL": 1 },
//     status: "New",
//     subname: "men"
//   },
//   {
//     title: "بنطلون رياضي",
//     description: "بنطلون رياضي رمادي مناسب للجيم.",
//     category: "pants",
//     newPrice: 170,
//     oldPrice: 220,
//     imgUrl: ["1.jpeg","2.jpeg","3.jpeg"],
//     avaliableSizes: { Small: 12, Medium: 10, Large: 5, XL: 2, "2XL": 1 },
//     status: "New",
//     subname: "boy"
//   },
//   {
//     title: "تيشيرت وردي",
//     description: "تيشيرت باللون الوردي للبنات.",
//     category: "tshirt",
//     newPrice: 130,
//     oldPrice: 190,
//     imgUrl: ["1.jpeg","2.jpeg","3.jpeg"],
//     avaliableSizes: { Small: 10, Medium: 9, Large: 6, XL: 4, "2XL": 2 },
//     status: "New",
//     subname: "girl"
//   },
//   {
//     title: "بنطلون أسود",
//     description: "بنطلون قماش أسود أنيق.",
//     category: "pants",
//     newPrice: 210,
//     oldPrice: 270,
//     imgUrl: ["1.jpeg","2.jpeg","3.jpeg"],
//     avaliableSizes: { Small: 7, Medium: 12, Large: 9, XL: 4, "2XL": 2 },
//     status: "New",
//     subname: "men"
//   },
//   {
//     title: "تيشيرت أبيض",
//     description: "تيشيرت أبيض كاجوال.",
//     category: "tshirt",
//     newPrice: 90,
//     oldPrice: 140,
//     imgUrl: ["1.jpeg","2.jpeg","3.jpeg"],
//     avaliableSizes: { Small: 15, Medium: 12, Large: 10, XL: 6, "2XL": 3 },
//     status: "New",
//     subname: "boy"
//   },
//   {
//     title: "تيشيرت سكري",
//     description: "تيشيرت بلون سكري مناسب للصيف.",
//     category: "tshirt",
//     newPrice: 110,
//     oldPrice: 160,
//     imgUrl: ["1.jpeg","2.jpeg","3.jpeg"],
//     avaliableSizes: { Small: 18, Medium: 14, Large: 9, XL: 5, "2XL": 3 },
//     status: "New",
//     subname: "girl"
//   },
//   {
//     title: "بنطلون كاروهات",
//     description: "بنطلون كاروهات موضة شبابية.",
//     category: "pants",
//     newPrice: 180,
//     oldPrice: 240,
//     imgUrl: ["1.jpeg","2.jpeg","3.jpeg"],
//     avaliableSizes: { Small: 10, Medium: 11, Large: 7, XL: 3, "2XL": 1 },
//     status: "New",
//     subname: "boy"
//   },
//   {
//     title: "بنطلون جينز أسود",
//     description: "جينز أسود ضيق.",
//     category: "pants",
//     newPrice: 190,
//     oldPrice: 250,
//     imgUrl: ["1.jpeg","2.jpeg","3.jpeg"],
//     avaliableSizes: { Small: 9, Medium: 12, Large: 8, XL: 4, "2XL": 2 },
//     status: "New",
//     subname: "girl"
//   },
//   {
//     title: "تيشيرت أحمر",
//     description: "تيشيرت باللون الأحمر زاهي.",
//     category: "tshirt",
//     newPrice: 120,
//     oldPrice: 170,
//     imgUrl: ["1.jpeg","2.jpeg","3.jpeg"],
//     avaliableSizes: { Small: 13, Medium: 12, Large: 8, XL: 5, "2XL": 3 },
//     status: "New",
//     subname: "men"
//   },
//   {
//     title: "تيشيرت أزرق",
//     description: "تيشيرت أزرق سماوي.",
//     category: "tshirt",
//     newPrice: 115,
//     oldPrice: 160,
//     imgUrl: ["1.jpeg","2.jpeg","3.jpeg"],
//     avaliableSizes: { Small: 14, Medium: 11, Large: 7, XL: 5, "2XL": 2 },
//     status: "New",
//     subname: "boy"
//   },
//   {
//     title: "بنطلون بيج",
//     description: "بنطلون بيج صيفي مريح.",
//     category: "pants",
//     newPrice: 200,
//     oldPrice: 260,
//     imgUrl: ["1.jpeg","2.jpeg","3.jpeg"],
//     avaliableSizes: { Small: 12, Medium: 14, Large: 9, XL: 4, "2XL": 2 },
//     status: "New",
//     subname: "men"
//   },
//   {
//     title: "بنطلون رياضي أزرق",
//     description: "بنطلون رياضي أزرق فاتح.",
//     category: "pants",
//     newPrice: 160,
//     oldPrice: 220,
//     imgUrl: ["1.jpeg","2.jpeg","3.jpeg"],
//     avaliableSizes: { Small: 11, Medium: 12, Large: 8, XL: 3, "2XL": 1 },
//     status: "New",
//     subname: "boy"
//   },
//   {
//     title: "تيشيرت بنفسجي",
//     description: "تيشيرت بنفسجي مميز.",
//     category: "tshirt",
//     newPrice: 125,
//     oldPrice: 180,
//     imgUrl: ["1.jpeg","2.jpeg","3.jpeg"],
//     avaliableSizes: { Small: 13, Medium: 10, Large: 6, XL: 4, "2XL": 2 },
//     status: "New",
//     subname: "girl"
//   },
//   {
//     title: "تيشيرت رمادي",
//     description: "تيشيرت رمادي أنيق.",
//     category: "tshirt",
//     newPrice: 110,
//     oldPrice: 150,
//     imgUrl: ["1.jpeg","2.jpeg","3.jpeg"],
//     avaliableSizes: { Small: 15, Medium: 12, Large: 9, XL: 5, "2XL": 3 },
//     status: "New",
//     subname: "men"
//   },
//   {
//     title: "بنطلون أخضر",
//     description: "بنطلون أخضر كاجوال.",
//     category: "pants",
//     newPrice: 175,
//     oldPrice: 230,
//     imgUrl: ["1.jpeg","2.jpeg","3.jpeg"],
//     avaliableSizes: { Small: 10, Medium: 13, Large: 8, XL: 4, "2XL": 2 },
//     status: "New",
//     subname: "boy"
//   },
//   {
//     title: "بنطلون أبيض",
//     description: "بنطلون أبيض صيفي.",
//     category: "pants",
//     newPrice: 190,
//     oldPrice: 250,
//     imgUrl: ["1.jpeg","2.jpeg","3.jpeg"],
//     avaliableSizes: { Small: 9, Medium: 10, Large: 7, XL: 3, "2XL": 1 },
//     status: "New",
//     subname: "girl"
//   },
//   {
//     title: "تيشيرت أخضر",
//     description: "تيشيرت أخضر فاتح.",
//     category: "tshirt",
//     newPrice: 130,
//     oldPrice: 180,
//     imgUrl: ["1.jpeg","2.jpeg","3.jpeg"],
//     avaliableSizes: { Small: 14, Medium: 13, Large: 9, XL: 5, "2XL": 3 },
//     status: "New",
//     subname: "boy"
//   },
//   {
//     title: "تيشيرت أصفر",
//     description: "تيشيرت أصفر شبابي.",
//     category: "tshirt",
//     newPrice: 120,
//     oldPrice: 170,
//     imgUrl: ["1.jpeg","2.jpeg","3.jpeg"],
//     avaliableSizes: { Small: 12, Medium: 11, Large: 7, XL: 4, "2XL": 2 },
//     status: "New",
//     subname: "girl"
//   },
//   {
//     title: "بنطلون بني",
//     description: "بنطلون بني أنيق.",
//     category: "pants",
//     newPrice: 200,
//     oldPrice: 260,
//     imgUrl: ["1.jpeg","2.jpeg","3.jpeg"],
//     avaliableSizes: { Small: 10, Medium: 12, Large: 8, XL: 4, "2XL": 2 },
//     status: "New",
//     subname: "men"
//   },
//   {
//     title: "بنطلون زيتي",
//     description: "بنطلون زيتي مناسب للخريف.",
//     category: "pants",
//     newPrice: 180,
//     oldPrice: 240,
//     imgUrl: ["1.jpeg","2.jpeg","3.jpeg"],
//     avaliableSizes: { Small: 11, Medium: 10, Large: 7, XL: 3, "2XL": 1 },
//     status: "New",
//     subname: "boy"
//   },
//   {
//     title: "بنطلون بنفسجي",
//     description: "بنطلون بنفسجي جريء.",
//     category: "pants",
//     newPrice: 195,
//     oldPrice: 260,
//     imgUrl: ["1.jpeg","2.jpeg","3.jpeg"],
//     avaliableSizes: { Small: 9, Medium: 11, Large: 8, XL: 4, "2XL": 2 },
//     status: "New",
//     subname: "girl"
//   },
//   {
//     title: "تيشيرت كحلي",
//     description: "تيشيرت كحلي مناسب لكل وقت.",
//     category: "tshirt",
//     newPrice: 125,
//     oldPrice: 180,
//     imgUrl: ["1.jpeg","2.jpeg","3.jpeg"],
//     avaliableSizes: { Small: 13, Medium: 12, Large: 9, XL: 5, "2XL": 3 },
//     status: "New",
//     subname: "men"
//   }
// ];

// async function uploadProducts() {
//   try {
//     for (const product of products) {
//       await addDoc(collection(db, "products"), product);
//       console.log(`✅ Added: ${product.title}`);
//     }
//     console.log("🔥 All 25 products uploaded!");
//   } catch (e) {
//     console.error("Error adding document: ", e);
//   }
// }

// uploadProducts();




// on scroll product grid animation


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
    const reviewsContainer = document.querySelector('.analyse .carousel-inner');
    reviewsContainer.innerHTML = '<p>Loading reviews...</p>';
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        reviewsContainer.innerHTML = '';
        let hasReviews = false;
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if(data.userComments){
                hasReviews = true;
                const reviewCard = document.createElement('div');
                reviewCard.className = 'carousel-item active';
                reviewCard.innerHTML = `
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${data.firstName} ${data.lastName}</h5>
                            <p class="card-text">"${data.userComments}"</p>
                        </div>
                    </div>
                `;
                reviewsContainer.appendChild(reviewCard);
            }
        });
        if(!hasReviews){
            reviewsContainer.innerHTML = '<p>لا توجد اراء حتي الان كن اول من يشاركنا رايك!</p>';
        }
    } catch (error) {
        console.error("Error loading reviews: ", error);
        reviewsContainer.innerHTML = '<p>Error loading reviews. Please try again later.</p>';
    }
});
// enable/disable button based on input

document.querySelector('.analyse .reviews input').addEventListener('input', function() {
    const button = document.querySelector('.analyse .reviews button');
    button.disabled = this.value.trim() === '';
});
document.querySelector('.analyse .reviews input').addEventListener('focus', function() {
    userId?"":this.placeholder= 'يلزم تسجيل الدخول لكتابة رأيك';
});
document.querySelector('.analyse .reviews input').addEventListener('blur', function() {
    this.placeholder= "...اكتب رأيك هنا";
});
document.querySelector('.analyse .reviews button').addEventListener('click', async()=> {
    const input = document.querySelector('.analyse .reviews input');
    if (input.value.trim() !== '') {
        if(getCookie('userId')){
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                if(userData.firstName || userData.lastName){
                    updateDoc(doc(db, "users", userId), {
                        userComments:input.value,
                    }).then(() => {
                        alert('شكراً لمشاركتك رأيك!');
                        input.value = '';
                        this.disabled = true;
                    });
                }else{
                    alert("بلزم كتابة اسمك في صفحنك الشخصية");
                    window.location.href='../components/profile';
                }
            }
        }else{
            alert('يرجى تسجيل الدخول أولا.');
            window.location.href = './components/login/';
        }
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



import {getCookie, setCookie, eraseCookie} from './main.js';

// eraseCookie("user")
